/**
 * Direct-to-GCS upload via presigned URL.
 *
 * 1. Asks the API for a presigned PUT URL.
 * 2. Uploads the file bytes directly to GCS.
 * 3. Returns the public-facing URL the frontend should store/display.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const base = (import.meta as any).env?.BASE_URL || "/";

  const reqRes = await fetch(`${base}api/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      contentType: file.type || "application/octet-stream",
    }),
  });
  if (!reqRes.ok) {
    const j = await reqRes.json().catch(() => ({}));
    throw new Error(j.error || `Failed to request upload URL (${reqRes.status})`);
  }
  const { uploadURL, objectPath } = (await reqRes.json()) as {
    uploadURL: string;
    objectPath: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`GCS upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });

  // objectPath comes back as "/objects/<id>" — turn it into a public URL the frontend can render.
  return `${base.replace(/\/$/, "")}/api/storage${objectPath}`;
}
