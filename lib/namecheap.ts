// ─────────────────────────────────────────────────────────────────────────────
//  namecheap.ts — STUB del cliente para la API XML de Namecheap (WP-4).
//
//  Este archivo es un placeholder documentado. Cuando se tengan las credenciales,
//  reemplazar los `throw` por los llamados reales a la API XML de Namecheap.
//
//  Env vars necesarias (ninguna disponible aún):
//    NAMECHEAP_API_USER  — nombre de usuario de la cuenta Namecheap
//    NAMECHEAP_API_KEY   — API key generada en el panel de Namecheap
//    NAMECHEAP_CLIENT_IP — IP pública del servidor (debe estar en la whitelist)
//
//  Endpoint de la API: https://api.namecheap.com/xml.response
//  Documentación:      https://www.namecheap.com/support/api/intro/
//
//  Todos los métodos de la API son GET con parámetros en query string.
//  La respuesta es XML; se parsea con DOMParser (browser) o un parser XML (server).
//  Formato de respuesta: <ApiResponse Status="OK|ERROR">...</ApiResponse>
// ─────────────────────────────────────────────────────────────────────────────

/** Endpoint de producción de la API XML de Namecheap. */
const NC_ENDPOINT = "https://api.namecheap.com/xml.response";

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface DomainAvailability {
  domain: string;
  available: boolean;
  isPremiumName: boolean;
  premiumRegistrationPrice?: number;
}

export interface TldPricing {
  tld: string;
  /** Precio de registro por año (USD). */
  registrationPrice: number;
  /** Precio de renovación por año (USD). */
  renewalPrice: number;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string; // código ISO 2 letras, ej: "AR"
  phone: string;   // formato +54.91155556666
  emailAddress: string;
}

export interface PurchaseResult {
  domain: string;
  orderId: number;
  transactionId: number;
  chargedAmount: number;
}

// ── Validación de credenciales ────────────────────────────────────────────────

function requireCredentials(): { apiUser: string; apiKey: string; clientIp: string } {
  const apiUser = process.env.NAMECHEAP_API_USER;
  const apiKey = process.env.NAMECHEAP_API_KEY;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP;

  if (!apiUser || !apiKey || !clientIp) {
    throw new Error(
      "Namecheap no configurado: falta NAMECHEAP_API_USER/API_KEY/CLIENT_IP"
    );
  }

  return { apiUser, apiKey, clientIp };
}

// ── Funciones stub ────────────────────────────────────────────────────────────

/**
 * Verifica si un dominio está disponible para registrar.
 *
 * API real: namecheap.domains.check
 * GET https://api.namecheap.com/xml.response
 *   ?ApiUser=xxx&ApiKey=xxx&UserName=xxx&ClientIp=xxx
 *   &Command=namecheap.domains.check
 *   &DomainList=ejemplo.love
 *
 * Respuesta XML: <DomainCheckResult Domain="ejemplo.love" Available="true" />
 */
export async function checkAvailability(
  domain: string
): Promise<DomainAvailability> {
  requireCredentials();
  // TODO: implementar la llamada real cuando se tengan las credenciales.
  // Pasos:
  //   1. Construir URL con parámetros (incluyendo Command=namecheap.domains.check)
  //   2. fetch(url) → obtener XML
  //   3. Parsear <DomainCheckResult Available="true|false" IsPremiumName="true|false" />
  //   4. Devolver DomainAvailability
  throw new Error("Namecheap no configurado: falta NAMECHEAP_API_USER/API_KEY/CLIENT_IP");
}

/**
 * Obtiene el precio de registro/renovación para un TLD.
 *
 * API real: namecheap.users.getPricing
 * GET https://api.namecheap.com/xml.response
 *   ?ApiUser=xxx&ApiKey=xxx&UserName=xxx&ClientIp=xxx
 *   &Command=namecheap.users.getPricing
 *   &ProductType=DOMAIN
 *   &ActionName=REGISTER
 *   &ProductName=.love
 *
 * Respuesta XML: <ProductPrice Price="xx.xx" RegularPrice="xx.xx" ... />
 */
