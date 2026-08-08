// ─────────────────────────────────────────────────────────────────────────────
//  SiteReady.tsx — "Tu sitio está listo". Se envía cuando finalizeSite() termina
//  exitosamente. Gran CTA para que la pareja visite su sitio. Sin env vars propios.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Hr,
  Link,
  Preview,
} from "@react-email/components";

export interface SiteReadyProps {
  name?: string;
  siteUrl: string;
  couple: string;
}

const PINK = "#ff5c99";
const BG = "#fff5f9";
const DARK = "#1c0512";
const MUTED = "#8a6070";

export default function SiteReady({ name, siteUrl, couple }: SiteReadyProps) {
  const greeting = name ? `${name}, ¡ya está!` : "¡Ya está listo!";

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu sitio de aniversario está en línea — ¡compartílo con quien más querés!</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Encabezado */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>amooor</Text>
          </Section>

          {/* Hero */}
          <Section style={heroStyle}>
            <Text style={heroEmojiStyle}>🎊</Text>
            <Heading style={heroHeadingStyle}>{greeting}</Heading>
            <Text style={heroSubStyle}>
              El sitio de <strong>{couple}</strong> está en línea y listo para
              ser compartido.
            </Text>
          </Section>

          {/* Cuerpo */}
          <Section style={contentStyle}>
            <Text style={textStyle}>
              Crearon algo hermoso. Un lugar en internet que va a guardar su
              historia para siempre — fotos, recuerdos, las palabras que los
              definen.
            </Text>
            <Text style={textStyle}>
              Compartílo con quien más querés, ponelo en tu estado de Instagram
              o mandáselo de sorpresa. Es todo de ustedes.
            </Text>

            <Section style={btnWrapStyle}>
              <Button href={siteUrl} style={buttonStyle}>
                Ver nuestro sitio →
              </Button>
            </Section>

            <Text style={mutedStyle}>
              También podés acceder en cualquier momento desde:{" "}
              <Link href={siteUrl} style={linkStyle}>
                {siteUrl}
              </Link>
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>amooor · hecho con amooor</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── estilos inline ────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: BG,
  fontFamily: "'Georgia', serif",
  margin: 0,
  padding: "32px 16px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(255,92,153,0.10)",
};

const headerStyle: React.CSSProperties = {
  backgroundColor: PINK,
  padding: "24px 32px",
  textAlign: "center",
};

const brandStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.5px",
  margin: 0,
};

const heroStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #fff0f6 0%, #ffe8f2 100%)",
  padding: "32px 32px 24px",
  textAlign: "center",
};

const heroEmojiStyle: React.CSSProperties = {
  fontSize: "40px",
  margin: "0 0 8px",
  lineHeight: "1",
};

const heroHeadingStyle: React.CSSProperties = {
  color: DARK,
  fontSize: "26px",
  fontWeight: "700",
  margin: "0 0 8px",
  lineHeight: "1.2",
};

const heroSubStyle: React.CSSProperties = {
  color: "#6b3050",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  padding: "28px 32px 24px",
};

const textStyle: React.CSSProperties = {
  color: DARK,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 14px",
};

const btnWrapStyle: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0 20px",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: PINK,
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  padding: "16px 36px",
  borderRadius: "100px",
  textDecoration: "none",
  display: "inline-block",
};

const mutedStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0",
  textAlign: "center",
};

const linkStyle: React.CSSProperties = {
  color: PINK,
  textDecoration: "underline",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#f5dce8",
  margin: "0 32px",
};

const footerStyle: React.CSSProperties = {
  padding: "16px 32px 24px",
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: "12px",
  margin: 0,
};
