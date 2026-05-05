"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    const redirect = async () => {
      const code =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("code")
          : null;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, "", "/");
        if (!error) {
          window.location.replace("/dashboard");
          return;
        }
      }

      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        window.history.replaceState(null, "", "/");
        if (session) {
          window.location.replace("/dashboard");
          return;
        }
      }

      if (!loading) {
        if (user) {
          router.replace("/dashboard");
        } else {
          router.replace("/auth");
        }
      }
    };

    redirect();
  }, [user, loading, router]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", color: "#eef3ff" }}>
        <h1>DSA Command Center</h1>
        <p>Redirecting...</p>
      </div>
    </main>
  );
}
