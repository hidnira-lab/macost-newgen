from datetime import date

from supabase import Client

TREN_BULAN_COUNT = 6


def _shift_month(d: date, months: int) -> date:
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    return date(year, month, 1)


def compute_monthly_trend(db: Client, pengguna_id: str, months: int = TREN_BULAN_COUNT) -> list[dict]:
    """Total pemasukan/pengeluaran per bulan, `months` bulan terakhir termasuk
    bulan berjalan. Dipakai dashboard KPI #3 dan AI insight engine."""
    today = date.today()
    bulan_ini_awal = date(today.year, today.month, 1)

    bulan_totals: dict[str, dict[str, float]] = {}
    bulan_keys: list[str] = []
    for offset in range(months - 1, -1, -1):
        bulan_date = _shift_month(bulan_ini_awal, -offset)
        key = f"{bulan_date.year:04d}-{bulan_date.month:02d}"
        bulan_keys.append(key)
        bulan_totals[key] = {"total_pemasukan": 0.0, "total_pengeluaran": 0.0}

    earliest = _shift_month(bulan_ini_awal, -(months - 1))
    result = (
        db.table("transaksi")
        .select("tipe_transaksi, nominal, tanggal")
        .eq("pengguna_id", pengguna_id)
        .gte("tanggal", earliest.isoformat())
        .execute()
    )
    for row in result.data or []:
        tanggal = date.fromisoformat(row["tanggal"])
        key = f"{tanggal.year:04d}-{tanggal.month:02d}"
        if key not in bulan_totals:
            continue
        if row["tipe_transaksi"] == "Pemasukan":
            bulan_totals[key]["total_pemasukan"] += row["nominal"]
        else:
            bulan_totals[key]["total_pengeluaran"] += row["nominal"]

    return [{"bulan": key, **bulan_totals[key]} for key in bulan_keys]
