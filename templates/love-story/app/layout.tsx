import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import { config } from "@/lib/config";
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
  title: config.names.couple,
  description: "Our story, in photos · Nuestra historia, en fotos ❤️",
  openGraph: {
    title: `${config.names.couple} ❤️`,
    description: "Our story, in photos · Nuestra historia, en fotos",
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
  // The <html lang> is updated client-side by the language switch (lib/i18n).
  return (
    <html lang="es" className={`${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
