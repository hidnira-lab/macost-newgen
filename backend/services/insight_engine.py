import json

from supabase import Client

from core.config import settings
from services.expense_breakdown import compute_expense_breakdown
from services.gemini_client import GeminiError, generate_json_text
from services.goal_progress import compute_goal_progress
from services.goal_ranking import rank_user_goals
from services.json_repair import repair_and_parse_json
from services.monthly_trend import compute_monthly_trend
from services.wallet_balance import compute_total_saldo

VALID_TIPE = {"positive", "warning", "info", "tip"}

PROMPT_TEMPLATE = """Kamu adalah AI Financial Assistant di aplikasi Macost, membantu mahasiswa Indonesia mengelola uang bulanan (allowance) dan side income lewat goal-based saving.

Berdasarkan data keuangan user berikut (format JSON), berikan 3-5 insight singkat, konkret, dan actionable dalam Bahasa Indonesia. ini adalah insight satu arah (bukan chat), jadi tulis seolah kamu langsung menyampaikan observasi ke user.

Data:
{data_json}

Aturan:
- Kalau data transaksi/goal masih sangat sedikit atau kosong, jangan mengarang angka -- cukup beri 1-2 insight yang mendorong user mulai mencatat transaksi dan membuat goal.
- Sebutkan angka konkret dari data (nominal, persentase, nama kategori/goal) kalau relevan, jangan generik.
- Setiap insight maksimal 2 kalimat.
- Balas HANYA dengan JSON array, tanpa markdown, tanpa teks lain. Setiap elemen:
  {{"title": "judul singkat", "body": "1-2 kalimat insight", "tipe": "positive" | "warning" | "info" | "tip"}}
  - "positive": kabar baik/pencapaian
  - "warning": ada risiko/butuh perhatian (mis. overspending, goal berisiko meleset deadline)
  - "info": observasi netral
  - "tip": saran konkret yang bisa langsung dilakukan
"""


def _build_data_summary(db: Client, pengguna_id: str) -> dict:
    trend = compute_monthly_trend(db, pengguna_id)
    breakdown = compute_expense_breakdown(db, pengguna_id)
    goals = compute_goal_progress(db, pengguna_id)
    rank_map = {r.goal_id: r.rank for r in rank_user_goals(db, pengguna_id)}
    total_saldo = compute_total_saldo(db, pengguna_id)

    return {
        "total_saldo": total_saldo,
        "tren_bulanan_6_bulan_terakhir": trend,
        "breakdown_pengeluaran_bulan_ini": breakdown,
        "goals": [
            {
                "nama_goal": g["nama_goal"],
                "nominal_target": g["nominal_target"],
                "terkumpul": g["current_saved"],
                "progress_persen": g["progress_percent"],
                "deadline": g["deadline"],
                "prioritas_saw_rank": rank_map.get(g["id"]),
            }
            for g in goals
        ],
    }


def generate_insights(db: Client, pengguna_id: str) -> list[dict]:
    summary = _build_data_summary(db, pengguna_id)
    prompt = PROMPT_TEMPLATE.format(data_json=json.dumps(summary, ensure_ascii=False))

    raw = generate_json_text(prompt, settings.gemini_api_key)
    try:
        parsed = repair_and_parse_json(raw)
    except json.JSONDecodeError as exc:
        raise GeminiError(f"Tidak bisa parse JSON dari respons Gemini: {raw[:300]}") from exc

    if not isinstance(parsed, list):
        raise GeminiError("Respons Gemini bukan JSON array")

    cards = []
    for item in parsed:
        tipe = item.get("tipe") if isinstance(item, dict) else None
        if tipe not in VALID_TIPE:
            tipe = "info"
        cards.append(
            {
                "title": str(item.get("title", "")).strip(),
                "body": str(item.get("body", "")).strip(),
                "tipe": tipe,
            }
        )
    return cards
