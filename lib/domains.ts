// ─────────────────────────────────────────────────────────────────────────────
//  domains.ts — cliente para la Vercel Domains API (WP-4: dominios `.love`).
//
//  Env vars requeridas:
//    VERCEL_TOKEN       — Bearer token de la cuenta Vercel
//    VERCEL_PROJECT_ID  — ID del proyecto (prj_xxx)
//    VERCEL_TEAM_ID     — (opcional) ID del equipo; se adjunta como ?teamId=...
//
//  Documentación: https://vercel.com/docs/rest-api/endpoints/domains
// ─────────────────────────────────────────────────────────────────────────────

const BASE = "https://api.vercel.com";

/** Valida y devuelve las credenciales requeridas, o lanza error claro. */
function getCredentials(): {
  token: string;
  projectId: string;
  teamId: string | undefined;
} {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token) throw new Error("Falta VERCEL_TOKEN en las variables de entorno.");
  if (!projectId)
    throw new Error("Falta VERCEL_PROJECT_ID en las variables de entorno.");
  return { token, projectId, teamId: process.env.VERCEL_TEAM_ID || undefined };
}

/** Construye la query string con teamId si está disponible. */
function teamParam(teamId: string | undefined, first = true): string {
  if (!teamId) return "";
  return `${first ? "?" : "&"}teamId=${encodeURIComponent(teamId)}`;
}

/** Headers comunes para todas las requests. */
function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

// ── Tipos de respuesta (shapes reales de la API de Vercel) ───────────────────

export interface VercelDomainResponse {
  name: string;
  apexName?: string;
  projectId?: string;
  redirect?: string;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  verified?: boolean;
  verification?: VercelDomainVerification[];
}

export interface VercelDomainVerification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export interface VercelDomainConfigResponse {
  configuredBy?: string | null;
  acceptedChallenges?: string[];
  misconfigured: boolean;
  /** Registro CNAME recomendado (para subdominios). */
  cname?: string;
  /** Registro A recomendado (para apex). */
  aValue?: string;
}

export interface VercelDomainVerifyResponse {
  name: string;
  verified: boolean;
  verification?: VercelDomainVerification[];
}

export interface DnsInstructions {
  /** Para subdominios (ej: puri.love → CNAME) */
  cname: { type: "CNAME"; host: string; value: string };
  /** Para dominios apex (ej: puriivi.love → A) */
  apex: { type: "A"; host: string; value: string };
}

// ── Funciones públicas ────────────────────────────────────────────────────────

/**
 * Agrega un dominio personalizado al proyecto Vercel.
 * POST /v10/projects/{projectId}/domains
 * Trata el 409 (dominio ya existe) como éxito.
 */
export async function addDomain(domain: string): Promise<VercelDomainResponse> {
  const { token, projectId, teamId } = getCredentials();

  const res = await fetch(
    `${BASE}/v10/projects/${encodeURIComponent(projectId)}/domains${teamParam(teamId)}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ name: domain }),
    }
  );

  // 409 = el dominio ya estaba agregado → lo tratamos como éxito
  if (res.status === 409) {
    return { name: domain, verified: false };
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel addDomain falló (${res.status}): ${body}`);
  }

  return res.json() as Promise<VercelDomainResponse>;
}

/**
 * Obtiene la configuración DNS actual del dominio y si está bien apuntado.
 * GET /v6/domains/{domain}/config
 */
export async function getDomainConfig(
  domain: string
): Promise<VercelDomainConfigResponse> {
  const { token, teamId } = getCredentials();

  const res = await fetch(
    `${BASE}/v6/domains/${encodeURIComponent(domain)}/config${teamParam(teamId)}`,
    { headers: authHeaders(token) }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel getDomainConfig falló (${res.status}): ${body}`);
  }

  return res.json() as Promise<VercelDomainConfigResponse>;
}

/**
 * Dispara la verificación del dominio contra los DNS actuales.
 * POST /v9/projects/{projectId}/domains/{domain}/verify
 */
export async function verifyDomain(
  domain: string
): Promise<VercelDomainVerifyResponse> {
  const { token, projectId, teamId } = getCredentials();

  const res = await fetch(
    `${BASE}/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}/verify${teamParam(teamId)}`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({}),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel verifyDomain falló (${res.status}): ${body}`);
  }

  return res.json() as Promise<VercelDomainVerifyResponse>;
}

/**
 * Elimina un dominio del proyecto Vercel.
 * DELETE /v9/projects/{projectId}/domains/{domain}
 */
export async function removeDomain(domain: string): Promise<void> {
  const { token, projectId, teamId } = getCredentials();

  const res = await fetch(
    `${BASE}/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}${teamParam(teamId)}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Vercel removeDomain falló (${res.status}): ${body}`);
  }
}

/**
 * Devuelve los registros DNS estándar que el usuario debe configurar
 * en su registrador para apuntar su dominio a Vercel.
 */
export function vercelDnsInstructions(): DnsInstructions {
  return {
    cname: {
      type: "CNAME",
      host: "www (o el subdominio elegido)",
      value: "cname.vercel-dns.com",
    },
    apex: {
      type: "A",
      host: "@ (dominio raíz)",
      value: "76.76.21.21",
    },
  };
}
