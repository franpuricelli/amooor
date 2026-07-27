# Fase 1 · Templatización del sitio actual (WP-1)

> Deriva de [`PLAN.md`](./PLAN.md) §3 · WP-1. Objetivo: que el sitio de aniversario
> se personalice **100% por datos** y respete un `TemplateManifest`. Meta de
> aceptación: cambiar sólo `content` + `theme` produce el sitio de otra pareja **sin
> tocar `.tsx`**, y **0 strings en español** hardcodeados dentro de componentes.

## Estado

- [x] Bootstrap del repo `amooor` a partir del sitio actual (sin fotos privadas).
- [x] Contrato de template: `lib/template.ts` → `TemplateManifest` + `contentSchema` (Zod).
- [x] `lib/content.ts` — todo el copy extraído (hero, narrativa, secciones, stats, footer, dibujo).
- [x] `lib/theme.ts` — tokens + **5 paletas** (default = la actual).
- [x] `app/globals.css` `:root` — colores centralizados, sin rosas sueltos.
- [x] Secciones **data-driven** vía registry (`page.tsx` renderiza desde `content.sections`).
- [x] `TikTok → reproductor de video` configurable (embed o `<video>` propio).
- [x] Música configurable (`content.music.src`) + placeholders cuando falta un asset.

## Inventario de copy hardcodeado (origen → destino en `content`)

| Componente | Strings | Destino |
|---|---|---|
| `app/layout.tsx` | title/description/OG/themeColor/`lang` | `content.site` |
| `Hero.tsx` | eyebrow `26·07·2022 → ∞`, nombre, lede, alt, "Artistas favoritos", labels de zona/pill | `content.hero`, `content.people` |
| `Historia.tsx` | 3 beats (kicker/title/text) | `content.story.beats` |
| `Cocina.tsx` | beat "Comimos rico" | `content.story.beats` |
| `Viajes.tsx` | head "Viajamos" + lede | `content.travel` |
| `Momentos.tsx` | head "Celebramos todo" + lede | `content.moments` |
| `Pelis.tsx` | head "Maratoneamos", "…y las que faltan", "y nuestra película sin fin ↓" | `content.watch` |
| `Stats.tsx` | kicker, chips (`5 países`, `∞ mates`), línea "Nos conocimos…" | `content.stats` |
| `Galeria.tsx` | eyebrow/title/lede "Wall of love", CTA | `content.gallery` |
| `Footer.tsx` | "Feliz aniversario, mi amor", crédito | `content.footer` |
| `DrawingFlip.tsx` | "Te amo", "De: Fran", alts | `content.drawing` |
| `StoryRow.tsx` | "Ver las N fotos →" | `content.ui` (label templated) |

## Contrato

```ts
TemplateManifest = {
  id: 'anniversary',
  name: 'Aniversario',
  contentSchema,          // Zod — valida el content de cada tenant
  themeTokens,            // nombres de tokens expuestos
  palettes,               // 5 paletas (default incluida)
  sections,               // orden + activo por defecto (data-driven)
  defaultContent,         // el sitio de Puri & Ivi como seed/preview
  renderer,               // registry sectionType → componente
}
```

## Aceptación / verificación

- `npm run build` compila sin strings en español en `components/*.tsx`.
- Cambiar `defaultContent` por otro objeto (otra pareja) re-renderiza todo el sitio.
- Cambiar `theme.activePalette` cambia el 100% de los colores.

## Pendiente para fases siguientes

- Assets reales → **placeholders neutros** ya soportados; las fotos por-tenant se sirven
  desde Cloudflare Images (WP-4), no desde `/public`.
- El wizard (WP-3) produce este `content`/`theme`; Convex (WP-2) lo persiste por tenant.
