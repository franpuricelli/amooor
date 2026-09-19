// ─────────────────────────────────────────────────────────────────────────────
//  identity.test.ts — atar la cuenta (nombre + mail del login) con uno de los dos
//  nombres de la pareja. Lo que importa: que acierte con apodos y apellidos, y que
//  NO adivine cuando es ambiguo (firmar el sitio con el nombre errado es peor que
//  preguntar).
//
//  Mismo runner que el resto (node:test, sin deps):
//    npx tsc lib/identity.test.ts --outDir .ttest --module commonjs \
//      --target ES2020 --moduleResolution node --esModuleInterop --skipLibCheck
//    node .ttest/identity.test.js
// ─────────────────────────────────────────────────────────────────────────────

import test from "node:test";
import assert from "node:assert/strict";
import { matchNarrator, identityBlock } from "./identity";

const franco = { name: "Franco Puricelli", emailLocal: "francopurib" };

test("nombre de pila igual: match directo", () => {
  assert.equal(matchNarrator(["Franco", "Ivi"], franco), "Franco");
});

test("apodo dentro del apellido o del mail (Puri ← Puricelli/francopurib)", () => {
  assert.equal(matchNarrator(["Puri", "Ivi"], franco), "Puri");
  assert.equal(
    matchNarrator(["Puri", "Ivi"], { name: "", emailLocal: "francopurib" }),
    "Puri"
  );
});

test("acentos y mayúsculas no importan", () => {
  assert.equal(
    matchNarrator(["Martín", "Ivi"], { name: "MARTIN Gómez", emailLocal: "mg" }),
    "Martín"
  );
});

test("mail con separadores: cada pieza cuenta", () => {
  assert.equal(
    matchNarrator(["Ana", "Bruno"], { name: "", emailLocal: "bruno.perez" }),
    "Bruno"
  );
});

test("sin match no inventa (mejor preguntar que firmar mal)", () => {
  assert.equal(matchNarrator(["Ana", "Bruno"], { name: "Carla", emailLocal: "cs" }), "");
  assert.equal(matchNarrator(["Ana", "Bruno"], null), "");
  assert.equal(matchNarrator([], franco), "");
});

test("empate = ambiguo, tampoco elige", () => {
  const dos = { name: "Ana", emailLocal: "ana" };
  assert.equal(matchNarrator(["Ana", "Ana"], dos), "");
});

test("no matchea por substring corto (Ana dentro de mariana)", () => {
  assert.equal(
    matchNarrator(["Ana", "Bruno"], { name: "Mariana Diaz", emailLocal: "mariana" }),
    ""
  );
});

test("el bloque del prompt aclara que la cuenta NO dice el género", () => {
  const block = identityBlock(franco);
  assert.ok(block);
  assert.match(block!, /Franco Puricelli/);
  assert.match(block!, /género/);
  assert.equal(identityBlock(null), null);
  assert.equal(identityBlock({ name: "", emailLocal: "" }), null);
});
