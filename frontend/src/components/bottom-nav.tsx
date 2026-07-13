"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, Target, Sparkles, User } from "lucide-react";

const navItems = [
  { href: "/home", label: "Home", Icon: Home },
  { href: "/dashboard", label: "Dashboard", Icon: BarChart2 },
  { href: "/goals", label: "Goals", Icon: Target },
  { href: "/insights", label: "AI", Icon: Sparkles },
  { href: "/profile", label: "Profil", Icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "8px 4px 16px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}
    >
      {navItems.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 4px",
              color: isActive ? "#298DFF" : "#A0A0A8",
              transition: "color 0.2s",
              fontFamily: "var(--font-inter), sans-serif",
              position: "relative",
              textDecoration: "none",
            }}
          >
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: -9,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 32,
                  height: 3,
                  borderRadius: "0 0 4px 4px",
                  backgroundColor: "#298DFF",
                }}
              />
            )}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive ? "rgba(41,141,255,0.1)" : "transparent",
                transition: "background-color 0.2s",
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 700 : 400,
                letterSpacing: isActive ? "0.01em" : 0,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
