// ─────────────────────────────────────────────────────────────────────────────
//  lib/fal.ts — server-only. Convierte la foto real del cierre al estilo del
//  "dibujo" hecho a mano vía FAL (modelo gpt-image-2 edit, image-to-image).
//
//  Se le pasan DOS imágenes de referencia: el dibujo (estilo) y la foto real
//  (las personas), y el prompt combina ambos. Necesita `FAL_KEY` (Vercel /
//  .env.local). Si no está o la llamada falla, devuelve `null` y el caller cae a
//  la foto original — nunca rompe la generación del sitio.
//
//  Ojo (dev): FAL descarga las URLs que le pasás, así que el dibujo de estilo
//  tiene que ser público. En local, `req.nextUrl.origin` es localhost y FAL no
//  lo alcanza → seteá `FAL_DRAWING_STYLE_URL` a un drawing.png público.
// ─────────────────────────────────────────────────────────────────────────────

const FAL_MODEL = process.env.FAL_IMAGE_MODEL ?? "openai/gpt-image-2/edit";

/** El prompt exacto que estiliza la foto al estilo del dibujo. */
export const DRAWING_STYLE_PROMPT =
  "Make an image of the same style of the drawing with the human people of the real photo";

/** true si `src` ya es una imagen estilizada devuelta por FAL (para no re-llamar). */
export function isFalImage(src: string | undefined | null): boolean {
  return !!src && /(^|\.)fal\.(media|run|ai)\//.test(src);
}

interface StylizeArgs {
  /** Foto real subida por la pareja (URL pública). */
  photoUrl: string;
  /** Dibujo de referencia de estilo (URL pública). */
  styleUrl: string;
}

/** Devuelve la URL de la imagen estilizada, o `null` si no se pudo generar. */
export async function stylizeClosingDrawing({
  photoUrl,
  styleUrl,
}: StylizeArgs): Promise<string | null> {
  const key = process.env.FAL_KEY;
  if (!key) {
    // Sin esto el cierre muestra la foto cruda y NO hay forma de distinguir
    // "FAL falló" de "FAL no está configurado" mirando los logs del deploy.
    console.warn("[fal] FAL_KEY ausente: el cierre queda con la foto real, sin dibujo.");
    return null;
  }

  try {
    const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      // orden: primero el estilo (dibujo), después las personas (foto real).
      body: JSON.stringify({
        prompt: DRAWING_STYLE_PROMPT,
        image_urls: [styleUrl, photoUrl],
      }),
    });
    if (!res.ok) {
      console.error("[fal] edit-image falló:", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { images?: { url?: string }[] };
    return data.images?.[0]?.url ?? null;
  } catch (e) {
    console.error("[fal] edit-image error:", e);
    return null;
  }
}
