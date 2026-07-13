"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { X, Camera, ChevronDown, PenLine, FileText, Frown, RefreshCw, CheckCircle2, Edit3 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Kategori } from "@/types";

type ScanStep = "capture" | "loading" | "error" | "success";

export default function ScanReceiptModal({
  token,
  categories,
  onSave,
  onClose,
  onSwitchManual,
  saving = false,
}: {
  token: string;
  categories: Kategori[];
  onSave: (payload: { kategoriId: string; nominal: number; tanggal: string }) => void;
  onClose: () => void;
  onSwitchManual: () => void;
  saving?: boolean;
}) {
  const [step, setStep] = useState<ScanStep>("capture");
  const [errorMessage, setErrorMessage] = useState("");
  const [deskripsi, setDeskripsi] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [kategoriId, setKategoriId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const expenseCategories = categories.filter((c) => c.tipe === "Pengeluaran");

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStep("loading");
    try {
      const result = await api.receipts.scan(token, file);
      if (result.success) {
        setDeskripsi(result.deskripsi);
        setAmount(result.nominal ? result.nominal.toLocaleString("id-ID") : "");
        setTanggal(result.tanggal ?? new Date().toISOString().split("T")[0]);
        setKategoriId(result.kategori_id_suggestion ?? "");
        setStep("success");
      } else {
        setErrorMessage(result.error_message ?? "Struk tidak terbaca. Coba foto ulang atau input manual.");
        setStep("error");
      }
    } catch (err) {
      setErrorMessage(err instanceof ApiError ? err.message : "Gagal memindai struk.");
      setStep("error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmount(raw ? parseInt(raw, 10).toLocaleString("id-ID") : "");
  };

  const rawAmount = parseInt(amount.replace(/\./g, "") || "0", 10);
  const canSave = rawAmount > 0 && kategoriId !== "" && !saving;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ kategoriId, nominal: rawAmount, tanggal });
  };

  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      capture="environment"
      className="hidden"
      onChange={handleFileChange}
    />
  );

  if (step === "capture") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 150,
          backgroundColor: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {hiddenFileInput}
        <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={24} color="white" />
          </button>
          <p style={{ color: "white", fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
            Scan Struk
          </p>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div
            style={{
              width: "78%",
              aspectRatio: "3/4",
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: "#1C1C1C",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "33.33% 33.33%",
              }}
            />
            {[
              { top: 14, left: 14, borderTop: "3px solid #298DFF", borderLeft: "3px solid #298DFF" },
              { top: 14, right: 14, borderTop: "3px solid #298DFF", borderRight: "3px solid #298DFF" },
              { bottom: 14, left: 14, borderBottom: "3px solid #298DFF", borderLeft: "3px solid #298DFF" },
              { bottom: 14, right: 14, borderBottom: "3px solid #298DFF", borderRight: "3px solid #298DFF" },
            ].map((s, i) => (
              <div key={i} style={{ position: "absolute", width: 26, height: 26, borderRadius: 3, ...s }} />
            ))}
            <div style={{ position: "absolute", inset: "20px 28px", display: "flex", flexDirection: "column", gap: 9, opacity: 0.28 }}>
              {[85, 55, 100, 65, 80, 45, 70, 90, 50].map((w, i) => (
                <div key={i} style={{ height: 11, width: `${w}%`, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 4 }} />
              ))}
            </div>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500, textAlign: "center" }}>
            Arahkan kamera ke struk belanja
          </p>
        </div>

        <div style={{ padding: "16px 0 52px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: "4px solid rgba(255,255,255,0.3)",
              backgroundColor: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
            }}
          >
            <Camera size={34} color="#1E1E1E" />
          </button>
          <button
            type="button"
            onClick={onSwitchManual}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.25)",
              cursor: "pointer",
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              padding: "7px 18px",
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PenLine size={13} /> Input Manual
          </button>
        </div>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 150,
          backgroundColor: "rgba(7,37,72,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "#FCFCFC",
            borderRadius: 24,
            padding: "40px 32px",
            textAlign: "center",
            width: 300,
            maxWidth: "90%",
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <FileText size={44} color="#298DFF" strokeWidth={1.5} />
          </div>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "4px solid #EEF6FF",
              borderTop: "4px solid #298DFF",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ fontSize: 17, fontWeight: 700, color: "#1E1E1E", margin: "0 0 6px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
            Membaca strukmu...
          </p>
          <p style={{ fontSize: 13, color: "#717182", margin: 0 }}>
            AI sedang mengekstrak data, maksimal 10 detik
          </p>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 150,
          backgroundColor: "rgba(7,37,72,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backdropFilter: "blur(5px)",
          fontFamily: "var(--font-inter), sans-serif",
        }}
      >
        {hiddenFileInput}
        <div
          style={{
            backgroundColor: "#FCFCFC",
            borderRadius: 24,
            padding: "36px 28px",
            textAlign: "center",
            width: "100%",
            maxWidth: 360,
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Frown size={56} color="#A0A0A8" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: "#1E1E1E", margin: "0 0 10px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
            Struk Tidak Terbaca
          </h2>
          <p style={{ fontSize: 14, color: "#717182", margin: "0 0 26px", lineHeight: 1.65 }}>{errorMessage}</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #298DFF, #0070E0)",
              color: "white",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 14,
              fontFamily: "var(--font-inter), sans-serif",
              boxShadow: "0 4px 16px rgba(41,141,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <RefreshCw size={16} /> Coba Lagi
          </button>
          <button
            type="button"
            onClick={onSwitchManual}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#717182",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "var(--font-inter), sans-serif",
              textDecoration: "underline",
            }}
          >
            Switch ke Input Manual
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 150,
        backgroundColor: "rgba(7,37,72,0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backdropFilter: "blur(5px)",
        fontFamily: "var(--font-inter), sans-serif",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: "#FCFCFC",
          borderRadius: "24px 24px 0 0",
          maxHeight: "88vh",
          overflowY: "auto",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0" }} />
        </div>

        <div style={{ padding: "14px 20px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#EDFFF3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={22} color="#22C55E" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1E1E1E", margin: 0, fontFamily: "var(--font-plus-jakarta-sans), sans-serif" }}>
                  Struk Terbaca!
                </p>
                <p style={{ fontSize: 12, color: "#22C55E", margin: "2px 0 0", fontWeight: 600 }}>
                  {deskripsi ? deskripsi : "Periksa & edit data jika perlu"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#F0F0F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} color="#717182" />
            </button>
          </div>

          <div style={{ marginBottom: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#717182" }}>Jumlah</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "#717182" }}>
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 42px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(41,141,255,0.25)",
                  backgroundColor: "#F8FBFF",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#1E1E1E",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#717182" }}>Tanggal</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1.5px solid rgba(41,141,255,0.25)",
                backgroundColor: "#F8FBFF",
                fontSize: 14,
                color: "#1E1E1E",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#717182" }}>Kategori</label>
              <Edit3 size={13} color="#298DFF" />
            </div>
            <div style={{ position: "relative" }}>
              <select
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 36px 12px 14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(41,141,255,0.25)",
                  backgroundColor: "#F8FBFF",
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
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} color="#717182" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
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
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}
