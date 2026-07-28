// ─────────────────────────────────────────────────────────────────────────────
//  vercel-build.mjs — build command para Vercel.
//  · Producción (main): CONVEX_DEPLOY_KEY presente → `convex deploy` (pushea el
//    schema/functions e inyecta NEXT_PUBLIC_CONVEX_URL) + `next build`.
//  · Preview (branches/PRs): sin deploy key → sólo `next build`. El preview apunta
//    al Convex de dev vía NEXT_PUBLIC_CONVEX_URL (seteada en el env de Preview),
//    así no se necesita una preview deploy key ni se toca prod.
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from "node:child_process";

const hasKey = Boolean(process.env.CONVEX_DEPLOY_KEY);
const cmd = hasKey
  ? "npx convex deploy --cmd 'npm run build'"
  : "npm run build";

console.log(
  `[vercel-build] CONVEX_DEPLOY_KEY ${
    hasKey ? "presente → convex deploy + next build" : "ausente → next build (preview)"
  }`
);

execSync(cmd, { stdio: "inherit" });
