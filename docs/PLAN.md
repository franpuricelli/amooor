# amooor — Plan de ejecución

Plataforma SaaS que **genera y hostea sitios de aniversario para parejas**, self-service.
El sitio actual (`purivi.love`, repo `chengdu`: Next.js 15 + React 19 + Lenis/GSAP) se
convierte en el **template #1**. Este doc está estructurado como **work packages (WP)**
delegables a subagents.

---

## 0. Decisiones bloqueadas

**Stack**
| Necesidad | Proveedor |
|---|---|
| DB / backend | **Convex** (DB + funciones + realtime + file storage) |
| Auth (compradores) | **Better Auth** (open-source, plugin orgs, adaptador Convex) |
| Pagos | **Rebill** (pago único; LATAM/AR) |
| Storage de fotos | **Cloudflare Images** (direct upload + variants; acepta HEIC) |
| Imágenes IA | **fal.ai** — modelo `fal-ai/gpt-image-2/edit` |
| Hosting / multi-tenant | **Vercel for Platforms** (1 deploy, N dominios) |
| Dominios `.love` (compra + DNS por API) | **Namecheap** |
| Email | **Resend** (React Email) |
| LLM runtime del producto | **Kimi** (generar) / **Claude Sonnet** (editar) |
| Formato de skills IA | **Agent Skills** (`SKILL.md`, skills.sh) |

**Negocio**
- Flujo: **onboarding ANTES de pagar** → review → **paywall al dar "Generar"** → generación → deploy.
- **Pago único** por sitio: **US$50 / US$90 / US$150**. El plan **US$150 incluye edición con IA** (cambios y elementos ad-hoc por prompt). **Sin suscripción.**
- Dominio: base en **subdominio** `nombre.amooor.com` (incluido); **`.love` propio = upsell pago**. La renovación del `.love` (~US$20/año, el <US$5 es solo el 1er año) la paga el usuario; si no renueva → cae al subdominio.
- Foco **Argentina**, cualquier LATAM puede pagar.

**Modelos de codificación** (qué modelo usa el agente que construye)
- **Opus 4.8** (`claude-opus-4-8`): arquitectura, contratos/schemas, diseño de skills/prompts, refactors riesgosos.
- **Sonnet 4.6** (`claude-sonnet-4-6`): grueso de features, UI, integraciones.
- **Haiku 4.5** (`claude-haiku-4-5`): boilerplate, tests, migraciones mecánicas, copy.

---

## 1. Arquitectura

- **Multi-tenant:** 1 solo deploy en Vercel for Platforms. `middleware.ts` lee el header `Host`
  → resuelve el tenant en Convex → renderiza según su `templateId` + `content`/`theme`. Alta de
  cliente = registro en Convex + dominio conectado por API (sin build por cliente).
- **Capas:** Plataforma (compartida) · Producto (oferta + flujo) · Template (diseño + schema + skills) · Sitio/tenant (instancia).
- **Contratos:**
  - `TemplateManifest = { id, name, contentSchema (Zod), themeTokens, sections[], defaultContent, wizardSteps, skills[], renderer }`
  - `ProductManifest = { id, name, pricing, templates[], onboardingFlow }`
- **Skills IA** (formato `SKILL.md`): `generar-narrativa`, `editar-contenido`, `foto-a-ilustracion` (fal.ai), `sugerir-dominios` (Namecheap), `sugerir-paleta`. Cada template declara las que usa. La edición IA del plan top = agente Claude Sonnet con estas skills sobre el tenant.
- **Data model (Convex):** `users`, `tenants/sites` (`productId, templateId, contentJson, themeJson, theme, assets, domain, status: draft→paid→live, showcase?`), `sections`, `photos` (categoría → refs Cloudflare, con categoría `all`), `templates`, `products`.

---

## 2. Onboarding (spec para WP-3)

