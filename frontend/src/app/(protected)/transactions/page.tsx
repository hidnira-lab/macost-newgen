"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import AllocationSuggestionModal from "@/components/allocation-suggestion-modal";
import StatementImportModal from "@/components/statement-import-modal";
import type { AllocationSuggestion, Kategori, MetodeInput, StatementExtractionResponse, Transaksi } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kategoriId, setKategoriId] = useState("");
  const [nominal, setNominal] = useState("");
  const [tanggal, setTanggal] = useState(todayIso());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState<AllocationSuggestion | null>(null);

  const [metodeInput, setMetodeInput] = useState<MetodeInput>("Manual");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const [statementLoading, setStatementLoading] = useState(false);
  const [statementResult, setStatementResult] = useState<StatementExtractionResponse | null>(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const statementInputRef = useRef<HTMLInputElement>(null);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, txns] = await Promise.all([api.categories(token), api.transactions.list(token)]);
      setCategories(cats);
      setTransactions(txns);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data");
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
    setKategoriId("");
    setNominal("");
    setTanggal(todayIso());
    setEditingId(null);
    setMetodeInput("Manual");
    setScanMessage(null);
  }

  async function handleReceiptFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setScanning(true);
    setScanMessage(null);
    try {
      const result = await api.receipts.scan(token, file);
      if (result.nominal) setNominal(String(result.nominal));
      if (result.tanggal) setTanggal(result.tanggal);
      if (result.kategori_id_suggestion) setKategoriId(result.kategori_id_suggestion);

      if (result.success) {
        setMetodeInput("Scan Struk");
        setScanMessage({
          type: "success",
          text: `Struk berhasil dipindai${result.deskripsi ? ` (${result.deskripsi})` : ""}. Periksa data di bawah sebelum menyimpan.`,
        });
      } else {
        // Dual-path fallback (FR-004): tidak retry otomatis, langsung
        // tampilkan form manual dengan data parsial (kalau ada) sebagai bantuan.
        setMetodeInput("Manual");
        setScanMessage({
          type: "error",
          text: result.error_message ?? "Struk tidak terbaca. Isi data manual di bawah.",
        });
      }
    } catch (err) {
      setMetodeInput("Manual");
      setScanMessage({
        type: "error",
        text: err instanceof ApiError ? err.message : "Gagal memindai struk. Isi data manual di bawah.",
      });
    } finally {
      setScanning(false);
      if (receiptInputRef.current) receiptInputRef.current.value = "";
    }
  }

  async function handleStatementFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token || !kategoriId || !nominal) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = { kategori_id: kategoriId, nominal: Number(nominal), tanggal, metode_input: metodeInput };
      if (editingId) {
        await api.transactions.update(token, editingId, payload);
      } else {
        const created = await api.transactions.create(token, payload);
        if (created.tipe_transaksi === "Pemasukan" && created.source === "Flexible Side Income") {
          // Only computes a suggestion — the modal's explicit confirm click is
          // the sole path that writes to the alokasi table.
          try {
            const s = await api.allocations.suggest(token, { transaksi_id: created.id });
            setSuggestion(s);
          } catch {
            // non-fatal: a failed suggestion shouldn't block the transaction flow
          }
        }
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan transaksi");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(txn: Transaksi) {
    setEditingId(txn.id);
    setKategoriId(txn.kategori_id);
    setNominal(String(txn.nominal));
    setTanggal(txn.tanggal);
    setMetodeInput("Manual");
    setScanMessage(null);
  }

  async function handleDelete(id: string) {
    if (!token) return;
    if (!confirm("Hapus transaksi ini?")) return;
    setError(null);
    try {
      await api.transactions.remove(token, id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus transaksi");
    }
  }

  async function handleConfirmAllocation(nominalAlokasi: number) {
    if (!token || !suggestion?.goal_id) return;
    await api.allocations.confirm(token, {
      transaksi_id: suggestion.transaksi_id,
      goal_id: suggestion.goal_id,
      nominal_alokasi: nominalAlokasi,
    });
    setSuggestion(null);
  }

  function handleDismissAllocation() {
    setSuggestion(null);
  }

  const selectedKategori = categories.find((c) => c.id === kategoriId);
  const pemasukanCategories = categories.filter((c) => c.tipe === "Pemasukan");
  const pengeluaranCategories = categories.filter((c) => c.tipe === "Pengeluaran");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Transaksi</h1>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
        <h2 className="font-semibold text-slate-900">Import Otomatis</h2>
        <div className="flex flex-wrap gap-2">
          <input
            ref={receiptInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleReceiptFileChange}
          />
          <button
            type="button"
            disabled={scanning}
            onClick={() => receiptInputRef.current?.click()}
            className="rounded-md border border-slate-300 text-sm font-medium px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {scanning ? "Memindai..." : "Scan Struk"}
          </button>

          <input
            ref={statementInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleStatementFileChange}
          />
          <button
            type="button"
            onClick={() => statementInputRef.current?.click()}
            className="rounded-md border border-slate-300 text-sm font-medium px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Upload E-Statement (PDF)
          </button>
        </div>
        {scanning && (
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
            <span
              aria-hidden
              className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin"
            />
            Membaca struk dengan AI... biasanya 15-25 detik, mohon tunggu.
          </div>
        )}
        {scanMessage && (
          <p
            className={
              "text-sm rounded-md px-3 py-2 border " +
              (scanMessage.type === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-amber-700 bg-amber-50 border-amber-200")
            }
          >
            {scanMessage.text}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">{editingId ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Kategori</label>
            <select
              required
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Pilih kategori</option>
              <optgroup label="Pemasukan">
                {pemasukanCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Pengeluaran">
                {pengeluaranCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </optgroup>
            </select>
            {selectedKategori && (
              <p className="text-xs text-slate-400">
                Tipe: {selectedKategori.tipe}
                {selectedKategori.flag_pemasukan ? ` · Source: ${selectedKategori.flag_pemasukan}` : ""}
                {selectedKategori.flag_pengeluaran ? ` · ${selectedKategori.flag_pengeluaran}` : ""}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nominal (Rp)</label>
            <input
              type="number"
              required
              min={1}
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Tanggal</label>
            <input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Transaksi"}
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
          <p className="p-6 text-sm text-slate-500">Memuat transaksi...</p>
        ) : transactions.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">Belum ada transaksi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Tipe</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium text-right">Nominal</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-4 py-3 text-slate-600">{txn.tanggal}</td>
                  <td className="px-4 py-3 text-slate-900">{txn.nama_kategori}</td>
                  <td className="px-4 py-3">
                    <span className={txn.tipe_transaksi === "Pemasukan" ? "text-emerald-600" : "text-rose-600"}>
                      {txn.tipe_transaksi}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{txn.source ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{formatRupiah(txn.nominal)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(txn)} className="text-slate-500 hover:text-slate-900">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(txn.id)} className="text-slate-500 hover:text-red-600">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {suggestion && (
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
  );
}
