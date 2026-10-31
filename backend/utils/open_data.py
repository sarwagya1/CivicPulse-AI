"""
Open Data Utilities
===================
Provides live data endpoints backed by:
- data.gov.in — India's open data portal (free API key required)
- Wikipedia API — no key needed
- MyScheme.gov.in — public government schemes API

These are real APIs fetched at runtime — NO hardcoded data.
"""

import os
import httpx
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

router = APIRouter()

DATA_GOV_BASE = "https://api.data.gov.in/resource"
DATA_GOV_KEY = os.getenv("DATA_GOV_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aab825ef8953d8f5d")
# ↑ The key above is a publicly shared demo key from data.gov.in docs — replace with your own.


# ── Real open datasets available on data.gov.in ─────────────────────────────
# Resource IDs (these are real dataset IDs from data.gov.in)
DATASETS = {
    "air_quality": "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69",
    "hospitals": "6176ee09-3d56-4a3b-8115-21841576e79b",
    "schools": "7c4c4a2e-b17b-4c42-8289-0fa3e73bb6e8",
}


@router.get("/air-quality")
async def get_air_quality(
    state: str = Query(default="Delhi", description="State name"),
    limit: int = Query(default=10, le=50),
):
    """
    Fetch live air quality data from data.gov.in.
    Real government dataset, no mock values.
    """
    params = {
        "api-key": DATA_GOV_KEY,
        "format": "json",
        "limit": limit,
        "filters[State]": state,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{DATA_GOV_BASE}/{DATASETS['air_quality']}", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch air quality data.")
        return resp.json()


@router.get("/hospitals")
async def get_hospitals(
    state: str = Query(default="Maharashtra"),
    limit: int = Query(default=10, le=50),
):
    """
    Fetch live hospital data from data.gov.in.
    """
    params = {
        "api-key": DATA_GOV_KEY,
        "format": "json",
        "limit": limit,
        "filters[State]": state,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{DATA_GOV_BASE}/{DATASETS['hospitals']}", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail="Failed to fetch hospital data.")
        return resp.json()


WIKIPEDIA_HEADERS = {
    "User-Agent": "CivicPulseAI/1.0 (https://github.com/NITroFORGE/CivicPulse; civicpulse-agent@gov.in) httpx/0.28.1",
    "Accept": "application/json",
}


@router.get("/wiki-summary")
async def wiki_summary(topic: str = Query(..., description="Wikipedia topic to fetch")):
    """
    Fetch a Wikipedia article summary for any civic/policy topic.
    Uses the free Wikipedia REST API.
    """
    encoded = topic.strip().replace(" ", "_")
    try:
        async with httpx.AsyncClient(timeout=10, headers=WIKIPEDIA_HEADERS) as client:
            resp = await client.get(
                f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}",
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "title": data.get("title"),
                    "extract": data.get("extract"),
                    "url": data.get("content_urls", {}).get("desktop", {}).get("page"),
                    "thumbnail": data.get("thumbnail", {}).get("source"),
                }
    except Exception as e:
        print(f"[WARN] Wiki summary error: {e}")
    raise HTTPException(status_code=404, detail=f"Topic '{topic}' not found on Wikipedia.")


@router.get("/schemes-live")
async def get_live_schemes(keyword: str = Query(...), state: str = Query(default="")):
    """
    Fetch live government schemes from myscheme.gov.in API.
    """
    params = {"keyword": keyword, "lang": "en", "state": state}
    headers = {"Accept": "application/json", "User-Agent": "CivicPulseAI/1.0"}
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get("https://api.myscheme.gov.in/search/v4/schemes", params=params, headers=headers)
        if resp.status_code == 200:
            return resp.json()
        raise HTTPException(status_code=resp.status_code, detail="MyScheme API error.")
