"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, X, Edit2, Trash2, ChevronDown, Check, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import CategoryIcon from "@/components/category-icon";
import LoadingState from "@/components/loading-state";
import type { Kategori, Transaksi, TipeKategori } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function ActionSheet({
  txn,
  onEdit,
  onDelete,
  onClose,
}: {
  txn: Transaksi;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 120,
        backgroundColor: "rgba(7,37,72,0.5)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: "white", borderRadius: "20px 20px 0 0", padding: "16px 16px 36px", boxShadow: "0 -8px 32px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" }} />
        </div>
        <div style={{ padding: "0 4px 14px", borderBottom: "1px solid #F0F0F0", marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: "#A0A0A8", margin: "0 0 2px", fontFamily: "var(--font-inter), sans-serif" }}>
            {formatDate(txn.tanggal)}
          </p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E", margin: "0 0 2px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
            {txn.nama_kategori}
          </p>
          <p
            style={{
              fontSize: 17,
              fontWeight: 800,
              margin: 0,
              color: txn.tipe_transaksi === "Pemasukan" ? "#22C55E" : "#EF4444",
              fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
            }}
          >
            {txn.tipe_transaksi === "Pemasukan" ? "+" : "-"}
            {formatRupiah(txn.nominal)}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            backgroundColor: "#F0F7FF",
            color: "#298DFF",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 10,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          <Edit2 size={18} />
          Edit Transaksi
        </button>
        <button
          type="button"
          onClick={onDelete}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            backgroundColor: "#FEF2F2",
            color: "#EF4444",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          <Trash2 size={18} />
          Hapus Transaksi
        </button>
      </div>
    </div>
  );
}

