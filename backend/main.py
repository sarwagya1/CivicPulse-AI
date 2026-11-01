"""
CivicPulse AI — FastAPI Backend
================================
Main application entrypoint. Registers all routers.
"""

import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

_BASE_DIR = Path(__file__).resolve().parent
_ENV_FILE = _BASE_DIR / ".env"
if _ENV_FILE.exists():
    load_dotenv(_ENV_FILE)
else:
    load_dotenv()

from agents.policy_explainer import router as policy_router
from agents.grievance_router import router as grievance_router
from agents.fact_verifier import router as fact_router
from agents.scheme_finder import router as scheme_router
from utils.open_data import router as data_router

app = FastAPI(
    title="CivicPulse AI",
    description="Democratizing public information using Generative AI & HuggingFace models.",
    version="1.0.0",
)

# ----- CORS (supports multiple frontend origins & wildcards) -----
cors_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,*")
if "*" in [o.strip() for o in cors_env.split(",")]:
    origins = ["*"]
    allow_creds = False
else:
    origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    allow_creds = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Register routers -----
app.include_router(policy_router,   prefix="/api/policy",    tags=["Policy Explainer"])
app.include_router(grievance_router,prefix="/api/grievance", tags=["Grievance System"])
app.include_router(fact_router,     prefix="/api/fact",      tags=["Fact Verifier"])
app.include_router(scheme_router,   prefix="/api/scheme",    tags=["Scheme Finder"])
app.include_router(data_router,     prefix="/api/data",      tags=["Open Data"])


@app.get("/")
def root():
    return {
        "message": "CivicPulse AI is running 🟢",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
