"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Calendar, Target, TrendingUp, Pencil, Trash2, Sprout, Leaf, Flower2, TreeDeciduous, Trophy, ArrowRight } from "lucide-react";
import type { Goal } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

// ─── Pixel-Art Plant Illustration ────────────────────────────────────────────

const PX = 7;
const GW = 14;
const GH = 17;

function R(x: number, y: number, w: number, h: number, fill: string, key: string) {
  return <rect key={key} x={x * PX} y={y * PX} width={w * PX} height={h * PX} fill={fill} />;
}

const C = {
  s: "#1A5E2A",
  s2: "#2E7D32",
  l1: "#388E3C",
  l2: "#66BB6A",
  l3: "#1B5E20",
  fp: "#FF8929",
  fl: "#FFC107",
  pt: "#8B5E3C",
  pl: "#C4834A",
  pb: "#5C3A1E",
  so: "#3E2208",
  sL: "#6B4019",
  sk: "#2D1403",
  sl: "#7B4820",
};

const potBase = [
  R(2, 11, 10, 1, C.so, "soil"),
  R(3, 11, 5, 1, C.sL, "soilH"),
  R(1, 12, 12, 1, C.pl, "rim"),
  R(1, 12, 2, 1, "#D9A563", "rimH"),
  R(2, 13, 10, 4, C.pt, "pot"),
  R(2, 13, 1, 4, C.pl, "potH"),
  R(11, 13, 1, 4, C.pb, "potS"),
];