export async function getPricing(tld = ".love"): Promise<TldPricing> {
  requireCredentials();
  // TODO: implementar cuando se tengan las credenciales.
  // Pasos:
  //   1. Llamar namecheap.users.getPricing con ProductType=DOMAIN, ProductName=tld
  //   2. Parsear <ProductPrice Price="xx.xx" /> para REGISTER y RENEW
  //   3. Devolver TldPricing
  throw new Error("Namecheap no configurado: falta NAMECHEAP_API_USER/API_KEY/CLIENT_IP");
}

/**
 * Registra (compra) un dominio en Namecheap con los datos de contacto dados.
 *
 * API real: namecheap.domains.create
 * GET https://api.namecheap.com/xml.response
 *   ?ApiUser=xxx&ApiKey=xxx&UserName=xxx&ClientIp=xxx
 *   &Command=namecheap.domains.create
 *   &DomainName=ejemplo.love
 *   &Years=1
 *   &RegistrantFirstName=...&RegistrantLastName=...&RegistrantAddress1=...
 *   &RegistrantCity=...&RegistrantStateProvince=...&RegistrantPostalCode=...
 *   &RegistrantCountry=...&RegistrantPhone=...&RegistrantEmailAddress=...
 *   (mismos parámetros para Tech, Admin, AuxBilling)
 *
 * Respuesta XML: <DomainCreateResult Domain="ejemplo.love" Registered="true"
 *                  OrderID="xxx" TransactionID="xxx" ChargedAmount="xx.xx" />
 */
export async function purchase(
  domain: string,
  contact: ContactInfo
): Promise<PurchaseResult> {
  requireCredentials();
  // TODO: implementar cuando se tengan las credenciales.
  // Pasos:
  //   1. Construir la URL con todos los parámetros de contacto (x4: Registrant/Tech/Admin/AuxBilling)
  //   2. fetch(url) → obtener XML
  //   3. Verificar Status="OK" en <ApiResponse>
  //   4. Parsear <DomainCreateResult Registered="true" OrderID="..." ... />
  //   5. Devolver PurchaseResult
  void domain; void contact;
  throw new Error("Namecheap no configurado: falta NAMECHEAP_API_USER/API_KEY/CLIENT_IP");
}

/**
 * Configura los DNS del dominio para apuntar a Vercel (nameservers de Namecheap
 * + registros A/CNAME, o directamente los nameservers de Vercel si se usan).
 *
 * API real: namecheap.domains.dns.setHosts
 * GET https://api.namecheap.com/xml.response
 *   ?ApiUser=xxx&ApiKey=xxx&UserName=xxx&ClientIp=xxx
 *   &Command=namecheap.domains.dns.setHosts
 *   &SLD=ejemplo&TLD=love
 *   &HostName1=@&RecordType1=A&Address1=76.76.21.21&TTL1=1800
 *   &HostName2=www&RecordType2=CNAME&Address2=cname.vercel-dns.com&TTL2=1800
 *
 * Nota: Si el dominio usa nameservers personalizados (ej: ns1.vercel-dns.com),
 * se usa namecheap.domains.dns.setCustom en cambio.
 *
 * Respuesta XML: <DnsSetHostsResult Domain="ejemplo.love" IsSuccess="true" />
 */
export async function setDnsToVercel(domain: string): Promise<void> {
  requireCredentials();
  // TODO: implementar cuando se tengan las credenciales.
  // Pasos:
  //   1. Separar SLD (ejemplo) y TLD (love) del dominio
  //   2. Llamar namecheap.domains.dns.setHosts con los registros A y CNAME de Vercel
  //   3. Verificar IsSuccess="true" en la respuesta
  void domain;
  throw new Error("Namecheap no configurado: falta NAMECHEAP_API_USER/API_KEY/CLIENT_IP");
}
