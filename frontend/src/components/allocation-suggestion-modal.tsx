"use client";

import { useState } from "react";
import type { AllocationSuggestion } from "@/types";

interface Props {
  suggestion: AllocationSuggestion;
  onConfirm: (nominal: number) => Promise<void>;
  onDismiss: () => void;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

export default function AllocationSuggestionModal({ suggestion, onConfirm, onDismiss }: Props) {
  const [nominal, setNominal] = useState(String(suggestion.nominal_alokasi_disarankan));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(Number(nominal));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan alokasi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Saran Alokasi Side Income</h2>
          <p className="text-sm text-slate-500 mt-1">{suggestion.pesan}</p>
        </div>

        {!suggestion.has_goal ? (
          <button
            onClick={onDismiss}
            className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800"
          >
            Oke
          </button>
        ) : (
          <>
            <div className="bg-slate-50 rounded-md p-3 text-sm">
              <p className="text-slate-500">Goal prioritas tertinggi (SAW ranking)</p>
              <p className="font-medium text-slate-900">{suggestion.nama_goal}</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Nominal alokasi ({suggestion.persentase}% disarankan:{" "}
                {formatRupiah(suggestion.nominal_alokasi_disarankan)})
              </label>
              <input
                type="number"
                min={1}
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
              >
                {submitting ? "Menyimpan..." : "Konfirmasi Alokasi"}
              </button>
              <button
                onClick={onDismiss}
                disabled={submitting}
                className="flex-1 rounded-md border border-slate-300 text-sm font-medium py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Nanti Saja
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
