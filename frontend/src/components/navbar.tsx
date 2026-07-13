"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "/home", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transaksi" },
  { href: "/wallets", label: "Dompet" },
  { href: "/goals", label: "Goals" },
  { href: "/goal-priority", label: "Prioritas" },
  { href: "/pending-allocations", label: "Saran Tertunda" },
  { href: "/insights", label: "AI Insight" },
  { href: "/profile", label: "Profil" },
  { href: "/edit-profile", label: "Edit Profil" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-slate-900">Macost</span>
        <nav className="flex items-center gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900"}
            >
              {link.label}
            </Link>
          ))}
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">{user?.nama || user?.email}</span>
          <button onClick={logout} className="text-slate-500 hover:text-red-600">
            Keluar
          </button>
        </nav>
      </div>
    </header>
  );
}
