"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  steps.tsx — los pasos del wizard (WP-3, §2 del PLAN). Cada paso lee/escribe el
//  WizardState vía el hook useDraft (prop `d`). El orquestador (Wizard.tsx) decide
//  el orden y la navegación.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex-browser";
import { paletteLabels, palettes, type PaletteId } from "@/lib/theme";
import {
  ALL_CATEGORY,
  RECOMMENDED_SECTIONS,
  type SectionType,
  type WizardSection,
} from "@/lib/draft";
import type { UseDraft } from "@/lib/use-draft";
import { slugifyCouple } from "@/lib/subdomain";

export interface StepProps {
  d: UseDraft;
}

// ── helpers de UI ─────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="wz-field">
      <label className="wz-label">
        {label} {hint && <span className="wz-hint">· {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Head({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <>
      <div className="wz-kicker">{kicker}</div>
      <h2 className="wz-h">{title}</h2>
      {sub && <p className="wz-sub">{sub}</p>}
    </>
  );
}

// ── 1 · Nombres + fechas ─────────────────────────────────────────────────────
export function StepNames({ d }: StepProps) {
  const { state, setState } = d;
  return (
    <div>
      <Head
        kicker="Paso 1"
        title="Ustedes dos"
        sub="Empecemos por lo esencial: sus nombres y las fechas que marcan su historia."
      />
      <Field label="¿Cómo se llaman?" hint="ej. Puri & Ivi">
        <input
          className="wz-input"
          value={state.couple}
          placeholder="Nombre & Nombre"
          onChange={(e) => setState((s) => ({ ...s, couple: e.target.value }))}
        />
      </Field>
      <div className="wz-row">
        <Field label="Aniversario" hint="cuándo empezaron">
          <input
            className="wz-input"
            type="date"
            value={state.dates.together}
            onChange={(e) =>
              setState((s) => ({ ...s, dates: { ...s.dates, together: e.target.value } }))
            }
          />
        </Field>
        <Field label="Se conocieron" hint="opcional">
          <input
            className="wz-input"
            type="date"
            value={state.dates.met}
            onChange={(e) =>
              setState((s) => ({ ...s, dates: { ...s.dates, met: e.target.value } }))
            }
          />
        </Field>
      </div>
    </div>
  );
}

// ── 2 · Perfil por persona ───────────────────────────────────────────────────
function PersonEditor({
  which,
  d,
}: {
  which: "left" | "right";
  d: StepProps["d"];
}) {
  const { state, setState } = d;
  const p = state.people[which];
  const patch = (patchObj: Partial<typeof p>) =>
    setState((s) => ({
      ...s,
      people: { ...s.people, [which]: { ...s.people[which], ...patchObj } },
    }));

  return (
    <div className="wz-card">
      <Field label="Nombre">
        <input
          className="wz-input"
          value={p.name}
          placeholder={which === "left" ? "Ella / elle" : "Él / elle"}
          onChange={(e) => patch({ name: e.target.value })}
        />
      </Field>
      <Field label="Personalidad" hint="una frase — la IA la usa para su tagline">
        <input
          className="wz-input"
          value={p.personality}
          placeholder="ej. main character energy"
          onChange={(e) => patch({ personality: e.target.value })}
        />
      </Field>
      <Field label="Bandas / artistas favoritos" hint="separados por coma">
        <input
          className="wz-input"
          value={p.bands.join(", ")}
          placeholder="Tini, Emilia, The Beatles"
          onChange={(e) =>
            patch({
              bands: e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            })
          }
        />
      </Field>
    </div>
  );
}

export function StepPeople({ d }: StepProps) {
  return (
    <div>
      <Head
        kicker="Paso 2"
        title="Cada uno"
        sub="Un mini perfil de cada une. Aparece al pasar el mouse en la portada."
      />
      <div className="wz-row" style={{ alignItems: "flex-start" }}>
        <PersonEditor which="left" d={d} />
        <PersonEditor which="right" d={d} />
      </div>
    </div>
  );
}

// ── 3 · Historia ─────────────────────────────────────────────────────────────
export function StepStory({ d }: StepProps) {
  const { state, setState } = d;
  return (
    <div>
      <Head
        kicker="Paso 3"
        title="Su historia"
        sub="Contala como se la contarías a un amigo. Esto alimenta la narrativa del sitio."
      />
      <Field
        label="¿Cómo fue?"
        hint="dónde se conocieron, momentos clave, lo que los hace ustedes"
      >
        <textarea
          className="wz-textarea"
          style={{ minHeight: 200 }}
          value={state.story}
          placeholder="Nos cruzamos en la facu un día de marzo…"
          onChange={(e) => setState((s) => ({ ...s, story: e.target.value }))}
        />
      </Field>
    </div>
  );
}

// ── 4 · Secciones ────────────────────────────────────────────────────────────
const SECTION_TYPES: { type: SectionType; label: string }[] = [
  { type: "story", label: "Historia (texto + fotos)" },
  { type: "travel", label: "Viajes" },
  { type: "moments", label: "Momentos" },
  { type: "watch", label: "Pelis & series" },
  { type: "stats", label: "Contador" },
  { type: "gallery", label: "Galería completa" },
];

export function StepSections({ d }: StepProps) {
  const { state, setState } = d;
  const cats = state.categories.filter((c) => c !== ALL_CATEGORY);

  const update = (i: number, patch: Partial<WizardSection>) =>
    setState((s) => {
      const sections = s.sections.slice();
      sections[i] = { ...sections[i], ...patch };
      return { ...s, sections };
    });
  const move = (i: number, dir: -1 | 1) =>
    setState((s) => {
      const sections = s.sections.slice();
      const j = i + dir;
      if (j < 0 || j >= sections.length) return s;
      [sections[i], sections[j]] = [sections[j], sections[i]];
      return { ...s, sections };
    });
  const remove = (i: number) =>
    setState((s) => ({ ...s, sections: s.sections.filter((_, k) => k !== i) }));
  const add = (type: SectionType) =>
    setState((s) => ({
      ...s,
      sections: [
        ...s.sections,
        {
          type,
          id: `${type}-${s.sections.length + 1}`,
          title: SECTION_TYPES.find((t) => t.type === type)?.label ?? type,
          enabled: true,
          aiPrompt: "",
          categories: [],
        },
      ],
    }));
  const toggleCat = (i: number, cat: string) =>
    update(i, {
      categories: state.sections[i].categories.includes(cat)
        ? state.sections[i].categories.filter((c) => c !== cat)
        : [...state.sections[i].categories, cat],
    });

  return (
    <div>
      <Head
        kicker="Paso 4"
        title="Secciones"
        sub="Estas vienen recomendadas. Agregá, quitá, renombrá o reordená a gusto."
      />
      {state.sections.map((sec, i) => (
        <div className="wz-card" key={i}>
          <div className="wz-card-head">
            <input
              className="wz-input"
              style={{ fontWeight: 700 }}
              value={sec.title}
              onChange={(e) => update(i, { title: e.target.value })}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button className="wz-iconbtn" onClick={() => move(i, -1)} aria-label="Subir">
                ↑
              </button>
              <button className="wz-iconbtn" onClick={() => move(i, 1)} aria-label="Bajar">
                ↓
              </button>
              <button
                className="wz-iconbtn"
                onClick={() => update(i, { enabled: !sec.enabled })}
                aria-label="Mostrar/ocultar"
                title={sec.enabled ? "Visible" : "Oculta"}
              >
                {sec.enabled ? "👁" : "🚫"}
              </button>
              {sec.type !== "hero" && (
                <button className="wz-iconbtn" onClick={() => remove(i)} aria-label="Quitar">
                  ✕
                </button>
              )}
            </div>
          </div>
          {sec.type !== "hero" && sec.type !== "stats" && sec.type !== "gallery" && (
            <Field label="¿Qué querés que cuente?" hint="opcional — lo escribe la IA">
              <input
                className="wz-input"
                value={sec.aiPrompt}
                placeholder="ej. nuestro primer viaje juntos a Bariloche"
                onChange={(e) => update(i, { aiPrompt: e.target.value })}
              />
            </Field>
          )}
          {cats.length > 0 && sec.type !== "stats" && (
            <div className="wz-field">
              <label className="wz-label">
                Fotos <span className="wz-hint">· qué categorías usa</span>
              </label>
              <div className="wz-chips">
                {cats.map((cat) => (
                  <button
                    key={cat}
                    className={`wz-chip ${sec.categories.includes(cat) ? "on" : ""}`}
                    onClick={() => toggleCat(i, cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="wz-field" style={{ marginTop: "1rem" }}>
        <label className="wz-label">Agregar sección</label>
        <div className="wz-chips">
          {SECTION_TYPES.map((t) => (
            <button key={t.type} className="wz-chip" onClick={() => add(t.type)}>
              + {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 5 · Fotos ────────────────────────────────────────────────────────────────
interface DraftPhoto {
  _id: string;
  category: string;
  cloudflareId: string;
  thumbUrl: string;
  order: number;
}

export function StepPhotos({ d }: StepProps) {
  const { state, setState, token } = d;
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [target, setTarget] = useState<string>(ALL_CATEGORY);
  const [busy, setBusy] = useState(false);
  const [newCat, setNewCat] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const cats = state.categories;

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const rows = (await convexClient().query(api.photos.listDraftPhotos, {
        draftToken: token,
      })) as DraftPhoto[];
      setPhotos(rows);
    } catch (e) {
      console.error("[photos] listar falló:", e);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addCategory = () => {
    const name = slugifyCouple(newCat); // reutiliza el slugify para normalizar
    if (!name || cats.includes(name)) return;
    setState((s) => ({ ...s, categories: [...s.categories, name] }));
    setTarget(name);
    setNewCat("");
  };

  const upload = async (files: FileList | null) => {
    if (!files || !files.length || !token) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        // 1) URL de subida directa (Cloudflare Images)
        const r1 = await fetch("/api/upload", { method: "POST" });
        if (!r1.ok) throw new Error("no se pudo iniciar la subida");
        const { id, uploadURL } = await r1.json();
        // 2) subir el archivo
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(uploadURL, { method: "POST", body: fd });
        if (!up.ok) throw new Error("la subida falló");
        // 3) registrar la foto en el draft
        await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ draftToken: token, category: target, id }),
        });
      }
      await refresh();
    } catch (e) {
      console.error("[photos] subir falló:", e);
      alert("No se pudieron subir algunas fotos. Revisá la conexión e intentá de nuevo.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const recategorize = async (id: string, category: string) => {
    await convexClient().mutation(api.photos.setCategory, { id: id as any, category });
    await refresh();
  };
  const removePhoto = async (id: string) => {
    await convexClient().mutation(api.photos.deleteDraftPhoto, { id: id as any });
    await refresh();
  };

  return (
    <div>
      <Head
        kicker="Paso 5"
        title="Sus fotos"
        sub="Subí las fotos. Las que no categorices caen en «Todas» y las movés después."
      />

      <Field label="Nueva categoría" hint="una carpeta = un momento (ej. bariloche)">
        <div className="wz-row">
          <input
            className="wz-input"
            value={newCat}
            placeholder="bariloche"
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
          />
          <button className="wz-btn ghost" style={{ flex: "0 0 auto" }} onClick={addCategory}>
            Agregar
          </button>
        </div>
      </Field>

      <Field label="Subir a" hint="elegí dónde caen las próximas fotos">
        <select
          className="wz-select"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          <option value={ALL_CATEGORY}>Todas (sin categorizar)</option>
          {cats
            .filter((c) => c !== ALL_CATEGORY)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>
      </Field>

      <div className="wz-drop" onClick={() => fileRef.current?.click()}>
        {busy ? "Subiendo…" : "＋ Elegí o arrastrá tus fotos"}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {photos.length > 0 && (
        <div className="wz-photos">
          {photos.map((p) => (
            <div className="wz-photo" key={p._id}>
              <img src={p.thumbUrl} alt="" loading="lazy" />
              <button className="x" onClick={() => removePhoto(p._id)} aria-label="Quitar">
                ✕
              </button>
              <select
                value={p.category}
                onChange={(e) => recategorize(p._id, e.target.value)}
              >
                <option value={ALL_CATEGORY}>Todas</option>
                {cats
                  .filter((c) => c !== ALL_CATEGORY)
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>
      )}
      <p className="wz-hint" style={{ marginTop: "0.8rem" }}>
        {photos.length} foto{photos.length === 1 ? "" : "s"} subida
        {photos.length === 1 ? "" : "s"}.
      </p>
    </div>
  );
}

// ── 6 · Música + video ───────────────────────────────────────────────────────
export function StepMedia({ d }: StepProps) {
  const { state, setState } = d;
  const setMusic = (patch: Partial<typeof state.music>) =>
    setState((s) => ({ ...s, music: { ...s.music, ...patch } }));
  const setVideo = (patch: Partial<typeof state.video>) =>
    setState((s) => ({ ...s, video: { ...s.video, ...patch } }));

  return (
    <div>
      <Head
        kicker="Paso 6"
        title="Música y video"
        sub="Una canción de fondo y, si querés, un video suyo en lugar del TikTok."
      />
      <Field label="Canción">
        <select
          className="wz-select"
          value={state.music.mode}
          onChange={(e) => setMusic({ mode: e.target.value as typeof state.music.mode })}
        >
          <option value="library">De la librería (con licencia)</option>
          <option value="upload">Subir mi mp3</option>
          <option value="none">Sin música</option>
        </select>
      </Field>

      <Field label="Video">
        <select
          className="wz-select"
          value={state.video.mode}
          onChange={(e) => setVideo({ mode: e.target.value as typeof state.video.mode })}
        >
          <option value="none">Ninguno</option>
          <option value="tiktok">Embeber un TikTok</option>
          <option value="upload">Subir mi video</option>
        </select>
      </Field>

      {state.video.mode === "tiktok" && (
        <Field label="Link del TikTok">
          <input
            className="wz-input"
            value={state.video.url ?? ""}
            placeholder="https://www.tiktok.com/@…/video/123…"
            onChange={(e) => {
              const url = e.target.value;
              const m = url.match(/video\/(\d+)/);
              setVideo({ url, videoId: m?.[1] ?? "" });
            }}
          />
        </Field>
      )}
      <Field label="Epígrafe del video" hint="opcional">
        <input
          className="wz-input"
          value={state.video.caption}
          onChange={(e) => setVideo({ caption: e.target.value })}
        />
      </Field>
    </div>
  );
}

// ── 7 · Paleta ───────────────────────────────────────────────────────────────
export function StepPalette({ d }: StepProps) {
  const { state, setState } = d;
  const ids = Object.keys(palettes) as PaletteId[];
  return (
    <div>
      <Head kicker="Paso 7" title="Colores" sub="Elegí la paleta. Podés cambiarla cuando quieras." />
      <div className="wz-palettes">
        {ids.map((id) => {
          const p = palettes[id];
          return (
            <div
              key={id}
              className={`wz-pal ${state.palette === id ? "on" : ""}`}
              onClick={() => setState((s) => ({ ...s, palette: id }))}
            >
              <div
                className="wz-swatch"
                style={{
                  background: `linear-gradient(135deg, ${p.canvas}, ${p.accentStrong})`,
                }}
              />
              {paletteLabels[id]}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 8 · Dominio + email ──────────────────────────────────────────────────────
export function StepDomain({ d }: StepProps) {
  const { state, meta, setMeta } = d;
  const suggestion = slugifyCouple(state.couple || "nosotros");
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "amooor.com";
  return (
    <div>
      <Head
        kicker="Paso 8"
        title="Tu dirección"
        sub="Tu sitio vive en un subdominio gratis. Un .love propio es un extra."
      />
      <Field label="Subdominio" hint={`quedará como ${suggestion}.${appDomain}`}>
        <input
          className="wz-input"
          value={meta.subdomain ?? suggestion}
          onChange={(e) => setMeta({ subdomain: slugifyCouple(e.target.value) })}
        />
      </Field>
      <Field label="¿Querés un .love propio?" hint="upsell — lo conectamos después de pagar">
        <input
          className="wz-input"
          value={meta.domainWish ?? ""}
          placeholder="nosotros.love"
          onChange={(e) => setMeta({ domainWish: e.target.value })}
        />
      </Field>
      <Field label="Tu email" hint="para mandarte el sitio y el recibo">
        <input
          className="wz-input"
          type="email"
          value={meta.email ?? ""}
          placeholder="vos@email.com"
          onChange={(e) => setMeta({ email: e.target.value })}
        />
      </Field>
    </div>
  );
}
