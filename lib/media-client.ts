// ─────────────────────────────────────────────────────────────────────────────
//  media-client.ts — helpers de subida (cliente) para el post-aprobación.
//   - uploadImage: el handshake de 3 pasos de Cloudflare Images (idéntico al del
//     wizard) + reintento ante el 500 conocido de "variants not ready".
//   - uploadVideo: sube un MP4 a Convex `_storage` (URL de un solo uso) y lo
//     registra → devuelve la `src` servida por convex/http.ts (/video/<slug>.mp4).
//  Reusa las rutas /api/upload* (fotos) y /api/upload/video* (video).
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Sube una imagen a Cloudflare y la registra en el draft con su categoría. */
export async function uploadImage(
  file: File,
  draftToken: string,
  category: string
): Promise<void> {
  // 1) URL de subida directa (Cloudflare Images)
  const r1 = await fetch("/api/upload", { method: "POST" });
  if (!r1.ok) throw new Error("No se pudo iniciar la subida.");
  const { id, uploadURL } = await r1.json();

  // 2) subir el archivo
  const fd = new FormData();
  fd.append("file", file);
  const up = await fetch(uploadURL, { method: "POST", body: fd });
  if (!up.ok) throw new Error("La subida falló.");

  // 3) registrar en el draft — con reintento ante "variants not ready" (500)
  let lastErr = "";
  for (let i = 0; i < 4; i++) {
    const res = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ draftToken, category, id, filename: file.name }),
    });
    if (res.ok) return;
    const data = await res.json().catch(() => ({}));
    lastErr = (data && data.error) || `error ${res.status}`;
    if (res.status !== 500) break; // sólo el 500 de variantes se reintenta
    await sleep(700 * (i + 1));
  }
  throw new Error(lastErr || "No se pudo registrar la foto.");
}

/** Sube un video a Convex `_storage` y lo registra. Devuelve la `src` de entrega. */
export async function uploadVideo(
  file: File,
  draftToken: string,
  category: string
): Promise<{ src: string; slug: string }> {
  const r1 = await fetch("/api/upload/video", { method: "POST" });
  if (!r1.ok) throw new Error("No se pudo iniciar la subida del video.");
  const { uploadURL } = await r1.json();

  const up = await fetch(uploadURL, {
    method: "POST",
    headers: { "content-type": file.type || "video/mp4" },
    body: file,
  });
  if (!up.ok) throw new Error("La subida del video falló.");
  const { storageId } = await up.json();

  const res = await fetch("/api/upload/video/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draftToken, storageId, category }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && data.error) || "No se pudo registrar el video.");
  }
  return (await res.json()) as { src: string; slug: string };
}

/**
 * Sube la música de fondo (mp3) a Convex `_storage` y la registra. Uno por draft
 * (reemplaza el anterior). Devuelve la `src` de entrega (/track/<slug>.mp3), que
 * termina en content.media.audioUrl (el ❤ del navbar la reproduce).
 */
export async function uploadAudio(
  file: File,
  draftToken: string
): Promise<{ src: string; slug: string }> {
  const r1 = await fetch("/api/upload/audio", { method: "POST" });
  if (!r1.ok) throw new Error("No se pudo iniciar la subida de la música.");
  const { uploadURL } = await r1.json();

  const up = await fetch(uploadURL, {
    method: "POST",
    headers: { "content-type": file.type || "audio/mpeg" },
    body: file,
  });
  if (!up.ok) throw new Error("La subida de la música falló.");
  const { storageId } = await up.json();

  const res = await fetch("/api/upload/audio/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ draftToken, storageId, filename: file.name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data && data.error) || "No se pudo registrar la música.");
  }
  return (await res.json()) as { src: string; slug: string };
}
