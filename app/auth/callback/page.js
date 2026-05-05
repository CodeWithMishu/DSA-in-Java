"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import "../../auth.css";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing sign in...");

  useEffect(() => {
    const finishSignIn = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const error = searchParams.get("error") || searchParams.get("error_description");
      if (error) {
        router.replace(`/auth?error=${encodeURIComponent(error)}`);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          router.replace(`/auth?error=${encodeURIComponent(exchangeError.message)}`);
          return;
        }
      } else {
        await supabase.auth.getSession();
      }

      window.history.replaceState(null, "", "/auth/callback");
      setMessage("Opening your dashboard...");
      router.replace("/dashboard");
    };

    finishSignIn();
  }, [router]);

  return (
    <main className="authPage">
      <div className="authLoader">{message}</div>
    </main>
  );
}
