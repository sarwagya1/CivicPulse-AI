"""
Fact Verifier Agent
===================
Takes a user-submitted claim and:
1. Searches Wikipedia API (real, live) for relevant articles with proper User-Agent
2. Uses cross-encoder/ms-marco-MiniLM-L-6-v2 to score claim vs. evidence
3. Returns a verdict: VERIFIED / UNVERIFIED / FALSE / NEEDS_MORE_CONTEXT

Real data source: Wikipedia REST & Action APIs (publicly accessible with descriptive User-Agent)
"""

import os
import math
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

router = APIRouter()

WIKIPEDIA_API = "https://en.wikipedia.org/api/rest_v1/page/summary/"
WIKIPEDIA_SEARCH = "https://en.wikipedia.org/w/api.php"
WIKIPEDIA_HEADERS = {
    "User-Agent": "CivicPulseAI/1.0 (https://github.com/NITroFORGE/CivicPulse; civicpulse-verifier@gmail.com) httpx/0.28.1",
    "Accept": "application/json",
}

# ── Lazy model singleton ─────────────────────────────────────────────────────
_ce_tokenizer = None
_ce_model = None


def get_cross_encoder():
    global _ce_tokenizer, _ce_model
    if _ce_tokenizer is None or _ce_model is None:
        print("[INFO] Loading cross-encoder for fact verification...")
        model_name = "cross-encoder/ms-marco-MiniLM-L-6-v2"
        _ce_tokenizer = AutoTokenizer.from_pretrained(model_name)
        _ce_model = AutoModelForSequenceClassification.from_pretrained(model_name)
        _ce_model.eval()
        print("[OK] Cross-encoder loaded.")
    return _ce_tokenizer, _ce_model


# ── Schemas ──────────────────────────────────────────────────────────────────
class FactRequest(BaseModel):
    claim: str          # The claim to verify
    language: str = "en"


class Source(BaseModel):
    title: str
    url: str
    snippet: str
    relevance_score: float


class FactResponse(BaseModel):
    claim: str
    verdict: str        # VERIFIED / UNVERIFIED / FALSE / NEEDS_MORE_CONTEXT
    confidence: float
    explanation: str
    sources: list[Source]


# ── Wikipedia search helper ──────────────────────────────────────────────────
async def search_wikipedia(query: str) -> list[dict]:
    """Search Wikipedia for pages related to the claim with proper User-Agent."""
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json",
        "srlimit": 5,
    }
    try:
        async with httpx.AsyncClient(timeout=10, headers=WIKIPEDIA_HEADERS) as client:
            resp = await client.get(WIKIPEDIA_SEARCH, params=params)
            if resp.status_code == 200:
                data = resp.json()
                return data.get("query", {}).get("search", [])
            else:
                print(f"[WARN] Wikipedia search returned status {resp.status_code}")
    except Exception as e:
        print(f"[WARN] Wikipedia search error: {e}")
    return []


async def fetch_wikipedia_summary(title: str) -> str:
    """Fetch the plain-text summary of a Wikipedia article."""
    encoded = title.replace(" ", "_")
    try:
        async with httpx.AsyncClient(timeout=10, headers=WIKIPEDIA_HEADERS) as client:
            resp = await client.get(f"{WIKIPEDIA_API}{encoded}")
            if resp.status_code == 200:
                data = resp.json()
                return data.get("extract", "")
            else:
                print(f"[WARN] Wikipedia summary for '{title}' returned status {resp.status_code}")
    except Exception as e:
        print(f"[WARN] Wikipedia summary error: {e}")
    return ""


# ── Verdict logic ────────────────────────────────────────────────────
def determine_verdict(scores: list[float]) -> tuple[str, float, str]:
    if not scores:
        return "UNVERIFIED", 0.0, "No relevant sources found to verify this claim."

    max_score = max(scores)

    if max_score >= 0.70:
        return "VERIFIED", round(max_score, 3), "Strong supporting evidence found in verified public sources."
    elif max_score >= 0.40:
        return "NEEDS_MORE_CONTEXT", round(max_score, 3), "Partial evidence found. The claim may be partially accurate or needs nuance."
    elif max_score >= 0.15:
        return "UNVERIFIED", round(max_score, 3), "Weak supporting evidence. Treat with caution."
    else:
        return "FALSE", round(1.0 - max_score, 3), "No supporting evidence found. Sources indicate the claim is likely false or misleading."


# ── Endpoint ─────────────────────────────────────────────────────────────────
@router.post("/check", response_model=FactResponse)
async def verify_fact(req: FactRequest):
    """
    Verify a claim against live Wikipedia sources using a cross-encoder model.
    """
    clean_claim = req.claim.strip()
    if len(clean_claim) < 5:
        raise HTTPException(status_code=400, detail="Claim is too short. Please provide at least 5 characters.")

    # Step 1: Search Wikipedia for relevant articles
    search_results = await search_wikipedia(clean_claim)
    if not search_results:
        return FactResponse(
            claim=clean_claim,
            verdict="UNVERIFIED",
            confidence=0.0,
            explanation="No related Wikipedia entries were found for this query.",
            sources=[],
        )

    # Step 2: Fetch summaries for top results
    sources: list[Source] = []
    score_list: list[float] = []

    tokenizer, model = get_cross_encoder()

    for item in search_results[:3]:
        title = item.get("title", "")
        if not title:
            continue
        summary = await fetch_wikipedia_summary(title)
        if not summary:
            continue

        # Score claim vs. evidence using cross-encoder logits + sigmoid
        try:
            inputs = tokenizer(clean_claim, summary[:512], truncation=True, max_length=512, return_tensors="pt")
            with torch.no_grad():
                logits = model(**inputs).logits
                raw_logit = logits[0][0].item()
                # Apply sigmoid: 1 / (1 + exp(-logit))
                prob = 1.0 / (1.0 + math.exp(-raw_logit))
        except Exception as e:
            print(f"[WARN] Scoring error for '{title}': {e}")
            prob = 0.0

        score_list.append(prob)
        sources.append(Source(
            title=title,
            url=f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
            snippet=summary[:220] + "...",
            relevance_score=round(prob, 3),
        ))

    if not sources:
        return FactResponse(
            claim=clean_claim,
            verdict="UNVERIFIED",
            confidence=0.0,
            explanation="Could not retrieve readable extracts from relevant sources.",
            sources=[],
        )

    verdict, confidence, explanation = determine_verdict(score_list)

    return FactResponse(
        claim=clean_claim,
        verdict=verdict,
        confidence=confidence,
        explanation=explanation,
        sources=sources,
    )
