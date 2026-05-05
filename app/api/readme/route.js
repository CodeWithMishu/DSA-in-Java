import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "README.md");
    const content = await fs.readFile(filePath, "utf8");
    return Response.json({ ok: true, content });
  } catch (error) {
    return Response.json({ ok: false, message: "README.md not found" }, { status: 404 });
  }
}
