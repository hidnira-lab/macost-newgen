# Macost

Pocket Management Information System untuk mahasiswa Indonesia — mengelola fixed
allowance (uang bulanan) dan side income (freelance/part-time) lewat goal-based
saving dan smart allocation berbasis AI.

Web app saja, dijalankan lokal untuk demo.

## Tech Stack

- **Frontend**: Next.js (App Router, TypeScript, Tailwind CSS)
- **Backend**: FastAPI (Python)
- **Database & Auth**: Supabase (PostgreSQL, cloud-hosted — bukan container lokal)

## Struktur Folder

```
macost-newgen/
├── frontend/     Next.js app
├── backend/      FastAPI app
├── docker-compose.yml
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

## Status Implementasi

- [x] Scaffold Next.js + FastAPI + docker-compose
- [x] Pydantic models untuk 6 entitas (Pengguna, Dompet, Kategori, Transaksi,
      Goal, Alokasi)
- [x] SAW engine (`backend/services/saw_engine.py`) — sudah bisa dites tanpa
      Supabase, guard untuk 0 goal & 1 goal sudah ada
- [x] Auth (register/login/logout via Supabase Auth)
- [x] CRUD Transaksi manual + auto source labeling dari kategori
- [x] Dashboard 5 KPI (breakdown kategori, progress goal, tren bulanan, alert
      overspending, total saldo)
- [x] CRUD Goal + integrasi SAW ranking (`GET /api/goals/ranking`)
- [x] Smart Allocation (suggest-and-confirm — `POST /api/allocations/suggest`
      hanya menghitung, `POST /api/allocations/confirm` satu-satunya endpoint
      yang menulis ke tabel alokasi)
- [x] AI Financial Assistant — insight card-based satu arah via Gemini Flash
      (`POST /api/insights/generate`), dipicu klik user, bukan chat
- [ ] Scan struk & upload e-statement (Gemini Flash API)

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
