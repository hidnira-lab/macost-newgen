-- Migration 004: editable profile fields (phone, city)
-- Unblocks the Edit Profile screen. Name is already on `pengguna`; email is
-- intentionally not editable here (it's the Supabase Auth identity and
-- needs Auth's own verified-email-change flow, out of scope). Both new
-- columns are nullable since existing users have never filled them in.
-- Jalankan di Supabase SQL Editor.

alter table public.pengguna
  add column if not exists telepon text,
  add column if not exists kota text;
