"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  ProfileMenu.tsx — perfil abajo a la izquierda para acceder al menú. Sin login
//  todavía: muestra el estado "Iniciar sesión" (botón del mismo color que el
//  fondo, con contorno, para que se identifique). Al tocar abre un menú con
//  Iniciar sesión (stub, auth = futuro) + links (Precios, Términos, Privacidad).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

function SignInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 8l4 4-4 4M14 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProfileMenu({
  registerOpen,
}: {
  registerOpen?: (fn: () => void) => void;
}) {
  const [open, setOpen] = useState(false);
  const [soon, setSoon] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Deja que el botón "Guardar" del header abra este menú (login = futuro).
  useEffect(() => {
    registerOpen?.(() => {
      setOpen(true);
      setSoon(true);
    });
  }, [registerOpen]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="ch-profile" ref={ref}>
      {open && (
        <div className="ch-profile-menu" role="menu">
          <div className="ch-profile-head">
            <span className="ch-profile-avatar">
              <SignInIcon />
            </span>
            <div>
              <div className="ch-profile-name">Invitado</div>
              <div className="ch-profile-sub">No iniciaste sesión</div>
            </div>
          </div>

          <button
            type="button"
            className="ch-profile-item primary"
            onClick={() => setSoon(true)}
          >
            <SignInIcon />
            Iniciar sesión
          </button>
          {soon && (
            <p className="ch-profile-soon">
              Pronto vas a poder guardar tu cuenta y volver a tu historia.
            </p>
          )}

          <a className="ch-profile-item" href="/#precios">
            Precios
          </a>
        </div>
      )}

      <button
        type="button"
        className="ch-profile-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ch-profile-avatar sm">
          <SignInIcon />
        </span>
        <span className="ch-profile-btn-label">Iniciar sesión</span>
      </button>
    </div>
  );
}
