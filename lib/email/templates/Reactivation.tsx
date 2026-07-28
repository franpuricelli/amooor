// ─────────────────────────────────────────────────────────────────────────────
//  Reactivation.tsx — email de draft abandonado. Se envía días después si el
//  usuario no completó el checkout. Tono cálido, sin presión. Sin env vars propios.
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
  Preview,
} from "@react-email/components";

export interface ReactivationProps {
  name?: string;
  resumeUrl: string;
}

const PINK = "#ff5c99";
const BG = "#fff5f9";
const DARK = "#1c0512";
const MUTED = "#8a6070";

export default function Reactivation({ name, resumeUrl }: ReactivationProps) {
  const greeting = name ? `${name}, te estábamos esperando` : "Te estábamos esperando";

  return (
    <Html lang="es">
      <Head />
      <Preview>Tu sitio de aniversario está esperándote — ¡ya falta poco!</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Encabezado */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>amooor</Text>
          </Section>

          {/* Cuerpo */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>{greeting} 🌹</Heading>
            <Text style={textStyle}>
              Empezaste a armar algo muy especial, y todavía está guardado
              esperándote. Tu historia, tus fotos, todo lo que completaste sigue
              ahí.
            </Text>
            <Text style={textStyle}>
              Solo te falta un paso más para tener tu sitio de aniversario listo
              para compartir. ¿Lo terminamos juntos?
            </Text>

            <Section style={btnWrapStyle}>
              <Button href={resumeUrl} style={buttonStyle}>
                Terminar mi sitio →
              </Button>
            </Section>

            <Text style={mutedStyle}>
              Tu progreso se guarda automáticamente. El enlace te lleva
              exactamente donde lo dejaste.
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>amooor · hecho con amor</Text>
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

const contentStyle: React.CSSProperties = {
  padding: "32px 32px 24px",
};

const headingStyle: React.CSSProperties = {
  color: DARK,
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
  lineHeight: "1.3",
};

const textStyle: React.CSSProperties = {
  color: DARK,
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 14px",
};

const btnWrapStyle: React.CSSProperties = {
  textAlign: "center",
  margin: "28px 0",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: PINK,
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "14px 28px",
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
