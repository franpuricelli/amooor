import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images are pre-optimized by tools/prepare-photos.sh and served as static
  // assets, so we skip Next's on-demand optimizer (keeps us off Vercel's
  // hobby-tier image quota).
  images: { unoptimized: true },
  reactStrictMode: true,
  // Este repo vive anidado dentro de otro (staging) en dev; fijamos la raíz de
  // trazado a este directorio para que Next no tome el lockfile del padre.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  // Las Agent Skills (skills/*/SKILL.md) se leen del filesystem en runtime
  // (lib/skills.ts). Hay que incluirlas en el bundle de las funciones serverless.
  outputFileTracingIncludes: {
    "/**": ["./skills/**/*"],
  },
};

export default nextConfig;
