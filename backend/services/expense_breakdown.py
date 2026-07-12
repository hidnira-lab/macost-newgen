from datetime import date

from supabase import Client


def compute_expense_breakdown(db: Client, pengguna_id: str) -> list[dict]:
    """Total pengeluaran per kategori untuk bulan berjalan, diurutkan dari
    terbesar. Dipakai dashboard KPI #1 dan AI insight engine."""
    today = date.today()
    bulan_ini_awal = date(today.year, today.month, 1)

    result = (
        db.table("transaksi")
        .select("nominal, tanggal, kategori_id, kategori(nama_kategori)")
        .eq("pengguna_id", pengguna_id)
        .eq("tipe_transaksi", "Pengeluaran")
        .gte("tanggal", bulan_ini_awal.isoformat())
        .execute()
    )

    breakdown_map: dict[str, dict] = {}
    for row in result.data or []:
        kategori_id = row["kategori_id"]
        nama = (row.get("kategori") or {}).get("nama_kategori", "Lainnya")
        entry = breakdown_map.setdefault(kategori_id, {"nama_kategori": nama, "total_nominal": 0.0})
        entry["total_nominal"] += row["nominal"]

    return [
        {"kategori_id": k, **v}
        for k, v in sorted(breakdown_map.items(), key=lambda item: item[1]["total_nominal"], reverse=True)
    ]
