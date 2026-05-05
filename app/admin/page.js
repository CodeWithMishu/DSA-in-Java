"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import db from "../../data/problems.json";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

const emptyContent = {
  official_notes: "",
  official_solution_code: "",
  official_solution_language: "java",
  review_status: "published",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [selectedProblemId, setSelectedProblemId] = useState(String(db.problems[0]?.id || ""));
  const [content, setContent] = useState(emptyContent);
  const [announcement, setAnnouncement] = useState({ title: "", body: "", is_active: true });
  const [analytics, setAnalytics] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [message, setMessage] = useState("");

  const isAdmin = profile?.role === "admin";
  const selectedProblem = useMemo(
    () => db.problems.find((problem) => String(problem.id) === selectedProblemId),
    [selectedProblemId]
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/auth");
  }, [loading, router, user]);

  useEffect(() => {
    if (!isAdmin || !selectedProblemId) return;

    const loadAdminData = async () => {
      const [{ data: contentRows }, { data: analyticsRows }, { data: auditRows }] = await Promise.all([
        supabase
          .from("official_problem_content")
          .select("*")
          .eq("problem_id", selectedProblemId)
          .maybeSingle(),
        supabase.from("admin_user_analytics").select("*").limit(50),
        supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      setContent(contentRows || emptyContent);
      setAnalytics(Array.isArray(analyticsRows) ? analyticsRows : []);
      setAuditLog(Array.isArray(auditRows) ? auditRows : []);
    };

    loadAdminData();
  }, [isAdmin, selectedProblemId]);

  const writeAudit = async (action, targetType, targetId, metadata = {}) => {
    await supabase.from("admin_audit_log").insert({
      actor_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata,
    });
  };

  const saveOfficialContent = async () => {
    const payload = {
      problem_id: selectedProblemId,
      ...content,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("official_problem_content")
      .upsert(payload, { onConflict: "problem_id" });

    if (!error) await writeAudit("upsert", "official_problem_content", selectedProblemId);
    setMessage(error ? error.message : "Official content saved.");
  };

  const publishAnnouncement = async () => {
    const { error } = await supabase.from("admin_announcements").insert({
      ...announcement,
      created_by: user.id,
    });

    if (!error) {
      await writeAudit("create", "admin_announcement", announcement.title);
      setAnnouncement({ title: "", body: "", is_active: true });
    }
    setMessage(error ? error.message : "Announcement published.");
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = text.split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
      const [problem_id, official_notes, official_solution_code, official_solution_language = "java"] = line.split(",");
      return {
        problem_id: problem_id?.trim(),
        official_notes: official_notes?.trim() || "",
        official_solution_code: official_solution_code?.trim() || "",
        official_solution_language: official_solution_language?.trim() || "java",
        review_status: "published",
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      };
    }).filter((row) => row.problem_id);

    const { error } = await supabase.from("official_problem_content").upsert(rows, { onConflict: "problem_id" });
    if (!error) await writeAudit("csv_import", "official_problem_content", "bulk", { rows: rows.length });
    setMessage(error ? error.message : `Imported ${rows.length} rows.`);
    event.target.value = "";
  };

  if (loading) {
    return <main className="page"><section className="card adminShell">Loading admin workspace...</section></main>;
  }

  if (!isAdmin) {
    return (
      <main className="page">
        <section className="card adminShell">
          <h1>Admin Workspace</h1>
          <p>This area is available only to users with the admin role.</p>
          <button className="btn ghost" onClick={() => router.replace("/dashboard")}>Back to dashboard</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card adminShell">
        <div>
          <h1>Admin Workspace</h1>
          <p>Manage official content, announcements, users, imports, and audit activity.</p>
        </div>
        <button className="btn ghost" onClick={() => router.replace("/dashboard")}>Dashboard</button>
      </section>

      <section className="adminGrid">
        <article className="card adminPanel">
          <h3>Problem Content</h3>
          <select value={selectedProblemId} onChange={(event) => setSelectedProblemId(event.target.value)}>
            {db.problems.map((problem) => (
              <option key={problem.id} value={String(problem.id)}>
                #{problem.id} {problem.title}
              </option>
            ))}
          </select>
          <p>{selectedProblem?.topic} | {selectedProblem?.platform}</p>
          <textarea
            value={content.official_notes || ""}
            onChange={(event) => setContent((prev) => ({ ...prev, official_notes: event.target.value }))}
            placeholder="Official notes"
          />
          <textarea
            className="codeEditor"
            value={content.official_solution_code || ""}
            onChange={(event) => setContent((prev) => ({ ...prev, official_solution_code: event.target.value }))}
            placeholder="Official solution code"
          />
          <div className="row">
            <select
              value={content.official_solution_language || "java"}
              onChange={(event) => setContent((prev) => ({ ...prev, official_solution_language: event.target.value }))}
            >
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button className="btn" onClick={saveOfficialContent}>Save Content</button>
          </div>
        </article>

        <article className="card adminPanel">
          <h3>Announcement</h3>
          <input
            value={announcement.title}
            onChange={(event) => setAnnouncement((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Title"
          />
          <textarea
            value={announcement.body}
            onChange={(event) => setAnnouncement((prev) => ({ ...prev, body: event.target.value }))}
            placeholder="Message"
          />
          <label className="toggleRow">
            <input
              type="checkbox"
              checked={announcement.is_active}
              onChange={(event) => setAnnouncement((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            <span>Active</span>
          </label>
          <button className="btn" onClick={publishAnnouncement}>Publish</button>
        </article>

        <article className="card adminPanel">
          <h3>CSV Import</h3>
          <p>Columns: problem_id, official_notes, official_solution_code, language</p>
          <label className="btn ghost fileBtn">
            Import CSV
            <input type="file" accept=".csv,text/csv" onChange={importCsv} />
          </label>
          {message && <p className="adminMessage">{message}</p>}
        </article>
      </section>

      <section className="adminGrid two">
        <article className="card adminPanel">
          <h3>User Analytics</h3>
          <div className="adminTable">
            {analytics.map((row) => (
              <div key={row.id}>
                <span>{row.email}</span>
                <strong>{row.solved} solved</strong>
                <small>{row.role}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="card adminPanel">
          <h3>Audit Log</h3>
          <div className="adminTable">
            {auditLog.map((row) => (
              <div key={row.id}>
                <span>{row.action}</span>
                <strong>{row.target_type}</strong>
                <small>{new Date(row.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
