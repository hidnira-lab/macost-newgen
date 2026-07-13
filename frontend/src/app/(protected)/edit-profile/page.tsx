"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, MapPin, Check, GraduationCap, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

const inputBase: CSSProperties = {
  width: "100%",
  padding: "13px 14px 13px 42px",
  borderRadius: 14,
  border: "1.5px solid #E0E0E0",
  backgroundColor: "white",
  fontSize: 15,
  color: "#1E1E1E",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-inter), sans-serif",
};

export default function EditProfilePage() {
  const { token, updateUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const profile = await api.me(token);
        setName(profile.nama ?? "");
        setEmail(profile.email);
        setPhone(profile.telepon ?? "");
        setCity(profile.kota ?? "");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSave() {
    if (!token) return;
    if (name.trim().length < 2) {
      setNameError("Nama minimal 2 karakter");
      return;
    }
    setNameError("");
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateMe(token, { nama: name.trim(), telepon: phone, kota: city });
      updateUser({ nama: updated.nama, telepon: updated.telepon, kota: updated.kota });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setSaving(false);
    }
  }

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
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {/* Header */}
            <div
              style={{
                padding: "52px 20px 24px",
                background: "linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  Edit Profil
                </h1>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #298DFF, #FF8929)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 900,
                    fontSize: 30,
                    border: "3px solid rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  }}
                >
                  {name.trim().charAt(0).toUpperCase() || "?"}
                </div>
              </div>
            </div>

            {/* Form */}
            <div style={{ backgroundColor: "#F4F6F8", padding: "20px 16px 36px" }}>
              {error && (
                <p style={{ margin: "0 0 16px", fontSize: 13, color: "#EF4444", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 12px" }}>
                  {error}
                </p>
              )}

              {loading ? (
                <p style={{ padding: 24, fontSize: 14, color: "#717182", textAlign: "center" }}>Memuat...</p>
              ) : (
                <>
                  <div style={{ backgroundColor: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#A0A0A8", padding: "14px 18px 0", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Informasi Pribadi
                    </p>

                    <div style={{ padding: "12px 16px 0" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#717182", display: "block", marginBottom: 5 }}>
                        Nama Lengkap
                      </label>
                      <div style={{ position: "relative" }}>
                        <User size={16} color={nameError ? "#EF4444" : "#A0A0A8"} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setNameError("");
                          }}
                          style={{ ...inputBase, border: `1.5px solid ${nameError ? "#EF4444" : "#E0E0E0"}`, backgroundColor: nameError ? "#FEF2F2" : "white" }}
                          placeholder="Nama lengkapmu"
                        />
                      </div>
                      {nameError && (
                        <p style={{ fontSize: 12, color: "#EF4444", margin: "4px 0 0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                          <AlertTriangle size={12} /> {nameError}
                        </p>
                      )}
                    </div>

                    <div style={{ padding: "12px 16px 0" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#717182", display: "block", marginBottom: 5 }}>
                        Email <span style={{ fontSize: 10, color: "#A0A0A8", fontWeight: 400 }}>(tidak dapat diubah)</span>
                      </label>
                      <div style={{ position: "relative" }}>
                        <Mail size={16} color="#C0C0C8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          type="email"
                          value={email}
                          readOnly
                          style={{ ...inputBase, backgroundColor: "#F8F8F8", color: "#A0A0A8", cursor: "not-allowed" }}
                        />
                      </div>
                    </div>

                    <div style={{ padding: "12px 16px 0" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#717182", display: "block", marginBottom: 5 }}>
                        Nomor Telepon
                      </label>
                      <div style={{ position: "relative" }}>
                        <Phone size={16} color="#A0A0A8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08xx-xxxx-xxxx"
                          style={inputBase}
                        />
                      </div>
                    </div>

                    <div style={{ padding: "12px 16px 16px" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#717182", display: "block", marginBottom: 5 }}>
                        Kota
                      </label>
                      <div style={{ position: "relative" }}>
                        <MapPin size={16} color="#A0A0A8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Jakarta, Bandung, ..."
                          style={inputBase}
                        />
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#EFF6FF",
                      borderRadius: 16,
                      padding: "14px 16px",
                      border: "1.5px solid rgba(41,141,255,0.2)",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <GraduationCap size={22} color="#1D6FA8" strokeWidth={1.8} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1D6FA8", margin: "0 0 2px" }}>Status Mahasiswa Aktif</p>
                      <p style={{ fontSize: 12, color: "#5B9CC4", margin: 0 }}>Macost tersedia gratis untuk mahasiswa Indonesia</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      width: "100%",
                      padding: "15px",
                      borderRadius: 16,
                      border: "none",
                      background: saved
                        ? "linear-gradient(135deg, #22C55E, #16A34A)"
                        : "linear-gradient(135deg, #298DFF, #0070E0)",
                      color: "white",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: saving ? "not-allowed" : "pointer",
                      boxShadow: `0 6px 20px ${saved ? "rgba(34,197,94,0.38)" : "rgba(41,141,255,0.38)"}`,
                      fontFamily: "var(--font-inter), sans-serif",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {saving ? "Menyimpan..." : saved ? (
                      <>
                        <Check size={18} strokeWidth={3} /> Tersimpan!
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
