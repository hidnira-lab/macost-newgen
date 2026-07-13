"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import BottomNav from "@/components/bottom-nav";
import { getCategoryStyle } from "@/components/category-icon";
import LoadingState from "@/components/loading-state";
import type { DashboardSummary, Goal, GoalRankingItem } from "@/types";

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function monthLabel(bulan: string) {
  const month = Number(bulan.split("-")[1]);
  return MONTH_ABBR[month - 1] ?? bulan;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

const formatShort = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}jt`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}rb`;
  return `${v}`;
};

// Custom SVG donut chart — avoids recharts internal duplicate-key bug
function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const cx = 75, cy = 75, r = 55, innerR = 33;
  const slices = data.reduce<{ name: string; value: number; color: string; start: number; sweep: number }[]>(
    (acc, d) => {
      const prevEnd = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].sweep : -90;
      const sweep = (d.value / total) * 360;
      acc.push({ ...d, start: prevEnd, sweep });
      return acc;
    },
    []
  );

  const arc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return { x1, y1, x2, y2, large };
  };

  return (
    <svg viewBox="0 0 150 150" width="100%" height="100%">
      {slices.map((s) => {
        const end = s.start + s.sweep;
        const o = arc(cx, cy, r, s.start, end);
        const i = arc(cx, cy, innerR, s.start, end);
        const d = [
          `M ${o.x1} ${o.y1}`,
          `A ${r} ${r} 0 ${o.large} 1 ${o.x2} ${o.y2}`,
          `L ${i.x2} ${i.y2}`,
          `A ${innerR} ${innerR} 0 ${i.large} 0 ${i.x1} ${i.y1}`,
          "Z",
        ].join(" ");
        return <path key={s.name} d={d} fill={s.color} stroke="#FCFCFC" strokeWidth="2" />;
      })}
    </svg>
  );
}

type BarRow = { month: string; Pemasukan: number; Pengeluaran: number };