Wizard no técnico; guarda **draft** en Convex; login opcional (Better Auth). Steps:
1. Nombres + fechas (aniversario / cómo se conocieron).
2. **Perfil por persona:** apodo, personalidad, **bandas favoritas**, traits.
3. **Descripción de la historia** (texto libre → insumo IA).
4. **Secciones:** vienen las **recomendadas del template**; el usuario **agrega / quita / renombra / reordena** y **edita por texto con IA**.
5. **Fotos por sección:** sube a cada sección; las no categorizadas caen en **"Todas"** y desde ahí **recategoriza**.
6. Canción (mp3 propio o librería con licencia) · Video (opcional, reemplaza el TikTok).
7. **Paleta:** 5 opciones customizables (default = la del template).
8. Ideas de dominio (texto libre).
9. **Review → "Generar" → paywall (Rebill).**

---

## 3. Work packages (delegar a subagents)

Cada WP es autónomo. Al ejecutar, cada uno produce su `docs/fase-N-*.md` con pasos finos,
archivos y checklist.

### WP-1 · Templatización del sitio actual + contrato de template
**Objetivo:** que el sitio actual se personalice 100% por datos y respete un `TemplateManifest`.
**Tareas:**
- Definir `TemplateManifest` + `contentSchema` (Zod) del template de aniversario.
- Extraer **todo el copy hardcodeado** a `content.*` (metadata, hero, narrativa de secciones, stats, footer, mensaje del dibujo).
- Theming: centralizar el 100% de colores en `:root` (eliminar los ~9 rosas sueltos), exponer `theme` (~4-6 tokens) y **5 paletas** (default = actual).
- Secciones **data-driven** (array por tenant, orden/activo, categoría de fotos) + bucket **"Todas"**; música/video configurables; **TikTok → reproductor de video**.
- Reemplazar assets fijos por placeholders neutros.
**Archivos clave:** `lib/config.ts` (extender/dividir en `content`+`theme`), `components/sections/*.tsx` (narrativa), `components/{Hero,Footer,DrawingFlip,Stats,MusicToggle}.tsx`, `app/globals.css` (`:root`), `app/layout.tsx` (metadata), `lib/photos.ts` (contrato de fotos: mantener shape).
**Aceptación:** cambiar solo `content.json`+`theme.json` produce un sitio de otra pareja sin tocar `.tsx`; 0 strings en español dentro de componentes.
**Modelo:** Opus (contrato + schema) · Sonnet (extracción/refactor) · Haiku (mover strings).

### WP-2 · Plataforma multi-tenant + Convex
**Objetivo:** una app que sirve N sitios desde 1 deploy.
**Tareas:** schema Convex (data model §1); `middleware.ts` de host → tenant; registry de templates → renderer por `templateId`; render del sitio desde `content`/`theme`/fotos del tenant; deploy en Vercel for Platforms.
**Aceptación:** dos tenants distintos (seed) renderizan en dos hosts distintos desde el mismo deploy.
**Modelo:** Opus (arquitectura datos + multi-tenancy) · Sonnet (queries/mutations + wiring).

### WP-3 · Onboarding + generación IA + skills
**Objetivo:** el wizard completo (§2) + generación del sitio.
**Tareas:** wizard (secciones editables por IA, bucket "Todas" + recategorizar, perfil por persona, 5 paletas, upload de fotos → Cloudflare); skills `generar-narrativa` / `editar-contenido` / `foto-a-ilustracion`; paywall al final; persistir `content`/`theme` en Convex; disparar generación post-pago.
**Aceptación:** un usuario arma un draft, paga (sandbox) y obtiene un sitio live con su contenido.
**Modelo:** Sonnet (wizard/UI) · Opus (skills/prompts + flujo de generación). Runtime: Kimi/Claude Sonnet.

