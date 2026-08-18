// ─────────────────────────────────────────────────────────────────────────────
//  plan-to-state.test.ts — tests del puente Plan → WizardState (spec §Phase 2).
//
//  No hay runner de tests configurado en el repo. Estos tests usan el runner
//  built-in de Node (`node:test` + `node:assert`), así que corren sin dependencias
//  nuevas una vez transpilados a CommonJS. Ver la sección "Verification" del plan:
//    npx tsc lib/plan-to-state.test.ts --outDir .ttest --module commonjs \
//      --target ES2020 --moduleResolution node --esModuleInterop --skipLibCheck
//    node .ttest/lib/plan-to-state.test.js
// ─────────────────────────────────────────────────────────────────────────────

import test from "node:test";
import assert from "node:assert/strict";
import type { Plan } from "./plan";
import { planToWizardState, planSectionSlugs } from "./plan-to-state";

const basePlan: Plan = {
  names: ["Martín", "Ivi"],
  you: "Ivi",
  dates: { together: "2021-03-08", met: "2020-11-02" },
  title: "De la facu al living",
  angle: "Cómo dos desconocidos en un pasillo terminaron compartiendo las llaves.",
  tone: "cálido y divertido, sin cursilería",
  sections: [
    { kind: "hero", title: "Portada", intent: "La foto de ellos dos y una frase." },
    { kind: "story", title: "Nos conocimos", intent: "El pasillo de la facu." },
    { kind: "story", title: "Nos conocimos", intent: "Duplicado para probar dedupe." },
    { kind: "travel", title: "Viajes", intent: "Bariloche y algo más." },
    { kind: "closing", title: "Cierre", intent: "El dibujo que se da vuelta." },
  ],
  assumptions: [],
};

test("mapea nombres a couple + people", () => {
  const s = planToWizardState(basePlan);
  assert.equal(s.couple, "Martín & Ivi");
  assert.equal(s.people.left.name, "Martín");
  assert.equal(s.people.right.name, "Ivi");
});

test("dropea la sección closing del WizardState", () => {
  const s = planToWizardState(basePlan);
  const types = s.sections.map((x) => x.type);
  assert.ok(!types.includes("closing" as never));
  // 5 secciones en el plan, menos closing = 4 en el wizard
  assert.equal(s.sections.length, 4);
});

test("mapea kind→type, title, intent→aiPrompt y categoría=slug(title)", () => {
  const s = planToWizardState(basePlan);
  const hero = s.sections[0];
  assert.equal(hero.type, "hero");
  assert.equal(hero.id, "portada");
  assert.equal(hero.title, "Portada");
  assert.equal(hero.aiPrompt, "La foto de ellos dos y una frase.");
  assert.deepEqual(hero.categories, ["portada"]);
});

test("dedupe estable de slugs repetidos", () => {
  const s = planToWizardState(basePlan);
  const storyIds = s.sections.filter((x) => x.type === "story").map((x) => x.id);
  assert.deepEqual(storyIds, ["nos-conocimos", "nos-conocimos-2"]);
});

test("categories[] son los slugs por sección (sin closing)", () => {
  const s = planToWizardState(basePlan);
  assert.deepEqual(s.categories, ["portada", "nos-conocimos", "nos-conocimos-2", "viajes"]);
});

test("planSectionSlugs incluye closing con su propio slug", () => {
  const slugs = planSectionSlugs(basePlan);
  assert.equal(slugs.length, 5);
  const closing = slugs.find((x) => x.section.kind === "closing");
  assert.ok(closing);
  assert.equal(closing!.category, "cierre");
});

test("palette inválida cae a rosa; válida se respeta", () => {
  assert.equal(planToWizardState(basePlan, "no-existe").palette, "rosa");
  assert.equal(planToWizardState(basePlan, "menta").palette, "menta");
});

test("nombres faltantes no rompen (couple vacío, names parciales)", () => {
  const s = planToWizardState({ ...basePlan, names: [] });
  assert.equal(s.couple, "");
  assert.equal(s.people.left.name, "");
  assert.equal(s.people.right.name, "");
});

test("las fechas del plan viajan al WizardState (contador + portada)", () => {
  const s = planToWizardState(basePlan);
  assert.equal(s.dates.together, "2021-03-08");
  assert.equal(s.dates.met, "2020-11-02");
});

test("narrator = quién arma el sitio (plan.you), con fallback al primero", () => {
  assert.equal(planToWizardState(basePlan).narrator, "Ivi");
  assert.equal(planToWizardState({ ...basePlan, you: "" }).narrator, "Martín");
  // un `you` que no matchea ningún nombre no puede ensuciar la firma
  assert.equal(planToWizardState({ ...basePlan, you: "Otro" }).narrator, "Martín");
});
