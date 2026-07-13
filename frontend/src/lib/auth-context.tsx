"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nama: string, email: string, password: string) => Promise<{ emailConfirmationRequired: boolean }>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "macost_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reading localStorage must be deferred to an effect (not a lazy useState
    // initializer) so the client's first render matches the server's SSR
    // output and avoids a hydration mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: User; token: string };
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function persist(nextUser: User, nextToken: string) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  // The register/login response is cached to localStorage and never
  // refetched, so a successful profile edit (e.g. changing nama) needs this
  // to update both in-memory state and the cache — otherwise the old name
  // keeps showing on Home/Profile/Navbar until the next login.
  function updateUser(patch: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next, token }));
      return next;
    });
  }

  async function login(email: string, password: string) {
    const res = await api.login({ email, password });
    if (!res.access_token) throw new Error("Login gagal");
    persist(res.user, res.access_token);
  }

  async function register(nama: string, email: string, password: string) {
    const res = await api.register({ nama, email, password });
    if (res.access_token) {
      persist(res.user, res.access_token);
    }
    return { emailConfirmationRequired: !res.access_token };
  }

  async function logout() {
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // token might already be expired; clear session locally regardless
      }
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
