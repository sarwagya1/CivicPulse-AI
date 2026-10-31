# 🏛️ CivicPulse AI

> **Digital Governance & Public Information Intelligence Platform**  
> *Built for the NITroFORGE Hackathon | Civic Pulse Track*

CivicPulse AI is an open, full-stack civic technology platform designed to democratize public administration. It simplifies complex government notifications, matches citizens to eligible welfare schemes, automatically routes and assesses civic grievances, and fact-checks public claims using **HuggingFace Transformers**, **Computer Vision**, and **live Indian Open Government APIs**.

---

## 🌟 Key Features

| Feature | Description | Underlying Technology / APIs |
|---|---|---|
| **Scheme Finder** | Enter citizen demographic profile (age, state, category, income, occupation) to find matching welfare schemes. Features 1-click persona presets, in-page search, and verified official portal links. | `myscheme.gov.in` API + Built-in Official Welfare Catalog |
| **Grievance Portal** | Report civic issues with auto-routing to competent authorities, GPS location detection, optional damage photo upload with AI relevance validation, automated tracking tokens, and HTML email confirmation. | `distilbert-base-uncased` + Computer Vision / Gemini Vision + CPGRAMS / MoRTH / Jal Shakti Portals |
| **Policy Explainer** | Transform dense legal acts, gazette notifications, and policy circulars into structured plain-language summaries in English and Hindi. | `facebook/bart-large-cnn` + `Helsinki-NLP/opus-mt-en-hi` |
| **Fact Checker** | Verify viral claims and public statements against real-time reference sources with confidence scoring. | `cross-encoder/ms-marco-MiniLM-L-6-v2` + Wikipedia REST API |

---

## 🎨 UI/UX Design Standards

