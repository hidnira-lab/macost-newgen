"use client";

import { useEffect, useState } from "react";
import { Sparkles, RefreshCw, AlertTriangle, Star, Lightbulb, Info, Target } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import BottomNav from "@/components/bottom-nav";
import type { Goal, InsightCard, InsightTipe, Transaksi } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

const TIPE_META: Record<InsightTipe, { label: string; Icon: typeof Star; accent: string; bg: string; border: string }> = {
  positive: { label: "Pencapaian", Icon: Star, accent: "#22C55E", bg: "linear-gradient(135deg, #F0FFF4, #E8FFF1)", border: "rgba(34,197,94,0.22)" },
  warning: { label: "Perhatian", Icon: AlertTriangle, accent: "#EF4444", bg: "linear-gradient(135deg, #FFF5F5, #FEF0F0)", border: "rgba(239,68,68,0.2)" },
  info: { label: "Info", Icon: Info, accent: "#A855F7", bg: "linear-gradient(135deg, #F5F3FF, #F8F3FF)", border: "rgba(168,85,247,0.2)" },
  tip: { label: "Saran", Icon: Lightbulb, accent: "#298DFF", bg: "linear-gradient(135deg, #F0F7FF, #E8F3FF)", border: "rgba(41,141,255,0.2)" },
};

