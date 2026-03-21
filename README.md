# GovMind.AI
# 🏛️ GovMind.AI

> *Government moves slow. Businesses can't afford to.*

The average business permit takes 4–6 weeks to process.
GovMind.AI does it in under 5 minutes.

Not because we cut corners.
Because we finally applied intelligence to a system that never had any.

---

## The Problem Nobody Talks About

Every day, thousands of small business owners — restaurants, contractors,
retail shops, food trucks — sit waiting. Waiting for a permit. Waiting for
a license. Waiting for a signature from someone who hasn't checked their
inbox in three days.

Meanwhile their lease is running. Their staff is waiting. Their dream is
bleeding money.

The government isn't evil. It's just never had the right tools.

**GovMind.AI is the right tool.**

---

## What It Does

Submit a permit application online.
Upload your documents.
Get an AI-powered decision in minutes.

Every decision comes with:
- A full reasoning trace — not a black box
- A confidence score — so you know how certain the AI is
- A "Request Human Review" button — because humans stay in control, always

---

## Tech Stack

| Frontend | Backend | Infrastructure |
|----------|---------|----------------|
| Next.js 14 | FastAPI | Vercel |
| TypeScript | PostgreSQL | Render |
| Tailwind CSS | SQLAlchemy 2.0 | GitHub Actions |
| Lucide React | Pydantic v2 | Docker |
| DM Sans + Instrument Serif | Fernet encryption | Apache 2.0 |

---

## Core Principles

**No black boxes** — Every AI decision includes timestamp, reason,
confidence score, and who can reverse it.

**PII never stored raw** — Owner names, Tax IDs, addresses masked
before they touch the database. Always.

**Humans stay in control** — Every AI decision has a one-click
human override. The audit trail is append-only — never erased.

---

## Getting Started

### Docker (recommended)

```bash
git clone https://github.com/YOUR_USERNAME/govmind-ai.git
cd govmind-ai
cp .env.example .env

# Generate SECRET_KEY
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Paste output into .env as SECRET_KEY

docker-compose up --build
Frontend → http://localhost:3000
Backend API → http://localhost:8000
API Docs → http://localhost:8000/docs
Manual Setup
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev
API Reference
Method
Endpoint
Description
POST
/api/v1/permits/submit
Submit application + file
GET
/api/v1/permits/all
List all applications
GET
/api/v1/permits/{id}
Get application + audit trace
POST
/api/v1/permits/{id}/review
Human override
GET
/health
Health check
Deployment
Push to main → GitHub Actions automatically deploys:
Frontend to Vercel
Backend to Render
Required GitHub Secrets:
RENDER_API_KEY
RENDER_SERVICE_ID
RENDER_BACKEND_URL
VERCEL_TOKEN
SECRET_KEY
The Bigger Vision
Permits are just the beginning.
Business licenses. Food service certifications. Construction approvals.
Zoning requests. Tax registrations. Health inspections.
Every interaction a citizen has with their government that currently
requires a form, a wait, and a prayer — GovMind.AI turns into a conversation.
We're not automating government.
We're giving it a brain.

GovMind.AI — Government Services, now Automated with AI.
Apache 2.0 License — use it, build on it, improve it.
Just don't remove the audit trail. That part matters.
Here's my website link : https://gov-mind-9lhty1wfb-naman20101s-projects.vercel.app/
---

# ━━━ FINAL REPORT ━━━

## Complete File List — All 44 Files

| # | File | Status |
|---|------|--------|
| 1 | `backend/app/__init__.py` | ✅ |
| 2 | `backend/app/core/__init__.py` | ✅ |
| 3 | `backend/app/models/__init__.py` | ✅ |
| 4 | `backend/app/schemas/__init__.py` | ✅ |
| 5 | `backend/app/routers/__init__.py` | ✅ |
| 6 | `backend/app/services/__init__.py` | ✅ |
| 7 | `backend/app/core/audit.py` | ✅ |
| 8 | `backend/app/core/security.py` | ✅ |
| 9 | `backend/app/core/config.py` | ✅ |
| 10 | `backend/app/models/permit.py` | ✅ |
| 11 | `backend/app/schemas/permit.py` | ✅ |
| 12 | `backend/app/routers/permits.py` | ✅ |
| 13 | `backend/app/main.py` | ✅ |
| 14 | `backend/app/services/extractor.py` | ✅ |
| 15 | `backend/app/services/reviewer.py` | ✅ |
| 16 | `backend/alembic/env.py` | ✅ |
| 17 | `backend/alembic.ini` | ✅ |
| 18 | `backend/alembic/versions/.gitkeep` | ✅ |
| 19 | `backend/Dockerfile` | ✅ |
| 20 | `backend/requirements.txt` | ✅ |
| 21 | `frontend/app/globals.css` | ✅ |
| 22 | `frontend/app/layout.tsx` | ✅ |
| 23 | `frontend/app/page.tsx` | ✅ |
| 24 | `frontend/app/apply/page.tsx` | ✅ |
| 25 | `frontend/app/status/page.tsx` | ✅ |
| 26 | `frontend/app/status/[id]/page.tsx` | ✅ |
| 27 | `frontend/app/admin/page.tsx` | ✅ |
| 28 | `frontend/components/Navbar.tsx` | ✅ |
| 29 | `frontend/components/Footer.tsx` | ✅ |
| 30 | `frontend/components/AuditTraceViewer.tsx` | ✅ |
| 31 | `frontend/lib/api.ts` | ✅ |
| 32 | `frontend/package.json` | ✅ |
| 33 | `frontend/tailwind.config.ts` | ✅ |
| 34 | `frontend/next.config.ts` | ✅ |
| 35 | `frontend/tsconfig.json` | ✅ |
| 36 | `frontend/postcss.config.js` | ✅ |
| 37 | `frontend/vercel.json` | ✅ |
| 38 | `docker-compose.yml` | ✅ |
| 39 | `.env.example` | ✅ |
| 40 | `.gitignore` | ✅ |
| 41 | `LICENSE` | ✅ |
| 42 | `README.md` | ✅ |
| 43 | `.github/workflows/ci.yml` | ✅ |
| 44 | `.github/workflows/render-deploy.yml` | ✅ |
