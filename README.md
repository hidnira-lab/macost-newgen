```
#   #   ###    ####   ###    ####  #####
## ##  #   #  #      #   #  #        #
# # #  #####  #      #   #   ###     #
#   #  #   #  #      #   #      #    #
#   #  #   #   ####   ###   ####     #
```

# Macost

Pocket Management Information System for Indonesian students. Manage fixed
allowance (monthly pocket money) and side income (freelance/part-time work)
through goal-based saving and AI-powered smart allocation.

**Live demo:** [macost-newgen.vercel.app](https://macost-newgen.vercel.app/)

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## Features

- **Auth** via Supabase Auth (register/login/logout), with a default wallet
  created automatically on signup.
- **Transaction CRUD** where source (Fixed Routine / Flexible Side Income)
  and type (Income/Expense) are derived automatically from the chosen
  category, with wallet balance reconciled on every change.
- **Dashboard** showing 5 KPIs: category breakdown, goal progress, monthly
  trend, overspending alert, total balance.
- **Goal ranking with SAW** (Simple Additive Weighting), an algorithm that
  ranks savings goals by configurable criteria weights (importance,
  urgency, progress gap, and more), adjustable per user.
- **Smart Allocation**, a suggest-and-confirm flow that proposes putting 35%
  of side income toward the top-ranked goal. Nothing is committed
  automatically, and skipped suggestions stay reviewable later.
- **AI Financial Assistant** powered by Gemini Flash, giving one-way,
  card-based insights grounded in the user's real transaction and goal
  data (triggered by a button click, not a chat interface).
- **Receipt scanning & bank statement upload** via Gemini Vision, always
  routed through an editable form or preview table before anything is
  saved.
- **Wallet management** with popular preset icons (GoPay, OVO, DANA, Bank).

See [`STATUS.md`](./STATUS.md) for detailed verification notes and known
limitations.

## Project Structure

```
macost-newgen/
├── frontend/     Next.js app (App Router)
│   └── src/app/(protected)/   dashboard, goals, home, insights, profile,
│                              transactions, wallets, and more
├── backend/      FastAPI app
│   ├── routers/  auth, transactions, dashboard, goals, allocations,
│   │             insights, receipts, statements, wallets, saw_weights
│   └── services/ saw_engine, gemini_client, gemini_vision_client, and more
├── docker-compose.yml
├── DEPLOY.md
├── STATUS.md
└── README.md
```

## Getting Started

### 1. Set environment variables

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and the rest in both `.env`
files once your Supabase project exists.

### 2a. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (docs at http://localhost:8000/docs)

### 2b. Run manually without Docker

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Run the backend test suite

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Current coverage: pure unit tests for `services/saw_engine.py` (the SAW
ranking algorithm), `services/json_repair.py`, and
`services/kategori_matcher.py` (no Supabase involved at all), tests for
`services/gemini_client.py`/`gemini_vision_client.py` with the Gemini API
mocked (retry/fallback model, plus checks that raw error messages from
Google never leak to the user), and router/integration tests for
`routers/allocations.py` and `routers/wallets.py` through FastAPI's
`TestClient` with a fake Supabase client (`tests/fakes.py::FakeSupabaseClient`,
not the real thing). These cover the two most critical invariants: the
suggest endpoint never writes to the `alokasi` table (only confirm does),
and a wallet with linked transactions cannot be deleted (409). Other
routers (auth, transactions, categories, dashboard, insights, receipts,
statements, goals, saw_weights) and automated CI are not covered yet.

## Deployment

See [`DEPLOY.md`](./DEPLOY.md) for the full runbook to deploy the backend
to Railway and the frontend to Vercel.

## CI

`.github/workflows/ci.yml` runs two parallel jobs on every push/PR to
`main`: backend `pytest` (Python 3.12, zero secrets since the whole test
suite runs on fakes/mocks instead of real Supabase/Gemini) and frontend
`npm run lint` + `npm run build` (Node 22, also zero secrets since the
only env var the frontend reads, `NEXT_PUBLIC_API_BASE_URL`, has a
default fallback). `design-reference/` (a raw Figma Make export, not app
code) is excluded from linting via `eslint.config.mjs`.

## Data Model

| Entity     | Fields                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Pengguna   | id, nama, email, password (hashed via Supabase Auth)                                          |
| Dompet     | id, nama_dompet, saldo, pengguna_id                                                            |
| Kategori   | id, nama_kategori, tipe, flag_pemasukan, flag_pengeluaran                                      |
| Transaksi  | id, tipe_transaksi, nominal, tanggal, metode_input, pengguna_id, dompet_id, kategori_id        |
| Goal       | id, nama_goal, nominal_target, deadline, skor_keinginan, skor_kepentingan, pengguna_id         |
| Alokasi    | id, nominal_alokasi, tanggal_alokasi, transaksi_id, goal_id                                    |

## SAW Engine Criteria Weights

| Criterion            | Weight | Direction |
| --------------------- | ------ | --------- |
| personal_importance    | 22.5%  | benefit   |
| progress_gap            | 21.9%  | benefit   |
| saving_capacity        | 21.5%  | benefit   |
| urgency                 | 17.8%  | cost      |
| target_amount          | 16.2%  | benefit   |

These are the defaults; users can adjust them from the Goal Prioritization
screen (`GET`/`PUT /api/saw-weights`).
