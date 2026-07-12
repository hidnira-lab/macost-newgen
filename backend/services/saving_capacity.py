from datetime import date, timedelta

from supabase import Client

CAPACITY_WINDOW_DAYS = 90
CAPACITY_MONTHS = 3


def compute_monthly_saving_capacity(db: Client, pengguna_id: str) -> float:
    """Rata-rata net saving (pemasukan - pengeluaran) per bulan dari transaksi
    90 hari terakhir. Dipakai SAW engine (kriteria saving_capacity) dan smart
    allocation. Floor di 0 karena SAW normalize_benefit sudah punya guard
    untuk semua nilai 0, tapi tidak untuk nilai negatif."""
    cutoff = date.today() - timedelta(days=CAPACITY_WINDOW_DAYS)
    result = (
        db.table("transaksi")
        .select("tipe_transaksi, nominal")
        .eq("pengguna_id", pengguna_id)
        .gte("tanggal", cutoff.isoformat())
        .execute()
    )
    rows = result.data or []
    total_in = sum(r["nominal"] for r in rows if r["tipe_transaksi"] == "Pemasukan")
    total_out = sum(r["nominal"] for r in rows if r["tipe_transaksi"] == "Pengeluaran")
    return max((total_in - total_out) / CAPACITY_MONTHS, 0.0)