The frontend interface incorporates verified design principles adapted from leading global public service platforms:
- **[GOV.UK Design System](https://design-system.service.gov.uk/)**: High-contrast, accessible typography, clear service hierarchy, fieldsets with explanatory hint text, skip-to-content links, and full `@media (prefers-reduced-motion: reduce)` support.
- **[myScheme](https://www.myscheme.gov.in/)**: Scheme discovery hierarchy, ministry badges, direct benefit transfer (DBT) callouts, and verified official government portal action buttons.
- **[Canada Benefits Finder](https://www.canada.ca/en/services/benefits/finder.html)**: Guided multi-step questionnaires, quick-fill persona presets, and a dynamic "Profile at a Glance" summary card.
- **Bilingual Interface**: Seamless instant toggling between **English** and **Hindi (हिन्दी)** across all pages.

---

## 📁 Repository Structure

```
hack_project/
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
│   ├── .env.example                 # Backend environment variable template
│   └── preload_models.py            # Optional script to pre-download HuggingFace weights
│
├── frontend/                        # React 18 + Vite 5 Single Page Application
│   ├── src/
│   │   ├── App.jsx                  # Main routing & application shell
│   │   ├── index.css                # Tailwind base, accessible badges, motion rules
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Accessible navigation bar with mobile drawer
│   │   │   ├── Footer.jsx           # Civic information & verified source credits
│   │   │   ├── ServiceBanner.jsx    # Independence disclaimer & national helplines
│   │   │   └── Breadcrumbs.jsx      # Progressive service navigation
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Service journeys, metrics & model transparency
│   │   │   ├── SchemeFinder.jsx     # Multi-step eligibility questionnaire
│   │   │   ├── GrievancePortal.jsx  # Grievance registration & live tracking
│   │   │   ├── PolicyExplainer.jsx  # Bilingual policy document summarizer
│   │   │   └── FactChecker.jsx      # Claim verification & evidence dashboard
│   │   └── utils/
│   │       ├── api.js               # Axios instance with API prefix & proxy
│   │       ├── i18n.js              # Comprehensive English/Hindi dictionaries
│   │       └── LanguageContext.jsx  # React context for locale persistence
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── tailwind.config.js           # Extended civic color palette & typography
│   └── vite.config.js               # Vite bundler configuration & /api proxy
│
├── .env.example                     # Root environment configuration template
├── .gitignore                       # Multi-stack gitignore (Python, Node, secrets)
├── DEPLOYMENT.md                    # Hosting guide & hardware resource constraints
├── start_backend.bat                # Windows one-click backend startup script
├── start_frontend.bat               # Windows one-click frontend startup script
└── README.md                        # Project documentation
```

---

## ⚡ Prerequisites

- **Python**: Version `3.10` or `3.11` (Python 3.11 recommended)
- **Node.js**: Version `18.x` or `20.x+` (with `npm`)
- **Memory (RAM)**: Minimum **8 GB RAM** recommended (models occupy ~3.5 GB in memory)
- **Disk Space**: ~4 GB free disk space for HuggingFace model cache (`~/.cache/huggingface`)

---

## 🚀 Quick Start (Local Setup)

### 1. Clone & Setup Environment

```bash
# Clone the repository
git clone https://github.com/your-username/civicpulse-ai.git
cd civicpulse-ai

# Create backend environment configuration
cp .env.example backend/.env
```

Edit `backend/.env` to configure your keys:
- `DATA_GOV_API_KEY`: Free API key from [data.gov.in](https://data.gov.in)
- `HF_API_TOKEN`: Free token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- `SMTP_*`: (Optional) Configure Gmail or SMTP credentials to enable confirmation emails

---

### 2. Run Backend (FastAPI)

#### Windows One-Click:
Double-click `start_backend.bat`, or execute via terminal:

#### Manual Setup (Linux / macOS / Windows):
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

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> **Note on Initial Run:** When an endpoint is first called, HuggingFace downloads the respective model weights (BART ~1.6GB, Helsinki-NLP ~300MB, DistilBERT ~270MB, Cross-Encoder ~90MB). Subsequent runs use the local cache instantly.

Interactive OpenAPI Documentation: **`http://localhost:8000/docs`**

---

### 3. Run Frontend (React + Vite)

#### Windows One-Click:
Double-click `start_frontend.bat`, or execute via terminal:

#### Manual Setup:
```bash
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```

Application URL: **`http://localhost:5173`**

---

## 📊 API Specification Overview

The FastAPI backend exposes the following REST endpoints under `/api`:

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Service health and version status |
| `GET` | `/health` | Simple uptime probe (`{"status": "ok"}`) |
| `POST` | `/api/policy/explain` | Accepts raw policy text; returns structured summary, purpose, benefits, procedures, deadlines, and Hindi translation |
| `POST` | `/api/policy/translate` | Translates provided English text into Hindi using MarianMT |
| `POST` | `/api/grievance/submit` | Accepts complaint description, location, email, and optional image; returns routed department, severity, SLA, tracking token, and official portal escalation info |
| `GET` | `/api/grievance/track/{token}` | Looks up registered grievance status by tracking token |
| `POST` | `/api/fact/check` | Evaluates viral claim against live Wikipedia articles using cross-encoder relevance scoring |
| `POST` | `/api/scheme/find` | Evaluates citizen profile and returns matched schemes with benefit and eligibility criteria |
| `GET` | `/api/data/air-quality` | Queries live data.gov.in air quality monitoring dataset by state |
| `GET` | `/api/data/hospitals` | Queries live data.gov.in hospitals and healthcare infrastructure dataset |
| `GET` | `/api/data/wiki-summary` | Fetches verified Wikipedia summary for public topics |
| `GET` | `/api/data/schemes-live` | Proxies live scheme catalog search from myscheme.gov.in |

---

## 🤖 Machine Learning Models Used

1. **`facebook/bart-large-cnn`**
   - **Purpose**: Abstractive policy summarization.
   - **Why Chosen**: Bidirectional and auto-regressive transformer trained on complex articles; excels at condensing multi-page policy circulars into coherent citizen takeaways.
2. **`Helsinki-NLP/opus-mt-en-hi`**
   - **Purpose**: Neural machine translation (English to Hindi).
   - **Why Chosen**: Lightweight, deterministic transformer trained on parallel corpora, providing accessible localization without external proprietary APIs.
3. **`distilbert-base-uncased-finetuned-sst-2-english`**
   - **Purpose**: Grievance urgency classification.
   - **Why Chosen**: Retains 97% of BERT's performance with 40% fewer parameters, delivering low-latency sentiment and distress scoring.
4. **`cross-encoder/ms-marco-MiniLM-L-6-v2`**
   - **Purpose**: Semantic relevance scoring for claim verification.
   - **Why Chosen**: Computes cross-attention between a user claim and retrieved Wikipedia evidence sentences to determine truthfulness verdicts.

---

## 🔧 Troubleshooting

- **First-request latency**: On first startup, HuggingFace models download and load weights into memory. Allow 1–3 minutes on initial requests.
- **PowerShell Execution Policy on Windows**: If `npm` gives an execution policy error, run scripts via `npm.cmd` or set your policy using `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.
- **CORS Issues in Production**: Ensure `CORS_ORIGINS` in your backend `.env` includes the deployed frontend origin (e.g. `https://your-frontend.vercel.app`).
- **Memory Pressure**: If running on low-resource machines, avoid triggering all 4 models simultaneously. See [DEPLOYMENT.md](DEPLOYMENT.md) for sizing guidelines.

---

## 🛡️ Limitations & Transparency

- **Independent Platform**: CivicPulse AI is an independent civic technology platform created for hackathon demonstration. It is not an official government agency and does not issue legal certifications.
- **AI Assistive Output**: AI-generated summaries, visual damage estimates, and claim verifications are assistive and should be cross-referenced with primary government gazettes and competent authorities.
- **Live External APIs**: External endpoints (`myscheme.gov.in`, `data.gov.in`, `en.wikipedia.org`) are subject to third-party availability and rate limits. The platform includes local fallback catalogs to ensure continuous availability.

---

*CivicPulse AI • Built for NITroFORGE Hackathon | Real Government APIs | Open Source Models*
