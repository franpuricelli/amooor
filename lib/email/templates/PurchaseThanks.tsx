// ─────────────────────────────────────────────────────────────────────────────
//  PurchaseThanks.tsx — confirmación de compra. Se envía al momento de recibir
//  el pago. Informa que el sitio está siendo generado. Sin env vars propios.
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
  Hr,
  Preview,
} from "@react-email/components";

export interface PurchaseThanksProps {
  name?: string;
  planName: string;
  amountUsd: number;
}

const PINK = "#ff5c99";
const BG = "#fff5f9";
const DARK = "#1c0512";
const MUTED = "#8a6070";
const GREEN = "#22b183";

export default function PurchaseThanks({
  name,
  planName,
  amountUsd,
}: PurchaseThanksProps) {
  const greeting = name ? `¡Gracias, ${name}!` : "¡Gracias por tu compra!";

  return (
    <Html lang="es">
      <Head />
      <Preview>Pago confirmado — tu sitio de aniversario está en camino ✨</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Encabezado */}
          <Section style={headerStyle}>
            <Text style={brandStyle}>amooor</Text>
          </Section>

          {/* Cuerpo */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>{greeting} 🎉</Heading>
            <Text style={textStyle}>
              Tu pago fue procesado con éxito. Ya estamos generando tu sitio de
              aniversario — esto puede tomar solo unos minutos.
            </Text>

            {/* Resumen del pedido */}
            <Section style={summaryBoxStyle}>
              <Text style={summaryLabelStyle}>Resumen del pedido</Text>
              <Section style={summaryRowStyle}>
                <Text style={summaryKeyStyle}>Plan</Text>
                <Text style={summaryValStyle}>{planName}</Text>
              </Section>
              <Section style={summaryRowStyle}>
                <Text style={summaryKeyStyle}>Total</Text>
                <Text style={summaryValStyle}>US$ {amountUsd.toFixed(2)}</Text>
              </Section>
              <Section style={summaryRowStyle}>
                <Text style={summaryKeyStyle}>Estado</Text>
                <Text style={{ ...summaryValStyle, color: GREEN, fontWeight: "600" }}>
                  Pagado ✓
                </Text>
              </Section>
            </Section>

            <Text style={textStyle}>
              Cuando tu sitio esté listo te enviamos otro email con el enlace
              para verlo. Si tenés alguna pregunta, respondé este correo y te
              ayudamos enseguida.
            </Text>

            <Text style={mutedStyle}>
              Guardá este email como comprobante de tu compra.
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

const summaryBoxStyle: React.CSSProperties = {
  backgroundColor: "#fff0f6",
  borderRadius: "12px",
  padding: "16px 20px",
  margin: "20px 0",
};

const summaryLabelStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  margin: "0 0 10px",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  margin: "4px 0",
};

const summaryKeyStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: "14px",
  margin: 0,
};

const summaryValStyle: React.CSSProperties = {
  color: DARK,
  fontSize: "14px",
  fontWeight: "500",
  margin: 0,
};

const mutedStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "16px 0 0",
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
