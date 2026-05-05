"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import "../../auth.css";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Finishing sign in...");

  useEffect(() => {
    let cancelled = false;

    const goToDashboard = () => {
      window.history.replaceState(null, "", "/auth/callback");
      window.location.replace("/dashboard");
    };

    const goToAuth = (error) => {
      window.location.replace(`/auth?error=${encodeURIComponent(error)}`);
    };

    const finishSignIn = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const error = searchParams.get("error") || searchParams.get("error_description");
      if (error) {
        goToAuth(error);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          goToAuth(exchangeError.message);
          return;
        }
      } else {
        await supabase.auth.getSession();
      }

      if (!cancelled) {
        setMessage("Opening your dashboard...");
        goToDashboard();
      }
    };

    finishSignIn();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="authPage">
      <div className="authLoader">{message}</div>
    </main>
  );
}
