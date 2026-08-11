"use client";

// i18n.tsx — tiny language layer: a provider, a hook, a helper for bilingual
// content fields, and the minimal top-right ES/EN switch.
// i18n.tsx — capa de idioma mínima: provider, hook, helper para campos de
// contenido bilingües, y el switch ES/EN minimalista de arriba a la derecha.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { STRINGS, type Dict, type Lang } from "@/lib/strings";

// A content field can be one string (same in both languages, e.g. a name) or a
// { en, es } pair. `pick` / `tr` resolve it for the active language.
export type Bi = string | { en: string; es: string };

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  tr: (v: Bi) => string;
}

const Ctx = createContext<I18nValue | null>(null);

// Default language. Change to "en" to make English the default.
const DEFAULT_LANG: Lang = "es";

export function pick(v: Bi, lang: Lang): string {
  return typeof v === "string" ? v : v[lang];
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Same value on server and first client render (no hydration mismatch); the
  // saved preference is applied right after mount.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang");
      if (saved === "en" || saved === "es") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  }, []);

  const tr = useCallback((v: Bi) => pick(v, lang), [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang, t: STRINGS[lang], tr }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Minimal ES/EN toggle pinned to the top-right corner. */
export function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch glass" role="group" aria-label="Language · Idioma">
      <button
        type="button"
        className={lang === "es" ? "on" : ""}
        aria-pressed={lang === "es"}
        onClick={() => setLang("es")}
      >
        ES
      </button>
      <span className="lang-sep" aria-hidden>
        /
      </span>
      <button
        type="button"
        className={lang === "en" ? "on" : ""}
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
