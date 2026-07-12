from datetime import date

from pydantic import BaseModel


class BreakdownKategoriItem(BaseModel):
    kategori_id: str
    nama_kategori: str
    total_nominal: float


class ProgressGoalItem(BaseModel):
    goal_id: str
    nama_goal: str
    nominal_target: float
    current_saved: float
    progress_percent: float
    deadline: date


class TrenBulananItem(BaseModel):
    bulan: str
    total_pemasukan: float
    total_pengeluaran: float


class AlertOverspending(BaseModel):
    is_overspending: bool
    total_pemasukan_bulan_ini: float
    total_pengeluaran_bulan_ini: float
    selisih: float
    pesan: str


class DashboardSummary(BaseModel):
    breakdown_kategori: list[BreakdownKategoriItem]
    progress_goal: list[ProgressGoalItem]
    tren_bulanan: list[TrenBulananItem]
    alert_overspending: AlertOverspending
    total_saldo: float
