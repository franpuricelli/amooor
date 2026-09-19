// ─────────────────────────────────────────────────────────────────────────────
//  plan-compat.test.ts — el plan ganó `you` (quién arma el sitio) y `dates`
//  (aniversario). Estos tests cubren lo que puede romper: los drafts VIEJOS
//  (persistidos sin esos campos) y los formatos de fecha que dropea el LLM.
//
//  Mismo runner que plan-to-state.test.ts (node:test, sin deps):
//    npx tsc lib/plan-compat.test.ts --outDir .ttest --module commonjs \
//      --target ES2020 --moduleResolution node --esModuleInterop --skipLibCheck
//    node .ttest/plan-compat.test.js
// ─────────────────────────────────────────────────────────────────────────────

import test from "node:test";
import assert from "node:assert/strict";
import { parsePlan, planNarrator, planPronoun, normalizePlanDate } from "./plan";

const legacy = {
  names: ["Ana", "Bruno"],
  title: "T", angle: "A", tone: "cálido",
  sections: [
    { kind: "hero", title: "Portada", intent: "x" },
    { kind: "closing", title: "Cierre", intent: "y" },
  ],
  assumptions: [],
};

test("un plan viejo (sin you/dates/pronouns) sigue parseando", () => {
  const p = parsePlan(legacy);
  assert.ok(p);
  assert.equal(p!.you, "");
  assert.deepEqual(p!.pronouns, {});
  assert.deepEqual(p!.dates, { together: "", met: "" });
  assert.equal(planNarrator(p!).you, "Ana");
  assert.equal(planNarrator(p!).partner, "Bruno");
});

test("normaliza los formatos de fecha que suele dropear el LLM", () => {
  assert.equal(normalizePlanDate("2022-07-26"), "2022-07-26");
  assert.equal(normalizePlanDate("2022-7-6"), "2022-07-06");
  assert.equal(normalizePlanDate("2022-07"), "2022-07-01");
  assert.equal(normalizePlanDate("26/07/2022"), "2022-07-26");
  assert.equal(normalizePlanDate("26-07-2022"), "2022-07-26");
  assert.equal(normalizePlanDate("no me acuerdo"), "");
  assert.equal(normalizePlanDate(undefined), "");
});

test("dates del LLM en dd/mm/yyyy llegan normalizadas al plan", () => {
  const p = parsePlan({ ...legacy, you: "Bruno", dates: { together: "08/03/2021" } });
  assert.equal(p!.dates.together, "2021-03-08");
  assert.equal(p!.dates.met, "");
  assert.equal(planNarrator(p!).you, "Bruno");
});

test("pronouns: normaliza lo que dropea el LLM y descarta lo que no entiende", () => {
  const p = parsePlan({
    ...legacy,
    pronouns: { Ana: "Ella", " Bruno ": "él", Nadie: "helicóptero" },
  });
  assert.ok(p);
  assert.equal(planPronoun(p!, "ana"), "ella");
  assert.equal(planPronoun(p!, "Bruno"), "el");
  // un valor que no reconocemos se descarta (esa persona va en neutro), pero el
  // plan entero NO se pierde por eso.
  assert.equal(planPronoun(p!, "Nadie"), "");
});

test("pronouns basura (string, array) no invalida el plan", () => {
  assert.ok(parsePlan({ ...legacy, pronouns: "ella y el" }));
  assert.ok(parsePlan({ ...legacy, pronouns: ["ella", "el"] }));
});