function PixelArt({ pct }: { pct: number }) {
  const stage = pct < 25 ? 0 : pct < 50 ? 1 : pct < 75 ? 2 : 3;

  return (
    <svg
      viewBox={`0 0 ${GW * PX} ${GH * PX}`}
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges", width: "100%", maxWidth: 148 }}
    >
      {stage === 0 && [
        ...potBase,
        R(6, 9, 2, 2, C.sk, "sd"),
        R(6, 9, 2, 1, C.sl, "sdh"),
        R(7, 5, 1, 4, C.s, "st"),
        R(4, 6, 3, 1, C.l1, "lL"),
        R(4, 6, 1, 1, C.l2, "lLh"),
        R(8, 7, 3, 1, C.l1, "lR"),
        R(10, 7, 1, 1, C.l2, "lRh"),
        R(6, 3, 3, 2, C.l1, "bud"),
        R(7, 2, 1, 1, C.l2, "budh"),
        R(7, 4, 1, 1, C.s2, "buds"),
      ]}

      {stage === 1 && [
        ...potBase,
        R(7, 1, 1, 10, C.s, "st"),
        R(7, 1, 1, 1, C.s2, "stH"),
        R(3, 8, 4, 1, C.s, "bL"),
        R(0, 5, 5, 3, C.l1, "lL"),
        R(0, 5, 2, 1, C.l2, "lLh1"),
        R(0, 6, 1, 1, C.l2, "lLh2"),
        R(0, 8, 3, 1, C.l3, "lLs"),
        R(8, 5, 4, 1, C.s, "bR"),
        R(9, 2, 4, 3, C.l1, "lR"),
        R(11, 2, 2, 1, C.l2, "lRh"),
        R(9, 5, 3, 1, C.l3, "lRs"),
        R(5, 0, 5, 2, C.l1, "lt"),
        R(6, 0, 3, 1, C.l2, "lth"),
        R(4, 2, 2, 1, C.l1, "ltL"),
        R(10, 1, 2, 1, C.l1, "ltR"),
        R(6, 1, 2, 2, C.fp, "fb"),
        R(7, 2, 1, 1, C.fl, "fbc"),
      ]}

      {stage === 2 && [
        ...potBase,
        R(6, 3, 2, 8, C.s, "tr"),
        R(6, 3, 1, 8, C.s2, "trH"),
        R(2, 7, 4, 1, C.s, "bL"),
        R(0, 4, 6, 4, C.l1, "lL"),
        R(0, 4, 2, 2, C.l2, "lLh"),
        R(1, 8, 4, 1, C.l3, "lLs"),
        R(0, 6, 1, 2, C.l2, "lLe"),
        R(8, 5, 4, 1, C.s, "bR"),
        R(8, 2, 6, 4, C.l1, "lR"),
        R(11, 2, 2, 2, C.l2, "lRh"),
        R(9, 6, 4, 1, C.l3, "lRs"),
        R(13, 3, 1, 3, C.l2, "lRe"),
        R(4, 0, 6, 3, C.l1, "lT"),
        R(5, 0, 4, 1, C.l2, "lTh"),
        R(3, 1, 2, 2, C.l1, "lTL"),
        R(9, 1, 2, 2, C.l1, "lTR"),
        R(0, 5, 2, 2, C.fp, "f1"),
        R(1, 6, 1, 1, C.fl, "f1c"),
        R(11, 2, 2, 2, C.fp, "f2"),
        R(12, 3, 1, 1, C.fl, "f2c"),
        R(6, 0, 2, 2, C.fp, "f3"),
        R(7, 1, 1, 1, C.fl, "f3c"),
      ]}

      {stage === 3 && [
        ...potBase,
        R(5, 6, 4, 5, C.s, "tr"),
        R(5, 6, 2, 5, C.s2, "trH"),
        R(1, 8, 12, 3, C.l3, "fB"),
        R(0, 9, 1, 2, C.l3, "fBL"),
        R(13, 9, 1, 2, C.l3, "fBR"),
        R(0, 5, 14, 4, C.l1, "fM"),
        R(0, 5, 3, 2, C.l2, "fMhL"),
        R(11, 5, 3, 2, C.l2, "fMhR"),
        R(2, 9, 4, 1, C.l3, "fMs1"),
        R(8, 9, 4, 1, C.l3, "fMs2"),
        R(1, 1, 12, 5, C.l1, "fT"),
        R(2, 0, 10, 2, C.l2, "fTh"),
        R(3, 5, 4, 1, C.l3, "fTs1"),
        R(7, 5, 4, 1, C.l3, "fTs2"),
        R(0, 7, 1, 1, C.l1, "cBL"),
        R(13, 7, 1, 1, C.l1, "cBR"),
        R(0, 3, 1, 2, C.l1, "cTL"),
        R(13, 3, 1, 2, C.l1, "cTR"),
        R(0, 6, 2, 2, C.fp, "f1"),
        R(1, 7, 1, 1, C.fl, "f1c"),
        R(12, 6, 2, 2, C.fp, "f2"),
        R(12, 7, 1, 1, C.fl, "f2c"),
        R(4, 4, 2, 2, C.fp, "f3"),
        R(5, 5, 1, 1, C.fl, "f3c"),
        R(8, 3, 2, 2, C.fp, "f4"),
        R(9, 4, 1, 1, C.fl, "f4c"),
        R(6, 0, 2, 2, C.fp, "f5"),
        R(7, 1, 1, 1, C.fl, "f5c"),
        R(1, 2, 2, 2, C.fp, "f6"),
        R(2, 3, 1, 1, C.fl, "f6c"),
        R(10, 1, 2, 2, C.fp, "f7"),
        R(11, 2, 1, 1, C.fl, "f7c"),
        ...(pct >= 90
          ? [
              R(0, 0, 1, 1, C.fl, "sp1"),
              R(13, 0, 1, 1, C.fl, "sp2"),
              R(0, 10, 1, 1, C.fl, "sp3"),
              R(13, 10, 1, 1, C.fl, "sp4"),
            ]
          : []),
      ]}
    </svg>
  );
}

type StageTheme = {
  label: string;
  StageIcon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  desc: string;
  outerBg: string;
  illustBg: string;
  accentColor: string;
  textColor: string;
  barColor: string;
  borderColor: string;
};

