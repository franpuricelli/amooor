# Analytics — eventos de usuario (PostHog)

Instrumentación del embudo de amooor. El catálogo **tipado** vive en
`lib/analytics.ts` (`EventProps`); este documento explica qué mide cada evento y
cómo leerlos. Agregar un evento = agregar una fila en `EventProps` + el `track()`
en el punto de uso.

## Cómo está armado

| Pieza | Archivo | Qué hace |
| --- | --- | --- |
| Catálogo + wrapper | `lib/analytics.ts` | `track()`, `identifyUser()`, `registerContext()`, `initAnalytics()` |
| Provider | `components/analytics/PostHogProvider.tsx` | init, `$pageview` por navegación, identidad de Clerk |
| Montaje | `app/layout.tsx` | dentro de `<ClerkProvider>` (necesita `useUser`) |

Config: `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` (ver
`.env.example`). Son **Next-side** como el resto de las keys — `.env.local` en
local, Vercel en prod; Convex no las lee.

**Sin `NEXT_PUBLIC_POSTHOG_KEY` todo es no-op.** Local y previews no ensucian el
proyecto, y `track()` nunca puede romper un flujo del producto.

## Convenciones

- Nombres `snake_case`, objeto + verbo en pasado: `site_published`.
- **Nada de PII libre**: nunca el texto del chat ni el copy del sitio. Se mandan
  largos (`length`), cantidades y flags. El email/nombre sólo van al `identify`.
- `person_profiles: "identified_only"` — las visitas anónimas a los sitios de las
  parejas no crean perfiles; sólo quien se loguea a construir.

### Super-propiedades

Viajan en todos los eventos siguientes (`registerContext`):

| Propiedad | Origen | Para qué |
| --- | --- | --- |
| `surface` | `PostHogProvider` (host + path) | `marketing` \| `builder` \| `tenant` |
| `draft_token` | `Chat.tsx` cuando el draft hidrata | **une el embudo entero**: anónimo → logueado → publicado |
| `palette`, `template` | al elegirlos | segmentar por estética elegida |

`draft_token` es la clave: la identidad de amooor es el draft (localStorage),
no la cuenta — el login llega recién en el primer mensaje.

## Eventos

### Marketing (`amooor.com`)

| Evento | Props | Dónde |
| --- | --- | --- |
| `landing_cta_clicked` | `location` (`nav`/`hero`/`pricing`/`closing`), `plan?` | `components/marketing/sections.tsx` |

### Cuenta (Clerk)

| Evento | Props | Notas |
| --- | --- | --- |
| `user_signed_up` | `method` | cuenta creada hace < 5 min (heurística sobre `user.createdAt`) |
| `user_signed_in` | `method` | una vez por sesión de browser |
| `signup_gate_shown` | `at` | el soft gate abrió Clerk en vez de mandar el mensaje |

### Entrevista (`/comenzar`)

| Evento | Props |
| --- | --- |
| `builder_opened` | `returning`, `plan?` |
| `chat_message_sent` | `mode` (`chat`/`refine`/`converse`), `length`, `has_attachments`, `has_refs`, `has_quotes` |
| `chat_reply_received` | `mode`, `ms` |
| `chat_reply_failed` | `mode`, `ms`, `reason` |
| `plan_generated` | `sections`, `kinds`, `refined` |
| `plan_section_removed` | `kind`, `remaining` |
| `plan_assumption_corrected` | `remaining` |
| `plan_approved` | `sections`, `palette`, `template` |
| `demo_plan_loaded` | — |

`plan_generated.refined = false` es el **fin de la entrevista** (primer plan);
`true` es cada iteración. `demo_plan_loaded` marca las sesiones de `skip wizard`
(dev): filtralas de los embudos.

### Fotos y música

| Evento | Props |
| --- | --- |
| `media_upload_started` | `category`, `kind`, `count` |
| `media_uploaded` | `category`, `kind`, `ms` |
| `media_upload_failed` | `category`, `kind`, `reason` |
| `media_deleted` | `kind` |
| `music_uploaded` / `music_removed` | `ms` / — |
| `photos_step_completed` | `photos`, `videos`, `has_music`, `first_build` |
| `photos_step_reopened` | — |

La subida son 3 hops (`lib/media-client.ts`): `started` vs `uploaded`/`failed`
muestra en cuáles se cae y con qué latencia.

### Build

| Evento | Props |
| --- | --- |
| `site_build_started` | — |
| `site_build_succeeded` | `ms`, `sections` |
| `site_build_failed` | `ms`, `reason` |

El paso más lento del flujo y el candidato natural a abandono: mirá la
distribución de `ms` antes de tocar los timings de la pantalla de espera.

### Editor

| Evento | Props |
| --- | --- |
| `editor_opened` | `sections` |
| `editor_text_edited` | `path` (debounceado 700 ms, no por tecla) |
| `editor_message_sent` | `length` |
| `editor_reply_received` / `editor_reply_failed` | `ms` (+ `reason`) |
| `palette_changed` | `palette`, `custom`, `surface` (`plan`/`editor`) |
| `template_changed` | `template`, `surface` |

### Publicación

| Evento | Props |
| --- | --- |
| `site_publish_started` | `action`, `republish` |
| `site_published` | `subdomain`, `republish`, `ms` |
| `site_paused` | `subdomain` |
| `site_publish_failed` | `action`, `reason` |
| `published_site_opened` | `subdomain` |

Publicar es **gratis** (sin pago); `republish = false` es el alta real del sitio.

## El embudo principal

Armalo en PostHog con estos pasos (unificando por persona, o por `draft_token`
si querés incluir el tramo anónimo):

```
landing_cta_clicked → builder_opened → chat_message_sent
  → plan_generated (refined = false) → plan_approved
  → photos_step_completed → site_build_succeeded
  → site_published (republish = false)
```

Filtro recomendado en todos: `demo_plan_loaded` no ocurrió (saca las sesiones de
dev) y `surface = builder` donde aplique.

## Agregar un evento

1. Sumá la fila a `EventProps` en `lib/analytics.ts` (con sus props tipadas).
2. Llamá `track("mi_evento", { ... })` en el punto de uso — TypeScript valida el
   nombre y la forma de las props.
3. Documentalo en la tabla de arriba.

No hace falta tocar nada en PostHog: los eventos aparecen solos al primer envío.
