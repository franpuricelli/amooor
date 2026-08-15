"use client";

// ─────────────────────────────────────────────────────────────────────────────
//  ProfileMenu.tsx — perfil abajo a la izquierda para acceder al menú.
//  Signed-out: el botón "Iniciar sesión" (y el "Guardar" del header, vía
//  registerOpen) abre el modal de Clerk. Signed-in: muestra nombre/email y un
//  ítem para cerrar sesión. Se conserva el markup/clases .ch-profile* para que el
//  estilo quede intacto. La vinculación de borradores al usuario queda fuera de
//  alcance en este pase.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useUser, useClerk, SignOutButton } from "@clerk/nextjs";

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
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // El botón "Guardar" del header abre el modal de Clerk (login = guardar la
  // cuenta). Si ya hay sesión, no hay nada que hacer: openSignIn es inocuo.
  useEffect(() => {
    registerOpen?.(() => {
      if (isSignedIn) setOpen(true);
      else openSignIn();
    });
  }, [registerOpen, isSignedIn, openSignIn]);

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

  const name = user?.fullName || user?.username || "Tu cuenta";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const avatarUrl = user?.imageUrl;

  return (
    <div className="ch-profile" ref={ref}>
      {open && (
        <div className="ch-profile-menu" role="menu">
          <div className="ch-profile-head">
            <span className="ch-profile-avatar">
              {isSignedIn && avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" width={32} height={32} />
              ) : (
                <SignInIcon />
              )}
            </span>
            <div>
              <div className="ch-profile-name">{isSignedIn ? name : "Invitado"}</div>
              <div className="ch-profile-sub">
                {isSignedIn ? email : "No iniciaste sesión"}
              </div>
            </div>
          </div>

          {isSignedIn ? (
            <SignOutButton>
              <button type="button" className="ch-profile-item">
                <SignInIcon />
                Cerrar sesión
              </button>
            </SignOutButton>
          ) : (
            <button
              type="button"
              className="ch-profile-item primary"
              onClick={() => {
                setOpen(false);
                openSignIn();
              }}
            >
              <SignInIcon />
              Iniciar sesión
            </button>
          )}

          <a className="ch-profile-item" href="/#precios">
            Precios
          </a>
        </div>
      )}

      <button
        type="button"
        className={`ch-profile-btn${isSignedIn ? " avatar-only" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isSignedIn ? name : undefined}
        onClick={() => {
          if (isSignedIn) setOpen((o) => !o);
          else openSignIn();
        }}
      >
        <span className="ch-profile-avatar sm">
          {isSignedIn && avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" width={28} height={28} />
          ) : (
            <SignInIcon />
          )}
        </span>
        {!isSignedIn && (
          <span className="ch-profile-btn-label">Iniciar sesión</span>
        )}
      </button>
    </div>
  );
}
