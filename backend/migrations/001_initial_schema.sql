-- Macost - Initial Schema
-- 6 entitas: pengguna, dompet, kategori, transaksi, goal, alokasi
-- Jalankan di Supabase SQL Editor (project sudah harus punya Supabase Auth aktif).

create extension if not exists pgcrypto;

-- =========================================================
-- TABLES
-- =========================================================

-- Pengguna: profil tambahan di atas auth.users (password dikelola Supabase Auth)
create table public.pengguna (
  id    uuid primary key references auth.users (id) on delete cascade,
  nama  text not null,
  email text not null unique
);

-- Dompet
create table public.dompet (
  id           uuid primary key default gen_random_uuid(),
  nama_dompet  text not null,
  saldo        numeric(14, 2) not null default 0,
  pengguna_id  uuid not null references public.pengguna (id) on delete cascade
);

-- Kategori: shared/global, tidak terikat pengguna_id
create table public.kategori (
  id               uuid primary key default gen_random_uuid(),
  nama_kategori    text not null unique,
  tipe             text not null check (tipe in ('Pemasukan', 'Pengeluaran')),
  flag_pemasukan   text check (flag_pemasukan in ('Fixed Routine', 'Flexible Side Income')),
  flag_pengeluaran text check (flag_pengeluaran in ('Kebutuhan', 'Keinginan')),
  constraint kategori_flag_consistency check (
    (tipe = 'Pemasukan' and flag_pemasukan is not null and flag_pengeluaran is null)
    or
    (tipe = 'Pengeluaran' and flag_pengeluaran is not null and flag_pemasukan is null)
  )
);

-- Transaksi
create table public.transaksi (
  id             uuid primary key default gen_random_uuid(),
  tipe_transaksi text not null check (tipe_transaksi in ('Pemasukan', 'Pengeluaran')),
  nominal        numeric(14, 2) not null check (nominal > 0),
  tanggal        date not null default current_date,
  metode_input   text not null default 'Manual'
                   check (metode_input in ('Manual', 'Scan Struk', 'Upload E-Statement')),
  pengguna_id    uuid not null references public.pengguna (id) on delete cascade,
  dompet_id      uuid not null references public.dompet (id) on delete cascade,
  kategori_id    uuid not null references public.kategori (id) on delete restrict
);

-- Goal
-- Catatan: constraint "deadline di masa depan" dievaluasi ulang setiap UPDATE,
-- jadi goal lama yang deadline-nya sudah lewat tidak bisa di-UPDATE (kecuali
-- deadline-nya ikut dimajukan). Ini konsekuensi yang disengaja, bukan bug.
create table public.goal (
  id                uuid primary key default gen_random_uuid(),
  nama_goal         text not null,
  nominal_target    numeric(14, 2) not null check (nominal_target > 0),
  deadline          date not null check (deadline > current_date),
  skor_keinginan    smallint not null check (skor_keinginan between 1 and 5),
  skor_kepentingan  smallint not null check (skor_kepentingan between 1 and 5),
  pengguna_id       uuid not null references public.pengguna (id) on delete cascade
);

-- Alokasi
create table public.alokasi (
  id               uuid primary key default gen_random_uuid(),
  nominal_alokasi  numeric(14, 2) not null check (nominal_alokasi > 0),
  tanggal_alokasi  date not null default current_date,
  transaksi_id     uuid not null references public.transaksi (id) on delete cascade,
  goal_id          uuid not null references public.goal (id) on delete cascade
);

-- =========================================================
-- INDEXES
-- =========================================================

create index idx_dompet_pengguna_id on public.dompet (pengguna_id);
create index idx_transaksi_pengguna_id on public.transaksi (pengguna_id);
create index idx_transaksi_dompet_id on public.transaksi (dompet_id);
create index idx_transaksi_kategori_id on public.transaksi (kategori_id);
create index idx_goal_pengguna_id on public.goal (pengguna_id);
create index idx_alokasi_transaksi_id on public.alokasi (transaksi_id);
create index idx_alokasi_goal_id on public.alokasi (goal_id);

