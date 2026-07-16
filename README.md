# Macost

**Pocket Management Information System** untuk mahasiswa Indonesia — mengelola
*fixed allowance* (uang bulanan) dan *side income* (freelance/part-time)
lewat goal-based saving dan smart allocation berbasis AI.

Web app, dijalankan lokal untuk demo atau di-deploy ke Railway + Vercel.

## Fitur

- **Auth** — register/login/logout via Supabase Auth, wallet default otomatis
  dibuat saat register.
- **CRUD Transaksi** — source (`Fixed Routine`/`Flexible Side Income`) dan
  tipe (`Pemasukan`/`Pengeluaran`) otomatis diturunkan dari kategori, saldo
  dompet ter-reconcile otomatis.
- **Dashboard** — 5 KPI: breakdown kategori, progress goal, tren bulanan,
  alert overspending, total saldo.
- **Goal + SAW Ranking** — ranking goal pakai algoritma *Simple Additive
  Weighting*, bobot kriteria (importance/urgency/progress gap/dst)
  dikonfigurasi per-user di layar Goal Prioritization.
- **Smart Allocation** — suggest-and-confirm: saran alokasi 35% dari side
  income ke goal prioritas tertinggi, tidak pernah auto-commit; saran yang
  di-skip tetap tersimpan dan bisa ditinjau lagi lewat Pending Allocations.
- **AI Financial Assistant** — insight card-based satu arah lewat Gemini
  Flash, dipicu klik user (bukan chat), grounded ke data transaksi/goal asli.
- **Scan Struk & Upload E-Statement** — ekstraksi via Gemini Vision, hasil
  selalu lewat form/preview yang bisa dikoreksi user sebelum disimpan (tidak
  pernah auto-save langsung).
- **Manage Wallets** — CRUD dompet dengan preset ikon populer (GoPay, OVO,
  DANA, Bank).

Lihat [`STATUS.md`](./STATUS.md) untuk detail verifikasi tiap fitur dan
known limitations.

## Tech Stack

- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS)
- **Backend**: FastAPI (Python)
- **Database & Auth**: Supabase (PostgreSQL, cloud-hosted — bukan container lokal)
- **AI**: Gemini Flash (insight & vision extraction)

## Struktur Folder

```
macost-newgen/
├── frontend/     Next.js app (App Router)
│   └── src/app/(protected)/   dashboard, goals, home, insights, profile,
│                              transactions, wallets, dll
├── backend/      FastAPI app
│   ├── routers/  auth, transactions, dashboard, goals, allocations,
│   │             insights, receipts, statements, wallets, saw_weights
│   └── services/ saw_engine, gemini_client, gemini_vision_client, dll
├── docker-compose.yml
├── DEPLOY.md
├── STATUS.md
└── README.md
```

## Setup

### 1. Isi environment variables

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Isi `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dll di kedua file `.env` setelah project
Supabase dibuat.

### 2a. Jalankan dengan Docker Compose (disarankan)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (docs di http://localhost:8000/docs)

### 2b. Jalankan manual tanpa Docker

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

### 3. Jalankan test suite (backend)

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

Cakupan saat ini: unit test murni untuk `services/saw_engine.py` (algoritma
ranking SAW), `services/json_repair.py`, dan `services/kategori_matcher.py`
(tanpa Supabase sama sekali), test `services/gemini_client.py`/
`gemini_vision_client.py` dengan Gemini API di-mock (retry/fallback model,
dan memastikan pesan error mentah dari Google tidak pernah bocor ke user),
plus router/integration test untuk `routers/allocations.py` dan
`routers/wallets.py` lewat FastAPI `TestClient` dengan Supabase client
di-fake (`tests/fakes.py::FakeSupabaseClient`, bukan Supabase asli) —
meng-cover invariant paling kritis: suggest alokasi tidak pernah menulis ke
tabel `alokasi` (cuma `confirm` yang boleh), dan wallet dengan transaksi
terkait tidak bisa dihapus (409). Router lain (auth, transactions,
categories, dashboard, insights, receipts, statements, goals, saw_weights)
dan CI otomatis belum dicakup.

## Deploy

Lihat [`DEPLOY.md`](./DEPLOY.md) untuk runbook deploy backend ke Railway
dan frontend ke Vercel.

## CI

`.github/workflows/ci.yml` menjalankan dua job paralel di tiap push/PR ke
`main`: backend `pytest` (Python 3.12, tanpa secrets sama sekali — seluruh
test suite pakai fake/mock, bukan Supabase/Gemini asli) dan frontend
`npm run lint` + `npm run build` (Node 22, juga tanpa secrets karena satu-
satunya env var yang dibaca frontend, `NEXT_PUBLIC_API_BASE_URL`, punya
fallback default). `design-reference/` (raw Figma Make export, bukan kode
app) dikecualikan dari lint lewat `eslint.config.mjs`.

## Data Model

| Entitas    | Field                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| Pengguna   | id, nama, email, password (hashed via Supabase Auth)                                        |
| Dompet     | id, nama_dompet, saldo, pengguna_id                                                          |
| Kategori   | id, nama_kategori, tipe, flag_pemasukan, flag_pengeluaran                                    |
| Transaksi  | id, tipe_transaksi, nominal, tanggal, metode_input, pengguna_id, dompet_id, kategori_id      |
| Goal       | id, nama_goal, nominal_target, deadline, skor_keinginan, skor_kepentingan, pengguna_id       |
| Alokasi    | id, nominal_alokasi, tanggal_alokasi, transaksi_id, goal_id                                  |

## SAW Engine — Bobot Kriteria

| Kriteria             | Bobot | Arah    |
| --------------------- | ----- | ------- |
| personal_importance    | 22.5% | benefit |
| progress_gap            | 21.9% | benefit |
| saving_capacity        | 21.5% | benefit |
| urgency                 | 17.8% | cost    |
| target_amount          | 16.2% | benefit |

Bobot ini adalah default; user bisa mengubahnya sendiri lewat layar Goal
Prioritization (`GET`/`PUT /api/saw-weights`).
