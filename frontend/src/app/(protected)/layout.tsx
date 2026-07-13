"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import LoadingState from "@/components/loading-state";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <LoadingState />
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">{children}</main>
    </>
  );
}