const stageInfo = (pct: number): StageTheme => {
  if (pct >= 100)
    return {
      label: "Tercapai!",
      StageIcon: Trophy,
      desc: "Selamat! Goal kamu berhasil terpenuhi!",
      outerBg: "linear-gradient(145deg, #FFFDE7 0%, #FFF9C4 100%)",
      illustBg: "linear-gradient(180deg, #FFFFF5 0%, #FFFBDF 70%, #FFF5E0 100%)",
      accentColor: "#F57F17",
      textColor: "#E65100",
      barColor: "linear-gradient(90deg, #FF8929, #FFD700)",
      borderColor: "rgba(245,127,23,0.4)",
    };
  if (pct < 25)
    return {
      label: "Benih",
      StageIcon: Sprout,
      desc: "Baru dimulai — setiap tabungan berarti!",
      outerBg: "linear-gradient(145deg, #F1F8E9 0%, #DCEDC8 100%)",
      illustBg: "linear-gradient(180deg, #F6FFF5 0%, #EDF8E8 70%, #F5EEE4 100%)",
      accentColor: "#558B2F",
      textColor: "#33691E",
      barColor: "linear-gradient(90deg, #8BC34A, #C5E1A5)",
      borderColor: "rgba(139,195,74,0.4)",
    };
  if (pct < 50)
    return {
      label: "Tumbuh",
      StageIcon: Leaf,
      desc: "Momentum terbentuk — terus semangat!",
      outerBg: "linear-gradient(145deg, #E8F5E9 0%, #C8E6C9 100%)",
      illustBg: "linear-gradient(180deg, #F4FFF4 0%, #E8F5E8 70%, #F2EDE6 100%)",
      accentColor: "#2E7D32",
      textColor: "#1B5E20",
      barColor: "linear-gradient(90deg, #43A047, #81C784)",
      borderColor: "rgba(67,160,71,0.4)",
    };
  if (pct < 75)
    return {
      label: "Berkembang",
      StageIcon: Flower2,
      desc: "Sudah lebih dari setengah jalan!",
      outerBg: "linear-gradient(145deg, #FFF8E1 0%, #FFECB3 100%)",
      illustBg: "linear-gradient(180deg, #FFFFF2 0%, #FFFBEA 70%, #FBF3E4 100%)",
      accentColor: "#F57F17",
      textColor: "#E65100",
      barColor: "linear-gradient(90deg, #FFA726, #FFD54F)",
      borderColor: "rgba(245,127,23,0.35)",
    };
  return {
    label: "Hampir Terwujud",
    StageIcon: TreeDeciduous,
    desc: "Finish line sudah sangat dekat!",
    outerBg: "linear-gradient(145deg, #FFF3E0 0%, #FFE0B2 100%)",
    illustBg: "linear-gradient(180deg, #FFFFF5 0%, #FFF8EE 70%, #FEF0E4 100%)",
    accentColor: "#E65100",
    textColor: "#BF360C",
    barColor: "linear-gradient(90deg, #FF8929, #FFD700)",
    borderColor: "rgba(255,137,41,0.45)",
  };
};

