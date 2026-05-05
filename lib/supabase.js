import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function getAuthRedirectUrl() {
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return `${appUrl}/auth/callback`;
}

// Helper functions for auth
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  return { data, error };
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl(),
    },
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Helper to get user profile
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  return { data, error };
}

// Helper to update user profile
export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  return { data, error };
}

// Helper to save progress
export async function saveProgress(userId, problemId, status, updates = {}) {
  const { data, error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      problem_id: problemId,
      status,
      updated_at: new Date().toISOString(),
      ...updates,
    },
    { onConflict: "user_id,problem_id" }
  );
  return { data, error };
}

// Helper to get all progress for user
export async function getUserProgress(userId) {
  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId);
  return { data, error };
}

// Helper to log completion
export async function logCompletion(userId, problemId) {
  const { data, error } = await supabase.from("completion_log").insert({
    user_id: userId,
    problem_id: problemId,
    completed_at: new Date().toISOString(),
  });
  return { data, error };
}

// Helper to get completion log
export async function getCompletionLog(userId) {
  const { data, error } = await supabase
    .from("completion_log")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });
  return { data, error };
}
