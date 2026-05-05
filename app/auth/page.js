"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import "../auth.css";

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAuthLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setAuthLoading(false);
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setAuthLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setAuthLoading(false);
        return;
      }

      const { data, error: err } = await signUpWithEmail(email, password);
      if (err) {
        setError(err.message);
      } else {
        setSuccess("Account created! Check your email to confirm.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } else {
      const { data, error: err } = await signInWithEmail(email, password);
      if (err) {
        setError(err.message);
      } else {
        setSuccess("Logged in successfully!");
        setTimeout(() => router.push("/dashboard"), 500);
      }
    }

    setAuthLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setAuthLoading(true);
    const { data, error: err } = await signInWithGoogle();
    if (err) {
      setError(err.message);
    }
    setAuthLoading(false);
  };

  if (loading) {
    return <div className="authPage"><div className="authLoader">Loading...</div></div>;
  }

  return (
    <main className="authPage">
      <div className="authContainer">
        <div className="authCard">
          <div className="authHeader">
            <h1>DSA Command Center</h1>
            <p>Master 207 DSA problems in 3 iterations</p>
          </div>

          <form onSubmit={handleEmailAuth} className="authForm">
            <h2>{isSignUp ? "Create Account" : "Sign In"}</h2>

            <div className="formGroup">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="formGroup">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {isSignUp && (
              <div className="formGroup">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" disabled={authLoading} className="btn primary">
              {authLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>

            <div className="divider">or</div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="btn google"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <div className="authToggle">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                }}
                className="link"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>

        <div className="authInfo">
          <h3>Why create an account?</h3>
          <ul>
            <li>✓ Track your DSA progress across all devices</li>
            <li>✓ Sync completion with file mappings</li>
            <li>✓ View your study streak and velocity</li>
            <li>✓ Access your custom notes and solutions</li>
            <li>✓ Compare stats with other learners</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
