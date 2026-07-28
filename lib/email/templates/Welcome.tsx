// ─────────────────────────────────────────────────────────────────────────────
//  Welcome.tsx — email de bienvenida / activación. Se envía cuando el usuario
//  arranca un draft. CTA: "Seguí armando tu sitio". Sin env vars propios.
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

export interface WelcomeProps {
  name?: string;
  resumeUrl: string;
}

const PINK = "#ff5c99";
const BG = "#fff5f9";
const DARK = "#1c0512";
const MUTED = "#8a6070";

export default function Welcome({ name, resumeUrl }: WelcomeProps) {
  const greeting = name ? `Hola, ${name} 💕` : "Hola 💕";

  return (
    <Html lang="es">
      <Head />
      <Preview>¡Empezaste a armar tu sitio de aniversario! Seguí desde donde dejaste.</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Encabezado */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>amooor</Text>
          </Section>

          {/* Cuerpo */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>{greeting}</Heading>
            <Text style={textStyle}>
              ¡Qué lindo! Empezaste a crear tu sitio de aniversario en amooor.
              Guardamos todo tu avance para que puedas retomarlo cuando quieras.
            </Text>
            <Text style={textStyle}>
              Tu historia merece un lugar especial en internet. Seguí completando
              los detalles — fotos, fechas, tu música — y en minutos tenés un
              sitio único para compartir con quien más querés.
            </Text>

            <Section style={btnWrapStyle}>
              <Button href={resumeUrl} style={buttonStyle}>
                Seguí armando tu sitio →
              </Button>
            </Section>

            <Text style={mutedStyle}>
              El enlace funciona en cualquier dispositivo. Tu progreso está
              guardado y te esperará.
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

// ── estilos inline (React Email los necesita así) ────────────────────────────

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
