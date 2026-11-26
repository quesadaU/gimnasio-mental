import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_READER_PREFS, isReaderPrefs, READER_PREFS_KEY, stepFontSize } from "./prefs.ts";

test("la clave queda bajo el prefijo del módulo (gm: lo añade el núcleo)", () => {
  assert.equal(READER_PREFS_KEY, "lectura:prefs");
});

test("isReaderPrefs acepta los valores por defecto y rechaza datos corruptos", () => {
  assert.ok(isReaderPrefs(DEFAULT_READER_PREFS));
  assert.ok(!isReaderPrefs(null));
  assert.ok(!isReaderPrefs({ ...DEFAULT_READER_PREFS, theme: "neón" }));
  assert.ok(!isReaderPrefs({ ...DEFAULT_READER_PREFS, focusMode: "sí" }));
  const { showTimer: _omitted, ...incomplete } = DEFAULT_READER_PREFS;
  void _omitted;
  assert.ok(!isReaderPrefs(incomplete));
});

test("stepFontSize se mueve entre los tamaños sin salirse", () => {
  assert.equal(stepFontSize("m", 1), "l");
  assert.equal(stepFontSize("xl", 1), "xl");
  assert.equal(stepFontSize("s", -1), "s");
  assert.equal(stepFontSize("l", -1), "m");
});
