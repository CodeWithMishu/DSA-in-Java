"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import db from "../../data/problems.json";
import {
  getCompletionLog,
  getLeaderboard,
  getUserProgress,
  logCompletion,
  saveProblemWorkspace,
  signOut,
  supabase,
  updateUserProfile,
} from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

function toDayKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultProgress() {
  const out = {};
  for (const p of db.problems) {
    out[p.id] = {
      status: "not-started",
      updatedAt: null,
      completedAt: null,
      notes: "",
      solutionCode: "",
      solutionLanguage: "java",
      bookmarked: false,
      mistakeJournal: "",
      reviewIntervalDays: null,
      reviseAt: null,
      attemptCount: 0
    };
  }
  return out;
}

function normalizeState(raw) {
  const base = {
    progress: defaultProgress(),
    completionLog: [],
    selectedProblemId: db.problems[0]?.id || null
  };
  if (!raw || typeof raw !== "object") return base;

  const progress = { ...base.progress };
  if (raw.progress && typeof raw.progress === "object") {
    for (const p of db.problems) {
      const item = raw.progress[p.id];
      if (typeof item === "string") {
        progress[p.id] = {
          status: item,
          updatedAt: null,
          completedAt: item === "done" ? new Date().toISOString() : null
        };
      } else if (item && typeof item === "object") {
        progress[p.id] = {
          status: item.status || "not-started",
          updatedAt: item.updatedAt || null,
          completedAt: item.completedAt || null,
          notes: item.notes || "",
          solutionCode: item.solutionCode || "",
          solutionLanguage: item.solutionLanguage || "java",
          bookmarked: Boolean(item.bookmarked),
          mistakeJournal: item.mistakeJournal || "",
          reviewIntervalDays: item.reviewIntervalDays || null,
          reviseAt: item.reviseAt || null,
          attemptCount: item.attemptCount || 0
        };
      }
    }
  }

  return {
    progress,
    completionLog: Array.isArray(raw.completionLog) ? raw.completionLog : [],
    selectedProblemId: raw.selectedProblemId || base.selectedProblemId
  };
}

function rowToProgress(row) {
  return {
    status: row.status || "not-started",
    updatedAt: row.updated_at || null,
    completedAt: row.completed_at || null,
    notes: row.notes || "",
    solutionCode: row.solution_code || "",
    solutionLanguage: row.solution_language || "java",
    bookmarked: Boolean(row.bookmarked),
    mistakeJournal: row.mistake_journal || "",
    reviewIntervalDays: row.review_interval_days || null,
    reviseAt: row.revise_at || null,
    attemptCount: row.attempt_count || 0
  };
}

function progressToSupabase(item) {
  return {
    status: item.status,
    notes: item.notes || "",
    solution_code: item.solutionCode || "",
    solution_language: item.solutionLanguage || "java",
    bookmarked: Boolean(item.bookmarked),
    mistake_journal: item.mistakeJournal || "",
    review_interval_days: item.reviewIntervalDays || null,
    revise_at: item.reviseAt || null,
    attempt_count: item.attemptCount || 0,
    completed_at: item.completedAt || null
  };
}

function statusOf(progress, id) {
  return progress[id]?.status || "not-started";
}

