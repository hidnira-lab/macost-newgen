"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, Wallet, SlidersHorizontal, Bell, Clock, LogOut, Pencil, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import BottomNav from "@/components/bottom-nav";
import type { Dompet, Goal, Transaksi } from "@/types";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(
    value
  );
}

type MenuItem = {
  Icon: typeof History;
  label: string;
  desc: string;
  color: string;
  href?: string;
};

// Saran Tertunda / Notifikasi have no backing endpoint yet (no persisted
// "pending suggestion" list) — shown as inert "Segera" entries instead of
// faking a working screen for them. Kelola Dompet and Prioritas Goal moved
// to real links once their backends shipped.
const SEGERA_ITEMS: MenuItem[] = [
  { Icon: Clock, label: "Saran Tertunda", desc: "Fitur akan datang", color: "#F59E0B" },
  { Icon: Bell, label: "Notifikasi", desc: "Pengingat tabungan & tagihan", color: "#A855F7" },
];

export default function ProfilePage() {
  const { token, user, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [wallets, setWallets] = useState<Dompet[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      if (!token) return;
      setLoading(true);
      try {
        const [txns, gls, dash, wlts] = await Promise.all([
          api.transactions.list(token),
          api.goals.list(token),
          api.dashboard.summary(token),
          api.wallets.list(token),
        ]);
        setTransactions(txns);
        setGoals(gls);
        setBalance(dash.total_saldo);
        setWallets(wlts);
      } catch {
        // non-fatal: profile hero/menu still renders without stats
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [token]);

  const displayName = user?.nama || user?.email || "";
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : "?";

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
            <div style={{ paddingBottom: 32 }}>
              {/* Profile hero */}
              <div
                style={{
                  padding: "28px 24px 24px",
                  background: "linear-gradient(145deg, #072548 0%, #0F3870 60%, #1858A0 100%)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", backgroundColor: "rgba(41,141,255,0.15)" }} />
                <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: "50%", backgroundColor: "rgba(255,137,41,0.12)" }} />

                <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #298DFF, #FF8929)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 900,
                      fontSize: 28,
                      boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                      border: "3px solid rgba(255,255,255,0.3)",
                      fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                      flexShrink: 0,
                    }}
                  >
                    {avatarInitial}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "white",
                        margin: "0 0 3px",
                        fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {displayName}
                    </h2>
                    <p style={{ fontSize: 13, color: "rgba(180,210,255,0.85)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user?.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled
                    title="Segera hadir"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      border: "none",
                      cursor: "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      opacity: 0.6,
                    }}
                  >
                    <Pencil size={16} color="white" />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "flex",
                  margin: "0 16px",
                  marginTop: -20,
                  backgroundColor: "white",
                  borderRadius: 18,
                  boxShadow: "0 4px 20px rgba(7,37,72,0.12)",
                  overflow: "hidden",
                  position: "relative",
                  zIndex: 2,
                  border: "1px solid rgba(0,0,0,0.04)",
                }}
              >
                {[
                  { label: "Saldo", value: formatRupiah(balance), color: "#1E1E1E" },
                  { label: "Transaksi", value: `${transactions.length}`, color: "#298DFF" },
                  { label: "Target Aktif", value: `${goals.length}`, color: "#FF8929" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      flex: 1,
                      padding: "14px 8px",
                      textAlign: "center",
                      borderLeft: i > 0 ? "1px solid #F0F0F0" : "none",
                    }}
                  >
                    <p style={{ fontSize: 16, fontWeight: 800, color: stat.color, margin: "0 0 3px", fontFamily: "var(--font-plus-jakarta-sans), sans-serif", lineHeight: 1.1 }}>
                      {loading ? "…" : stat.value}
                    </p>
                    <p style={{ fontSize: 11, color: "#A0A0A8", margin: 0, fontWeight: 500 }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Menu section */}
              <div style={{ padding: "20px 16px 0" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#A0A0A8", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Menu Utama
                </p>
                <div style={{ backgroundColor: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <Link
                    href="/transactions"
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      textAlign: "left",
                      fontFamily: "var(--font-inter), sans-serif",
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        flexShrink: 0,
                        backgroundColor: "#298DFF15",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#298DFF",
                      }}
                    >
                      <History size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E", margin: "0 0 2px" }}>Riwayat Transaksi</p>
                      <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>
                        {loading ? "…" : `${transactions.length} transaksi tercatat`}
                      </p>
                    </div>
                    <ChevronRight size={18} color="#C0C0C8" />
                  </Link>

                  <Link
                    href="/wallets"
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      border: "none",
                      borderTop: "1px solid #F4F4F4",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      textAlign: "left",
                      fontFamily: "var(--font-inter), sans-serif",
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        flexShrink: 0,
                        backgroundColor: "#22C55E15",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#22C55E",
                      }}
                    >
                      <Wallet size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E", margin: "0 0 2px" }}>Kelola Dompet</p>
                      <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>
                        {loading ? "…" : `${wallets.length} dompet terhubung`}
                      </p>
                    </div>
                    <ChevronRight size={18} color="#C0C0C8" />
                  </Link>

                  <Link
                    href="/goal-priority"
                    style={{
                      width: "100%",
                      padding: "16px 18px",
                      border: "none",
                      borderTop: "1px solid #F4F4F4",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      textAlign: "left",
                      fontFamily: "var(--font-inter), sans-serif",
                      textDecoration: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        flexShrink: 0,
                        backgroundColor: "#FF892915",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FF8929",
                      }}
                    >
                      <SlidersHorizontal size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E", margin: "0 0 2px" }}>Prioritas Goal</p>
                      <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>Atur bobot SAW & strategi</p>
                    </div>
                    <ChevronRight size={18} color="#C0C0C8" />
                  </Link>

                  {SEGERA_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      disabled
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        border: "none",
                        borderTop: "1px solid #F4F4F4",
                        backgroundColor: "transparent",
                        cursor: "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        textAlign: "left",
                        fontFamily: "var(--font-inter), sans-serif",
                        opacity: 0.75,
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          flexShrink: 0,
                          backgroundColor: `${item.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: item.color,
                        }}
                      >
                        <item.Icon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1E1E1E", margin: "0 0 2px" }}>{item.label}</p>
                        <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>{item.desc}</p>
                      </div>
                      <span
                        style={{
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: "#F4F4F4",
                          color: "#A0A0A8",
                          flexShrink: 0,
                        }}
                      >
                        Segera
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* App info */}
              <div style={{ padding: "16px 16px 0" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#A0A0A8", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Tentang Aplikasi
                </p>
                <div style={{ backgroundColor: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src="/logo-macost-icon.svg" alt="Macost" width={36} height={36} style={{ borderRadius: 10, display: "block", flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#1E1E1E", margin: 0 }}>Macost</p>
                        <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0 }}>Versi 1.0.0 · Beta</p>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#A0A0A8", margin: 0, lineHeight: 1.6 }}>
                    Pocket Management Information System untuk mahasiswa Indonesia. Kelola uang saku, side income,
                    dan goals tabunganmu dengan cerdas.
                  </p>
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding: "16px 16px 0" }}>
                <button
                  type="button"
                  onClick={() => logout()}
                  style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: 16,
                    border: "1.5px solid rgba(239,68,68,0.25)",
                    backgroundColor: "#FEF2F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    color: "#DC2626",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  <LogOut size={18} />
                  Keluar dari Akun
                </button>
              </div>
            </div>
          </div>

          <BottomNav />
        </div>
      </div>
    </div>
  );
}
