"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { DashboardSummary } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api.dashboard
      .summary(token)
      .then(setSummary)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Gagal memuat dashboard"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-sm text-slate-500">Memuat dashboard...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!summary) return null;

  const trenMax = Math.max(
    ...summary.tren_bulanan.map((t) => Math.max(t.total_pemasukan, t.total_pengeluaran)),
    1
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      {/* 1. Breakdown pengeluaran per kategori */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Breakdown Pengeluaran per Kategori (Bulan Ini)</h2>
        {summary.breakdown_kategori.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada pengeluaran bulan ini.</p>
        ) : (
          <ul className="space-y-2">
            {summary.breakdown_kategori.map((item) => (
              <li key={item.kategori_id} className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{item.nama_kategori}</span>
                <span className="font-medium text-slate-900">{formatRupiah(item.total_nominal)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2. Progress goal aktif */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Progress Goal Aktif</h2>
        {summary.progress_goal.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada goal. Fitur Goal segera hadir.</p>
        ) : (
          <ul className="space-y-4">
            {summary.progress_goal.map((goal) => (
              <li key={goal.goal_id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700">{goal.nama_goal}</span>
                  <span className="text-slate-500">{goal.progress_percent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900" style={{ width: `${goal.progress_percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 3. Tren bulanan (income vs expense) */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Tren Bulanan (Income vs Expense)</h2>
        <div className="space-y-3">
          {summary.tren_bulanan.map((item) => (
            <div key={item.bulan} className="text-sm">
              <p className="text-slate-500 mb-1">{item.bulan}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(item.total_pemasukan / trenMax) * 100}%` }}
                  />
                </div>
                <span className="w-28 text-right text-emerald-700">{formatRupiah(item.total_pemasukan)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(item.total_pengeluaran / trenMax) * 100}%` }}
                  />
                </div>
                <span className="w-28 text-right text-rose-700">{formatRupiah(item.total_pengeluaran)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Alert overspending */}
      <section
        className={`rounded-xl border p-6 ${
          summary.alert_overspending.is_overspending ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <h2 className="font-semibold text-slate-900 mb-2">Alert Overspending</h2>
        <p className={`text-sm ${summary.alert_overspending.is_overspending ? "text-red-700" : "text-emerald-700"}`}>
          {summary.alert_overspending.pesan}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Pemasukan bulan ini {formatRupiah(summary.alert_overspending.total_pemasukan_bulan_ini)} · Pengeluaran{" "}
          {formatRupiah(summary.alert_overspending.total_pengeluaran_bulan_ini)}
        </p>
      </section>

      {/* 5. Total saldo (prioritas visual terendah) */}
      <p className="text-xs text-slate-400 text-right">
        Total saldo: <span className="text-slate-500 font-medium">{formatRupiah(summary.total_saldo)}</span>
      </p>
    </div>
  );
}
