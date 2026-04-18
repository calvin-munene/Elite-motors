import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { uploadedFilesTable } from "@workspace/db";

const router: IRouter = Router();

const DirectUploadBody = z.object({
  filename: z.string().min(1).max(500),
  contentType: z.string().min(1).max(200),
  dataBase64: z.string().min(1),
});

const MAX_BYTES = 40 * 1024 * 1024;

router.post("/storage/uploads/direct", async (req: Request, res: Response) => {
  const parsed = DirectUploadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid fields (filename, contentType, dataBase64)" });
    return;
  }
  try {
    const { filename, contentType, dataBase64 } = parsed.data;
    const buf = Buffer.from(dataBase64, "base64");
    if (buf.length === 0) {
      res.status(400).json({ error: "Empty file data" });
      return;
    }
    if (buf.length > MAX_BYTES) {
      res.status(413).json({ error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` });
      return;
    }
    const [row] = await db
      .insert(uploadedFilesTable)
      .values({
        filename,
        mimeType: contentType,
        size: buf.length,
        data: buf,
      })
      .returning({ id: uploadedFilesTable.id });

    const base = (process.env.PUBLIC_URL_BASE || "").replace(/\/$/, "");
    const url = `${base}/api/storage/files/${row.id}`;
    res.json({ url, id: row.id, size: buf.length });
  } catch (err: any) {
    req.log.error({ err }, "Error storing uploaded file");
    res.status(500).json({ error: err?.message || "Failed to store uploaded file" });
  }
});

router.get("/storage/files/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const [row] = await db
      .select()
      .from(uploadedFilesTable)
      .where(eq(uploadedFilesTable.id, id))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    res.setHeader("Content-Type", row.mimeType);
    res.setHeader("Content-Length", String(row.size));
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Disposition", `inline; filename="${row.filename.replace(/"/g, "")}"`);
    res.end(row.data);
  } catch (err: any) {
    req.log.error({ err }, "Error serving uploaded file");
    res.status(500).json({ error: "Failed to serve file" });
  }
});

export default router;
