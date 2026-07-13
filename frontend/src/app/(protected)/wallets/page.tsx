"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import WalletIconDisplay from "@/components/wallet-icon";
import LoadingState from "@/components/loading-state";
import type { Dompet, WalletIcon } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

const WALLET_PRESETS: { name: string; icon: WalletIcon; color: string }[] = [
  { name: "Tunai", icon: "Banknote", color: "#22C55E" },
  { name: "GoPay", icon: "Smartphone", color: "#00AA13" },
  { name: "OVO", icon: "Smartphone", color: "#7B2FBE" },
  { name: "DANA", icon: "Smartphone", color: "#118EEA" },
  { name: "Bank BCA", icon: "Building2", color: "#005BAA" },
  { name: "Bank Mandiri", icon: "Landmark", color: "#F5A623" },
  { name: "Kartu Kredit", icon: "CreditCard", color: "#EF4444" },
  { name: "Beasiswa", icon: "GraduationCap", color: "#FF8929" },
];

function WalletForm({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial?: Dompet;
  saving: boolean;
  onSave: (payload: { nama_dompet: string; icon: WalletIcon; warna: string; saldo: number }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.nama_dompet ?? "");
  const [icon, setIcon] = useState<WalletIcon>(initial?.icon ?? "Banknote");
  const [color, setColor] = useState(initial?.warna ?? "#22C55E");
  const [balance, setBalance] = useState(initial ? initial.saldo.toLocaleString("id-ID") : "");

  const rawBalance = parseInt(balance.replace(/\./g, "") || "0", 10);
  const canSave = name.trim() !== "" && rawBalance >= 0 && !saving;

  function handleBalanceChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setBalance(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "");
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 120,
        backgroundColor: "rgba(7,37,72,0.55)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ backgroundColor: "white", borderRadius: "20px 20px 0 0", padding: "16px 16px 36px", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingTop: 8 }}>
          <p style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#1E1E1E", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
            {initial ? "Edit Dompet" : "Tambah Dompet"}
          </p>
          <button
            type="button"
            onClick={onClose}
            title="Tutup"
            style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#F0F0F0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} color="#717182" />
          </button>
        </div>

        <p style={{ fontSize: 13, fontWeight: 600, color: "#717182", margin: "0 0 8px", fontFamily: "var(--font-inter), sans-serif" }}>
          Pilih Jenis Dompet
        </p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 14 }}>
          {WALLET_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setName(p.name);
                setIcon(p.icon);
                setColor(p.color);
              }}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 20,
                border: `2px solid ${name === p.name ? p.color : "#E0E0E0"}`,
                backgroundColor: name === p.name ? `${p.color}15` : "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: name === p.name ? p.color : "#717182",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              <WalletIconDisplay icon={p.icon} color={name === p.name ? p.color : "#717182"} size={15} />
              {p.name}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px", fontFamily: "var(--font-inter), sans-serif" }}>Nama Dompet</p>
          <input
            type="text"
            placeholder="Nama dompet"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px", fontFamily: "var(--font-inter), sans-serif" }}>Saldo Saat Ini</p>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: "#717182" }}>Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={balance}
              onChange={handleBalanceChange}
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

        <button
          type="button"
          onClick={() => canSave && onSave({ nama_dompet: name.trim(), icon, warna: color, saldo: rawBalance })}
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
          <Check size={17} /> {saving ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Dompet"}
        </button>
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<Dompet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Dompet | null>(null);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const wlts = await api.wallets.list(token);
      setWallets(wlts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat dompet");
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

  async function handleCreate(payload: { nama_dompet: string; icon: WalletIcon; warna: string; saldo: number }) {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await api.wallets.create(token, payload);
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menambah dompet");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, payload: { nama_dompet: string; icon: WalletIcon; warna: string; saldo: number }) {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await api.wallets.update(token, id, payload);
      setEditingWallet(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setError(null);
    try {
      await api.wallets.remove(token, id);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus dompet");
    }
  }

  const totalBalance = wallets.reduce((a, w) => a + w.saldo, 0);

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
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
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
                Kelola Dompet
              </h1>
            </div>

            <div style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 18, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ fontSize: 12, color: "rgba(180,210,255,0.8)", margin: "0 0 4px", fontWeight: 500 }}>Total Saldo Semua Dompet</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: "white", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                {formatRupiah(totalBalance)}
              </p>
              <p style={{ fontSize: 12, color: "rgba(180,210,255,0.7)", margin: "4px 0 0" }}>{wallets.length} dompet terhubung</p>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#F4F6F8", padding: "14px 12px 24px" }}>
            {error && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "#EF4444", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px" }}>
                {error}
              </p>
            )}

            {loading ? (
              <LoadingState />
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      style={{
                        backgroundColor: "white",
                        borderRadius: 18,
                        padding: "16px 18px",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                        border: `1.5px solid ${wallet.warna}22`,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          flexShrink: 0,
                          backgroundColor: `${wallet.warna}18`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1.5px solid ${wallet.warna}30`,
                        }}
                      >
                        <WalletIconDisplay icon={wallet.icon} color={wallet.warna} size={26} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: "#1E1E1E", margin: "0 0 3px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                          {wallet.nama_dompet}
                        </p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: wallet.warna, margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                          {formatRupiah(wallet.saldo)}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setEditingWallet(wallet)}
                          title={`Edit ${wallet.nama_dompet}`}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: "none",
                            backgroundColor: "#F0F7FF",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Edit2 size={15} color="#298DFF" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(wallet.id)}
                          title={`Hapus ${wallet.nama_dompet}`}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: "none",
                            backgroundColor: "#FEF2F2",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Trash2 size={15} color="#EF4444" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: 18,
                    border: "2px dashed #CBD5E1",
                    backgroundColor: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    color: "#717182",
                    fontSize: 15,
                    fontWeight: 600,
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <Plus size={20} color="#A0A0A8" />
                  Tambah Dompet Baru
                </button>
              </>
            )}
          </div>

          {showForm && <WalletForm saving={saving} onSave={handleCreate} onClose={() => setShowForm(false)} />}
          {editingWallet && (
            <WalletForm
              initial={editingWallet}
              saving={saving}
              onSave={(payload) => handleUpdate(editingWallet.id, payload)}
              onClose={() => setEditingWallet(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
