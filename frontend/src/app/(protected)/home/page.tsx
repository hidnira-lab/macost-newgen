"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, ChevronRight, TrendingUp, TrendingDown, Sparkles, ScanLine, Target, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import BottomNav from "@/components/bottom-nav";
import CategoryIcon from "@/components/category-icon";
import AddTransactionModal from "@/components/add-transaction-modal";
import LoadingState from "@/components/loading-state";
import ScanReceiptModal from "@/components/scan-receipt-modal";
import AllocationSuggestionModal from "@/components/allocation-suggestion-modal";
import StatementImportModal from "@/components/statement-import-modal";
import type {
  AllocationSuggestion,
  DashboardSummary,
  Goal,
  GoalRankingItem,
  Kategori,
  MetodeInput,
  StatementExtractionResponse,
  Transaksi,
} from "@/types";

type ActiveModal = "none" | "add" | "scan";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default function HomePage() {
  const { token, user } = useAuth();

  const [categories, setCategories] = useState<Kategori[]>([]);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ranking, setRanking] = useState<GoalRankingItem[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ActiveModal>("none");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [suggestion, setSuggestion] = useState<AllocationSuggestion | null>(null);
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  const [statementLoading, setStatementLoading] = useState(false);
  const [statementResult, setStatementResult] = useState<StatementExtractionResponse | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const statementInputRef = useRef<HTMLInputElement>(null);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [cats, txns, gls, rank, dash] = await Promise.all([
        api.categories(token),
        api.transactions.list(token),
        api.goals.list(token),
        api.goals.ranking(token),
        api.dashboard.summary(token),
      ]);
      setCategories(cats);
      setTransactions(txns);
      setGoals(gls);
      setRanking(rank);
      setSummary(dash);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  // loadAll is also reused by every save/import handler below, so it isn't
  // split into an effect-only variant just to satisfy the linter.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadAll();
  }, [token]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  async function createTransaction(
    payload: { kategoriId: string; nominal: number; tanggal: string },
    metodeInput: MetodeInput
  ) {
    if (!token) return;
    setSaving(true);
    setActionError(null);
    try {
      const created = await api.transactions.create(token, {
        kategori_id: payload.kategoriId,
        nominal: payload.nominal,
        tanggal: payload.tanggal,
        metode_input: metodeInput,
      });
      if (created.tipe_transaksi === "Pemasukan" && created.source === "Flexible Side Income") {
        try {
          const s = await api.allocations.suggest(token, { transaksi_id: created.id });
          setSuggestion(s);
        } catch {
          // non-fatal: a failed suggestion shouldn't block the transaction flow
        }
      }
      setActiveModal("none");
      await loadAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Gagal menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatementFileChange(file: File) {
    if (!token) return;
    setActiveModal("none");
    setShowStatementModal(true);
    setStatementLoading(true);
    setStatementResult(null);
    try {
      const result = await api.statements.extract(token, file);
      setStatementResult(result);
    } catch (err) {
      setStatementResult({
        success: false,
        transactions: [],
        error_reason: "api_error",
        error_message: err instanceof ApiError ? err.message : "Gagal mengekstrak dokumen.",
      });
    } finally {
      setStatementLoading(false);
      if (statementInputRef.current) statementInputRef.current.value = "";
    }
  }

  function closeStatementModal() {
    setShowStatementModal(false);
    setStatementResult(null);
  }

  async function handleConfirmAllocation(nominalAlokasi: number) {
    if (!token || !suggestion?.goal_id) return;
    await api.allocations.confirm(token, {
      transaksi_id: suggestion.transaksi_id,
      goal_id: suggestion.goal_id,
      nominal_alokasi: nominalAlokasi,
    });
    setSuggestion(null);
    setShowAllocationModal(false);
    await loadAll();
  }

  function handleDismissAllocation() {
    setSuggestion(null);
    setShowAllocationModal(false);
  }

  const totalIncome = transactions
    .filter((t) => t.tipe_transaksi === "Pemasukan")
    .reduce((a, t) => a + t.nominal, 0);
  const totalExpense = transactions
    .filter((t) => t.tipe_transaksi === "Pengeluaran")
    .reduce((a, t) => a + t.nominal, 0);
  const balance = summary?.total_saldo ?? 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 5);

  const rankByGoalId = new Map(ranking.map((r) => [r.goal_id, r]));
  const topGoals = [...ranking]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 2)
    .map((r) => goals.find((g) => g.id === r.goal_id))
    .filter((g): g is Goal => Boolean(g));
  const topGoal = topGoals[0] ?? null;

  const displayName = user?.nama || user?.email || "";
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#E8EEF4",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          boxShadow: "0 0 60px rgba(7,37,72,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            backgroundColor: "#FCFCFC",
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-inter), sans-serif",
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {loading ? (
              <LoadingState />
            ) : loadError ? (
              <p style={{ padding: 24, fontSize: 14, color: "#DC2626" }}>{loadError}</p>
            ) : (
              <div style={{ paddingBottom: 24 }}>
                {/* Header */}
                <div style={{ padding: "22px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 13, color: "#717182", margin: "0 0 2px" }}>Selamat datang</p>
                    <h1
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#1E1E1E",
                        margin: 0,
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      {displayName}
                    </h1>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #298DFF, #072548)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 18,
                      boxShadow: "0 4px 12px rgba(41,141,255,0.4)",
                    }}
                  >
                    {avatarInitial}
                  </div>
                </div>

                {actionError && (
                  <div style={{ padding: "0 16px 14px" }}>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#DC2626",
                        backgroundColor: "#FEF2F2",
                        border: "1.5px solid rgba(239,68,68,0.25)",
                        borderRadius: 12,
                        padding: "10px 14px",
                        margin: 0,
                      }}
                    >
                      {actionError}
                    </p>
                  </div>
                )}

                {/* Quick Access Panel */}
                <div style={{ padding: "0 16px 14px" }}>
                  <div
                    style={{
                      borderRadius: 20,
                      overflow: "hidden",
                      background: "linear-gradient(135deg, #F0F7FF 0%, #F8F3FF 100%)",
                      border: "1.5px solid rgba(41,141,255,0.12)",
                      boxShadow: "0 2px 16px rgba(41,141,255,0.08)",
                    }}
                  >
                    <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#A0A0A8", margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Akses Cepat
                      </p>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.6)" }} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 10px 10px" }}>
                      {/* Card 1 - Add Transaction */}
                      <button
                        type="button"
                        onClick={() => setActiveModal("add")}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "14px 14px 12px",
                          borderRadius: 16,
                          border: "none",
                          background: "linear-gradient(135deg, #298DFF, #0070E0)",
                          cursor: "pointer",
                          textAlign: "left",
                          boxShadow: "0 4px 14px rgba(41,141,255,0.32)",
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Plus size={20} color="white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 1px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>Tambah</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0 }}>Transaksi baru</p>
                        </div>
                      </button>

                      {/* Card 2 - Scan Receipt */}
                      <button
                        type="button"
                        onClick={() => setActiveModal("scan")}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "14px 14px 12px",
                          borderRadius: 16,
                          border: "none",
                          background: "linear-gradient(135deg, #FF8929, #E86800)",
                          cursor: "pointer",
                          textAlign: "left",
                          boxShadow: "0 4px 14px rgba(255,137,41,0.32)",
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <ScanLine size={20} color="white" strokeWidth={2} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 1px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>Scan</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", margin: 0 }}>Scan struk</p>
                        </div>
                      </button>

                      {/* Card 3 - Top Priority Goal, links to /goals (no add-funds shortcut) */}
                      {topGoal ? (
                        (() => {
                          const goalPct = topGoal.progress_percent;
                          const rank = rankByGoalId.get(topGoal.id)?.rank;
                          return (
                            <Link
                              href="/goals"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                gap: 6,
                                padding: "14px 14px 12px",
                                borderRadius: 16,
                                border: "1.5px solid rgba(168,85,247,0.2)",
                                backgroundColor: "white",
                                textAlign: "left",
                                boxShadow: "0 2px 10px rgba(168,85,247,0.1)",
                                textDecoration: "none",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "#F5F3FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Target size={18} color="#A855F7" strokeWidth={2} />
                                </div>
                                <span style={{ fontSize: 18, fontWeight: 900, color: "#A855F7", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                                  {rank ? `#${rank}` : `${goalPct}%`}
                                </span>
                              </div>
                              <div style={{ width: "100%" }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: "#1E1E1E", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {topGoal.nama_goal}
                                </p>
                                <div style={{ height: 5, backgroundColor: "#F0F0F0", borderRadius: 99, overflow: "hidden" }}>
                                  <div style={{ height: "100%", borderRadius: 99, width: `${goalPct}%`, backgroundColor: "#A855F7" }} />
                                </div>
                              </div>
                            </Link>
                          );
                        })()
                      ) : (
                        <Link
                          href="/goals"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            padding: 14,
                            borderRadius: 16,
                            border: "1.5px dashed #E0E0E0",
                            backgroundColor: "white",
                            textDecoration: "none",
                          }}
                        >
                          <Target size={22} color="#C0C0C8" />
                          <p style={{ fontSize: 12, color: "#C0C0C8", margin: 0, fontWeight: 500 }}>Buat Goal</p>
                        </Link>
                      )}

                      {/* Card 4 - Balance */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 6,
                          padding: "14px 14px 12px",
                          borderRadius: 16,
                          border: "1.5px solid rgba(7,37,72,0.1)",
                          background: "linear-gradient(135deg, #F0F4FA, #E8EEF8)",
                        }}
                      >
                        <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(7,37,72,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Wallet size={18} color="#072548" strokeWidth={2} />
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: "#717182", margin: "0 0 2px", fontWeight: 500 }}>Saldo</p>
                          <p style={{ fontSize: 13, fontWeight: 800, color: "#072548", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif", lineHeight: 1.1 }}>
                            {formatRupiah(balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Card */}
                <div style={{ padding: "0 16px 14px" }}>
                  <div
                    style={{
                      borderRadius: 22,
                      padding: "22px 22px 20px",
                      background: "linear-gradient(145deg, #072548 0%, #0F3870 55%, #1858A0 100%)",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 10px 36px rgba(7,37,72,0.4)",
                    }}
                  >
                    <div style={{ position: "absolute", top: -40, right: -30, width: 150, height: 150, borderRadius: "50%", backgroundColor: "rgba(41,141,255,0.18)" }} />
                    <div style={{ position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: "50%", backgroundColor: "rgba(41,141,255,0.1)" }} />
                    <div style={{ position: "absolute", top: 20, right: 90, width: 60, height: 60, borderRadius: "50%", backgroundColor: "rgba(255,137,41,0.12)" }} />

                    <p style={{ fontSize: 12, color: "rgba(180,210,255,0.85)", margin: "0 0 6px", position: "relative", fontWeight: 500 }}>Total Saldo</p>
                    <p style={{ fontSize: 32, fontWeight: 800, margin: "0 0 18px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", position: "relative", letterSpacing: "-0.8px", lineHeight: 1.1 }}>
                      {formatRupiah(balance)}
                    </p>

                    <div style={{ display: "flex", gap: 28, position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(74,222,128,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TrendingUp size={14} color="#4ade80" />
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: "rgba(180,210,255,0.7)", margin: 0, fontWeight: 500 }}>Pemasukan</p>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{formatRupiah(totalIncome)}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "rgba(251,113,133,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TrendingDown size={14} color="#fb7185" />
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: "rgba(180,210,255,0.7)", margin: 0, fontWeight: 500 }}>Pengeluaran</p>
                          <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{formatRupiah(totalExpense)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Transaction Button */}
                <div style={{ padding: "0 16px 12px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveModal("add")}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      padding: 15,
                      borderRadius: 18,
                      border: "none",
                      background: "linear-gradient(135deg, #298DFF 0%, #0070E0 100%)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: "0 6px 20px rgba(41,141,255,0.4)",
                      fontFamily: "var(--font-inter), sans-serif",
                      letterSpacing: "0.01em",
                    }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    Tambah Transaksi
                  </button>
                </div>

                {/* Smart Allocation Banner - only when a real suggestion exists */}
                {suggestion && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAllocationModal(true)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        borderRadius: 16,
                        border: "1.5px solid rgba(255,137,41,0.25)",
                        backgroundColor: "#FFF8F3",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 13,
                            background: "linear-gradient(135deg, #FF8929, #FFB36B)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 3px 10px rgba(255,137,41,0.3)",
                          }}
                        >
                          <Sparkles size={19} color="white" />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: 0 }}>Saran Alokasi Cerdas</p>
                          <p style={{ fontSize: 12, color: "#996633", margin: "2px 0 0" }}>Pemasukan barumu bisa dioptimalkan!</p>
                        </div>
                      </div>
                      <ChevronRight size={16} color="#FF8929" />
                    </button>
                  </div>
                )}

                {/* Goals Section */}
                <div style={{ paddingBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 12px" }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E1E1E", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                      Target Tabungan
                    </h2>
                    <Link
                      href="/goals"
                      style={{ display: "flex", alignItems: "center", gap: 2, color: "#298DFF", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-inter), sans-serif", textDecoration: "none" }}
                    >
                      Semua <ChevronRight size={14} />
                    </Link>
                  </div>

                  {topGoals.length === 0 ? (
                    <p style={{ padding: "0 16px", fontSize: 13, color: "#A0A0A8" }}>Belum ada goal.</p>
                  ) : (
                    <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "0 16px 4px" }}>
                      {topGoals.map((goal) => {
                        const pct = goal.progress_percent;
                        const rank = rankByGoalId.get(goal.id)?.rank;
                        const isHigh = pct >= 50;
                        return (
                          <div
                            key={goal.id}
                            style={{
                              minWidth: 210,
                              backgroundColor: "white",
                              borderRadius: 18,
                              padding: 16,
                              boxShadow: "0 2px 14px rgba(0,0,0,0.08)",
                              border: "1px solid rgba(0,0,0,0.05)",
                              flexShrink: 0,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: 0, flex: 1, marginRight: 8 }}>{goal.nama_goal}</p>
                              {rank && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "3px 8px",
                                    borderRadius: 8,
                                    whiteSpace: "nowrap",
                                    backgroundColor: isHigh ? "#FFF3E8" : "#EEF6FF",
                                    color: isHigh ? "#FF8929" : "#298DFF",
                                  }}
                                >
                                  #{rank}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: "#A0A0A8", margin: "0 0 10px" }}>
                              {formatRupiah(goal.current_saved)} / {formatRupiah(goal.nominal_target)}
                            </p>
                            <div style={{ width: "100%", height: 8, backgroundColor: "#F0F0F0", borderRadius: 99, overflow: "hidden", marginBottom: 7 }}>
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  width: `${pct}%`,
                                  background: isHigh ? "linear-gradient(90deg, #FF8929, #FFB36B)" : "linear-gradient(90deg, #298DFF, #66AAFF)",
                                  transition: "width 0.6s ease",
                                }}
                              />
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: isHigh ? "#FF8929" : "#298DFF" }}>{pct}% tercapai</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div style={{ padding: "0 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1E1E1E", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                      Transaksi Terbaru
                    </h2>
                    <Link
                      href="/transactions"
                      style={{ display: "flex", alignItems: "center", gap: 2, color: "#298DFF", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-inter), sans-serif", textDecoration: "none" }}
                    >
                      Semua <ChevronRight size={14} />
                    </Link>
                  </div>

                  {recentTransactions.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#A0A0A8" }}>Belum ada transaksi.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {recentTransactions.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            backgroundColor: "white",
                            borderRadius: 14,
                            padding: "12px 14px",
                            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                            border: "1px solid rgba(0,0,0,0.04)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <CategoryIcon category={t.nama_kategori} size={16} containerSize={40} borderRadius={12} />
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 500, color: "#1E1E1E", margin: 0 }}>{t.nama_kategori}</p>
                              <p style={{ fontSize: 11, color: "#A0A0A8", margin: "2px 0 0" }}>
                                {new Date(t.tanggal + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                          <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: t.tipe_transaksi === "Pemasukan" ? "#16a34a" : "#dc2626", flexShrink: 0 }}>
                            {t.tipe_transaksi === "Pemasukan" ? "+" : "−"}
                            {formatRupiah(t.nominal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <BottomNav />

          {/* Hidden input backing the "Upload Mutasi Bank" choice inside AddTransactionModal */}
          <input
            ref={statementInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleStatementFileChange(file);
            }}
          />

          {activeModal === "add" && (
            <AddTransactionModal
              categories={categories}
              saving={saving}
              onSave={(payload) => createTransaction(payload, "Manual")}
              onClose={() => setActiveModal("none")}
              onScanReceipt={() => setActiveModal("scan")}
              onUploadStatement={() => statementInputRef.current?.click()}
            />
          )}

          {activeModal === "scan" && token && (
            <ScanReceiptModal
              token={token}
              categories={categories}
              saving={saving}
              onSave={(payload) => createTransaction(payload, "Scan Struk")}
              onClose={() => setActiveModal("none")}
              onSwitchManual={() => setActiveModal("add")}
            />
          )}

          {showAllocationModal && suggestion && (
            <AllocationSuggestionModal
              suggestion={suggestion}
              onConfirm={handleConfirmAllocation}
              onDismiss={handleDismissAllocation}
            />
          )}

          {showStatementModal && token && (
            <StatementImportModal
              token={token}
              categories={categories}
              loading={statementLoading}
              result={statementResult}
              onClose={closeStatementModal}
              onImported={loadAll}
            />
          )}
        </div>
      </div>
    </div>
  );
}