export default function InsightsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [insights, setInsights] = useState<InsightCard[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // loadStats backs the header quick-stats bar; insights.latest restores the
  // last generated batch (saved server-side) so navigating away and back
  // doesn't lose it and doesn't burn another Gemini call. Generating a new
  // batch is still a separate, explicit, user-triggered action (handleGenerate).
  useEffect(() => {
    async function loadStats() {
      if (!token) return;
      setInitialLoading(true);
      try {
        const [txns, gls] = await Promise.all([api.transactions.list(token), api.goals.list(token)]);
        setTransactions(txns);
        setGoals(gls);
      } catch {
        // non-fatal: quick stats are decorative, insight generation still works without them
      } finally {
        setInitialLoading(false);
      }
    }
    async function loadLatestInsights() {
      if (!token) return;
      try {
        const res = await api.insights.latest(token);
        setInsights(res.insights);
        setGeneratedAt(res.generated_at);
      } catch {
        // 404 means the user hasn't generated any insight yet — keep the
        // empty state; any other failure is non-fatal too, since the user
        // can still generate fresh insights.
      }
    }
    loadStats();
    loadLatestInsights();
  }, [token]);

  async function handleGenerate() {
    if (!token || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.insights.generate(token);
      setInsights(res.insights);
      setGeneratedAt(res.generated_at);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat insight");
    } finally {
      setGenerating(false);
    }
  }

  const totalIncome = transactions.filter((t) => t.tipe_transaksi === "Pemasukan").reduce((a, t) => a + t.nominal, 0);
  const totalExpense = transactions.filter((t) => t.tipe_transaksi === "Pengeluaran").reduce((a, t) => a + t.nominal, 0);

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
      <div style={{ width: "100%", maxWidth: 430, height: "100%", boxShadow: "0 0 60px rgba(7,37,72,0.18)", overflow: "hidden" }}>
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
            <div style={{ paddingBottom: 32 }}>
              {/* Header */}
              <div
                style={{
                  padding: "22px 20px 20px",
                  background: "linear-gradient(145deg, #072548 0%, #0F3870 55%, #1858A0 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -20, right: -10, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(255,137,41,0.15)" }} />
                <div style={{ position: "absolute", bottom: -30, left: -20, width: 90, height: 90, borderRadius: "50%", backgroundColor: "rgba(41,141,255,0.15)" }} />

                <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: "linear-gradient(135deg, #FF8929, #FFB36B)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Sparkles size={17} color="white" />
                      </div>
                      <div>
                        <p style={{ fontSize: 11, color: "rgba(180,210,255,0.75)", margin: 0, fontWeight: 500 }}>Macost AI</p>
                        <h1
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "white",
                            margin: 0,
                            fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                            letterSpacing: "-0.3px",
                          }}
                        >
                          Insight Keuanganmu
                        </h1>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(180,210,255,0.7)", margin: 0 }}>
                      Analisis satu arah dari data transaksi &amp; goal kamu
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating || !token}
                    title="Buat insight terbaru"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      border: "none",
                      cursor: generating ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <RefreshCw size={16} color="white" className={generating ? "animate-spin" : undefined} />
                  </button>
                </div>

                {/* Quick stats bar */}
                <div style={{ marginTop: 16, display: "flex", gap: 10, position: "relative" }}>
                  {[
                    { label: "Pemasukan", value: formatRupiah(totalIncome), color: "#4ade80" },
                    { label: "Pengeluaran", value: formatRupiah(totalExpense), color: "#fb7185" },
                    { label: "Goals Aktif", value: `${goals.length} target`, color: "#FFB36B" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        padding: "10px 10px",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p style={{ fontSize: 10, color: "rgba(180,210,255,0.7)", margin: "0 0 2px", fontWeight: 500 }}>{stat.label}</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: stat.color, margin: 0 }}>
                        {initialLoading ? "…" : stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: "16px 16px 0" }}>
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
                    {error}
                  </p>
                </div>
              )}

              {/* Insight feed label */}
              <div style={{ padding: "20px 20px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#1E1E1E",
                        margin: "0 0 2px",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      }}
                    >
                      {insights ? "Insight Untukmu" : "Belum Ada Insight"}
                    </h2>
                    <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>
                      {insights ? `${insights.length} insight dipersonalisasi` : "Klik tombol di bawah untuk analisis pertama"}
                    </p>
                  </div>
                  {insights && (
                    <div
                      style={{
                        padding: "5px 10px",
                        borderRadius: 20,
                        backgroundColor: "#FFF3E8",
                        border: "1px solid rgba(255,137,41,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Sparkles size={11} color="#FF8929" />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#FF8929" }}>AI</span>
                    </div>
                  )}
                </div>
              </div>

              {insights === null ? (
                /* First-run empty state — real generation only happens on explicit click */
                <div style={{ padding: "0 16px" }}>
                  <div
                    style={{
                      borderRadius: 20,
                      padding: "28px 22px",
                      textAlign: "center",
                      backgroundColor: "white",
                      border: "1.5px dashed #E0E0E0",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: "linear-gradient(135deg, #FF8929, #FFB36B)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 14px",
                      }}
                    >
                      <Sparkles size={24} color="white" />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: "0 0 6px" }}>
                      Belum ada insight
                    </p>
                    <p style={{ fontSize: 13, color: "#717182", margin: "0 0 18px", lineHeight: 1.5 }}>
                      AI akan membaca transaksi dan goal kamu lalu memberi 3-5 insight konkret. Biasanya butuh
                      15-20 detik.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={generating || !token}
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: 14,
                        border: "none",
                        background: generating ? "#E0E0E0" : "linear-gradient(135deg, #298DFF, #0070E0)",
                        color: generating ? "#A0A0A8" : "white",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: generating ? "not-allowed" : "pointer",
                        boxShadow: generating ? "none" : "0 4px 16px rgba(41,141,255,0.35)",
                        fontFamily: "var(--font-inter), sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      <Sparkles size={16} className={generating ? "animate-spin" : undefined} />
                      {generating ? "Menganalisis data keuangan kamu..." : "Buat Insight Pertama"}
                    </button>
                  </div>
                </div>
              ) : insights.length === 0 ? (
                <p style={{ padding: "0 16px", fontSize: 13, color: "#A0A0A8" }}>
                  Belum ada insight yang bisa ditampilkan.
                </p>
              ) : (
                <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {insights.map((card, index) => {
                    const meta = TIPE_META[card.tipe];
                    const Icon = meta.Icon;
                    return (
                      <div
                        key={index}
                        style={{
                          borderRadius: 20,
                          padding: "18px",
                          background: meta.bg,
                          border: `1.5px solid ${meta.border}`,
                          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 13,
                              flexShrink: 0,
                              backgroundColor: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: `0 3px 10px ${meta.border}`,
                            }}
                          >
                            <Icon size={22} color={meta.accent} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5, gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  backgroundColor: "rgba(255,255,255,0.7)",
                                  color: meta.accent,
                                  border: `1px solid ${meta.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                {meta.label}
                              </span>
                              <span style={{ fontSize: 10, color: "#A0A0A8", flexShrink: 0 }}>
                                {generatedAt ? timeAgo(generatedAt) : "Baru saja"}
                              </span>
                            </div>

                            <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: "0 0 4px" }}>
                              {card.title}
                            </p>
                            <p style={{ fontSize: 13, color: "#1E1E1E", margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                              {card.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom note */}
              <div style={{ padding: "20px 20px 0" }}>
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: 16,
                    backgroundColor: "rgba(41,141,255,0.06)",
                    border: "1.5px solid rgba(41,141,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Target size={16} color="#298DFF" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 12, color: "#717182", margin: 0, lineHeight: 1.6 }}>
                    Insight dihasilkan dari saldo, tren 6 bulan terakhir, breakdown pengeluaran bulan ini, dan
                    progress goal kamu.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  );
}
