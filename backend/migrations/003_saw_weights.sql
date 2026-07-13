-- Migration 003: configurable SAW criteria weights
-- Lets a user override the fixed CRITERIA_WEIGHTS in services/saw_engine.py
-- with their own percentages (must sum to ~100), unblocking the Goal
-- Prioritization screen. One row per user; absence of a row means "use the
-- system default" (handled in application code, not backfilled here).
-- Jalankan di Supabase SQL Editor.

create table public.pengaturan_saw (
  pengguna_id          uuid primary key references public.pengguna (id) on delete cascade,
  personal_importance  numeric(5, 2) not null default 22.5 check (personal_importance >= 0),
  progress_gap         numeric(5, 2) not null default 21.9 check (progress_gap >= 0),
  saving_capacity      numeric(5, 2) not null default 21.5 check (saving_capacity >= 0),
  urgency              numeric(5, 2) not null default 17.8 check (urgency >= 0),
  target_amount        numeric(5, 2) not null default 16.2 check (target_amount >= 0),
  updated_at           timestamptz not null default now()
);

alter table public.pengaturan_saw enable row level security;

create policy "pengaturan_saw_owner_all"
  on public.pengaturan_saw for all
  using (auth.uid() = pengguna_id)
  with check (auth.uid() = pengguna_id);