function EditModal({
  txn,
  categories,
  saving,
  onSave,
  onClose,
}: {
  txn: Transaksi;
  categories: Kategori[];
  saving: boolean;
  onSave: (payload: { kategori_id: string; nominal: number; tanggal: string }) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(txn.nominal.toLocaleString("id-ID"));
  const [type, setType] = useState<TipeKategori>(txn.tipe_transaksi);
  const [kategoriId, setKategoriId] = useState(txn.kategori_id);
  const [tanggal, setTanggal] = useState(txn.tanggal);

  const filteredCategories = categories.filter((c) => c.tipe === type);
  const rawAmount = parseInt(amount.replace(/\./g, "") || "0", 10);
  const canSave = rawAmount > 0 && kategoriId !== "" && !saving;

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "");
  }

  function handleTypeChange(t: TipeKategori) {
    setType(t);
    setKategoriId(categories.find((c) => c.tipe === t)?.id ?? "");
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 130,
        backgroundColor: "rgba(7,37,72,0.55)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ backgroundColor: "white", borderRadius: "20px 20px 0 0", padding: "16px 16px 36px", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#1E1E1E", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
            Edit Transaksi
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#F0F0F0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} color="#717182" />
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, backgroundColor: "#F2F2F2", borderRadius: 14, padding: 4, marginBottom: 14 }}>
          {(["Pengeluaran", "Pemasukan"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: 11,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                fontFamily: "var(--font-inter), sans-serif",
                backgroundColor: type === t ? (t === "Pengeluaran" ? "#EF4444" : "#22C55E") : "transparent",
                color: type === t ? "white" : "#717182",
                boxShadow: type === t ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                {t === "Pengeluaran" ? <TrendingDown size={14} strokeWidth={2.5} /> : <TrendingUp size={14} strokeWidth={2.5} />}
                {t}
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px", fontFamily: "var(--font-inter), sans-serif" }}>Jumlah</p>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "#717182" }}>Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              style={{
                width: "100%",
                padding: "12px 12px 12px 38px",
                borderRadius: 12,
                border: "1.5px solid #E0E0E0",
                backgroundColor: "white",
                fontSize: 16,
                fontWeight: 700,
                color: "#1E1E1E",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px", fontFamily: "var(--font-inter), sans-serif" }}>Kategori</p>
          <div style={{ position: "relative" }}>
            <select
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 36px 12px 14px",
                borderRadius: 12,
                border: "1.5px solid #E0E0E0",
                backgroundColor: "white",
                fontSize: 14,
                color: "#1E1E1E",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "var(--font-inter), sans-serif",
                appearance: "none",
              }}
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>
            <ChevronDown size={15} color="#A0A0A8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px", fontFamily: "var(--font-inter), sans-serif" }}>Tanggal</p>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1.5px solid #E0E0E0",
              backgroundColor: "white",
              fontSize: 14,
              color: "#1E1E1E",
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => canSave && onSave({ kategori_id: kategoriId, nominal: rawAmount, tanggal })}
          disabled={!canSave}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 14,
            border: "none",
            background: canSave ? "linear-gradient(135deg, #298DFF, #0070E0)" : "#E0E0E0",
            color: canSave ? "white" : "#A0A0A8",
            fontSize: 15,
            fontWeight: 700,
            cursor: canSave ? "pointer" : "not-allowed",
            fontFamily: "var(--font-inter), sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Check size={17} /> {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TipeKategori>("all");
  const [selectedTx, setSelectedTx] = useState<Transaksi | null>(null);
  const [editingTx, setEditingTx] = useState<Transaksi | null>(null);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [cats, txns] = await Promise.all([api.categories(token), api.transactions.list(token)]);
      setCategories(cats);
      setTransactions(txns);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat transaksi");
    } finally {
      setLoading(false);
    }
  }

  // loadAll is also reused by the edit/delete handlers below, so it isn't
  // split into an effect-only variant just to satisfy the linter.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    loadAll();
  }, [token]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  async function handleDelete(id: string) {
    if (!token) return;
    setError(null);
    try {
      await api.transactions.remove(token, id);
      setSelectedTx(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus transaksi");
    }
  }

  async function handleSaveEdit(id: string, payload: { kategori_id: string; nominal: number; tanggal: string }) {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await api.transactions.update(token, id, payload);
      setEditingTx(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  const sorted = [...transactions].sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
  const filtered = sorted.filter((t) => {
    const matchSearch = search === "" || t.nama_kategori.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || t.tipe_transaksi === filter;
    return matchSearch && matchType;
  });

  const groups: Record<string, Transaksi[]> = {};
  for (const t of filtered) {
    if (!groups[t.tanggal]) groups[t.tanggal] = [];
    groups[t.tanggal].push(t);
  }
  const groupedByDate = Object.entries(groups).sort(([a], [b]) => (a < b ? 1 : -1));

  const totalPemasukan = filtered.filter((t) => t.tipe_transaksi === "Pemasukan").reduce((a, t) => a + t.nominal, 0);
  const totalPengeluaran = filtered.filter((t) => t.tipe_transaksi === "Pengeluaran").reduce((a, t) => a + t.nominal, 0);

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
              padding: "52px 20px 18px",
              background: "linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => router.back()}
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
                Riwayat Transaksi
              </h1>
            </div>

            <div style={{ position: "relative", marginBottom: 12 }}>
              <Search size={16} color="rgba(255,255,255,0.6)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 36px 11px 40px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
                >
                  <X size={15} color="rgba(255,255,255,0.7)" />
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
              {(["all", "Pemasukan", "Pengeluaran"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    flexShrink: 0,
                    padding: "7px 14px",
                    borderRadius: 20,
                    border: filter === f ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                    backgroundColor: filter === f ? "white" : "transparent",
                    color: filter === f ? (f === "Pemasukan" ? "#22C55E" : f === "Pengeluaran" ? "#EF4444" : "#072548") : "rgba(255,255,255,0.8)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {f === "all" ? "Semua" : f === "Pemasukan" ? "↑ Pemasukan" : "↓ Pengeluaran"}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#F4F6F8" }}>
            {error && (
              <p style={{ margin: 16, fontSize: 13, color: "#EF4444", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px" }}>
                {error}
              </p>
            )}

            {loading ? (
              <LoadingState />
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, padding: "12px 16px", backgroundColor: "white", borderBottom: "1px solid #F0F0F0" }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "#A0A0A8", margin: "0 0 2px", fontWeight: 500 }}>Pemasukan</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#22C55E", margin: 0 }}>{formatRupiah(totalPemasukan)}</p>
                  </div>
                  <div style={{ width: 1, backgroundColor: "#F0F0F0" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "#A0A0A8", margin: "0 0 2px", fontWeight: 500 }}>Pengeluaran</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#EF4444", margin: 0 }}>{formatRupiah(totalPengeluaran)}</p>
                  </div>
                  <div style={{ width: 1, backgroundColor: "#F0F0F0" }} />
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: "#A0A0A8", margin: "0 0 2px", fontWeight: 500 }}>Transaksi</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: 0 }}>{filtered.length}</p>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                      <Search size={44} color="#C0C0C8" strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#1E1E1E", margin: "0 0 6px" }}>Tidak ditemukan</p>
                    <p style={{ fontSize: 13, color: "#A0A0A8", margin: 0 }}>Coba ubah filter atau kata kunci pencarian</p>
                  </div>
                ) : (
                  <div style={{ padding: "10px 0 24px" }}>
                    {groupedByDate.map(([date, txs]) => (
                      <div key={date}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#A0A0A8", padding: "8px 16px 6px", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {formatDate(date)}
                        </p>
                        <div style={{ backgroundColor: "white", margin: "0 12px", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                          {txs.map((t, idx) => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTx(t)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "14px 16px",
                                borderTop: idx > 0 ? "1px solid #F4F4F4" : "none",
                                cursor: "pointer",
                              }}
                            >
                              <CategoryIcon category={t.nama_kategori} size={18} containerSize={42} borderRadius={12} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E", margin: "0 0 2px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                                  {t.nama_kategori}
                                </p>
                                <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>{t.metode_input}</p>
                              </div>
                              <p
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                  margin: 0,
                                  flexShrink: 0,
                                  color: t.tipe_transaksi === "Pemasukan" ? "#22C55E" : "#EF4444",
                                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                                }}
                              >
                                {t.tipe_transaksi === "Pemasukan" ? "+" : "-"}
                                {formatRupiah(t.nominal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {selectedTx && !editingTx && (
            <ActionSheet
              txn={selectedTx}
              onEdit={() => {
                setEditingTx(selectedTx);
                setSelectedTx(null);
              }}
              onDelete={() => handleDelete(selectedTx.id)}
              onClose={() => setSelectedTx(null)}
            />
          )}
          {editingTx && (
            <EditModal
              txn={editingTx}
              categories={categories}
              saving={saving}
              onSave={(payload) => handleSaveEdit(editingTx.id, payload)}
              onClose={() => setEditingTx(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
