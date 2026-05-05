"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user || null);

        // Get user profile if logged in
        if (session?.user) {
          const { data } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(data);
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (session?.user) {
        setTimeout(async () => {
          const { data, error } = await supabase
            .from("users")
            .upsert(
              {
                id: session.user.id,
                email: session.user.email,
                username: session.user.user_metadata?.username || null,
                full_name: session.user.user_metadata?.full_name || null,
                avatar_url: session.user.user_metadata?.avatar_url || null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            )
            .select()
            .single();

          if (!error && data) setProfile(data);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
