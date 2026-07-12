from supabase import Client


def compute_total_saldo(db: Client, pengguna_id: str) -> float:
    result = db.table("dompet").select("saldo").eq("pengguna_id", pengguna_id).execute()
    return sum(row["saldo"] for row in (result.data or []))
