"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  use-conversation.ts — el estado del intake conversacional con persistencia en
//  Convex. Calcado de lib/use-draft.ts: MISMA identidad (`amooor_draft_token`),
//  autosave con debounce a `drafts.save`, rehidrata al volver. Guarda la
//  conversación y el plan en el MISMO draft → sobrevive refresh y deja el gancho
//  para el paywall futuro (que también lee ese draft).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { convexClient } from "@/lib/convex-browser";
import { parsePlan, type Plan } from "@/lib/plan";
import type { Activity, Attachment } from "@/lib/chat-format";
import type { Swatch } from "@/lib/palette-gen";

const TOKEN_KEY = "amooor_draft_token";
const CUSTOM_PAL_KEY = "amooor_custom_palettes";

export interface Message {
  role: "user" | "assistant";
  content: string;
  /** actividad del agente en ese turno (razonó, buscó, armó el plan) — display */
  activities?: Activity[];
  /** imágenes / archivos que el usuario adjuntó en su mensaje */
  attachments?: Attachment[];
  /** referencias (@objeto) que el usuario seleccionó — chips azules */
  refs?: string[];
}

function ensureToken(): string {
  if (typeof window === "undefined") return "";
  let t = window.localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = crypto.randomUUID();
    window.localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

function parseMessages(data: unknown): Message[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (m): m is Message =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .map((m) => ({
      role: m.role,
      content: m.content,
      ...(Array.isArray(m.activities) ? { activities: m.activities } : {}),
      ...(Array.isArray(m.attachments) ? { attachments: m.attachments } : {}),
      ...(Array.isArray(m.refs) ? { refs: m.refs } : {}),
    }));
}

function loadCustomPalettes(): Swatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_PAL_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export interface UseConversation {
  token: string;
  ready: boolean;
  messages: Message[];
  plan: Plan | null;
  palette: string;
  customPalettes: Swatch[];
  setMessages: (updater: (m: Message[]) => Message[]) => void;
  setPlan: (plan: Plan | null) => void;
  setPalette: (id: string) => void;
  addCustomPalette: (sw: Swatch) => void;
  saving: boolean;
}

export function useConversation(): UseConversation {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [messages, setMessagesRaw] = useState<Message[]>([]);
  const [plan, setPlanRaw] = useState<Plan | null>(null);
  const [palette, setPaletteRaw] = useState<string>("rosa");
  const [customPalettes, setCustomPalettes] = useState<Swatch[]>([]);
  const [saving, setSaving] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const planRef = useRef<Plan | null>(null);
  const paletteRef = useRef<string>("rosa");
  const tokenRef = useRef("");

  // ── carga inicial (rehidrata del draft) ──────────────────────────────────────
  useEffect(() => {
    const t = ensureToken();
    setToken(t);
    tokenRef.current = t;
    setCustomPalettes(loadCustomPalettes());
    (async () => {
      try {
        const draft = await convexClient().query(api.drafts.get, { token: t });
        if (draft?.conversation) {
          const msgs = parseMessages(draft.conversation);
          messagesRef.current = msgs;
          setMessagesRaw(msgs);
        }
        if (draft?.intakePlan) {
          const p = parsePlan(draft.intakePlan);
          planRef.current = p;
          setPlanRaw(p);
        }
        const pal = draft?.theme?.palette;
        if (typeof pal === "string" && pal) {
          paletteRef.current = pal;
          setPaletteRaw(pal);
        }
      } catch (e) {
        console.error("[useConversation] carga falló:", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async () => {
    const t = tokenRef.current;
    if (!t) return;
    setSaving(true);
    try {
      await convexClient().mutation(api.drafts.save, {
        token: t,
        conversation: messagesRef.current,
        intakePlan: planRef.current ?? undefined,
        theme: { palette: paletteRef.current },
        status: "editing",
      });
    } catch (e) {
      console.error("[useConversation] guardado falló:", e);
    } finally {
      setSaving(false);
    }
  }, []);

  const schedule = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void persist(), 800);
  }, [persist]);

  const setMessages = useCallback(
    (updater: (m: Message[]) => Message[]) => {
      setMessagesRaw((prev) => {
        const next = updater(prev);
        messagesRef.current = next;
        schedule();
        return next;
      });
    },
    [schedule]
  );

  const setPlan = useCallback(
    (p: Plan | null) => {
      planRef.current = p;
      setPlanRaw(p);
      schedule();
    },
    [schedule]
  );

  const setPalette = useCallback(
    (id: string) => {
      paletteRef.current = id;
      setPaletteRaw(id);
      schedule();
    },
    [schedule]
  );

  const addCustomPalette = useCallback((sw: Swatch) => {
    setCustomPalettes((prev) => {
      const next = [...prev.filter((p) => p.id !== sw.id), sw];
      try {
        window.localStorage.setItem(CUSTOM_PAL_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return {
    token,
    ready,
    messages,
    plan,
    palette,
    customPalettes,
    setMessages,
    setPlan,
    setPalette,
    addCustomPalette,
    saving,
  };
}
