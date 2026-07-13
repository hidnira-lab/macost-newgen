export type TipeKategori = "Pemasukan" | "Pengeluaran";
export type FlagPemasukan = "Fixed Routine" | "Flexible Side Income";
export type FlagPengeluaran = "Kebutuhan" | "Keinginan";
export type MetodeInput = "Manual" | "Scan Struk" | "Upload E-Statement";
export type WalletIcon = "Banknote" | "Smartphone" | "Building2" | "Landmark" | "CreditCard" | "GraduationCap";

export interface Dompet {
  id: string;
  nama_dompet: string;
  icon: WalletIcon;
  warna: string;
  saldo: number;
  pengguna_id: string;
  created_at: string;
}

export interface SAWWeights {
  personal_importance: number;
  progress_gap: number;
  saving_capacity: number;
  urgency: number;
  target_amount: number;
}

export interface DompetCreateRequest {
  nama_dompet: string;
  icon: WalletIcon;
  warna: string;
  saldo?: number;
}

export interface Kategori {
  id: string;
  nama_kategori: string;
  tipe: TipeKategori;
  flag_pemasukan: FlagPemasukan | null;
  flag_pengeluaran: FlagPengeluaran | null;
}

export interface Transaksi {
  id: string;
  tipe_transaksi: TipeKategori;
  nominal: number;
  tanggal: string;
  metode_input: MetodeInput;
  pengguna_id: string;
  dompet_id: string;
  kategori_id: string;
  nama_kategori: string;
  source: FlagPemasukan | null;
}

export interface TransaksiCreateRequest {
  kategori_id: string;
  nominal: number;
  tanggal: string;
  metode_input?: MetodeInput;
}

export interface User {
  id: string;
  email: string;
  nama?: string | null;
  telepon?: string | null;
  kota?: string | null;
}

export interface PenggunaUpdateRequest {
  nama?: string;
  telepon?: string;
  kota?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string | null;
  refresh_token: string | null;
  email_confirmation_required?: boolean;
}

export interface BreakdownKategoriItem {
  kategori_id: string;
  nama_kategori: string;
  total_nominal: number;
}

export interface ProgressGoalItem {
  goal_id: string;
  nama_goal: string;
  nominal_target: number;
  current_saved: number;
  progress_percent: number;
  deadline: string;
}

export interface TrenBulananItem {
  bulan: string;
  total_pemasukan: number;
  total_pengeluaran: number;
}

export interface AlertOverspending {
  is_overspending: boolean;
  total_pemasukan_bulan_ini: number;
  total_pengeluaran_bulan_ini: number;
  selisih: number;
  pesan: string;
}

export interface DashboardSummary {
  breakdown_kategori: BreakdownKategoriItem[];
  progress_goal: ProgressGoalItem[];
  tren_bulanan: TrenBulananItem[];
  alert_overspending: AlertOverspending;
  total_saldo: number;
}

export interface Goal {
  id: string;
  nama_goal: string;
  nominal_target: number;
  deadline: string;
  skor_keinginan: number;
  skor_kepentingan: number;
  pengguna_id: string;
  current_saved: number;
  progress_percent: number;
}

export interface GoalCreateRequest {
  nama_goal: string;
  nominal_target: number;
  deadline: string;
  skor_keinginan: number;
  skor_kepentingan: number;
}

export interface GoalRankingItem {
  goal_id: string;
  nama_goal: string;
  score: number;
  rank: number;
  criteria_scores: Record<string, number>;
}

export interface AllocationSuggestion {
  transaksi_id: string;
  has_goal: boolean;
  goal_id: string | null;
  nama_goal: string | null;
  nominal_alokasi_disarankan: number;
  persentase: number;
  pesan: string;
}

export interface AllocationConfirmRequest {
  transaksi_id: string;
  goal_id: string;
  nominal_alokasi: number;
}

export interface AllocationPending {
  id: string;
  transaksi_id: string;
  goal_id: string;
  nama_goal: string;
  nominal_alokasi_disarankan: number;
  persentase: number;
  pesan: string;
  created_at: string;
  current_saved: number;
  nominal_target: number;
  progress_percent: number;
}

export interface Alokasi {
  id: string;
  nominal_alokasi: number;
  tanggal_alokasi: string;
  transaksi_id: string;
  goal_id: string;
}

export type InsightTipe = "positive" | "warning" | "info" | "tip";

export interface InsightCard {
  title: string;
  body: string;
  tipe: InsightTipe;
}

export interface InsightResponse {
  insights: InsightCard[];
}

export interface ReceiptExtraction {
  success: boolean;
  nominal: number | null;
  tanggal: string | null;
  deskripsi: string | null;
  kategori_id_suggestion: string | null;
  nama_kategori_suggestion: string | null;
  missing_fields: string[];
  error_reason: string | null;
  error_message: string | null;
}

export interface StatementTransactionCandidate {
  tanggal: string | null;
  deskripsi: string;
  nominal: number;
  tipe_transaksi: TipeKategori;
  kategori_id_suggestion: string | null;
  nama_kategori_suggestion: string | null;
}

export interface StatementExtractionResponse {
  success: boolean;
  transactions: StatementTransactionCandidate[];
  error_reason: string | null;
  error_message: string | null;
}
