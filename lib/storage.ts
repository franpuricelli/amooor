// ─────────────────────────────────────────────────────────────────────────────
//  lib/storage.ts — cliente de Cloudflare Images (WP-4).
//  Necesita: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (Bearer).
//
//  API shapes asumidas (Cloudflare Images REST API v1/v2):
//  - POST /images/v2/direct_upload → { result: { id, uploadURL }, success, errors }
//  - GET  /images/v1/{id}          → { result: { id, variants: string[] }, success, errors }
//  - POST /images/v1/variants      → { result: { variant: {...} }, success, errors }
//    body: { id: string, options: { fit, width, height, metadata: 'none' } }
//    409 / mensaje "already exists" se ignora.
//  Las URLs de entrega tienen la forma:
//    https://imagedelivery.net/<hash>/<imageId>/<variantName>
//  Derivamos <hash> del primer elemento de result.variants, quitando los últimos
//  dos segmentos de path (/<imageId>/<variantName>) para quedarnos con la base.
// ─────────────────────────────────────────────────────────────────────────────

const CF_BASE = "https://api.cloudflare.com/client/v4";

function getCredentials(): { accountId: string; token: string } {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    throw new Error(
      "Faltan variables de entorno: CLOUDFLARE_ACCOUNT_ID y/o CLOUDFLARE_API_TOKEN"
    );
  }
  return { accountId, token };
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface CfDirectUploadResult {
  id: string;
  uploadURL: string;
}

interface CfImageResult {
  id: string;
  variants: string[];
}

interface CfResponse<T> {
  result: T;
  success: boolean;
  errors: Array<{ code: number; message: string }>;
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

/**
 * Crea un direct-upload URL en Cloudflare Images v2.
 * El cliente sube directamente a `uploadURL` (PUT multipart), sin pasar por
 * nuestros servidores.
 */
export async function createDirectUpload(): Promise<{
  id: string;
  uploadURL: string;
}> {
  const { accountId, token } = getCredentials();

  const res = await fetch(
    `${CF_BASE}/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: authHeaders(token),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Cloudflare direct_upload falló (${res.status}): ${text}`
    );
  }

  const json = (await res.json()) as CfResponse<CfDirectUploadResult>;
  if (!json.success) {
    throw new Error(
      `Cloudflare direct_upload error: ${JSON.stringify(json.errors)}`
    );
  }

  return { id: json.result.id, uploadURL: json.result.uploadURL };
}

/**
 * Obtiene los metadatos de una imagen por su ID (incluye `variants`).
 */
export async function getImage(id: string): Promise<CfImageResult> {
  const { accountId, token } = getCredentials();

  const res = await fetch(
    `${CF_BASE}/accounts/${accountId}/images/v1/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: authHeaders(token),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Cloudflare getImage falló (${res.status}): ${text}`
    );
  }

  const json = (await res.json()) as CfResponse<CfImageResult>;
  if (!json.success) {
    throw new Error(
      `Cloudflare getImage error: ${JSON.stringify(json.errors)}`
    );
  }

  return json.result;
}

/**
 * Crea las variantes "thumb" (480×480) y "full" (1280×1280) si no existen.
 * Swallows todos los errores — se llama best-effort antes del upload.
 */
export async function ensureVariants(): Promise<void> {
  const { accountId, token } = getCredentials();

  const variants: Array<{
    id: string;
    width: number;
    height: number;
  }> = [
    { id: "thumb", width: 480, height: 480 },
    { id: "full", width: 1280, height: 1280 },
  ];

  await Promise.allSettled(
    variants.map(async (v) => {
      try {
        const res = await fetch(
          `${CF_BASE}/accounts/${accountId}/images/v1/variants`,
          {
            method: "POST",
            headers: {
              ...authHeaders(token),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: v.id,
              options: {
                fit: "scale-down",
                width: v.width,
                height: v.height,
                metadata: "none",
              },
            }),
          }
        );

        if (!res.ok) {
          const text = await res.text();
          // 409 / "already exists" → ignorar silenciosamente
          if (
            res.status === 409 ||
            text.toLowerCase().includes("already exists")
          ) {
            return;
          }
          // Cualquier otro error también se ignora (best-effort)
        }
      } catch {
        // best-effort: no propagamos
      }
    })
  );
}

/**
 * Resuelve las URLs de entrega para una imagen ya subida.
 * Hace GET a Cloudflare, deriva la base de imagedelivery.net desde el primer
 * variant URL disponible, y construye thumbUrl y fullUrl.
 *
 * Retorna `{ cloudflareId, thumbUrl, fullUrl }`.
 * Si no hay variants todavía, thumbUrl y fullUrl serán null.
 */
export async function resolveUrls(id: string): Promise<{
  cloudflareId: string;
  thumbUrl: string | null;
  fullUrl: string | null;
}> {
  const image = await getImage(id);

  if (!image.variants || image.variants.length === 0) {
    return { cloudflareId: id, thumbUrl: null, fullUrl: null };
  }

  // Ejemplo de variant URL:
  //   https://imagedelivery.net/<hash>/<imageId>/public
  // Queremos derivar: https://imagedelivery.net/<hash>/<imageId>
  // quitando el último segmento ("public" o el nombre del variant).
  const firstVariant = image.variants[0];
  const baseUrl = firstVariant.substring(0, firstVariant.lastIndexOf("/"));

  return {
    cloudflareId: id,
    thumbUrl: `${baseUrl}/thumb`,
    fullUrl: `${baseUrl}/full`,
  };
}
