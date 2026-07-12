"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Goal, GoalRankingItem } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

function defaultDeadline() {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().slice(0, 10);
}

const SKOR_OPTIONS = [1, 2, 3, 4, 5];

export default function GoalsPage() {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [ranking, setRanking] = useState<GoalRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [namaGoal, setNamaGoal] = useState("");
  const [nominalTarget, setNominalTarget] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [skorKeinginan, setSkorKeinginan] = useState("3");
  const [skorKepentingan, setSkorKepentingan] = useState("3");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [g, r] = await Promise.all([api.goals.list(token), api.goals.ranking(token)]);
      setGoals(g);
      setRanking(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat goal");
    } finally {
      setLoading(false);
    }
  }

  // loadAll is also reused by the create/edit/delete handlers below, so it
  // isn't split into an effect-only variant just to satisfy the linter.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadAll();
  }, [token]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  function resetForm() {
    setNamaGoal("");
    setNominalTarget("");
    setDeadline(defaultDeadline());
    setSkorKeinginan("3");
    setSkorKepentingan("3");
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !namaGoal || !nominalTarget) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        nama_goal: namaGoal,
        nominal_target: Number(nominalTarget),
        deadline,
        skor_keinginan: Number(skorKeinginan),
        skor_kepentingan: Number(skorKepentingan),
      };
      if (editingId) {
        await api.goals.update(token, editingId, payload);
      } else {
        await api.goals.create(token, payload);
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan goal");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id);
    setNamaGoal(goal.nama_goal);
    setNominalTarget(String(goal.nominal_target));
    setDeadline(goal.deadline);
    setSkorKeinginan(String(goal.skor_keinginan));
    setSkorKepentingan(String(goal.skor_kepentingan));
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm("Hapus goal ini?")) return;
    setError(null);
    try {
      await api.goals.remove(token, id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus goal");
    }
  }

  const rankByGoalId = new Map(ranking.map((r) => [r.goal_id, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Goals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ranking goal dihitung otomatis pakai SAW (Simple Additive Weighting) berdasarkan skor keinginan,
          progress, kapasitas nabung, urgensi deadline, dan besar target.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">{editingId ? "Edit Goal" : "Tambah Goal"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nama Goal</label>
            <input
              type="text"
              required
              value={namaGoal}
              onChange={(e) => setNamaGoal(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nominal Target (Rp)</label>
            <input
              type="number"
              required
              min={1}
              value={nominalTarget}
              onChange={(e) => setNominalTarget(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Deadline</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-400">Harus lebih dari hari ini.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Skor Keinginan</label>
              <select
                value={skorKeinginan}
                onChange={(e) => setSkorKeinginan(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {SKOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Skor Kepentingan</label>
              <select
                value={skorKepentingan}
                onChange={(e) => setSkorKepentingan(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {SKOR_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Goal"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-900">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat goal...</p>
        ) : goals.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Belum ada goal.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {goals.map((goal) => {
              const rank = rankByGoalId.get(goal.id);
              return (
                <li key={goal.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        {rank && (
                          <span className="text-xs font-semibold bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            {rank.rank}
                          </span>
                        )}
                        <span className="font-medium text-slate-900">{goal.nama_goal}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Deadline {goal.deadline} · Skor keinginan {goal.skor_keinginan} · Skor kepentingan{" "}
                        {goal.skor_kepentingan}
                        {rank && ` · SAW score ${rank.score}`}
                      </p>
                    </div>
                    <div className="flex gap-2 text-sm shrink-0">
                      <button onClick={() => startEdit(goal)} className="text-slate-500 hover:text-slate-900">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="text-slate-500 hover:text-red-600">
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900" style={{ width: `${goal.progress_percent}%` }} />
                    </div>
                    <span className="text-slate-500 w-40 text-right">
                      {formatRupiah(goal.current_saved)} / {formatRupiah(goal.nominal_target)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
