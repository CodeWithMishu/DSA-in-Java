"use client";

import { useEffect, useMemo, useState } from "react";
import db from "../data/problems.json";

const ADMIN_USER = "codewithmishu";
const ADMIN_PASSWORD = "Mishu@2005";
const AUTH_KEY = "dsa_next_admin_auth";

// Git-backed progress storage functions
async function loadProgressFromGit() {
  try {
    const res = await fetch("/api/progress", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    
    const { completedProblems, completionLog } = data.progress;
    return { completedProblems, completionLog };
  } catch (err) {
    console.warn("Failed to load progress from git:", err);
    return null;
  }
}

async function saveProgressToGit(completedProblems, completionLog) {
  try {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedProblems, completionLog })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Failed to save progress to git:", err);
    return null;
  }
}

function convertGitProgressToState(gitProgress, state) {
  if (!gitProgress) return state;
  
  const { completedProblems, completionLog } = gitProgress;
  const progress = { ...state.progress };
  
  // Mark problems as done if they're in completedProblems array
  for (const problemId of completedProblems) {
    if (progress[problemId]) {
      progress[problemId] = {
        ...progress[problemId],
        status: "done",
        completedAt: progress[problemId].completedAt || new Date().toISOString()
      };
    }
  }
  
  return {
    ...state,
    progress,
    completionLog
  };
}

function convertStateToGitProgress(state) {
  const completedProblems = Object.entries(state.progress)
    .filter(([_, item]) => item.status === "done")
    .map(([id, _]) => id);
  
  return {
    completedProblems,
    completionLog: state.completionLog
  };
}

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
      completedAt: null
    };
  }
  return out;
}

