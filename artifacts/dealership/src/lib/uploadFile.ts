/**
 * Direct file upload to the API (stored in Postgres bytea).
 * Works on every host with a Postgres DB — no external storage required.
 */
export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const base = (import.meta as any).env?.BASE_URL || "/";
  const MAX = 40 * 1024 * 1024;
  if (file.size > MAX) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 40MB.`);
  }

  const dataBase64 = await fileToBase64(file, onProgress);

  const res = await fetch(`${base}api/storage/uploads/direct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      dataBase64,
    }),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || `Upload failed (${res.status})`);
  }
  const { url } = (await res.json()) as { url: string };
  if (onProgress) onProgress(100);
  return url;
}

function fileToBase64(file: File, onProgress?: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        // Reading is ~half the work; reserve 50-100% for the network upload.
        onProgress(Math.round((e.loaded / e.total) * 50));
      }
    };
    reader.onload = () => {
      const result = reader.result as string;
      const b64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(b64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