function BarChartSVG({ data }: { data: BarRow[] }) {
  const W = 300, H = 160, padL = 36, padB = 24, padT = 8, padR = 8;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const maxVal = Math.max(...data.flatMap((d) => [d.Pemasukan, d.Pengeluaran]), 1);
  const rounded = Math.ceil(maxVal / 500000) * 500000 || 500000;
  const yTicks = [0, rounded / 2, rounded];
  const groupW = chartW / data.length;
  const barW = Math.min(18, groupW * 0.3);
  const gap = 4;

  const yPos = (v: number) => padT + chartH - (v / rounded) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
      {yTicks.map((tick) => {
        const y = yPos(tick);
        return (
          <g key={`y-${tick}`}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#F0F0F0" strokeWidth="1" />
            <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#A0A0A8">
              {formatShort(tick)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const cx = padL + groupW * i + groupW / 2;
        const x1 = cx - barW - gap / 2;
        const x2 = cx + gap / 2;
        const h1 = (d.Pemasukan / rounded) * chartH;
        const h2 = (d.Pengeluaran / rounded) * chartH;
        const y1 = yPos(d.Pemasukan);
        const y2 = yPos(d.Pengeluaran);
        const rx = 4;
        return (
          <g key={d.month}>
            <rect x={x1} y={y1} width={barW} height={h1} fill="#298DFF" rx={rx} ry={rx} />
            <rect x={x2} y={y2} width={barW} height={h2} fill="#FF8929" rx={rx} ry={rx} />
            <text x={cx} y={H - 4} textAnchor="middle" fontSize="11" fill="#717182" fontWeight="500">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ranking, setRanking] = useState<GoalRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [dash, gls, rank] = await Promise.all([
        api.dashboard.summary(token),
        api.goals.list(token),
        api.goals.ranking(token),
      ]);
      setSummary(dash);
      setGoals(gls);
      setRanking(rank);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadAll();
  }, [token]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  const rankByGoalId = new Map(ranking.map((r) => [r.goal_id, r]));
  const topGoals = [...ranking]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 2)
    .map((r) => goals.find((g) => g.id === r.goal_id))
    .filter((g): g is Goal => Boolean(g));

  const breakdownTotal = summary?.breakdown_kategori.reduce((a, b) => a + b.total_nominal, 0) ?? 0;
  const expenseBreakdown =
    summary?.breakdown_kategori.map((item) => ({
      name: item.nama_kategori,
      value: breakdownTotal > 0 ? Math.round((item.total_nominal / breakdownTotal) * 100) : 0,
      color: getCategoryStyle(item.nama_kategori).color,
      Icon: getCategoryStyle(item.nama_kategori).Icon,
    })) ?? [];

  const trendData: BarRow[] =
    summary?.tren_bulanan.map((t) => ({
      month: monthLabel(t.bulan),
      Pemasukan: t.total_pemasukan,
      Pengeluaran: t.total_pengeluaran,
    })) ?? [];

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
            {loading ? (
              <LoadingState />
            ) : loadError ? (
              <p style={{ padding: 24, fontSize: 14, color: "#DC2626" }}>{loadError}</p>
            ) : summary ? (
              <div style={{ paddingBottom: 24 }}>
                {/* Header + Period (fixed to current month — no historical filter yet) */}
                <div style={{ padding: "22px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#1E1E1E",
                      margin: 0,
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    Dashboard
                  </h1>
                  <span
                    style={{
                      padding: "8px 13px",
                      borderRadius: 11,
                      border: "1.5px solid #E0E0E0",
                      backgroundColor: "white",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1E1E1E",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    Bulan Ini
                  </span>
                </div>

                {/* 1. Expense Breakdown */}
                <div style={{ margin: "0 16px 14px" }}>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: 20,
                      padding: 18,
                      boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1E1E1E",
                        margin: "0 0 14px",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      }}
                    >
                      Breakdown Pengeluaran
                    </h3>
                    {expenseBreakdown.length === 0 ? (
                      <p style={{ fontSize: 13, color: "#A0A0A8", margin: 0 }}>Belum ada pengeluaran bulan ini.</p>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 150, height: 150, flexShrink: 0 }}>
                          <DonutChart data={expenseBreakdown} />
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                          {expenseBreakdown.map((item) => (
                            <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <item.Icon size={13} color={item.color} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                              <div style={{ flex: 1, height: 6, backgroundColor: "#F0F0F0", borderRadius: 99, overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 99, width: `${item.value}%`, backgroundColor: item.color }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#1E1E1E", minWidth: 32, textAlign: "right" }}>
                                {item.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Active Goals Progress */}
                <div style={{ margin: "0 16px 14px" }}>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: 20,
                      padding: 18,
                      boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1E1E1E",
                        margin: "0 0 14px",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      }}
                    >
                      Progress Target Aktif
                    </h3>
                    {topGoals.length === 0 ? (
                      <p style={{ fontSize: 13, color: "#A0A0A8", margin: 0 }}>
                        Belum ada goal.{" "}
                        <Link href="/goals" style={{ color: "#298DFF", fontWeight: 600, textDecoration: "none" }}>
                          Buat sekarang
                        </Link>
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {topGoals.map((goal) => {
                          const pct = goal.progress_percent;
                          const rank = rankByGoalId.get(goal.id)?.rank;
                          const isHigh = pct >= 50;
                          return (
                            <div key={goal.id}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                  {rank && (
                                    <span
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        padding: "2px 8px",
                                        borderRadius: 7,
                                        backgroundColor: "#F2F2F2",
                                        color: "#717182",
                                      }}
                                    >
                                      #{rank}
                                    </span>
                                  )}
                                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E" }}>{goal.nama_goal}</span>
                                </div>
                                <span
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 800,
                                    color: isHigh ? "#FF8929" : "#298DFF",
                                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                                  }}
                                >
                                  {pct}%
                                </span>
                              </div>
                              <div style={{ height: 9, backgroundColor: "#F0F0F0", borderRadius: 99, overflow: "hidden", marginBottom: 5 }}>
                                <div
                                  style={{
                                    height: "100%",
                                    borderRadius: 99,
                                    width: `${pct}%`,
                                    background: isHigh
                                      ? "linear-gradient(90deg, #FF8929, #FFB36B)"
                                      : "linear-gradient(90deg, #298DFF, #66AAFF)",
                                    transition: "width 0.6s ease",
                                  }}
                                />
                              </div>
                              <p style={{ fontSize: 11, color: "#A0A0A8", margin: 0 }}>
                                {formatRupiah(goal.current_saved)} / {formatRupiah(goal.nominal_target)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Monthly Trend */}
                <div style={{ margin: "0 16px 14px" }}>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: 20,
                      padding: 18,
                      boxShadow: "0 2px 14px rgba(0,0,0,0.07)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#1E1E1E",
                        margin: "0 0 14px",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      }}
                    >
                      Tren 6 Bulan Terakhir
                    </h3>
                    <div style={{ height: 180 }}>
                      <BarChartSVG data={trendData} />
                    </div>
                    <div style={{ display: "flex", gap: 20, marginTop: 10, justifyContent: "center" }}>
                      {[
                        { color: "#298DFF", label: "Pemasukan" },
                        { color: "#FF8929", label: "Pengeluaran" },
                      ].map((item) => (
                        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color }} />
                          <span style={{ fontSize: 12, color: "#717182", fontWeight: 500 }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Overspending Alert (dismissible) */}
                {!alertDismissed && (
                  <div style={{ margin: "0 16px 14px" }}>
                    <div
                      style={{
                        borderRadius: 16,
                        padding: 14,
                        background: summary.alert_overspending.is_overspending
                          ? "linear-gradient(135deg, #FFF4E8, #FFE9CC)"
                          : "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
                        border: summary.alert_overspending.is_overspending
                          ? "1.5px solid rgba(255,137,41,0.28)"
                          : "1.5px solid rgba(34,197,94,0.28)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      {summary.alert_overspending.is_overspending ? (
                        <AlertTriangle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
                      ) : (
                        <CheckCircle2 size={20} color="#15803D" style={{ flexShrink: 0, marginTop: 1 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: summary.alert_overspending.is_overspending ? "#B45309" : "#15803D",
                            margin: "0 0 3px",
                          }}
                        >
                          {summary.alert_overspending.pesan}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: summary.alert_overspending.is_overspending ? "#92400E" : "#166534",
                            margin: 0,
                            lineHeight: 1.55,
                          }}
                        >
                          Pemasukan {formatRupiah(summary.alert_overspending.total_pemasukan_bulan_ini)} · Pengeluaran{" "}
                          {formatRupiah(summary.alert_overspending.total_pengeluaran_bulan_ini)}
                        </p>
                      </div>
                      <button
                        onClick={() => setAlertDismissed(true)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: summary.alert_overspending.is_overspending ? "#B45309" : "#15803D",
                          padding: 2,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Total Balance (small, intentionally near bottom) */}
                <div style={{ margin: "0 16px" }}>
                  <div
                    style={{
                      backgroundColor: "#F6F8FA",
                      borderRadius: 14,
                      padding: "13px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <p style={{ fontSize: 13, color: "#717182", margin: 0, fontWeight: 500 }}>Total Saldo</p>
                    <p style={{ fontSize: 17, fontWeight: 800, color: "#1E1E1E", margin: 0 }}>
                      {formatRupiah(summary.total_saldo)}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  );
}
