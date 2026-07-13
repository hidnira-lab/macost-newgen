-- Migration 006: persist the latest AI insight batch per user
-- Previously POST /insights/generate was purely ephemeral (returned to the
-- frontend, held only in React state) -- navigating away from the AI
-- Assistant screen and back reset it to empty, forcing a brand new (slow,
-- quota-consuming) Gemini call every time. Now each generation upserts one
-- row per user here, and GET /insights/latest lets the frontend restore it.
-- Jalankan di Supabase SQL Editor.

create table public.insight_terakhir (
  id           uuid primary key default gen_random_uuid(),
  pengguna_id  uuid not null unique references public.pengguna (id) on delete cascade,
  insights     jsonb not null,
  generated_at timestamptz not null default now()
);

alter table public.insight_terakhir enable row level security;

create policy "insight_terakhir_owner_all"
  on public.insight_terakhir for all
  using (auth.uid() = pengguna_id)
  with check (auth.uid() = pengguna_id);
