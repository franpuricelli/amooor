// ─────────────────────────────────────────────────────────────────────────────
//  chat-format.ts — parseo del texto del agente (client-safe, sin deps server).
//
//  El agente puede terminar un mensaje con una línea `[[options: A | B | C]]`
//  (ver lib/intake-prompt.ts) para ofrecer respuestas rápidas seleccionables
//  (onboarding asistido). Acá lo separamos del texto visible y lo convertimos en
//  chips. También ocultamos un marcador a medio llegar mientras streamea, para
//  que no se vea el `[[options:` crudo.
// ─────────────────────────────────────────────────────────────────────────────

// ── actividad del agente (razona / busca / navega / escribe / arma plan) ─────
export type ActivityKind =
  | "think"
  | "search"
  | "browse"
  | "read"
  | "write"
  | "plan";
export interface Activity {
  id: string;
  kind: ActivityKind;
  label: string;
  detail?: string;
  status: "running" | "done";
  meta?: string;
}

// ── adjuntos del usuario (imágenes / archivos que pega o sube) ───────────────
export interface Attachment {
  id: string;
  kind: "image" | "file";
  name: string;
  /** object-URL o data-URL para previsualizar (solo imágenes) */
  url?: string;
}

// ── panel de "compartidos" (columna derecha): imágenes, enlaces, y el plan ───
export type SharedKind = "image" | "link" | "plan";
export interface SharedItem {
  id: string;
  kind: SharedKind;
  /** etiqueta corta para el chip y para referenciar con @ */
  label: string;
  url?: string;
  /** miniatura (imágenes) */
  thumb?: string;
}

const URL_RE = /\bhttps?:\/\/[^\s<>()]+/gi;

function hostLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 28);
  }
}

/**
 * Deriva los "compartidos" de la conversación (para la columna derecha):
 * imágenes adjuntas + enlaces que el usuario pegó + el plan (si existe).
 * `overrides` (id → nombre) deja renombrar cada referencia. Los nombres por
 * defecto son limpios (no el filename crudo). Client-safe.
 */
export function deriveShared(
  messages: { role: string; content: string; attachments?: Attachment[] }[],
  hasPlan: boolean,
  planTitle?: string,
  overrides: Record<string, string> = {}
): SharedItem[] {
  const items: SharedItem[] = [];
  const seenUrl = new Set<string>();
  let imgN = 0;

  for (const m of messages) {
    if (m.role !== "user") continue;
    for (const a of m.attachments ?? []) {
      if (a.kind === "image" && a.url) {
        imgN += 1;
        items.push({
          id: a.id,
          kind: "image",
          label: overrides[a.id] ?? `Imagen ${imgN}`,
          url: a.url,
          thumb: a.url,
        });
      }
    }
    const urls = m.content.match(URL_RE) ?? [];
    for (const raw of urls) {
      const url = raw.replace(/[.,)]+$/, "");
      if (seenUrl.has(url)) continue;
      seenUrl.add(url);
      const id = `url-${url}`;
      items.push({ id, kind: "link", label: overrides[id] ?? hostLabel(url), url });
    }
  }

  if (hasPlan) {
    items.unshift({
      id: "plan",
      kind: "plan",
      label: overrides["plan"] ?? (planTitle || "Plan de tu sitio"),
    });
  }
  return items;
}

const OPTIONS_RE = /\[\[options:([^\]]*)\]\]/gi;
const DEEPEN_RE = /\[\[deepen:([^\]]*)\]\]/gi;

/** Separa el texto de las opciones (para un mensaje ya completo). */
export function splitOptions(content: string): { text: string; options: string[] } {
  const options: string[] = [];
  const text = content
    .replace(OPTIONS_RE, (_m, group: string) => {
      for (const o of group.split("|").map((s) => s.trim()).filter(Boolean)) {
        options.push(o);
      }
      return "";
    })
    .trimEnd();
  return { text, options };
}

/**
 * Opciones para "¿dónde querés profundizar?" (4 + la UI agrega "Otro"). El agente
 * las emite con `[[deepen: A | B | C | D]]` y la barra de chat se expande con ellas.
 */
export function parseDeepen(content: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(DEEPEN_RE);
  while ((m = re.exec(content)) !== null) {
    for (const o of m[1].split("|").map((s) => s.trim()).filter(Boolean)) out.push(o);
  }
  return out;
}

/** Texto para mostrar mientras streamea: saca markers completos y uno incompleto al final. */
export function displayText(content: string): string {
  let text = content.replace(OPTIONS_RE, "").replace(DEEPEN_RE, "").trimEnd();
  const i = text.lastIndexOf("[[");
  if (i !== -1 && !text.slice(i).includes("]]")) text = text.slice(0, i).trimEnd();
  return text;
}
