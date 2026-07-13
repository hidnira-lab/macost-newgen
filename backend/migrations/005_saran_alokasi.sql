-- Migration 005: persisted pending allocation suggestions
-- Unblocks the Pending Allocations screen. Previously POST /allocations/suggest
-- was purely ephemeral (computed and returned, never stored) — if the user
-- dismissed the inline modal without confirming, the suggestion was gone for
-- good. Now /suggest upserts a row here (keyed by transaksi_id, so re-calling
-- it for the same transaction updates rather than duplicates), /confirm marks
-- the matching row 'confirmed', and a new bulk-dismiss endpoint marks all of
-- a user's pending rows 'dismissed'.
-- Jalankan di Supabase SQL Editor.

create table public.saran_alokasi (
  id                          uuid primary key default gen_random_uuid(),
  transaksi_id                uuid not null unique references public.transaksi (id) on delete cascade,
  goal_id                     uuid not null references public.goal (id) on delete cascade,
  pengguna_id                 uuid not null references public.pengguna (id) on delete cascade,
  nominal_alokasi_disarankan  numeric(14, 2) not null check (nominal_alokasi_disarankan > 0),
  persentase                  smallint not null,
  pesan                       text not null,
  status                      text not null default 'pending'
                                check (status in ('pending', 'confirmed', 'dismissed')),
  created_at                  timestamptz not null default now()
);

create index idx_saran_alokasi_pengguna_status on public.saran_alokasi (pengguna_id, status);

alter table public.saran_alokasi enable row level security;

create policy "saran_alokasi_owner_all"
  on public.saran_alokasi for all
  using (auth.uid() = pengguna_id)
  with check (auth.uid() = pengguna_id);
