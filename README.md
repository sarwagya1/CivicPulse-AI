# 🏛️ CivicPulse AI

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat&logo=Tailwind-CSS&logoColor=white)](https://tailwindcss.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.3.0-EE4C2C.svg?style=flat&logo=PyTorch&logoColor=white)](https://pytorch.org)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21E.svg?style=flat&logo=HuggingFace&logoColor=black)](https://huggingface.co)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Digital Governance & Public Information Intelligence Platform**  
*Democratizing civic knowledge, grievance routing, welfare scheme matching, and fact verification.*

[🚀 Free 1-Click Deployment](#-100-free-deployment-guide) • [⚡ Quick Start](#-local-quick-start) • [📁 Repo Structure](#-repository-structure) • [🌐 API Specs](#-api-specification-overview) • [🤖 AI Models](#-machine-learning-models-used)

</div>

---

## 📖 Overview

CivicPulse AI is an open, full-stack civic technology platform designed to bridge the gap between citizens and public administration. It simplifies complex government notifications, matches citizens to eligible welfare schemes, automatically routes and prioritizes civic grievances, and fact-checks viral public claims using **HuggingFace Transformers**, **Computer Vision**, and **live Indian Open Government APIs**.

---

## 🌟 Key Features

| Feature | Description | Underlying Technology / APIs |
|---|---|---|
| **Scheme Finder** | Enter demographic details (age, state, category, income, occupation) to discover eligible welfare schemes. Features 1-click persona presets, live search, and verified portal links. | `myscheme.gov.in` API + Built-in Official Welfare Catalog |
| **Grievance Portal** | Register civic issues with automated department routing, GPS location detection, optional damage photo validation, live tracking tokens, and HTML email confirmation. | `distilbert-base-uncased` + Computer Vision / Gemini Vision + CPGRAMS / MoRTH / Jal Shakti Portals |
| **Policy Explainer** | Transform dense legal acts, gazette notifications, and policy circulars into structured, plain-language summaries in English and Hindi. | `facebook/bart-large-cnn` + `Helsinki-NLP/opus-mt-en-hi` |
| **Fact Checker** | Verify viral claims and public statements against real-time reference sources with confidence scoring. | `cross-encoder/ms-marco-MiniLM-L-6-v2` + Wikipedia REST API |
| **Multilingual & Voice** | Instant toggle between **English** and **Hindi (हिन्दी)** with browser speech-to-text dictation across input fields. | Web Speech API (`en-IN`, `hi-IN`) + React Context |

---

## 🎨 UI/UX Design Standards

The frontend interface incorporates verified design principles adapted from leading global public service platforms:
- **[GOV.UK Design System](https://design-system.service.gov.uk/)**: High-contrast, accessible typography, clear service hierarchy, fieldsets with explanatory hint text, skip-to-content links, and full `@media (prefers-reduced-motion: reduce)` support.
- **[myScheme](https://www.myscheme.gov.in/)**: Scheme discovery hierarchy, ministry badges, direct benefit transfer (DBT) callouts, and verified official government portal action buttons.
- **[Canada Benefits Finder](https://www.canada.ca/en/services/benefits/finder.html)**: Guided multi-step questionnaires, quick-fill persona presets, and dynamic profile summary cards.

---

## 📁 Repository Structure

```
CivicPulse-AI/
├── .github/                         # GitHub configuration
├── backend/                         # FastAPI Python Backend
│   ├── main.py                      # Application entrypoint & CORS middleware
│   ├── agents/                      # Domain intelligence agents
│   │   ├── policy_explainer.py      # BART summarization + Helsinki translation
│   │   ├── grievance_router.py      # DistilBERT urgency + Vision validation + routing
│   │   ├── fact_verifier.py         # Cross-encoder claim verification + Wikipedia API
│   │   └── scheme_finder.py         # myScheme.gov.in API integration & catalog
│   ├── utils/                       # Supporting utilities
│   │   ├── email_service.py         # HTML grievance confirmation email delivery
│   │   └── open_data.py             # data.gov.in open datasets & Wikipedia proxy
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Backend Docker configuration
│   ├── .env.example                 # Backend environment variable template
│   └── preload_models.py            # Optional script to pre-download HuggingFace weights
│
├── frontend/                        # React 18 + Vite 5 Single Page Application
│   ├── src/
│   │   ├── App.jsx                  # Main routing & application shell
│   │   ├── index.css                # Tailwind base & accessible styles
│   │   ├── components/              # Reusable UI components (Navbar, Footer, Voice, etc.)
│   │   ├── pages/                   # Application pages (Home, Schemes, Grievance, Policy, FactCheck)
│   │   └── utils/                   # Axios API instance, i18n dictionaries, LanguageContext
│   ├── public/                      # Static assets & _redirects for SPA routing
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── tailwind.config.js           # Extended civic color palette & typography
│   ├── vercel.json                  # Vercel deployment rewrites
│   ├── .env.example                 # Frontend environment template
│   └── vite.config.js               # Vite bundler configuration & /api proxy
│
├── Dockerfile                       # Root Dockerfile for containerized deployment
├── vercel.json                      # Root Vercel deployment configuration
├── DEPLOYMENT.md                    # Infrastructure guide & hardware resource details
├── start_backend.bat                # Windows 1-click backend startup
├── start_frontend.bat               # Windows 1-click frontend startup
├── .gitignore                       # Multi-stack gitignore
└── README.md                        # Project documentation
```

---

## 🚀 100% Free Deployment Guide

CivicPulse AI runs state-of-the-art transformer models (`bart-large-cnn`, `distilbert`, etc.). Because standard free tiers (Render/Railway free tiers) offer only 512MB RAM and crash with Out-Of-Memory (OOM), we recommend the following **completely free architecture**:

```
[ Citizens / Browsers ]
       │
       ├───> [ Frontend: Vercel / Netlify ] (100% Free Static Hosting & Global CDN)
       │       Build: `npm run build`
       │       Environment: `VITE_API_URL=https://<your-backend>.hf.space/api`
       │
       └───> [ Backend: Hugging Face Spaces ] (100% Free 16 GB RAM / 2 vCPU)
               Docker / FastAPI Backend
               Port: 7860
```

### Part 1: Deploy Backend for Free on Hugging Face Spaces (16 GB RAM)

1. Sign up for a free account at [Hugging Face](https://huggingface.co).
2. Go to [huggingface.co/new-space](https://huggingface.co/new-space).
3. Fill in:
   - **Space Name**: `civicpulse-api`
   - **License**: `MIT`
   - **Space SDK**: Select **Docker** -> **Blank**.
   - **Space Hardware**: **CPU Basic (2 vCPU · 16 GB RAM · Free)**.
4. Clone your new Hugging Face space repo locally or upload files:
   - Copy the contents of `backend/` into the Space (or copy `backend/*` and `backend/Dockerfile`).
   - If using Git:
     ```bash
     git clone https://huggingface.co/spaces/<your-username>/civicpulse-api
     cd civicpulse-api
     # Copy backend files and backend/Dockerfile to here
     git add .
     git commit -m "Deploy CivicPulse AI Backend"
     git push
     ```
5. In your Space's **Settings** -> **Variables and secrets**, add any optional environment variables:
   - `HF_API_TOKEN`: Your Hugging Face token (optional, from [settings/tokens](https://huggingface.co/settings/tokens)).
   - `DATA_GOV_API_KEY`: Your key from [data.gov.in](https://data.gov.in).
   - `CORS_ORIGINS`: `*` (or your Vercel frontend URL once deployed).
6. Once built, your Space URL will be:
   `https://<your-username>-civicpulse-api.hf.space`

---

### Part 2: Deploy Frontend for Free on Vercel

1. Push your code to your GitHub account (see [GitHub Setup Guide](#-pushing-to-github)).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New Project** and import your `CivicPulse-AI` repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (Click *Edit* and select `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-username>-civicpulse-api.hf.space/api` (the backend URL from Part 1).
6. Click **Deploy**. In under a minute, your website will be live at `https://civicpulse-ai.vercel.app`!

> **Alternative**: You can also deploy the frontend to **Netlify** or **Cloudflare Pages** by selecting `frontend` as base directory and `npm run build` as build command. The included `_redirects` file automatically handles single-page app routes.

---

## 🐙 Pushing to GitHub

Follow these steps to push this local folder to your GitHub account:

### 1. Create a Repository on GitHub
1. Log in to [GitHub](https://github.com).
2. Click **New Repository** (top-right `+` icon).
3. Name it `CivicPulse-AI` (or any name you prefer).
4. Leave it **Public** (or Private) and **do not** check "Initialize with README", ".gitignore", or "License" (we already configured them).
5. Click **Create repository**.

### 2. Push from your local terminal
Open PowerShell or your terminal in this project folder and run:

```bash
# 1. Stage all prepared files
git add .

# 2. Commit the files
git commit -m "feat: initial commit of CivicPulse AI platform"

# 3. Link your GitHub repository (replace with your actual GitHub URL)
git remote add origin https://github.com/<your-username>/CivicPulse-AI.git

# 4. Push to GitHub
git branch -M main
git push -u origin main
```

---

## ⚡ Local Quick Start

### Prerequisites
- **Python**: `3.10` or `3.11`
- **Node.js**: `18.x` or `20.x+` (with `npm`)
- **Memory**: 8 GB RAM recommended for local model inference

### 1. Setup Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Windows One-Click**: You can simply double-click `start_backend.bat` in the root folder!

Interactive API Documentation: **`http://localhost:8000/docs`**

### 2. Setup Frontend (React + Vite)

Open a new terminal window:

```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```

> **Windows One-Click**: You can simply double-click `start_frontend.bat` in the root folder!

Open your browser at: **`http://localhost:5173`**

---

## ⚙️ Environment Variables Reference

Copy `.env.example` to `backend/.env` to configure your keys:

| Variable | Required | Description | Source |
|---|---|---|---|
| `HF_API_TOKEN` | Optional | HuggingFace Token for rate-limit protection | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `DATA_GOV_API_KEY` | Optional | Data.gov.in API key for live dataset queries | [data.gov.in](https://data.gov.in) |
| `GEMINI_API_KEY` | Optional | Google Gemini Vision key for damage photo validation | [aistudio.google.com](https://aistudio.google.com) |
| `CORS_ORIGINS` | Optional | Comma-separated allowed frontend origins | e.g. `http://localhost:5173,https://your-app.vercel.app` |
| `SMTP_*` | Optional | SMTP credentials for automated grievance tracking emails | Gmail App Passwords / SendGrid |
| `VITE_API_URL` | Optional | Frontend API target URL (set in Vercel / frontend `.env`) | e.g. `https://your-backend.hf.space/api` |

---

## 📊 API Specification Overview

The backend exposes the following REST endpoints under `/api`:

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Service health and version status |
| `GET` | `/health` | Simple uptime probe (`{"status": "ok"}`) |
| `POST` | `/api/policy/explain` | Accepts raw policy text; returns structured plain-language summary & Hindi translation |
| `POST` | `/api/policy/translate` | Translates English text into Hindi using MarianMT |
| `POST` | `/api/grievance/submit` | Accepts complaint, coordinates, email & image; returns routed department, SLA & tracking token |
| `GET` | `/api/grievance/track/{token}` | Looks up registered grievance status by tracking token |
| `POST` | `/api/fact/check` | Evaluates viral claim against live Wikipedia articles using cross-encoder relevance scoring |
| `POST` | `/api/scheme/find` | Matches citizen demographic profile against welfare scheme catalog |
| `GET` | `/api/data/air-quality` | Queries live data.gov.in air quality monitoring dataset by state |
| `GET` | `/api/data/hospitals` | Queries live data.gov.in hospital & healthcare infrastructure dataset |
| `GET` | `/api/data/wiki-summary` | Fetches verified Wikipedia summary for public topics |
| `GET` | `/api/data/schemes-live` | Proxies live scheme catalog search from myscheme.gov.in |

---

## 🤖 Machine Learning Models Used

1. **`facebook/bart-large-cnn`**
   - **Purpose**: Abstractive policy summarization.
   - **Why Chosen**: Bidirectional and auto-regressive transformer trained on complex articles; condenses multi-page policy circulars into coherent citizen takeaways.
2. **`Helsinki-NLP/opus-mt-en-hi`**
   - **Purpose**: Neural machine translation (English to Hindi).
   - **Why Chosen**: Lightweight, deterministic transformer trained on parallel corpora, providing accessible localization without external proprietary APIs.
3. **`distilbert-base-uncased-finetuned-sst-2-english`**
   - **Purpose**: Grievance urgency classification.
   - **Why Chosen**: Retains 97% of BERT's performance with 40% fewer parameters, delivering low-latency sentiment and distress scoring.
4. **`cross-encoder/ms-marco-MiniLM-L-6-v2`**
   - **Purpose**: Semantic relevance scoring for claim verification.
   - **Why Chosen**: Computes cross-attention between user claims and retrieved Wikipedia evidence sentences to determine truthfulness verdicts.

---

## 🛡️ License & Transparency

- **License**: MIT License. Open source and free to use.
- **Independent Platform**: CivicPulse AI is an independent civic technology platform created for hackathon demonstration. It is not an official government agency.
- **AI Assistive Output**: AI-generated summaries and claim verifications are assistive and should be cross-referenced with primary government gazettes.

---

<div align="center">
  <sub>Built with ❤️ for Digital Governance & Citizen Empowerment</sub>
</div>
