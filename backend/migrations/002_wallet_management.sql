-- Migration 002: wallet management
-- Adds icon/color presets (for the Kelola Dompet screen) and a created_at
-- column so the backend can deterministically resolve each user's "primary"
-- wallet (oldest by creation) instead of relying on unordered row order.
-- Jalankan di Supabase SQL Editor.

alter table public.dompet
  add column if not exists icon text not null default 'Banknote',
  add column if not exists warna text not null default '#22C55E',
  add column if not exists created_at timestamptz not null default now();

alter table public.dompet
  add constraint dompet_icon_check
  check (icon in ('Banknote', 'Smartphone', 'Building2', 'Landmark', 'CreditCard', 'GraduationCap'));

create index if not exists idx_dompet_pengguna_created on public.dompet (pengguna_id, created_at);
