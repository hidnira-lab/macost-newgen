"use client";

import { useState, type ChangeEvent } from "react";
import { Keyboard, ScanLine, FileUp, ChevronDown, TrendingDown, TrendingUp } from "lucide-react";
import type { Kategori } from "@/types";

type Step = "choose" | "manual";

export default function AddTransactionModal({
  categories,
  onSave,
  onClose,
  onScanReceipt,
  onUploadStatement,
  saving = false,
}: {
  categories: Kategori[];
  onSave: (payload: { kategoriId: string; nominal: number; tanggal: string }) => void;
  onClose: () => void;
  onScanReceipt: () => void;
  onUploadStatement: () => void;
  saving?: boolean;
}) {
  const [step, setStep] = useState<Step>("choose");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Pengeluaran" | "Pemasukan">("Pengeluaran");
  const [kategoriId, setKategoriId] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);

  const filteredCategories = categories.filter((c) => c.tipe === type);
  const rawAmount = parseInt(amount.replace(/\./g, "") || "0", 10);
  const canSave = rawAmount > 0 && kategoriId !== "" && !saving;

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "");
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({ kategoriId, nominal: rawAmount, tanggal });
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        backgroundColor: "rgba(7,37,72,0.55)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FCFCFC",
          borderRadius: "24px 24px 0 0",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" }} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step === "manual" && (
              <button
                type="button"
                onClick={() => setStep("choose")}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: "#F0F0F0",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  color: "#717182",
                }}
              >
                ‹
              </button>
            )}
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1E1E1E",
                margin: 0,
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              {step === "choose" ? "Tambah Transaksi" : "Input Manual"}
            </h2>
          </div>
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
              fontSize: 15,
              color: "#717182",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {step === "choose" ? (
          <div style={{ padding: "0 20px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                Icon: Keyboard,
                title: "Input Manual",
                color: "#298DFF",
                bg: "#EEF6FF",
                desc: "Masukkan detail transaksi secara langsung",
                onClick: () => setStep("manual"),
              },
              {
                Icon: ScanLine,
                title: "Scan Struk",
                color: "#FF8929",
                bg: "#FFF3E8",
                desc: "Foto struk belanja untuk input otomatis",
                onClick: onScanReceipt,
              },
              {
                Icon: FileUp,
                title: "Upload Mutasi Bank",
                color: "#22C55E",
                bg: "#EDFFF3",
                desc: "Unggah file mutasi rekening (PDF)",
                onClick: onUploadStatement,
              },
            ].map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={item.onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: "1.5px solid rgba(0,0,0,0.07)",
                  backgroundColor: "white",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                  width: "100%",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.Icon size={22} color={item.color} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#1E1E1E", margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: "#717182", margin: "2px 0 0" }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ padding: "0 20px 28px" }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: "#717182", margin: "0 0 8px", textAlign: "center", fontWeight: 500 }}>
                Jumlah
              </p>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#717182",
                  }}
                >
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "16px 16px 16px 56px",
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#1E1E1E",
                    border: "2px solid #298DFF",
                    borderRadius: 18,
                    backgroundColor: "#F8FBFF",
                    outline: "none",
                    fontFamily: "var(--font-inter), sans-serif",
                    boxSizing: "border-box",
                    letterSpacing: "-0.5px",
                    textAlign: "left",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 14,
                backgroundColor: "#F2F2F2",
                padding: 4,
                borderRadius: 14,
              }}
            >
              {(["Pengeluaran", "Pemasukan"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setKategoriId("");
                  }}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 11,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "all 0.2s",
                    backgroundColor: type === t ? (t === "Pengeluaran" ? "#EF4444" : "#22C55E") : "transparent",
                    color: type === t ? "white" : "#717182",
                    boxShadow: type === t ? "0 2px 10px rgba(0,0,0,0.15)" : "none",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    {t === "Pengeluaran" ? (
                      <>
                        <TrendingDown size={14} strokeWidth={2.5} /> Pengeluaran
                      </>
                    ) : (
                      <>
                        <TrendingUp size={14} strokeWidth={2.5} /> Pemasukan
                      </>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px" }}>Kategori</p>
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
                    color: kategoriId ? "#1E1E1E" : "#A0A0A8",
                    appearance: "none",
                    cursor: "pointer",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <option value="">Pilih kategori...</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  color="#717182"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#717182", margin: "0 0 6px" }}>Tanggal</p>
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
              onClick={handleSave}
              disabled={!canSave}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: 16,
                border: "none",
                background: canSave ? "linear-gradient(135deg, #298DFF, #0070E0)" : "#E0E0E0",
                color: canSave ? "white" : "#A0A0A8",
                fontSize: 15,
                fontWeight: 700,
                cursor: canSave ? "pointer" : "not-allowed",
                boxShadow: canSave ? "0 4px 16px rgba(41,141,255,0.35)" : "none",
                transition: "all 0.2s",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
