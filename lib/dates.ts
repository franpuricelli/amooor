// ─────────────────────────────────────────────────────────────────────────────
//  dates.ts — el formato de fecha del sitio, en un solo lugar. Las fechas se
//  guardan siempre en ISO (`yyyy-mm-dd`, ver `normalizePlanDate` en lib/plan.ts)
//  y se MUESTRAN con este helper: el contador, la portada, la línea del cierre y
//  la tarjeta del plan tienen que decir lo mismo.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * "2022-07-26" → "26 · 07 · 2022" (o con el separador que le pases: `"."` da
 * "26.07.2022"). Devuelve "" si la fecha no es válida, para que quien la muestra
 * pueda caer a su propio texto en vez de imprimir basura.
 */
export function fmtDate(iso: string, sep = " · "): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return "";
  const [, y, mo, d] = m;
  return [d, mo, y].join(sep);
}
