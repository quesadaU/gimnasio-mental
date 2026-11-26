import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

import type { ContentPack } from "../../core/types.ts";
import type { ReadingText } from "../../features/lectura/domain/types.ts";
import { validateReadingPack } from "../../features/lectura/domain/validate-pack.ts";
import { LECTURA_CATALOG, LECTURA_LOADERS } from "./index.ts";

const textsDir = join(dirname(fileURLToPath(import.meta.url)), "textos");

async function loadAllPacks(): Promise<ContentPack<ReadingText>[]> {
  const files = readdirSync(textsDir).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
  const packs: ContentPack<ReadingText>[] = [];
  for (const file of files) {
    const mod = (await import(pathToFileURL(join(textsDir, file)).href)) as {
      default: ContentPack<ReadingText>;
    };
    packs.push(mod.default);
  }
  return packs;
}

test("hay entre 10 y 12 textos y cada paquete es válido", async () => {
  const packs = await loadAllPacks();
  assert.ok(packs.length >= 10 && packs.length <= 12, `hay ${packs.length} paquetes`);
  for (const pack of packs) {
    assert.deepEqual(validateReadingPack(pack), [], `errores en ${pack.id}`);
  }
});

test("los ids de paquetes y textos son únicos y coinciden entre sí", async () => {
  const packs = await loadAllPacks();
  const packIds = packs.map((pack) => pack.id);
  assert.equal(new Set(packIds).size, packIds.length);
  const textIds = packs.flatMap((pack) => pack.items.map((item) => item.id));
  assert.equal(new Set(textIds).size, textIds.length);
  for (const pack of packs) assert.equal(pack.items[0]?.id, pack.id);
});

test("las ideas clave generan ids de tarjeta únicos en todo el mazo", async () => {
  const packs = await loadAllPacks();
  const keys = packs.flatMap((pack) =>
    pack.items.flatMap((text) => text.keyIdeas.map((idea) => `${text.id}/${idea.id}`)),
  );
  assert.equal(new Set(keys).size, keys.length);
});

test("todo texto tiene licencia, y los de dominio público, autor, obra y referencia", async () => {
  const packs = await loadAllPacks();
  for (const text of packs.flatMap((pack) => pack.items)) {
    assert.ok(text.source.license.trim().length > 0, `${text.id} sin licencia`);
    if (text.source.kind === "dominio-publico") {
      assert.ok(text.source.author && text.source.work && text.source.reference, `${text.id} sin fuente completa`);
    }
  }
});

test("las respuestas correctas no están siempre en la misma posición", async () => {
  const packs = await loadAllPacks();
  const positions = new Set(
    packs.flatMap((pack) => pack.items.flatMap((text) => text.questions.map((q) => q.correctIndex))),
  );
  assert.ok(positions.size >= 3);
});

test("el catálogo coincide con los paquetes y cada texto tiene cargador", async () => {
  const packs = await loadAllPacks();
  const byId = new Map(packs.flatMap((pack) => pack.items.map((text) => [text.id, text] as const)));
  assert.equal(LECTURA_CATALOG.length, byId.size);
  assert.deepEqual(Object.keys(LECTURA_LOADERS).sort(), [...byId.keys()].sort());
  for (const meta of LECTURA_CATALOG) {
    const text = byId.get(meta.id);
    assert.ok(text, `el catálogo referencia un texto inexistente: ${meta.id}`);
    assert.equal(meta.title, text.title);
    assert.equal(meta.summary, text.summary);
    assert.equal(meta.topic, text.topic);
    assert.equal(meta.level, text.level);
    assert.equal(meta.words, text.words);
    assert.equal(meta.sourceKind, text.source.kind);
    assert.equal(meta.author, text.source.author);
  }
});
