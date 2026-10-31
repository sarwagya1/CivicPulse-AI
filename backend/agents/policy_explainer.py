"""
Policy Explainer Agent
======================
Uses HuggingFace BART (facebook/bart-large-cnn) to summarize government
policy documents into rich, structured plain-language explanations.
Optionally translates the result into Hindi using Helsinki-NLP/opus-mt-en-hi.

Real data source: Text pasted by user (government notification PDFs / URLs).
"""

import re
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, MarianMTModel, MarianTokenizer

router = APIRouter()

# ── Model loading (lazy singleton to avoid re-loading on every request) ──────
_bart_tokenizer = None
_bart_model = None
_translator = None


def get_summarizer():
    global _bart_tokenizer, _bart_model
    if _bart_tokenizer is None or _bart_model is None:
        print("[INFO] Loading BART summarizer model...")
        model_name = "facebook/bart-large-cnn"
        _bart_tokenizer = AutoTokenizer.from_pretrained(model_name)
        _bart_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        print("[OK] BART loaded.")
    return _bart_tokenizer, _bart_model


def get_translator():
    global _translator
    if _translator is None:
        print("[INFO] Loading Helsinki-NLP translation model (EN->HI)...")
        model_name = "Helsinki-NLP/opus-mt-en-hi"
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        _translator = (model, tokenizer)
        print("[OK] Translation model loaded.")
    return _translator


# ── Request / Response schemas ───────────────────────────────────────────────
class PolicyRequest(BaseModel):
    text: str                   # Raw government policy text
    translate_to_hindi: bool = False
    max_length: int = 400       # Summary length in tokens (increased for richness)


class PolicyResponse(BaseModel):
    summary_english: str
    summary_hindi: str | None = None
    key_points: list[str]
    eligibility_hints: list[str]
    # Rich structured fields
    purpose: str
    who_is_affected: str
    key_benefits: list[str]
    procedures: list[str]
    deadlines: list[str]
    practical_example: str
    limitations: list[str]
    missing_info: list[str]


class TranslateRequest(BaseModel):
    text: str


class TranslateResponse(BaseModel):
    translated: str


# ── Helper: extract key points from summary ──────────────────────────────────
def extract_key_points(summary: str) -> list[str]:
    """Split summary into bullet-point sentences (max 6)."""
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', summary) if len(s.strip()) > 20]
    return sentences[:6] if sentences else [summary]


def extract_eligibility(text: str) -> list[str]:
    """
    Rule-based extraction of eligibility criteria.
    Looks for patterns like 'eligible', 'criteria', 'must be', etc.
    """
    hints = []
    trigger_phrases = [
        "eligible", "eligibility", "criteria", "must be", "should be",
        "income limit", "age limit", "category", "sc/st", "obc", "bpl",
        "annual income", "applicant", "beneficiary", "who can apply",
        "qualification", "resident", "citizen", "domicile",
    ]
    for line in text.split("\n"):
        line_lower = line.lower()
        if any(p in line_lower for p in trigger_phrases):
            cleaned = line.strip()
            if cleaned and len(cleaned) > 10 and len(cleaned) < 500:
                hints.append(cleaned)
    return hints[:6] if hints else ["No specific eligibility criteria detected in the provided text."]


# ── Rich structured extraction helpers ───────────────────────────────────────

def extract_purpose(text: str, summary: str) -> str:
    """
    Derive the purpose/background of the policy from the text.
    Looks for introductory sentences and purpose keywords.
    """
    purpose_keywords = [
        "objective", "purpose", "aim", "goal", "introduced to", "enacted to",
        "in order to", "to provide", "to ensure", "to promote", "preamble",
        "whereas", "background", "rationale", "vision",
    ]
    candidates = []
    for line in text.split("\n"):
        line_lower = line.lower().strip()
        if any(kw in line_lower for kw in purpose_keywords) and len(line.strip()) > 20:
            candidates.append(line.strip())
    if candidates:
        return " ".join(candidates[:2])[:600]
    # Fallback: use the first 2 meaningful sentences from summary
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', summary) if len(s.strip()) > 20]
    return " ".join(sentences[:2]) if sentences else "Not specified in the provided document."


