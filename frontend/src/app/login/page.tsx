"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

type FieldError = { email?: string; password?: string };

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validateFormat = (): boolean => {
    const e: FieldError = {};
    if (!email.trim()) {
      e.email = "Email tidak boleh kosong";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = "Format email tidak valid";
    }
    if (!password) {
      e.password = "Password tidak boleh kosong";
    } else if (password.length < 6) {
      e.password = "Password minimal 6 karakter";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError("");
    if (!validateFormat()) return;
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/home");
    } catch (err) {
      setAuthError(err instanceof ApiError ? err.message : "Gagal login");
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
          {/* Top Wave / Decoration */}
          <div
            style={{
              height: 220,
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-end",
              padding: "0 0 32px",
              flexShrink: 0,
            }}
          >
            {/* Circles */}
            <div style={{ position: "absolute", top: -30, right: -20, width: 160, height: 160, borderRadius: "50%", backgroundColor: "rgba(41,141,255,0.2)" }} />
            <div style={{ position: "absolute", top: 60, left: -30, width: 100, height: 100, borderRadius: "50%", backgroundColor: "rgba(255,137,41,0.15)" }} />

            {/* Logo */}
            <div style={{ position: "relative", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-macost-with-text.svg"
                alt="Macost"
                style={{ height: 44, width: "auto", display: "block", margin: "0 auto 8px" }}
              />
              <p style={{ fontSize: 13, color: "rgba(180,210,255,0.8)", margin: "4px 0 0" }}>
                 Yuk Kendalikan Arus Keuanganmu Sekarang!
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div style={{ flex: 1, padding: "28px 20px 32px" }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1E1E1E",
                margin: "0 0 6px",
                fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
              }}
            >
              Selamat Datang!
            </h2>
            <p style={{ fontSize: 14, color: "#717182", margin: "0 0 28px" }}>
              Masuk ke akun Macost kamu
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

              {/* Email */}
              <div style={{ marginBottom: 16 }}>
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
                      setAuthError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "13px 14px 13px 42px",
                      borderRadius: 14,
                      border: `1.5px solid ${errors.email ? "#EF4444" : "#E0E0E0"}`,
                      backgroundColor: errors.email ? "#FEF2F2" : "white",
                      fontSize: 15,
                      color: "#1E1E1E",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "var(--font-inter), sans-serif",
                      transition: "border-color 0.2s",
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{ fontSize: 12, color: "#EF4444", margin: "5px 0 0", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                    <AlertTriangle size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
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
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                      setAuthError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "13px 44px 13px 42px",
                      borderRadius: 14,
                      border: `1.5px solid ${errors.password ? "#EF4444" : "#E0E0E0"}`,
                      backgroundColor: errors.password ? "#FEF2F2" : "white",
                      fontSize: 15,
                      color: "#1E1E1E",
                      outline: "none",
                      boxSizing: "border-box",
                      fontFamily: "var(--font-inter), sans-serif",
                      transition: "border-color 0.2s",
                    }}
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
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: 28 }}>
                <button
                  type="button"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#298DFF", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Lupa Password?
                </button>
              </div>

              {/* Login Button */}
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
                  letterSpacing: "0.01em",
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
                    Masuk...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 14, color: "#717182" }}>
              Belum punya akun?{" "}
              <Link
                href="/register"
                style={{ color: "#298DFF", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-inter), sans-serif" }}
              >
                Daftar Sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