function normalizeState(raw) {
  const base = {
    progress: defaultProgress(),
    resources: {},
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
          completedAt: item.completedAt || null
        };
      }
    }
  }

  return {
    progress,
    resources: raw.resources || {},
    completionLog: Array.isArray(raw.completionLog) ? raw.completionLog : [],
    selectedProblemId: raw.selectedProblemId || base.selectedProblemId
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
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [state, setState] = useState(() => normalizeState(null));
  const [readmeText, setReadmeText] = useState("");
  const [noteContent, setNoteContent] = useState("No note file loaded.");
  const [codeContent, setCodeContent] = useState("No solution file loaded.");
  const [notePathInput, setNotePathInput] = useState("");
  const [codePathInput, setCodePathInput] = useState("");

  const [difficulty, setDifficulty] = useState("");
  const [iteration, setIteration] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem(AUTH_KEY) === "1";
    setIsAdmin(auth);

    // Load progress from git-backed storage
    const load = async () => {
      const gitProgress = await loadProgressFromGit();
      const base = normalizeState(null);
      if (gitProgress) {
        setState(convertGitProgressToState(gitProgress, base));
      } else {
        setState(base);
      }
      setReady(true);
    };

    load();
  }, []);

  // Auto-save progress to git whenever state changes
  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => {
      const gitProgress = convertStateToGitProgress(state);
      saveProgressToGit(gitProgress.completedProblems, gitProgress.completionLog);
    }, 1000); // Debounce: save after 1 second of inactivity
    
    return () => clearTimeout(timeout);
  }, [state, ready]);

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

  const readmeSnippet = useMemo(() => {
    if (!selected) return "";
    return extractReadmeSnippet(readmeText, selected.title);
  }, [readmeText, selected]);

  useEffect(() => {
    if (!selected) return;
    const map = state.resources[selected.id] || {};
    setNotePathInput(map.notePath || "");
    setCodePathInput(map.codePath || "");

    const load = async () => {
      const linked = extractLinkedFiles(readmeSnippet);
      const slug = slugify(selected.title);
      const pascal = pascalCase(selected.title);

      const noteCandidates = [
        map.notePath,
        ...linked.filter((p) => /\.md$/i.test(p)),
        `notes/${pascal}.md`,
        `notes/${slug}.md`,
        `${pascal}.md`,
        `${slug}.md`
      ].filter(Boolean);

      const codeCandidates = [
        map.codePath,
        ...linked.filter((p) => /\.(java|txt)$/i.test(p)),
        `${pascal}.java`,
        `solutions/${pascal}.java`,
        `src/${pascal}.java`,
        `${slug}.java`
      ].filter(Boolean);

      let noteLoaded = false;
      for (const p of noteCandidates) {
        const data = await fetchApi(`/api/file?path=${encodeURIComponent(p)}`);
        if (data?.ok) {
          setNoteContent(`Path: ${p}\n\n${data.content}`);
          noteLoaded = true;
          break;
        }
      }
      if (!noteLoaded) {
        setNoteContent("No note file found automatically. Add path and click Save Paths.");
      }

      let codeLoaded = false;
      for (const p of codeCandidates) {
        const data = await fetchApi(`/api/file?path=${encodeURIComponent(p)}`);
        if (data?.ok) {
          setCodeContent(`Path: ${p}\n\n${data.content}`);
          codeLoaded = true;
          break;
        }
      }
      if (!codeLoaded) {
        setCodeContent("No solution file found automatically. Add path and click Save Paths.");
      }
    };

    load();
  }, [selected?.id, readmeSnippet]);

  const onLogin = () => {
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setIsAdmin(true);
      setShowLogin(false);
      setLoginError("");
      setLoginUser("");
      setLoginPass("");
      return;
    }
    setLoginError("Invalid username or password.");
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAdmin(false);
  };

  const setProblemStatus = (problemId, nextStatus) => {
    if (!isAdmin) {
      setShowLogin(true);
      return;
    }

    setState((prev) => {
      const current = statusOf(prev.progress, problemId);
      const updated = { ...prev.progress };
      const nowIso = new Date().toISOString();
      const old = updated[problemId] || { status: "not-started", updatedAt: null, completedAt: null };
      updated[problemId] = {
        ...old,
        status: nextStatus,
        updatedAt: nowIso,
        completedAt: nextStatus === "done" && current !== "done" ? nowIso : old.completedAt
      };
      const log = [...prev.completionLog];
      if (nextStatus === "done" && current !== "done") log.push(nowIso);

      return { ...prev, progress: updated, completionLog: log };
    });
  };

  const savePaths = () => {
    if (!isAdmin) {
      setShowLogin(true);
      return;
    }
    if (!selected) return;
    setState((prev) => ({
      ...prev,
      resources: {
        ...prev.resources,
        [selected.id]: { notePath: notePathInput.trim(), codePath: codePathInput.trim() }
      }
    }));
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
    if (!isAdmin) {
      setShowLogin(true);
      return;
    }
    if (!confirm("Reset all progress?")) return;
    setState((prev) => ({
      ...prev,
      progress: defaultProgress(),
      completionLog: []
    }));
  };

  if (!ready) return (
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
          <p className="loaderSubtext">Powered by Next.js • Git-backed Progress</p>
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
            JSON database powered tracker, optimized for Vercel deployment. No paid service required.
          </p>
          <div className="chips">
            <span>DB: data/problems.json</span>
            <span>Total: {stats.total}</span>
            <span>Easy/Medium/Hard: 38/131/38</span>
            <span>Admin lock enabled</span>
          </div>
        </div>
        <div className="adminBox">
          <div className="status">{isAdmin ? "Unlocked (Admin)" : "Locked (Viewer)"}</div>
          <div className="row">
            <button className="btn" onClick={() => setShowLogin(true)}>{isAdmin ? "Re-Login" : "Admin Login"}</button>
            <button className="btn ghost" onClick={logout} disabled={!isAdmin}>Logout</button>
            <button className="btn ghost" onClick={exportJson}>Export JSON</button>
            <label className="btn ghost fileBtn">
              Import JSON
              <input type="file" accept="application/json" onChange={importJson} />
            </label>
            <button className="btn danger" onClick={resetAll} disabled={!isAdmin}>Reset</button>
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
          <h3>Problem Detail</h3>
          <h4>{selected ? `#${selected.id} ${selected.title}` : "Select problem"}</h4>
          <div className="detailMeta">{selected?.topic} | {selected?.platform} | <a href={selected?.url} target="_blank">Open Link</a></div>

          <section>
            <h5>Algorithm / Notes from README.md</h5>
            <pre>{readmeSnippet}</pre>
          </section>

          <section>
            <h5>Detailed Notes File</h5>
            <pre>{noteContent}</pre>
          </section>

          <section>
            <h5>Solution File</h5>
            <pre>{codeContent}</pre>
          </section>

          <section>
            <h5>Map Files (Admin)</h5>
            <input value={notePathInput} onChange={(e) => setNotePathInput(e.target.value)} placeholder="notes/FastPower.md" />
            <input value={codePathInput} onChange={(e) => setCodePathInput(e.target.value)} placeholder="FastPower.java" />
            <button className="btn ghost" onClick={savePaths} disabled={!isAdmin}>Save Paths</button>
          </section>
        </aside>
      </section>

      {showLogin && (
        <div className="overlay" onClick={() => setShowLogin(false)}>
          <div className="login card" onClick={(e) => e.stopPropagation()}>
            <h3>Admin Login</h3>
            <input placeholder="username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
            <input placeholder="password" type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
            <div className="error">{loginError}</div>
            <div className="row">
              <button className="btn" onClick={onLogin}>Login</button>
              <button className="btn ghost" onClick={() => setShowLogin(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
