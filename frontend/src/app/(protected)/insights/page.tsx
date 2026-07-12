"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { InsightCard, InsightTipe } from "@/types";

const TIPE_STYLE: Record<InsightTipe, { badge: string; card: string; label: string }> = {
  positive: { badge: "bg-emerald-100 text-emerald-700", card: "border-emerald-200", label: "Pencapaian" },
  warning: { badge: "bg-amber-100 text-amber-700", card: "border-amber-200", label: "Perhatian" },
  info: { badge: "bg-slate-100 text-slate-700", card: "border-slate-200", label: "Info" },
  tip: { badge: "bg-indigo-100 text-indigo-700", card: "border-indigo-200", label: "Saran" },
};

export default function InsightsPage() {
  const { token } = useAuth();
  const [insights, setInsights] = useState<InsightCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.insights.generate(token);
      setInsights(res.insights);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal membuat insight");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">AI Financial Assistant</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ringkasan insight satu arah dari data transaksi dan goal kamu, dibuat oleh AI. Bukan chat — klik tombol di
          bawah untuk analisis terbaru.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Menganalisis data keuangan kamu..." : "Buat Insight Terbaru"}
      </button>

      {loading && (
        <p className="text-xs text-slate-400">Biasanya butuh 15-20 detik — AI sedang membaca transaksi dan goal kamu.</p>
      )}

      {insights && insights.length === 0 && !loading && (
        <p className="text-sm text-slate-500">Belum ada insight yang bisa ditampilkan.</p>
      )}

      {insights && insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.map((card, i) => {
            const style = TIPE_STYLE[card.tipe];
            return (
              <div key={i} className={`bg-white rounded-xl border p-5 space-y-2 ${style.card}`}>
                <span className={`inline-block text-xs font-medium rounded-full px-2 py-0.5 ${style.badge}`}>
                  {style.label}
                </span>
                <h2 className="font-semibold text-slate-900">{card.title}</h2>
                <p className="text-sm text-slate-600">{card.body}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
