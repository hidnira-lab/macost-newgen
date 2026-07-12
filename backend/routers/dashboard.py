from datetime import date

from fastapi import APIRouter, Depends
from supabase import Client

from core.security import CurrentUser, get_current_user, get_user_client
from models.dashboard import (
    AlertOverspending,
    BreakdownKategoriItem,
    DashboardSummary,
    ProgressGoalItem,
    TrenBulananItem,
)
from services.expense_breakdown import compute_expense_breakdown
from services.goal_progress import compute_goal_progress
from services.monthly_trend import compute_monthly_trend
from services.wallet_balance import compute_total_saldo

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    current_user: CurrentUser = Depends(get_current_user),
    db: Client = Depends(get_user_client),
):
    # 1. Breakdown pengeluaran per kategori (bulan berjalan)
    breakdown_kategori = [
        BreakdownKategoriItem(
            kategori_id=row["kategori_id"],
            nama_kategori=row["nama_kategori"],
            total_nominal=row["total_nominal"],
        )
        for row in compute_expense_breakdown(db, current_user.id)
    ]

    # 2. Progress goal aktif
    progress_goal = [
        ProgressGoalItem(
            goal_id=g["id"],
            nama_goal=g["nama_goal"],
            nominal_target=g["nominal_target"],
            current_saved=g["current_saved"],
            progress_percent=g["progress_percent"],
            deadline=date.fromisoformat(g["deadline"]),
        )
        for g in compute_goal_progress(db, current_user.id)
    ]

    # 3. Tren bulanan (income vs expense), 6 bulan terakhir
    trend_rows = compute_monthly_trend(db, current_user.id)
    tren_bulanan = [TrenBulananItem(**row) for row in trend_rows]

    # 4. Alert overspending (bulan berjalan: pengeluaran vs pemasukan)
    current_month = trend_rows[-1]
    total_pemasukan_bulan_ini = current_month["total_pemasukan"]
    total_pengeluaran_bulan_ini = current_month["total_pengeluaran"]
    selisih = total_pemasukan_bulan_ini - total_pengeluaran_bulan_ini
    is_overspending = total_pengeluaran_bulan_ini > total_pemasukan_bulan_ini
    pesan = (
        "Pengeluaran bulan ini sudah melebihi pemasukan."
        if is_overspending
        else "Pengeluaran bulan ini masih dalam batas pemasukan."
    )
    alert_overspending = AlertOverspending(
        is_overspending=is_overspending,
        total_pemasukan_bulan_ini=total_pemasukan_bulan_ini,
        total_pengeluaran_bulan_ini=total_pengeluaran_bulan_ini,
        selisih=selisih,
        pesan=pesan,
    )

    # 5. Total saldo (prioritas visual terendah)
    total_saldo = compute_total_saldo(db, current_user.id)

    return DashboardSummary(
        breakdown_kategori=breakdown_kategori,
        progress_goal=progress_goal,
        tren_bulanan=tren_bulanan,
        alert_overspending=alert_overspending,
        total_saldo=total_saldo,
    )
