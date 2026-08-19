// ─────────────────────────────────────────────────────────────────────────────
//  today.test.ts — la fecha que se le inyecta al modelo. Lo que puede romper es
//  la zona horaria: el server corre en UTC y el público está en AR (UTC-3), así
//  que a la noche argentina "hoy" se adelantaba un día.
//
//  Mismo runner que el resto (node:test, sin deps):
//    npx tsc lib/today.test.ts --outDir .ttest --module commonjs \
//      --target ES2020 --moduleResolution node --esModuleInterop --skipLibCheck
//    node .ttest/today.test.js
// ─────────────────────────────────────────────────────────────────────────────

import test from "node:test";
import assert from "node:assert/strict";
import { todayISO, todayBlock } from "./today";

test("todayISO devuelve yyyy-mm-dd en la zona del público (AR)", () => {
  assert.equal(todayISO(new Date("2026-08-19T15:00:00Z")), "2026-08-19");
  // 01:30 UTC del 20 todavía es el 19 en Argentina (UTC-3)
  assert.equal(todayISO(new Date("2026-08-20T01:30:00Z")), "2026-08-19");
});

test("el bloque nombra el año en curso (que es lo que el modelo inventaba)", () => {
  const block = todayBlock(new Date("2026-08-19T15:00:00Z"));
  assert.match(block, /2026-08-19/);
  assert.match(block, /El año en curso es 2026/);
});
