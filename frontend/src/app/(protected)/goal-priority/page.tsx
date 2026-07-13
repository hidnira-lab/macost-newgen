"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Info,
  Star,
  Target,
  Banknote,
  Clock,
  BarChart2,
  Zap,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import LoadingState from "@/components/loading-state";
import type { SAWWeights } from "@/types";

type CriterionKey = keyof SAWWeights;

// The backend stores weights as 0-100 floats (e.g. 22.5), but the slider UI
// works in whole percents. Rounding each field independently can push the
// sum away from 100 (22.5+21.9+21.5+17.8+16.2 = 99.9, which naive rounding
// turns into 101) and trips the "must total 100%" validity check on a brand
// new user's very first load. Largest-remainder rounding keeps the sum
// exact: floor everything, then hand the leftover points to the fields with
// the biggest fractional part.
function roundToWholePercent(weights: SAWWeights): SAWWeights {
  const keys = Object.keys(weights) as CriterionKey[];
  const floors = { ...weights };
  for (const k of keys) floors[k] = Math.floor(weights[k]);
  const remainder = 100 - keys.reduce((sum, k) => sum + floors[k], 0);
  const byFraction = [...keys].sort((a, b) => weights[b] % 1 - (weights[a] % 1));
  for (let i = 0; i < remainder; i++) {
    floors[byFraction[i]] += 1;
  }
  return floors;
}

const CRITERIA: { key: CriterionKey; label: string; desc: string; Icon: LucideIcon; color: string }[] = [
  { key: "personal_importance", label: "Kepentingan Pribadi", desc: "Seberapa penting goal ini untukmu", Icon: Star, color: "#FF8929" },
  { key: "progress_gap", label: "Jarak ke Target", desc: "Seberapa jauh dari target (% sisa)", Icon: Target, color: "#298DFF" },
  { key: "saving_capacity", label: "Kapasitas Tabungan", desc: "Kemampuan menabung saat ini", Icon: Banknote, color: "#22C55E" },
  { key: "urgency", label: "Urgensi & Deadline", desc: "Sisa waktu hingga batas waktu", Icon: Clock, color: "#EF4444" },
  { key: "target_amount", label: "Besaran Target", desc: "Nilai total yang harus dicapai", Icon: BarChart2, color: "#A855F7" },
];

// Matches the backend's default when a user has never customized their
// weights (services/saw_weights.py DEFAULT_WEIGHTS_PERCENT, itself derived
// from the fixed CRITERIA_WEIGHTS in services/saw_engine.py).
const DEFAULT_WEIGHTS: SAWWeights = {
  personal_importance: 22.5,
  progress_gap: 21.9,
  saving_capacity: 21.5,
  urgency: 17.8,
  target_amount: 16.2,
};

// Figma's "strategy" toggle never actually fed into any ranking computation
// in the source mock (nor does the real backend have a persisted strategy
// field) — ported here as two quick presets that just set the sliders,
// the same convention Goals' quick-template buttons already use.
const STRATEGY_PRESETS: {
  value: "quick-win" | "importance-first";
  StratIcon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  weights: SAWWeights;
}[] = [
  {
    value: "quick-win",
    StratIcon: Zap,
    title: "Quick Win",
    desc: "Dahulukan goal yang paling dekat selesai untuk menjaga motivasi",
    color: "#22C55E",
    weights: { personal_importance: 15, progress_gap: 30, saving_capacity: 25, urgency: 20, target_amount: 10 },
  },
  {
    value: "importance-first",
    StratIcon: Target,
    title: "Importance First",
    desc: "Fokus pada goal paling penting dulu, meski butuh waktu lebih lama",
    color: "#FF8929",
    weights: { personal_importance: 50, progress_gap: 15, saving_capacity: 10, urgency: 10, target_amount: 15 },
  },
];

