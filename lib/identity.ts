// ─────────────────────────────────────────────────────────────────────────────
//  identity.ts — quién de los dos está armando el sitio, deducido de la CUENTA.
//
//  El intake ya no arranca preguntando "y de los dos, vos cuál sos?": para entrar
//  al chat hay que estar logueado (soft gate en Chat.tsx), así que el server ya
//  sabe con qué nombre y mail entró la persona. Con eso alcanza para atar el
//  narrador (`plan.you`) al nombre de la pareja que le corresponde y quedarse con
//  una confirmación de pasada en vez de una pregunta.
//
//  Dos consumidores: el PROMPT (`identityBlock`, para que el agente confirme en
//  vez de preguntar) y el CÓDIGO (`matchNarrator`, que resuelve `plan.you` sin
//  depender de que el modelo lo haga bien).
//
//  Sólo viaja la parte local del mail (lo de antes del @): es lo único que sirve
//  para matchear un nombre, y así el dominio no sale del server.
//
//  ⚠️ Lo que la cuenta NO dice es el GÉNERO. Deducirlo del nombre fue el bug que
//  arreglamos (ver skills/orchestrator): se sigue preguntando siempre.
// ─────────────────────────────────────────────────────────────────────────────

export interface AccountIdentity {
  /** nombre con el que entró (Clerk: firstName + lastName, o el username) */
  name: string;
  /** parte local del mail, sin el dominio ("fran.puricelli") */
  emailLocal: string;
}

/** minúsculas, sin acentos y sin nada que no sea letra o número. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Las "piezas" del nombre y del mail contra las que matcheamos (["franco","puricelli"]). */
function tokens(id: AccountIdentity): string[] {
  const fromName = id.name.split(/[\s,]+/).map(norm).filter((t) => t.length >= 2);
  const fromEmail = id.emailLocal
    .split(/[^a-zA-Z0-9]+/)
    .map(norm)
    .filter((t) => t.length >= 3);
  return [...new Set([...fromName, ...fromEmail])];
}

/**
 * Qué tan fuerte matchea un nombre de la pareja contra la cuenta:
 *   3 = igual ("Franco" ↔ "franco")
 *   2 = uno es prefijo del otro ("Puri" ↔ "puricelli")
 *   1 = uno contiene al otro ("Puri" dentro de "francopurib"); pide 4+ letras
 *       para no matchear "Ana" con "mariana".
 */
function score(name: string, ts: string[]): number {
  const n = norm(name);
  if (n.length < 2) return 0;
  let best = 0;
  for (const t of ts) {
    if (t === n) best = Math.max(best, 3);
    else if (n.length >= 3 && (t.startsWith(n) || n.startsWith(t))) best = Math.max(best, 2);
    else if (n.length >= 4 && (t.includes(n) || n.includes(t))) best = Math.max(best, 1);
  }
  return best;
}

/**
 * De los nombres de la pareja, cuál es la persona de esta cuenta. "" si no hay
 * identidad, si no matchea ninguno, o si matchean los dos igual de fuerte (ahí
 * adivinar sería peor que preguntar: firmaríamos el sitio con el nombre errado).
 */
export function matchNarrator(names: string[], id: AccountIdentity | null): string {
  if (!id) return "";
  const clean = names.map((n) => n.trim()).filter(Boolean);
  if (!clean.length) return "";
  const ts = tokens(id);
  if (!ts.length) return "";
  const scored = clean.map((n) => ({ name: n, s: score(n, ts) }));
  scored.sort((a, b) => b.s - a.s);
  const [first, second] = scored;
  if (!first.s) return "";
  if (second && second.s === first.s) return ""; // empate → ambiguo
  return first.name;
}

/** Bloque de contexto para el prompt. null si no hay sesión (se pregunta como antes). */
export function identityBlock(id: AccountIdentity | null): string | null {
  if (!id) return null;
  const who = [
    id.name ? `con el nombre "${id.name}"` : null,
    id.emailLocal ? `con el usuario de mail "${id.emailLocal}"` : null,
  ]
    .filter(Boolean)
    .join(" y ");
  if (!who) return null;
  return `Contexto de la cuenta (dato real del login, no lo inventes ni lo contradigas):
- La persona que te habla entró ${who}.
- Si eso coincide con uno de los dos nombres de la pareja, ESA es la persona que arma
  el sitio: NO se lo preguntes desde cero, confirmalo de pasada ("vos sos X, no?") y
  seguí. Si no coincide con ninguno o coincide con los dos, preguntalo.
- El nombre de la cuenta NO dice nada del género de nadie: el género se pregunta
  siempre, para las dos personas.`;
}