-- =========================================================
-- AUTO-CREATE PENGGUNA PROFILE ON SIGNUP
-- Trigger ini membuat baris `pengguna` otomatis begitu ada baris baru di
-- auth.users (dipicu oleh supabase.auth.sign_up). Endpoint register di
-- backend cukup memanggil Supabase Auth dan mengirim `nama` lewat user
-- metadata, tidak perlu INSERT manual ke tabel pengguna.
-- =========================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.pengguna (id, nama, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nama', new.email), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY
-- Semua tabel: user hanya bisa akses data miliknya sendiri,
-- kecuali `kategori` yang shared/read-only untuk semua user login.
-- =========================================================

alter table public.pengguna enable row level security;
alter table public.dompet enable row level security;
alter table public.kategori enable row level security;
alter table public.transaksi enable row level security;
alter table public.goal enable row level security;
alter table public.alokasi enable row level security;

-- pengguna: hanya boleh lihat & update profil sendiri (insert ditangani trigger)
create policy "pengguna_select_own"
  on public.pengguna for select
  using (auth.uid() = id);

create policy "pengguna_update_own"
  on public.pengguna for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- dompet: CRUD penuh untuk pemilik
create policy "dompet_owner_all"
  on public.dompet for all
  using (auth.uid() = pengguna_id)
  with check (auth.uid() = pengguna_id);

-- kategori: read-only untuk semua user yang login, tidak ada policy write
-- (insert/update/delete hanya lewat service_role, misalnya saat seeding)
create policy "kategori_read_all"
  on public.kategori for select
  to authenticated
  using (true);

-- transaksi: CRUD penuh untuk pemilik
create policy "transaksi_owner_all"
  on public.transaksi for all
  using (auth.uid() = pengguna_id)
  with check (auth.uid() = pengguna_id);

-- goal: CRUD penuh untuk pemilik
create policy "goal_owner_all"
  on public.goal for all
  using (auth.uid() = pengguna_id)
  with check (auth.uid() = pengguna_id);

-- alokasi: tidak punya pengguna_id langsung, kepemilikan diturunkan dari
-- transaksi & goal yang direferensikan (keduanya harus milik user yang sama)
create policy "alokasi_owner_all"
  on public.alokasi for all
  using (
    exists (
      select 1 from public.transaksi t
      where t.id = alokasi.transaksi_id
        and t.pengguna_id = auth.uid()
    )
    and exists (
      select 1 from public.goal g
      where g.id = alokasi.goal_id
        and g.pengguna_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.transaksi t
      where t.id = alokasi.transaksi_id
        and t.pengguna_id = auth.uid()
    )
    and exists (
      select 1 from public.goal g
      where g.id = alokasi.goal_id
        and g.pengguna_id = auth.uid()
    )
  );

-- =========================================================
-- SEED DATA: kategori umum
-- =========================================================

insert into public.kategori (nama_kategori, tipe, flag_pemasukan, flag_pengeluaran) values
  ('Makan & Minum',          'Pengeluaran', null,                     'Kebutuhan'),
  ('Transportasi',           'Pengeluaran', null,                     'Kebutuhan'),
  ('Kos & Sewa Tempat Tinggal', 'Pengeluaran', null,                  'Kebutuhan'),
  ('Kebutuhan Kuliah',       'Pengeluaran', null,                     'Kebutuhan'),
  ('Kesehatan',              'Pengeluaran', null,                     'Kebutuhan'),
  ('Hiburan',                'Pengeluaran', null,                     'Keinginan'),
  ('Belanja & Fashion',      'Pengeluaran', null,                     'Keinginan'),
  ('Nongkrong & Kafe',       'Pengeluaran', null,                     'Keinginan'),
  ('Uang Saku Bulanan',      'Pemasukan',   'Fixed Routine',          null),
  ('Freelance & Part-Time',  'Pemasukan',   'Flexible Side Income',   null)
on conflict (nama_kategori) do nothing;