export default function GoalPriorityPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [weights, setWeights] = useState<SAWWeights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const w = await api.sawWeights.get(token);
        setWeights(roundToWholePercent(w));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat bobot");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  function handleSliderChange(key: CriterionKey, newVal: number) {
    if (!weights) return;
    const old = weights[key];
    const delta = newVal - old;
    if (delta === 0) return;

    const others = (Object.keys(weights) as CriterionKey[]).filter((k) => k !== key);
    const totalOthers = others.reduce((a, k) => a + weights[k], 0);

    const updated: SAWWeights = { ...weights, [key]: newVal };

    if (totalOthers > 0) {
      const factor = (totalOthers - delta) / totalOthers;
      for (const k of others) {
        updated[k] = Math.max(0, Math.round(weights[k] * factor));
      }
    }

    const currentSum = (Object.keys(updated) as CriterionKey[]).reduce((a, k) => a + updated[k], 0);
    if (currentSum !== 100) {
      const diff = 100 - currentSum;
      const adjustKey = others.find((k) => updated[k] + diff >= 0) ?? others[0];
      updated[adjustKey] = Math.max(0, updated[adjustKey] + diff);
    }

    setWeights(updated);
    setSaved(false);
  }

  function applyPreset(preset: SAWWeights) {
    setWeights(preset);
    setSaved(false);
  }

  function isPresetActive(preset: SAWWeights) {
    if (!weights) return false;
    return (Object.keys(preset) as CriterionKey[]).every((k) => weights[k] === preset[k]);
  }

  function resetDefault() {
    setWeights(roundToWholePercent(DEFAULT_WEIGHTS));
    setSaved(false);
  }

  async function handleSave() {
    if (!token || !weights) return;
    setSaving(true);
    setError(null);
    try {
      await api.sawWeights.update(token, weights);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan bobot");
    } finally {
      setSaving(false);
    }
  }

  const total = weights ? (Object.values(weights) as number[]).reduce((a, b) => a + b, 0) : 0;
  const isValid = Math.abs(total - 100) < 0.5;

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
          {/* Header */}
          <div
            style={{
              padding: "52px 20px 20px",
              background: "linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  title="Kembali"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowLeft size={18} color="white" />
                </button>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                  Prioritas Goal
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                title="Info SAW"
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Info size={16} color="white" />
              </button>
            </div>
            <p style={{ fontSize: 13, color: "rgba(180,210,255,0.8)", margin: "8px 0 0", paddingLeft: 48 }}>
              Atur bagaimana Macost menyarankan alokasi danamu
            </p>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#F4F6F8" }}>
            {error && (
              <p style={{ margin: "12px 12px 0", fontSize: 13, color: "#EF4444", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px" }}>
                {error}
              </p>
            )}

            {loading || !weights ? (
              <LoadingState />
            ) : (
              <>
                {showInfo && (
                  <div style={{ margin: "12px 12px 0", backgroundColor: "#EFF6FF", borderRadius: 14, padding: "14px 16px", border: "1.5px solid rgba(41,141,255,0.2)" }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#298DFF", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
                      <Info size={14} /> Apa itu SAW?
                    </p>
                    <p style={{ fontSize: 12, color: "#1D6FA8", margin: 0, lineHeight: 1.6 }}>
                      Simple Additive Weighting (SAW) adalah metode pemeringkatan multi-kriteria. Setiap goal
                      mendapat skor berdasarkan bobot yang kamu tentukan, lalu diurutkan otomatis. Jumlah semua
                      bobot harus 100%.
                    </p>
                  </div>
                )}

                {/* Strategy presets */}
                <div style={{ margin: "12px 12px 0", backgroundColor: "white", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: "0 0 12px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                    Strategi Prioritas
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {STRATEGY_PRESETS.map((opt) => {
                      const active = isPresetActive(opt.weights);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => applyPreset(opt.weights)}
                          style={{
                            padding: "14px 16px",
                            borderRadius: 14,
                            border: "none",
                            backgroundColor: active ? `${opt.color}12` : "#F8F8F8",
                            cursor: "pointer",
                            textAlign: "left",
                            outline: active ? `2px solid ${opt.color}` : "2px solid transparent",
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 700, color: active ? opt.color : "#1E1E1E", margin: "0 0 4px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                                <opt.StratIcon size={15} strokeWidth={2.5} />
                                {opt.title}
                              </p>
                              <p style={{ fontSize: 12, color: "#717182", margin: 0, lineHeight: 1.5 }}>{opt.desc}</p>
                            </div>
                            {active && (
                              <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: opt.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8 }}>
                                <Check size={13} color="white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SAW weight sliders */}
                <div style={{ margin: "12px 12px 0", backgroundColor: "white", borderRadius: 18, padding: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                      Bobot Kriteria SAW
                    </p>
                    <button
                      type="button"
                      onClick={resetDefault}
                      style={{ fontSize: 12, color: "#298DFF", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Reset
                    </button>
                  </div>

                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      marginBottom: 14,
                      backgroundColor: isValid ? "#F0FDF4" : "#FEF2F2",
                      border: `1.5px solid ${isValid ? "#22C55E40" : "#EF444440"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <p style={{ fontSize: 12, color: isValid ? "#16A34A" : "#DC2626", margin: 0, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      {isValid ? (
                        <>
                          <Check size={13} strokeWidth={2.5} /> Bobot sudah seimbang
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={13} /> Total bobot: {total}% (harus 100%)
                        </>
                      )}
                    </p>
                    <p style={{ fontSize: 18, fontWeight: 900, margin: 0, color: isValid ? "#22C55E" : "#EF4444", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                      {total}%
                    </p>
                  </div>

                  <div style={{ display: "flex", height: 10, borderRadius: 99, overflow: "hidden", marginBottom: 18, gap: 2 }}>
                    {CRITERIA.map((c) => (
                      <div
                        key={c.key}
                        style={{
                          flex: weights[c.key],
                          backgroundColor: c.color,
                          minWidth: weights[c.key] > 0 ? 2 : 0,
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    {CRITERIA.map((c) => (
                      <div key={c.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: `${c.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <c.Icon size={17} color={c.color} strokeWidth={1.8} />
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#1E1E1E", margin: 0 }}>{c.label}</p>
                              <p style={{ fontSize: 11, color: "#A0A0A8", margin: 0 }}>{c.desc}</p>
                            </div>
                          </div>
                          <span style={{ fontSize: 18, fontWeight: 900, color: c.color, fontFamily: "var(--font-plus-jakarta-sans), sans-serif", minWidth: 44, textAlign: "right" }}>
                            {weights[c.key]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={weights[c.key]}
                          onChange={(e) => handleSliderChange(c.key, Number(e.target.value))}
                          style={{ width: "100%", accentColor: c.color, height: 4 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <div style={{ padding: "16px 12px 36px" }}>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !isValid}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: 16,
                      border: "none",
                      background: !isValid
                        ? "#E0E0E0"
                        : saved
                          ? "linear-gradient(135deg, #22C55E, #16A34A)"
                          : "linear-gradient(135deg, #298DFF, #0070E0)",
                      color: !isValid ? "#A0A0A8" : "white",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: !isValid || saving ? "not-allowed" : "pointer",
                      boxShadow: !isValid ? "none" : `0 6px 20px ${saved ? "rgba(34,197,94,0.38)" : "rgba(41,141,255,0.38)"}`,
                      fontFamily: "var(--font-inter), sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {saving ? "Menyimpan..." : saved ? (
                      <>
                        <Check size={18} strokeWidth={3} /> Tersimpan!
                      </>
                    ) : (
                      "Simpan Pengaturan"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