export default function GoalDetailSheet({
  goal,
  rank,
  onClose,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  rank: number | null;
  onClose: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}) {
  const [now] = useState(() => Date.now());
  const pct = Math.min(100, Math.round(goal.progress_percent));
  const remaining = goal.nominal_target - goal.current_saved;
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - now) / 86400000));
  const info = stageInfo(pct);
  const milestones = [25, 50, 75];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 110,
        backgroundColor: "rgba(7,37,72,0.55)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backdropFilter: "blur(4px)",
        fontFamily: "var(--font-inter), sans-serif",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FCFCFC",
          borderRadius: "24px 24px 0 0",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 -12px 48px rgba(7,37,72,0.22)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" }} />
        </div>

        {/* Close + Edit + Delete */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "8px 16px 0" }}>
          <button
            type="button"
            onClick={() => onEdit(goal)}
            title="Edit target"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#F0F0F0",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pencil size={14} color="#717182" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(goal)}
            title="Hapus target"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#FEF2F2",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={14} color="#EF4444" />
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#F0F0F0",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} color="#717182" />
          </button>
        </div>

        {/* Progress visual section */}
        <div
          style={{
            margin: "6px 16px 0",
            borderRadius: 22,
            padding: "18px 16px 16px",
            background: info.outerBg,
            border: `1.5px solid ${info.borderColor}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 16px",
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.75)",
                border: `1.5px solid ${info.borderColor}`,
                fontSize: 13,
                fontWeight: 800,
                color: info.accentColor,
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              }}
            >
              <info.StageIcon size={14} color={info.accentColor} strokeWidth={2.2} />
              {info.label}
            </div>
          </div>

          <div
            style={{
              background: info.illustBg,
              borderRadius: 16,
              padding: "18px 20px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -2px 8px rgba(0,0,0,0.05)",
              border: "1px solid rgba(255,255,255,0.8)",
              marginBottom: 14,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${info.accentColor}20 1px, transparent 1px)`,
                backgroundSize: "14px 14px",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <PixelArt pct={pct} />
            </div>
          </div>

          <p
            style={{
              fontSize: 13,
              color: info.textColor,
              margin: "0 0 14px",
              textAlign: "center",
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {info.desc}
          </p>

          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.65)",
              borderRadius: 16,
              padding: "12px 16px",
              border: "1px solid rgba(255,255,255,0.9)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 10, justifyContent: "center" }}>
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: info.accentColor,
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  letterSpacing: "-3px",
                  lineHeight: 1,
                }}
              >
                {pct}
              </span>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: info.accentColor,
                  opacity: 0.6,
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                %
              </span>
            </div>

            <div style={{ height: 10, backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 99, overflow: "hidden", marginBottom: 7 }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  width: `${Math.max(pct, 2)}%`,
                  background: info.barColor,
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: `0 0 8px ${info.accentColor}55`,
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2%" }}>
              {milestones.map((m) => (
                <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      backgroundColor: pct >= m ? info.accentColor : "#CACACE",
                      transition: "background-color 0.4s ease",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: pct >= m ? info.accentColor : "#B8B8C0",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    {m}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goal name + rank */}
        <div style={{ padding: "16px 16px 0" }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#1E1E1E",
              margin: "0 0 4px",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            }}
          >
            {goal.nama_goal}
          </h2>
          <p style={{ fontSize: 13, color: "#A0A0A8", margin: 0 }}>
            {rank ? `Prioritas #${rank} · ` : ""}Keinginan {goal.skor_keinginan}/5 · Kepentingan {goal.skor_kepentingan}/5
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "14px 16px" }}>
          {[
            { Icon: TrendingUp, label: "Terkumpul", value: formatRupiah(goal.current_saved), color: "#22C55E" },
            { Icon: Target, label: "Target", value: formatRupiah(goal.nominal_target), color: "#298DFF" },
            {
              Icon: X,
              label: "Sisa",
              value: remaining > 0 ? formatRupiah(remaining) : "Tercapai!",
              color: remaining > 0 ? "#FF8929" : "#22C55E",
            },
            {
              Icon: Calendar,
              label: "Deadline",
              value: daysLeft > 0 ? `${daysLeft} hari lagi` : "Sudah lewat",
              color: daysLeft < 30 ? "#EF4444" : "#717182",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: "white",
                borderRadius: 14,
                padding: "12px 14px",
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <p style={{ fontSize: 11, color: "#A0A0A8", margin: "0 0 3px", fontWeight: 500 }}>{stat.label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: stat.color, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Real funding path: dana bertambah lewat Smart Allocation, bukan input manual */}
        <div style={{ padding: "0 16px 36px" }}>
          <Link
            href="/home"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 16,
              border: "1.5px solid rgba(255,137,41,0.25)",
              backgroundColor: "#FFF8F3",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1E1E1E", margin: 0 }}>Dana bertambah otomatis</p>
              <p style={{ fontSize: 12, color: "#996633", margin: "2px 0 0" }}>
                Lewat Smart Allocation saat ada pemasukan side income
              </p>
            </div>
            <ArrowRight size={16} color="#FF8929" />
          </Link>
        </div>
      </div>
    </div>
  );
}