function pct(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function titleKey(s) {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function extractReadmeSnippet(readmeText, title) {
  if (!readmeText) {
    return "README.md is not loaded yet.";
  }

  const lines = readmeText.split(/\r?\n/);
  const target = titleKey(title);
  const parts = target.split(" ").filter((x) => x.length > 3);

  let index = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const row = titleKey(lines[i]);
    if (!row) continue;
    if (row.includes(target)) {
      index = i;
      break;
    }
    let hit = 0;
    for (const part of parts.slice(0, 5)) {
      if (row.includes(part)) hit += 1;
    }
    if (hit >= 3) {
      index = i;
      break;
    }
  }

  if (index === -1) {
    return "No direct matching section found in README yet. Add your notes for this problem and it will show here automatically.";
  }

  let start = index;
  while (start > 0 && !/^#{2,4}\s+/.test(lines[start])) {
    start -= 1;
  }
  let end = index + 1;
  while (end < lines.length && !(end > start && /^#{2,4}\s+/.test(lines[end]))) {
    end += 1;
  }

  return lines.slice(start, Math.min(end, start + 80)).join("\n").trim();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function pascalCase(text) {
  return text
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((t) => t[0].toUpperCase() + t.slice(1).toLowerCase())
    .join("");
}

function extractLinkedFiles(snippet) {
  const out = [];
  const re = /\[[^\]]+\]\(([^)]+)\)/g;
  let m = re.exec(snippet);
  while (m) {
    out.push(m[1]);
    m = re.exec(snippet);
  }
  return out;
}

async function fetchApi(url) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

export default function Page() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);

  const [state, setState] = useState(() => normalizeState(null));
  const [readmeText, setReadmeText] = useState("");
  const [noteContent, setNoteContent] = useState("No note file loaded.");
  const [codeContent, setCodeContent] = useState("No solution file loaded.");
  const [leaderboard, setLeaderboard] = useState([]);
  const [saveStatus, setSaveStatus] = useState("");
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);

  const [difficulty, setDifficulty] = useState("");
  const [iteration, setIteration] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }

    const load = async () => {
      const base = normalizeState(null);
      const [{ data: progressRows }, { data: logRows }, { data: leaderboardRows }] = await Promise.all([
        getUserProgress(user.id),
        getCompletionLog(user.id),
        getLeaderboard(),
      ]);

      if (Array.isArray(progressRows)) {
        for (const row of progressRows) {
          if (base.progress[row.problem_id]) {
            base.progress[row.problem_id] = rowToProgress(row);
          }
        }
      }

      base.completionLog = Array.isArray(logRows)
        ? logRows.map((row) => row.completed_at).filter(Boolean)
        : [];

      setLeaderboard(Array.isArray(leaderboardRows) ? leaderboardRows : []);
      setLeaderboardOptIn(Boolean(profile?.opt_in_leaderboard));
      setState(base);
      setReady(true);
    };

    load();
  }, [authLoading, router, user]);

  useEffect(() => {
    setLeaderboardOptIn(Boolean(profile?.opt_in_leaderboard));
  }, [profile?.opt_in_leaderboard]);

  useEffect(() => {
    fetchApi("/api/readme").then((data) => {
      if (data?.ok) setReadmeText(data.content);
    });
  }, []);

  const selected = useMemo(
    () => db.problems.find((p) => p.id === state.selectedProblemId) || db.problems[0],
    [state.selectedProblemId]
  );

  const topics = useMemo(() => {
    const set = new Set(db.problems.map((p) => p.topic));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    return db.problems.filter((p) => {
      if (difficulty && p.difficulty !== difficulty) return false;
      if (iteration && String(p.iteration) !== iteration) return false;
      if (topic && p.topic !== topic) return false;
      if (status && statusOf(state.progress, p.id) !== status) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!`${p.title} ${p.topic} ${p.platform}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [difficulty, iteration, topic, status, search, state.progress]);

  const grouped = useMemo(() => {
    const out = { 1: [], 2: [], 3: [] };
    for (const p of filtered) out[p.iteration].push(p);
    return out;
  }, [filtered]);

  const stats = useMemo(() => {
    const total = db.problems.length;
    const done = db.problems.filter((p) => statusOf(state.progress, p.id) === "done").length;
    const inProgress = db.problems.filter((p) => statusOf(state.progress, p.id) === "in-progress").length;
    const byDiff = {
      easy: db.problems.filter((p) => p.difficulty === "easy"),
      medium: db.problems.filter((p) => p.difficulty === "medium"),
      hard: db.problems.filter((p) => p.difficulty === "hard")
    };

    const completionDates = state.completionLog
      .map((x) => new Date(x))
      .filter((d) => !Number.isNaN(d.getTime()));

    const daySet = new Set(completionDates.map(toDayKey));
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 3650; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (daySet.has(toDayKey(d))) streak += 1;
      else break;
    }

    const now = Date.now();
    const d7 = 7 * 24 * 60 * 60 * 1000;
    const d28 = 28 * 24 * 60 * 60 * 1000;
    const last7 = completionDates.filter((d) => now - d.getTime() <= d7).length;
    const velocity = (completionDates.filter((d) => now - d.getTime() <= d28).length / 4).toFixed(1);

    const byTopic = db.topicOrder.map((t) => {
      const all = db.problems.filter((p) => p.topic === t);
      const doneT = all.filter((p) => statusOf(state.progress, p.id) === "done").length;
      return { topic: t, done: doneT, total: all.length, ratio: all.length ? doneT / all.length : 0 };
    });

    return { total, done, inProgress, byDiff, streak, last7, velocity, byTopic };
  }, [state.progress, state.completionLog]);

  const profileStats = useMemo(() => {
    const strongest = [...stats.byTopic].sort((a, b) => b.ratio - a.ratio)[0];
    const weakest = [...stats.byTopic]
      .filter((t) => t.total > 0 && t.done < t.total)
      .sort((a, b) => a.ratio - b.ratio)[0];

    return {
      strongestTopic: strongest?.topic || "Not enough data",
      weakestTopic: weakest?.topic || "All caught up",
      solvedPercent: pct(stats.done, stats.total)
    };
  }, [stats]);

  const dailyQueue = useMemo(() => {
    const now = Date.now();
    const due = db.problems.filter((p) => {
      const item = state.progress[p.id];
      return item?.reviseAt && new Date(item.reviseAt).getTime() <= now;
    });
    const bookmarked = db.problems.filter((p) => state.progress[p.id]?.bookmarked);
    const weakTopic = profileStats.weakestTopic;
    const weak = db.problems.filter((p) => {
      return p.topic === weakTopic && statusOf(state.progress, p.id) !== "done";
    });
    const fresh = db.problems.filter((p) => statusOf(state.progress, p.id) === "not-started");
    const seen = new Set();

    return [...due, ...bookmarked, ...weak, ...fresh].filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    }).slice(0, 5);
  }, [profileStats.weakestTopic, state.progress]);

  const readmeSnippet = useMemo(() => {
    if (!selected) return "";
    return extractReadmeSnippet(readmeText, selected.title);
  }, [readmeText, selected]);

  const selectedProgress = selected
    ? state.progress[selected.id] || defaultProgress()[selected.id]
    : null;

  useEffect(() => {
    if (!selected) return;

    const load = async () => {
      const { data: officialContent } = await supabase
        .from("official_problem_content")
        .select("official_notes, official_solution_code")
        .eq("problem_id", String(selected.id))
        .eq("review_status", "published")
        .maybeSingle();
      const linked = extractLinkedFiles(readmeSnippet);
      const slug = slugify(selected.title);
      const pascal = pascalCase(selected.title);

      const noteCandidates = [
        ...linked.filter((p) => /\.md$/i.test(p)),
        `Notes/${pascal}.md`,
        `Notes/${slug}.md`,
        `notes/${pascal}.md`,
        `notes/${slug}.md`,
        `${pascal}.md`,
        `${slug}.md`
      ].filter(Boolean);

      const codeCandidates = [
        ...linked.filter((p) => /\.(java|txt)$/i.test(p)),
        `code/${pascal}.java`,
        `code/${slug}.java`,
        `${pascal}.java`,
        `solutions/${pascal}.java`,
        `src/${pascal}.java`,
        `${slug}.java`
      ].filter(Boolean);

      let noteLoaded = Boolean(officialContent?.official_notes);
      if (noteLoaded) setNoteContent(officialContent.official_notes);
      for (const p of noteCandidates) {
        if (noteLoaded) break;
        const data = await fetchApi(`/api/file?path=${encodeURIComponent(p)}`);
        if (data?.ok) {
          setNoteContent(data.content);
          noteLoaded = true;
          break;
        }
      }
      if (!noteLoaded) {
        setNoteContent("No detailed note has been published for this problem yet.");
      }

      let codeLoaded = Boolean(officialContent?.official_solution_code);
      if (codeLoaded) setCodeContent(officialContent.official_solution_code);
      for (const p of codeCandidates) {
        if (codeLoaded) break;
        const data = await fetchApi(`/api/file?path=${encodeURIComponent(p)}`);
        if (data?.ok) {
          setCodeContent(data.content);
          codeLoaded = true;
          break;
        }
      }
      if (!codeLoaded) {
        setCodeContent("No solution code has been published for this problem yet.");
      }
    };

    load();
  }, [selected, readmeSnippet]);

  const setProblemStatus = (problemId, nextStatus) => {
    if (!user) return;
    let itemToSave = null;

    setState((prev) => {
      const current = statusOf(prev.progress, problemId);
      const updated = { ...prev.progress };
      const nowIso = new Date().toISOString();
      const old = updated[problemId] || { status: "not-started", updatedAt: null, completedAt: null };
      const nextItem = {
        ...old,
        status: nextStatus,
        updatedAt: nowIso,
        completedAt: nextStatus === "done" && current !== "done" ? nowIso : old.completedAt,
        attemptCount: nextStatus === "in-progress" && current !== "in-progress"
          ? (old.attemptCount || 0) + 1
          : old.attemptCount || 0
      };
      updated[problemId] = nextItem;
      itemToSave = nextItem;
      const log = [...prev.completionLog];
      if (nextStatus === "done" && current !== "done") log.push(nowIso);

      return { ...prev, progress: updated, completionLog: log };
    });

    setTimeout(async () => {
      if (!itemToSave) return;
      const { error } = await saveProblemWorkspace(user.id, problemId, progressToSupabase(itemToSave));
      if (nextStatus === "done") await logCompletion(user.id, String(problemId));
      setSaveStatus(error ? "Save failed. Run the feature SQL if this is your first upgrade." : "Saved");
    }, 0);
  };

  const updateProblemWorkspace = (updates) => {
    if (!selected || !user) return;
    const problemId = selected.id;
    let itemToSave = null;

    setState((prev) => {
      const current = prev.progress[problemId] || defaultProgress()[problemId];
      const nextItem = {
        ...current,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      itemToSave = nextItem;

      return {
        ...prev,
        progress: {
          ...prev.progress,
          [problemId]: nextItem
        }
      };
    });

    window.clearTimeout(updateProblemWorkspace.timeoutId);
    updateProblemWorkspace.timeoutId = window.setTimeout(async () => {
      if (!itemToSave) return;
      const { error } = await saveProblemWorkspace(user.id, problemId, progressToSupabase(itemToSave));
      setSaveStatus(error ? "Save failed. Run the feature SQL if this is your first upgrade." : "Saved");
    }, 700);
  };

  const setReviewInterval = (days) => {
    const reviseAt = new Date();
    reviseAt.setDate(reviseAt.getDate() + days);
    updateProblemWorkspace({
      reviewIntervalDays: days,
      reviseAt: reviseAt.toISOString()
    });
  };

  const toggleLeaderboard = async () => {
    if (!user) return;
    const next = !leaderboardOptIn;
    setLeaderboardOptIn(next);
    const { error } = await updateUserProfile(user.id, { opt_in_leaderboard: next });
    setSaveStatus(error ? "Leaderboard opt-in failed. Run the feature SQL first." : "Saved");
  };

  const logout = async () => {
    await signOut();
    router.replace("/auth");
  };

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      problemsDbVersion: db.version,
      state
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dsa-state-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importJson = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const nextState = normalizeState(parsed.state || parsed);
        setState(nextState);
      } catch (_) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const resetAll = () => {
    if (!confirm("Reset all progress?")) return;
    setState((prev) => ({
      ...prev,
      progress: defaultProgress(),
      completionLog: []
    }));
  };

  if (authLoading || !ready) return (
    <main className="page loaderPage">
      <div className="loaderContainer">
        <div className="loaderGlass">
          <div className="logoSpinner">
            <svg viewBox="0 0 100 100" className="spinner">
              <defs>
                <linearGradient id="gradientSpinner" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="100%" stopColor="#ffed4e" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradientSpinner)" strokeWidth="3" strokeDasharray="282" strokeDashoffset="0" className="spinnerCircle" />
            </svg>
            <div className="loaderText">DSA Command Center</div>
          </div>
          <div className="loadingSteps">
            <div className="step"><span className="dot"></span> Initializing dashboard</div>
            <div className="step"><span className="dot"></span> Loading 207 problems</div>
            <div className="step"><span className="dot"></span> Syncing your progress</div>
            <div className="step"><span className="dot"></span> Ready!</div>
          </div>
          <div className="progressBar">
            <div className="progressFill"></div>
          </div>
          <p className="loaderSubtext">Powered by Next.js • Supabase Sync</p>
        </div>
      </div>
    </main>
  );

  return (
    <main className="page">
      <section className="hero card">
        <div>
          <h1>DSA Command Center (Next.js)</h1>
          <p>
            Personal DSA workspace with progress, notes, code, revision, and topic analytics.
          </p>
          <div className="chips">
            <span>DB: data/problems.json</span>
            <span>Total: {stats.total}</span>
            <span>Easy/Medium/Hard: 38/131/38</span>
            <span>Signed in as {user?.email || "user"}</span>
          </div>
        </div>
        <div className="accountBox">
          <div className="status">User workspace</div>
          <div className="row">
            <button className="btn ghost" onClick={exportJson}>Export JSON</button>
            <label className="btn ghost fileBtn">
              Import JSON
              <input type="file" accept="application/json" onChange={importJson} />
            </label>
            <button className="btn danger" onClick={resetAll}>Reset</button>
            {profile?.role === "admin" && (
              <button className="btn ghost" onClick={() => router.push("/admin")}>Admin</button>
            )}
            <button className="btn ghost" onClick={logout}>Logout</button>
          </div>
        </div>
      </section>

      <section className="stats">
        <article className="card stat"><h3>Total</h3><div>{stats.total}</div></article>
        <article className="card stat"><h3>Completed</h3><div>{stats.done}</div><small>{pct(stats.done, stats.total)}%</small></article>
        <article className="card stat"><h3>In Progress</h3><div>{stats.inProgress}</div></article>
        <article className="card stat"><h3>Current Streak</h3><div>{stats.streak}d</div></article>
        <article className="card stat"><h3>Last 7 Days</h3><div>{stats.last7}</div></article>
        <article className="card stat"><h3>Velocity</h3><div>{stats.velocity}/wk</div></article>
      </section>

      <section className="workspaceGrid">
        <article className="card profileCard">
          <div>
            <h3>Your Profile</h3>
            <p>{profile?.full_name || user?.email || "Learner"}</p>
          </div>
          <div className="profileStats">
            <span>{profileStats.solvedPercent}% solved</span>
            <span>Strongest: {profileStats.strongestTopic}</span>
            <span>Focus: {profileStats.weakestTopic}</span>
          </div>
          <label className="toggleRow">
            <input type="checkbox" checked={leaderboardOptIn} onChange={toggleLeaderboard} />
            <span>Show me on public leaderboard</span>
          </label>
        </article>

        <article className="card queueCard">
          <div className="sectionTitle">
            <h3>Daily Practice Queue</h3>
            <span>{dailyQueue.length} picks</span>
          </div>
          <div className="queueList">
            {dailyQueue.map((p) => (
              <button
                key={p.id}
                className="queueItem"
                onClick={() => setState((prev) => ({ ...prev, selectedProblemId: p.id }))}
              >
                <strong>#{p.id}</strong>
                <span>{p.title}</span>
                <small>{p.topic}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="card leaderboardCard">
          <div className="sectionTitle">
            <h3>Leaderboard</h3>
            <span>Opt-in</span>
          </div>
          <div className="leaderRows">
            {leaderboard.length ? leaderboard.slice(0, 5).map((row, index) => (
              <div className="leaderRow" key={row.id}>
                <span>#{index + 1}</span>
                <strong>{row.display_name}</strong>
                <small>{row.solved} solved</small>
              </div>
            )) : <p className="emptyText">No opt-in learners yet.</p>}
          </div>
        </article>
      </section>

      <section className="stats difficulty">
        {(["easy", "medium", "hard"]).map((d) => {
          const total = stats.byDiff[d].length;
          const done = stats.byDiff[d].filter((p) => statusOf(state.progress, p.id) === "done").length;
          return (
            <article key={d} className={`card stat ${d}`}>
              <h3>{d.toUpperCase()}</h3>
              <div>{total}</div>
              <small>Done {done}/{total}</small>
              <div className="bar"><span style={{ width: `${pct(done, total)}%` }} /></div>
            </article>
          );
        })}
      </section>

      <section className="card chartCard">
        <h3>Topic-wise Analytics</h3>
        <div className="topicChart">
          {stats.byTopic.map((t) => (
            <div className="topicRow" key={t.topic}>
              <div className="topicName">{t.topic}</div>
              <div className="topicBar"><span style={{ width: `${Math.round(t.ratio * 100)}%` }} /></div>
              <div className="topicVal">{t.done}/{t.total}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="layoutGrid">
        <section className="card listPanel">
          <div className="filters">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select value={iteration} onChange={(e) => setIteration(e.target.value)}>
              <option value="">All Iterations</option>
              <option value="1">Iteration 1</option>
              <option value="2">Iteration 2</option>
              <option value="3">Iteration 3</option>
            </select>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="">All Topics</option>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="not-started">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search problem" />
          </div>

          {[1, 2, 3].map((it) => {
            if (!grouped[it].length) return null;
            return (
              <div key={it}>
                <div className="iterHead">Iteration {it} ({grouped[it].length})</div>
                <div className="problemGrid">
                  {grouped[it].map((p) => {
                    const st = statusOf(state.progress, p.id);
                    return (
                      <article
                        key={p.id}
                        className={`problem ${st} ${selected?.id === p.id ? "selected" : ""}`}
                        onClick={() => setState((prev) => ({ ...prev, selectedProblemId: p.id }))}
                      >
                        <h4>#{p.id} {p.title}</h4>
                        <div className="meta">{p.topic} | {p.platform}</div>
                        <div className="actions" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setProblemStatus(p.id, "not-started")} className={st === "not-started" ? "active" : ""}>Todo</button>
                          <button onClick={() => setProblemStatus(p.id, "in-progress")} className={st === "in-progress" ? "active" : ""}>Progress</button>
                          <button onClick={() => setProblemStatus(p.id, "done")} className={st === "done" ? "active" : ""}>Done</button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <aside className="card detailPanel">
          <div className="detailHeader">
            <div>
              <h3>Problem Workspace</h3>
              <h4>{selected ? `#${selected.id} ${selected.title}` : "Select problem"}</h4>
              <div className="detailMeta">{selected?.topic} | {selected?.platform} | <a href={selected?.url} target="_blank">Open Link</a></div>
            </div>
            <button
              className={`bookmarkBtn ${selectedProgress?.bookmarked ? "active" : ""}`}
              onClick={() => updateProblemWorkspace({ bookmarked: !selectedProgress?.bookmarked })}
            >
              {selectedProgress?.bookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          </div>

          <div className="workspaceStats">
            <span>Status: {selectedProgress?.status || "not-started"}</span>
            <span>Attempts: {selectedProgress?.attemptCount || 0}</span>
            <span>{saveStatus || "Ready"}</span>
          </div>

          <section className="editorSection">
            <div className="sectionTitle">
              <h5>Personal Notes</h5>
              <span>Private</span>
            </div>
            <textarea
              value={selectedProgress?.notes || ""}
              onChange={(e) => updateProblemWorkspace({ notes: e.target.value })}
              placeholder="Write your intuition, edge cases, complexity, and recall hints here."
            />
          </section>

          <section className="editorSection">
            <div className="sectionTitle">
              <h5>Code Solution</h5>
              <select
                value={selectedProgress?.solutionLanguage || "java"}
                onChange={(e) => updateProblemWorkspace({ solutionLanguage: e.target.value })}
              >
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <textarea
              className="codeEditor"
              value={selectedProgress?.solutionCode || ""}
              onChange={(e) => updateProblemWorkspace({ solutionCode: e.target.value })}
              placeholder="Paste or write your accepted solution here."
            />
          </section>

          <section className="editorSection">
            <div className="sectionTitle">
              <h5>Mistake Journal</h5>
              <span>Review fuel</span>
            </div>
            <textarea
              value={selectedProgress?.mistakeJournal || ""}
              onChange={(e) => updateProblemWorkspace({ mistakeJournal: e.target.value })}
              placeholder="What went wrong? Missed edge case, wrong pattern, time complexity, implementation bug..."
            />
          </section>

          <section>
            <div className="sectionTitle">
              <h5>Revision Scheduler</h5>
              <span>{selectedProgress?.reviseAt ? new Date(selectedProgress.reviseAt).toLocaleDateString() : "Not scheduled"}</span>
            </div>
            <div className="revisionButtons">
              {[1, 3, 7, 21].map((days) => (
                <button key={days} className="btn ghost" onClick={() => setReviewInterval(days)}>
                  {days}d
                </button>
              ))}
            </div>
          </section>

          <section>
            <h5>Published README Notes</h5>
            <pre>{readmeSnippet}</pre>
          </section>

          <section>
            <h5>Published Detailed Notes</h5>
            <pre>{noteContent}</pre>
          </section>

          <section>
            <h5>Published Solution</h5>
            <pre>{codeContent}</pre>
          </section>

        </aside>
      </section>
    </main>
  );
}
