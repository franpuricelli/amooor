"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  use-draft.ts — el estado del wizard con persistencia en Convex (WP-3).
//  Identidad = un token uuid en localStorage (login opcional). Autosave con
//  debounce a `drafts.save`. Rehidrata el draft guardado al volver.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex-browser";
import {
  defaultWizardState,
  parseWizardState,
  type WizardState,
} from "@/lib/draft";
import type { PlanId } from "@/lib/pricing";

const TOKEN_KEY = "amooor_draft_token";

function ensureToken(): string {
  if (typeof window === "undefined") return "";
  let t = window.localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = crypto.randomUUID();
    window.localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

export interface DraftMeta {
  email?: string;
  plan?: PlanId;
  subdomain?: string;
  domainWish?: string;
  lastStep?: number;
}

export interface UseDraft {
  token: string;
  ready: boolean;
  state: WizardState;
  meta: DraftMeta;
  setState: (updater: (s: WizardState) => WizardState) => void;
  setMeta: (patch: Partial<DraftMeta>) => void;
  saveNow: () => Promise<void>;
  saving: boolean;
}

export function useDraft(): UseDraft {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [state, setStateRaw] = useState<WizardState>(defaultWizardState);
  const [meta, setMetaRaw] = useState<DraftMeta>({});
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  // ── carga inicial ───────────────────────────────────────────────────────────
  useEffect(() => {
    const t = ensureToken();
    setToken(t);
    (async () => {
      try {
        const c = convexClient();
        const draft = await c.query(api.drafts.get, { token: t });
        if (draft?.answers && Object.keys(draft.answers).length) {
          setStateRaw(parseWizardState(draft.answers));
        }
        if (draft) {
          setMetaRaw({
            email: draft.email ?? undefined,
            plan: (draft.plan as PlanId) ?? undefined,
            subdomain: draft.subdomain ?? undefined,
            domainWish: draft.domainWish ?? undefined,
            lastStep: draft.lastStep ?? 0,
          });
        }
      } catch (e) {
        console.error("[useDraft] carga falló:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(
    async (s: WizardState, m: DraftMeta) => {
      if (!token) return;
      setSaving(true);
      try {
        await convexClient().mutation(api.drafts.save, {
          token,
          answers: s,
          theme: { palette: s.palette },
          email: m.email,
          plan: m.plan,
          subdomain: m.subdomain,
          domainWish: m.domainWish,
          lastStep: m.lastStep,
          status: "editing",
        });
      } catch (e) {
        console.error("[useDraft] guardado falló:", e);
      } finally {
        setSaving(false);
      }
    },
    [token]
  );

  // ── autosave con debounce ────────────────────────────────────────────────────
  const schedule = useCallback(
    (s: WizardState, m: DraftMeta) => {
      dirty.current = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        dirty.current = false;
        void persist(s, m);
      }, 800);
    },
    [persist]
  );

  const setState = useCallback(
    (updater: (s: WizardState) => WizardState) => {
      setStateRaw((prev) => {
        const next = updater(prev);
        schedule(next, meta);
        return next;
      });
    },
    [schedule, meta]
  );

  const setMeta = useCallback(
    (patch: Partial<DraftMeta>) => {
      setMetaRaw((prev) => {
        const next = { ...prev, ...patch };
        schedule(state, next);
        return next;
      });
    },
    [schedule, state]
  );

  const saveNow = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await persist(state, meta);
  }, [persist, state, meta]);

  return { token, ready, state, meta, setState, setMeta, saveNow, saving };
}
