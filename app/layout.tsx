import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Purivi",
  description: "Nuestra historia, en fotos. Feliz aniversario ❤️",
  openGraph: {
    title: "Purivi ❤️",
    description: "Nuestra historia, en fotos.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6fae",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
