"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { Kategori, StatementExtractionResponse, StatementTransactionCandidate } from "@/types";

interface Props {
  token: string;
  categories: Kategori[];
  loading: boolean;
  result: StatementExtractionResponse | null;
  onClose: () => void;
  onImported: () => Promise<void>;
}

interface Row {
  candidate: StatementTransactionCandidate;
  checked: boolean;
  kategoriId: string;
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function StatementImportModal({ token, categories, loading, result, onClose, onImported }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  // Derive row state from `result` during render (React-recommended pattern
  // for syncing state from props) rather than in an effect, since this needs
  // to reset synchronously the first time a successful result arrives.
  const [syncedResult, setSyncedResult] = useState<StatementExtractionResponse | null>(null);

  if (result !== syncedResult) {
    setSyncedResult(result);
    if (result?.success) {
      setRows(
        result.transactions.map((candidate) => ({
          candidate,
          checked: Boolean(candidate.kategori_id_suggestion),
          kategoriId: candidate.kategori_id_suggestion ?? "",
        }))
      );
      setImportError(null);
    }
  }

  function toggleRow(index: number, checked: boolean) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, checked } : r)));
  }

  function setRowKategori(index: number, kategoriId: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, kategoriId } : r)));
  }

  const checkedRows = rows.filter((r) => r.checked);
  const canImport = checkedRows.length > 0 && checkedRows.every((r) => r.kategoriId);

  async function handleImport() {
    if (!canImport) return;
    setImporting(true);
    setImportError(null);
    const outcomes = await Promise.allSettled(
      checkedRows.map((r) =>
        api.transactions.create(token, {
          kategori_id: r.kategoriId,
          nominal: r.candidate.nominal,
          tanggal: r.candidate.tanggal ?? todayIso(),
          metode_input: "Upload E-Statement",
        })
      )
    );
    const failed = outcomes.filter((o) => o.status === "rejected").length;
    setImporting(false);
    if (failed > 0) {
      setImportError(`${failed} dari ${checkedRows.length} transaksi gagal diimpor. Sisanya berhasil disimpan.`);
    }
    if (failed < checkedRows.length) {
      await onImported();
    }
    if (failed === 0) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
        <div>
          <h2 className="font-semibold text-slate-900">Import E-Statement</h2>
          <p className="text-sm text-slate-500 mt-1">
            Periksa & sesuaikan hasil ekstraksi sebelum diimpor. Hapus centang baris yang tidak ingin disimpan.
          </p>
        </div>

        {loading && <p className="text-sm text-slate-500 py-6 text-center">Mengekstrak transaksi dari PDF...</p>}

        {!loading && result && !result.success && (
          <>
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {result.error_message ?? "Gagal mengekstrak dokumen. Silakan input transaksi manual."}
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800"
            >
              Tutup
            </button>
          </>
        )}

        {!loading && result?.success && (
          <>
            {importError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {importError}
              </p>
            )}
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium"></th>
                    <th className="px-3 py-2 font-medium">Tanggal</th>
                    <th className="px-3 py-2 font-medium">Deskripsi</th>
                    <th className="px-3 py-2 font-medium text-right">Nominal</th>
                    <th className="px-3 py-2 font-medium">Tipe</th>
                    <th className="px-3 py-2 font-medium">Kategori</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, i) => {
                    const options = categories.filter((c) => c.tipe === row.candidate.tipe_transaksi);
                    return (
                      <tr key={i} className={row.checked ? "" : "opacity-50"}>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={row.checked}
                            onChange={(e) => toggleRow(i, e.target.checked)}
                          />
                        </td>
                        <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                          {row.candidate.tanggal ?? <span className="text-amber-600">hari ini</span>}
                        </td>
                        <td className="px-3 py-2 text-slate-900">{row.candidate.deskripsi}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900 whitespace-nowrap">
                          {formatRupiah(row.candidate.nominal)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              row.candidate.tipe_transaksi === "Pemasukan" ? "text-emerald-600" : "text-rose-600"
                            }
                          >
                            {row.candidate.tipe_transaksi}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.kategoriId}
                            onChange={(e) => setRowKategori(i, e.target.value)}
                            className="rounded-md border border-slate-300 px-2 py-1 text-sm w-full"
                          >
                            <option value="">Pilih kategori</option>
                            {options.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nama_kategori}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleImport}
                disabled={!canImport || importing}
                className="flex-1 rounded-md bg-slate-900 text-white text-sm font-medium py-2 hover:bg-slate-800 disabled:opacity-50"
              >
                {importing ? "Mengimpor..." : `Import ${checkedRows.length} Transaksi`}
              </button>
              <button
                onClick={onClose}
                disabled={importing}
                className="flex-1 rounded-md border border-slate-300 text-sm font-medium py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