def extract_who_is_affected(text: str) -> str:
    """
    Extract information about who is affected or eligible.
    """
    who_keywords = [
        "citizens", "farmers", "students", "women", "children", "workers",
        "beneficiaries", "households", "families", "applicants", "residents",
        "persons with disability", "sc ", "st ", "obc", "minority", "youth",
        "entrepreneurs", "self-employed", "below poverty line", "bpl",
    ]
    candidates = []
    for line in text.split("\n"):
        line_lower = line.lower().strip()
        if any(kw in line_lower for kw in who_keywords) and len(line.strip()) > 15:
            candidates.append(line.strip())
    if candidates:
        # Deduplicate and limit
        seen = set()
        unique = []
        for c in candidates:
            key = c[:40].lower()
            if key not in seen:
                seen.add(key)
                unique.append(c)
        return " ".join(unique[:3])[:600]
    return "Not specified in the provided document."


def extract_key_benefits(text: str) -> list[str]:
    """
    Extract financial benefits, rights, and entitlements.
    Looks for monetary amounts and benefit keywords.
    """
    benefit_pattern = re.compile(
        r'(?:₹|Rs\.?|INR)\s*[\d,]+(?:\s*(?:lakh|crore|thousand|hundred))?'
        r'|[\d,]+\s*(?:lakh|crore)\s*(?:rupees?|per\s+(?:year|annum|month))?'
        r'|\d+\s*%\s*(?:subsidy|interest|rebate|discount)',
        re.IGNORECASE
    )
    benefit_keywords = [
        "benefit", "financial assistance", "subsidy", "grant", "incentive",
        "pension", "allowance", "scholarship", "loan", "credit", "coverage",
        "compensation", "reimbursement", "free", "waiver", "entitlement",
    ]
    benefits = []
    for line in text.split("\n"):
        line_strip = line.strip()
        if not line_strip or len(line_strip) < 10:
            continue
        has_amount = bool(benefit_pattern.search(line_strip))
        has_keyword = any(kw in line_strip.lower() for kw in benefit_keywords)
        if (has_amount or has_keyword) and len(line_strip) < 400:
            benefits.append(line_strip)
    if not benefits:
        return ["Not specified in the provided document."]
    # Deduplicate
    seen = set()
    unique = []
    for b in benefits:
        key = b[:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(b)
    return unique[:6]


def extract_procedures(text: str) -> list[str]:
    """
    Extract application procedures and steps.
    """
    proc_keywords = [
        "apply", "application", "portal", "submit", "register", "enroll",
        "form", "documents required", "step", "procedure", "how to",
        "login", "visit", "contact", "office", "deadline to apply",
    ]
    procedures = []
    for line in text.split("\n"):
        line_strip = line.strip()
        if any(kw in line_strip.lower() for kw in proc_keywords) and 15 < len(line_strip) < 400:
            procedures.append(line_strip)
    if not procedures:
        return ["Not specified in the provided document."]
    seen = set()
    unique = []
    for p in procedures:
        key = p[:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique[:5]


def extract_deadlines(text: str) -> list[str]:
    """
    Extract dates, deadlines, and financial thresholds.
    """
    date_pattern = re.compile(
        r'\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
        r'|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
        r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
        r'\s+\d{4}'
        r'|\d{4}-\d{2}-\d{2}'
        r'|FY\s*\d{2,4}[-–]\d{2,4}'
        r'|financial year\s+\d{4})\b',
        re.IGNORECASE
    )
    deadline_keywords = [
        "deadline", "last date", "closing date", "by", "before", "within",
        "effective from", "applicable from", "valid till", "expiry",
    ]
    deadlines = []
    for line in text.split("\n"):
        line_strip = line.strip()
        has_date = bool(date_pattern.search(line_strip))
        has_keyword = any(kw in line_strip.lower() for kw in deadline_keywords)
        if (has_date or has_keyword) and 10 < len(line_strip) < 400:
            deadlines.append(line_strip)
    if not deadlines:
        return ["Not specified in the provided document."]
    seen = set()
    unique = []
    for d in deadlines:
        key = d[:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(d)
    return unique[:5]


def extract_limitations(text: str) -> list[str]:
    """
    Extract exceptions, conditions, and limitations.
    """
    limit_keywords = [
        "except", "not eligible", "excluded", "exclusion", "condition",
        "subject to", "provided that", "however", "notwithstanding",
        "shall not", "cannot", "disqualified", "restriction", "limit",
        "only if", "unless", "ineligible", "not applicable",
    ]
    limitations = []
    for line in text.split("\n"):
        line_strip = line.strip()
        if any(kw in line_strip.lower() for kw in limit_keywords) and 15 < len(line_strip) < 400:
            limitations.append(line_strip)
    if not limitations:
        return ["Not specified in the provided document."]
    seen = set()
    unique = []
    for lim in limitations:
        key = lim[:50].lower()
        if key not in seen:
            seen.add(key)
            unique.append(lim)
    return unique[:5]


def build_practical_example(text: str, who: str, benefits: list[str]) -> str:
    """
    Construct a practical citizen-facing example based on extracted data.
    This uses ONLY information found in the text — no invented facts.
    """
    # Try to find an age range in the text
    age_match = re.search(r'(\d{1,2})\s*(?:to|-)\s*(\d{2,3})\s*years?', text, re.IGNORECASE)
    age_str = f"{age_match.group(1)}-{age_match.group(2)} year old" if age_match else "eligible"

    # Find an occupation or category hint
    occ_words = ["farmer", "student", "woman", "worker", "entrepreneur", "citizen", "family"]
    occ = "citizen"
    for w in occ_words:
        if w in text.lower():
            occ = w
            break

    # Pick first non-trivial benefit
    benefit_example = ""
    for b in benefits:
        if "not specified" not in b.lower() and len(b) > 10:
            benefit_example = b
            break

    if benefit_example:
        return (
            f"Example: An {age_str} {occ} who meets the eligibility criteria described above "
            f"can avail: \"{benefit_example}\". "
            f"They should review the official document for the exact application process and required documents."
        )
    return "Not specified in the provided document."


def identify_missing_sections(
    purpose: str, who: str, benefits: list[str],
    procedures: list[str], deadlines: list[str], limitations: list[str]
) -> list[str]:
    """Report which sections had no data found in the document."""
    NOT_SPECIFIED = "not specified in the provided document"
    missing = []
    if NOT_SPECIFIED in purpose.lower():
        missing.append("Purpose / Background")
    if NOT_SPECIFIED in who.lower():
        missing.append("Who is Eligible / Affected")
    if benefits and NOT_SPECIFIED in benefits[0].lower():
        missing.append("Key Benefits")
    if procedures and NOT_SPECIFIED in procedures[0].lower():
        missing.append("Application Procedures")
    if deadlines and NOT_SPECIFIED in deadlines[0].lower():
        missing.append("Deadlines / Dates")
    if limitations and NOT_SPECIFIED in limitations[0].lower():
        missing.append("Limitations / Conditions")
    return missing


# ── Translate English → Hindi using Helsinki model ───────────────────────────
def _do_translate(text: str) -> str:
    """Translate a single chunk of text (≤ 512 tokens) from English to Hindi."""
    model, tokenizer = get_translator()
    inputs = tokenizer([text], return_tensors="pt", padding=True, truncation=True, max_length=512)
    translated = model.generate(**inputs)
    return tokenizer.decode(translated[0], skip_special_tokens=True)


def translate_to_hindi(text: str) -> str:
    """
    Translate English text to Hindi.
    Splits into chunks of ~400 chars to handle long summaries.
    """
    if not text or len(text.strip()) < 5:
        return text
    # Split at sentence boundaries to stay within token limits
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks, current = [], ""
    for sent in sentences:
        if len(current) + len(sent) < 450:
            current += " " + sent
        else:
            if current.strip():
                chunks.append(current.strip())
            current = sent
    if current.strip():
        chunks.append(current.strip())

    translated_parts = []
    for chunk in chunks:
        try:
            translated_parts.append(_do_translate(chunk))
        except Exception:
            translated_parts.append(chunk)  # Fall back to English chunk on error
    return " ".join(translated_parts)


# ── Translation endpoint (for scheme descriptions and other UI text) ─────────
@router.post("/translate", response_model=TranslateResponse)
async def translate_text(req: TranslateRequest):
    """
    Translate any English text to Hindi using the Helsinki-NLP model.
    Used by the frontend to translate scheme descriptions when Hindi UI is active.
    """
    if not req.text or len(req.text.strip()) < 2:
        raise HTTPException(status_code=400, detail="Text is too short to translate.")
    try:
        translated = translate_to_hindi(req.text.strip())
        return TranslateResponse(translated=translated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


# ── API Endpoint ─────────────────────────────────────────────────────────────
@router.post("/explain", response_model=PolicyResponse)
async def explain_policy(req: PolicyRequest):
    """
    Takes a government policy document text and returns a rich structured analysis:
    - Plain English summary (via BART)
    - Hindi translation (optional, via Helsinki-NLP)
    - Key bullet points
    - Eligibility hints (rule-based extraction)
    - Purpose & background
    - Who is affected / eligible
    - Key benefits and rights
    - Application procedures
    - Important deadlines
    - Practical citizen example
    - Limitations and conditions
    - List of sections not found in the document
    """
    if len(req.text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Policy text is too short. Provide at least 50 characters."
        )

    tokenizer, model = get_summarizer()

    # Chunk large texts (BART handles ~1024 tokens max; ~3000 chars is safe)
    text_chunk = req.text[:4000]

    try:
        inputs = tokenizer(
            [text_chunk],
            max_length=1024,
            truncation=True,
            return_tensors="pt"
        )
        summary_ids = model.generate(
            inputs["input_ids"],
            num_beams=4,
            max_length=max(req.max_length, 400),
            min_length=80,
            length_penalty=2.0,
            early_stopping=True,
            no_repeat_ngram_size=3,
        )
        summary_en = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

    # Hindi translation of summary (always via Helsinki-NLP — no fake translations)
    summary_hi = None
    if req.translate_to_hindi:
        try:
            summary_hi = translate_to_hindi(summary_en)
        except Exception as e:
            summary_hi = f"Translation error: {str(e)}"

    # ── Structured extraction (rule-based, uses only the provided text) ──────
    full_text = req.text   # Use the full original text for extraction

    purpose       = extract_purpose(full_text, summary_en)
    who_affected  = extract_who_is_affected(full_text)
    key_benefits  = extract_key_benefits(full_text)
    procedures    = extract_procedures(full_text)
    deadlines     = extract_deadlines(full_text)
    limitations   = extract_limitations(full_text)
    practical_ex  = build_practical_example(full_text, who_affected, key_benefits)
    missing_info  = identify_missing_sections(
        purpose, who_affected, key_benefits, procedures, deadlines, limitations
    )

    return PolicyResponse(
        summary_english=summary_en,
        summary_hindi=summary_hi,
        key_points=extract_key_points(summary_en),
        eligibility_hints=extract_eligibility(full_text),
        purpose=purpose,
        who_is_affected=who_affected,
        key_benefits=key_benefits,
        procedures=procedures,
        deadlines=deadlines,
        practical_example=practical_ex,
        limitations=limitations,
        missing_info=missing_info,
    )