### WP-4 · Integraciones (pagos, storage, dominios, email)
**Objetivo:** conectar los proveedores.
**Tareas:** Rebill (paywall + webhook de pago → alta/`paid` + verificación de firma); Cloudflare Images (direct upload + variants `thumb`/`full`); Namecheap (`sugerir-dominios`: check/precio de varias `.love` <US$5 + compra + DNS a Vercel); Vercel Domains API (add + verify); **Resend** (5 emails, §4).
**Aceptación:** compra end-to-end en sandbox: pago → sitio → dominio `.love` conectado + emails disparados.
**Modelo:** Sonnet (integraciones) · Haiku (webhooks, tests, plantillas de email).

### WP-5 · Sitio de marketing de la empresa
**Objetivo:** la landing institucional, misma onda que `purivi.love` con estructura de web.
**Tareas:** navbar (logo + links + **CTA "Comenzar" arriba a la derecha** → onboarding), hero con valor + preview, "cómo funciona", **showcase** de sitios de clientes (tenants `showcase` en Convex), **precios** ($50/$90/$150 + upsell), FAQ/testimonios, footer. Reusa el design system. Vive en el **apex** (`amooor.com`); el middleware distingue apex → marketing, subdominio → tenant.
**Aceptación:** landing responsive con showcase real y CTAs que entran al onboarding.
**Modelo:** Sonnet (build) · Haiku (copy/secciones).

### WP-6 · Escalar catálogo (post-MVP)
Template #2 (mismo `TemplateManifest`) y producto #2 (flujo propio) reusando la plataforma.
**Modelo:** Sonnet.

---

## 4. Emails (Resend)

welcome/activación · re-activación (draft abandonado) · gracias por la compra · "tu sitio está listo" · recuperación de acceso. Disparados por eventos de Convex/webhooks; templates con React Email.

---

## 5. Referencia de proveedores (endpoints clave)

- **Convex:** DB reactiva + functions + file storage; integra con Better Auth (adaptador oficial).
- **Better Auth:** open-source; plugin de organizaciones (multi-tenant); email/password + Google + magic link.
- **Rebill:** auth Bearer; payment link o SDK JS; **metadata** (`tenantId`) recuperable en webhook; webhook de pago exitoso → **verificar firma** (confirmar en dashboard/sandbox).
- **Cloudflare Images:** `POST /accounts/{id}/images/v2/direct_upload` (uploadURL de un uso) → browser sube → `image_id`; variants `POST /images/v1/variants` (`thumb` w480, `full` w1280); entrega `imagedelivery.net/<hash>/<id>/<variant>`. Acepta HEIC.
- **fal.ai:** `@fal-ai/client`, `FAL_KEY`; `fal.subscribe("fal-ai/gpt-image-2/edit", { image_url, prompt })` (o `fal.queue.submit` + webhook). Cobro por imagen.
- **Vercel for Platforms:** base `vercel/platforms`; agregar dominio `projectsAddProjectDomain` / `POST /v10/projects/{id}/domains`; DNS `GET /v6/domains/{d}/config` (CNAME `cname.vercel-dns.com` / A `76.76.21.x`); verificar `POST /v9/projects/{id}/domains/{d}/verify`; SSL auto. Requiere plan Pro.
- **Namecheap:** `namecheap.users.getPricing`, `namecheap.domains.create`, `namecheap.domains.dns.setHosts`. `.love` ~US$4.98 el 1er año / ~US$20 renovación; requiere ~US$50 de saldo para habilitar API.
- **Resend:** `resend.emails.send({ from, to, subject, react })`; verificar dominio (SPF/DKIM/DMARC); webhooks de eventos.
- **LLM runtime:** Kimi (OpenAI-compatible, `response_format: json_schema`) para generar; Claude Sonnet (tool use + prompt caching) para editar.
- **skills.sh:** Agent Skills Directory (`SKILL.md`); `npx skills add <owner/repo>`; reusar skills de design systems.

---

## 6. Próximo paso

Guardar este plan en un **repo nuevo** (`amooor`) como `docs/PLAN.md`, y al ejecutar cada WP
generar su `docs/fase-N-*.md`. Cada WP se delega a un subagent con el modelo indicado.
