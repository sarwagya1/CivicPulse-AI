# 🚀 CivicPulse AI — Deployment & Infrastructure Guide

This guide details the infrastructure requirements, hosting options, and hardware constraints for deploying CivicPulse AI in staging or production environments.

---

## ⚠️ Critical Hardware & Resource Constraints

CivicPulse AI runs deep learning transformer models in the backend. Hosting providers must satisfy the following resource profiles:

### 1. Model Footprint & Memory Consumption

| Component | Model / Package | Disk Weight | Memory (RAM) In-Use |
|---|---|---|---|
| **Policy Summarizer** | `facebook/bart-large-cnn` | ~1.63 GB | ~2.0 – 2.5 GB |
| **Language Translation** | `Helsinki-NLP/opus-mt-en-hi` | ~300 MB | ~500 MB |
| **Grievance Urgency** | `distilbert-base-uncased` | ~268 MB | ~350 MB |
| **Fact Claim Scorer** | `cross-encoder/ms-marco-MiniLM-L-6-v2` | ~90 MB | ~200 MB |
| **PyTorch & FastAPI Runtime** | `torch 2.3.0` + `fastapi` | ~1.5 GB | ~500 MB base |
| **Total Recommended** | — | **~4 GB Disk** | **4 GB RAM (Min) / 8 GB (Ideal)** |

### 2. Incompatible Platforms (Will Fail with Out-Of-Memory)
- ❌ **AWS Lambda / Vercel Serverless Functions**: 250MB–512MB limits are strictly insufficient for PyTorch and BART weights.
- ❌ **Render / Railway Free Tiers (512 MB RAM)**: Will crash with `Process killed (OOM)` during model initialization.
- ❌ **Heroku Eco Dynos (512 MB RAM)**: Insufficient memory and ephemeral disk discards the ~2.3GB model cache on every restart.

---

## 🖥️ Recommended Infrastructure Profiles

### Option A: Dedicated Cloud VM (Recommended for Stability)
- **Providers**: AWS EC2 (`t3.medium` with 4GB RAM + swap, or `t3.large`), DigitalOcean Droplet (4GB RAM, $24/mo), GCP (`e2-standard-2`, 8GB RAM).
- **Storage**: 25 GB SSD minimum (for OS, virtualenv, dependencies, and HuggingFace cache in `~/.cache/huggingface`).
- **OS**: Ubuntu 22.04 LTS or Debian 12.

### Option B: Container / PaaS Platform (Paid Resource Tiers)
- **Railway**: Deploy backend with a Dockerfile or Nixpacks; set service memory limit to 4 GB or 8 GB.
- **Render**: Paid Web Service tier (Starter Plus with 2GB–4GB RAM).
- **Fly.io**: Dedicated machine with `--memory 4096` or `--memory 8192`.

---

## 🌐 Split-Deployment Architecture

For optimal performance and minimal hosting costs, deploy the frontend and backend separately:

```
[ Citizens / Browsers ]
       │
       ├───> [ Frontend: Vercel / Netlify / Cloudflare Pages ] (Static CDN, Free)
       │       Build: `npm run build` -> `dist/`
       │       Environment: `VITE_API_URL=https://api.yourdomain.com`
       │
       └───> [ Backend: Cloud VM / Railway / Docker ] (FastAPI + HuggingFace)
               Host: `0.0.0.0:8000`
               Environment: `CORS_ORIGINS=https://your-frontend.vercel.app`
```

---

## 🛠️ Step-by-Step Production Setup (Ubuntu VM Example)

### 1. Server Provisioning
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv git nginx
```

### 2. Backend Setup
```bash
git clone https://github.com/your-username/civicpulse-ai.git /var/www/civicpulse
cd /var/www/civicpulse/backend

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Pre-download model weights into disk cache so first user request is fast
python preload_models.py
```

### 3. Configure Production Environment
```bash
cp ../.env.example .env
nano .env
# Set CORS_ORIGINS to your frontend domain
# Set DATA_GOV_API_KEY, HF_API_TOKEN, SMTP credentials
```

### 4. Systemd Service (Process Management)
Create `/etc/systemd/system/civicpulse.service`:
```ini
[Unit]
Description=CivicPulse AI FastAPI Service
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/var/www/civicpulse/backend
ExecStart=/var/www/civicpulse/backend/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 1
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now civicpulse
```

> **Note on Workers:** Because transformer models occupy ~3 GB RAM per worker process, keep `--workers 1` on a 4 GB RAM server. Scaling horizontally requires additional memory.

---

## 📋 Status of Tested Environments

- ✅ **Tested & Verified**:
  - Local Windows 10/11 environment with Python 3.11 virtualenv and Vite 5 / Node 24.
  - End-to-end API communication via Vite local proxy (`/api` -> `http://localhost:8000`).
  - Production frontend build (`npm run build` to static `dist/`).
  - Model loading and CPU inference for all 4 HuggingFace models.

- ⚠️ **Untested / Future Work**:
  - Multi-worker Gunicorn deployments under high concurrency.
  - Multi-stage Docker containerization and Docker Compose builds.
  - Cloud GPU acceleration (NVIDIA CUDA / TensorRT).
  - Production Nginx reverse-proxy SSL termination.
