import { promises as fs } from "fs";
import path from "path";

const ALLOWED = new Set([".md", ".java", ".txt"]);

function isSafeRelativePath(value) {
  if (!value || typeof value !== "string") return false;
  if (value.includes("..")) return false;
  if (path.isAbsolute(value)) return false;
  return true;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = (searchParams.get("path") || "").trim();

    if (!isSafeRelativePath(raw)) {
      return Response.json({ ok: false, message: "Invalid path" }, { status: 400 });
    }

    const extension = path.extname(raw).toLowerCase();
    if (!ALLOWED.has(extension)) {
      return Response.json({ ok: false, message: "Unsupported file type" }, { status: 400 });
    }

    const normalized = path.normalize(raw);
    const root = /* turbopackIgnore: true */ process.cwd();
    const absolute = path.join(root, normalized);

    if (!absolute.startsWith(root)) {
      return Response.json({ ok: false, message: "Path traversal blocked" }, { status: 400 });
    }

    const content = await fs.readFile(absolute, "utf8");
    return Response.json({ ok: true, path: normalized, content });
  } catch (error) {
    return Response.json({ ok: false, message: "File not found" }, { status: 404 });
  }
}
