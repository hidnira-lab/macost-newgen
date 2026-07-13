"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, AlertTriangle, Check as CheckIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const PASSWORD_MIN_LENGTH = 8;

type FieldError = { name?: string; email?: string; password?: string };

function inputStyle(hasError?: boolean): CSSProperties {
  return {
    width: "100%",
    padding: "13px 14px 13px 42px",
    borderRadius: 14,
    border: `1.5px solid ${hasError ? "#EF4444" : "#E0E0E0"}`,
    backgroundColor: hasError ? "#FEF2F2" : "white",
    fontSize: 15,
    color: "#1E1E1E",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--font-inter), sans-serif",
    transition: "border-color 0.2s",
  };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [authError, setAuthError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: FieldError = {};
    if (!nama.trim() || nama.trim().length < 2) {
      e.name = "Nama minimal 2 karakter";
    }
    if (!email.trim()) {
      e.email = "Email tidak boleh kosong";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Format email tidak valid";
    }
    if (!password) {
      e.password = "Password tidak boleh kosong";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      e.password = `Password minimal ${PASSWORD_MIN_LENGTH} karakter`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError("");
    setInfo("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { emailConfirmationRequired } = await register(nama, email, password);
      if (emailConfirmationRequired) {
        setInfo("Akun berhasil dibuat. Cek email kamu untuk konfirmasi sebelum login.");
      } else {
        router.replace("/home");
      }
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message : "Gagal mendaftar");
    } finally {
      setSubmitting(false);
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
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          boxShadow: "0 0 60px rgba(7,37,72,0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            backgroundColor: "#FCFCFC",
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-inter), sans-serif",
            overflowY: "auto",
          }}
        >
          {/* Top Header */}
          <div
            style={{
              height: 180,
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 0 28px",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "absolute", top: -20, right: -10, width: 130, height: 130, borderRadius: "50%", backgroundColor: "rgba(41,141,255,0.18)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,137,41,0.12)" }} />

            <div style={{ position: "relative", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-macost-with-text.svg"
                alt="Macost"
                style={{ height: 38, width: "auto", display: "block", margin: "0 auto" }}
              />
            </div>
          </div>

          {/* Form */}
          <div style={{ flex: 1, padding: "24px 20px 32px" }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1E1E1E",
                margin: "0 0 4px",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              Buat Akun Baru
            </h2>
            <p style={{ fontSize: 14, color: "#717182", margin: "0 0 24px" }}>
              Mulai kelola keuanganmu hari ini
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Auth error banner */}
              {authError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    marginBottom: 20,
                    backgroundColor: "#FEF2F2",
                    border: "1.5px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <Lock size={16} color="#DC2626" />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#DC2626", margin: 0 }}>{authError}</p>
                </div>
              )}

              {/* Info banner (e.g. email confirmation required) */}
              {info && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 12,
                    marginBottom: 20,
                    backgroundColor: "#F0FDF4",
                    border: "1.5px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <CheckIcon size={16} color="#16A34A" strokeWidth={2.5} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#16A34A", margin: 0 }}>{info}</p>
                </div>
              )}

              {/* Full Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#717182", display: "block", marginBottom: 6 }}>
                  Nama Lengkap
                </label>
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    color={errors.name ? "#EF4444" : "#A0A0A8"}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                  <input
                    type="text"
                    placeholder="Nama lengkap kamu"
                    value={nama}
                    onChange={(e) => {
                      setNama(e.target.value);
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    style={inputStyle(!!errors.name)}
                  />
                </div>
                {errors.name && (
                  <p style={{ fontSize: 12, color: "#EF4444", margin: "5px 0 0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#717182", display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
                    color={errors.email ? "#EF4444" : "#A0A0A8"}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    style={inputStyle(!!errors.email)}
                  />
                </div>
                {errors.email && (
                  <p style={{ fontSize: 12, color: "#EF4444", margin: "5px 0 0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#717182", display: "block", marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    color={errors.password ? "#EF4444" : "#A0A0A8"}
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={`Minimal ${PASSWORD_MIN_LENGTH} karakter`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPass ? <EyeOff size={16} color="#A0A0A8" /> : <Eye size={16} color="#A0A0A8" />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: "#EF4444", margin: "5px 0 0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={12} /> {errors.password}
                  </p>
                )}
                {password && password.length >= PASSWORD_MIN_LENGTH && !errors.password && (
                  <p style={{ fontSize: 12, color: "#22C55E", margin: "5px 0 0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <CheckIcon size={12} strokeWidth={2.5} /> Password aman
                  </p>
                )}
              </div>

              {/* Terms note */}
              <p style={{ fontSize: 12, color: "#A0A0A8", margin: "0 0 18px", lineHeight: 1.6, textAlign: "center" }}>
                Dengan mendaftar, kamu menyetujui{" "}
                <span style={{ color: "#298DFF", fontWeight: 600 }}>Syarat & Ketentuan</span>
                {" "}dan{" "}
                <span style={{ color: "#298DFF", fontWeight: 600 }}>Kebijakan Privasi</span>
                {" "}Macost.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "15px",
                  borderRadius: 16,
                  border: "none",
                  background: submitting ? "#C0D8F8" : "linear-gradient(135deg, #298DFF, #0070E0)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : "0 6px 20px rgba(41,141,255,0.38)",
                  fontFamily: "var(--font-inter), sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
              >
                {submitting ? (
                  <>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    Membuat Akun...
                  </>
                ) : (
                  "Buat Akun"
                )}
              </button>
            </form>

            {/* Login link */}
            <p style={{ textAlign: "center", margin: "24px 0 0", fontSize: 14, color: "#717182" }}>
              Sudah punya akun?{" "}
              <Link
                href="/login"
                style={{ color: "#298DFF", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-inter), sans-serif" }}
              >
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
