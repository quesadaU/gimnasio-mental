/**
 * Detección prudente de expresiones que pueden indicar malestar intenso o riesgo.
 *
 * Uso exclusivo: decidir si se MUESTRAN con calidez los recursos de ayuda. No diagnostica,
 * no evalúa riesgo, no puntúa y su resultado nunca se guarda ni se envía a ningún sitio.
 * Se prefiere algún falso positivo (mostrar ayuda de más) a ignorar un mensaje serio.
 */

const CRISIS_EXPRESSIONS: readonly string[] = [
  "suicid",
  "quitarme la vida",
  "quitarme de en medio",
  "acabar con mi vida",
  "acabar con todo",
  "terminar con todo",
  "no quiero vivir",
  "no quiero seguir viviendo",
  "no quiero seguir aqui",
  "no quiero despertar",
  "no merece la pena vivir",
  "no vale la pena vivir",
  "ganas de morir",
  "quiero morir",
  "deseo morir",
  "prefiero morir",
  "mejor muerto",
  "mejor muerta",
  "estarian mejor sin mi",
  "estaria mejor sin mi",
  "mejor sin mi",
  "matarme",
  "hacerme dano",
  "autolesion",
  "lesionarme",
  "cortarme las venas",
  "desaparecer para siempre",
  "no le veo sentido a vivir",
  "no le encuentro sentido a vivir",
];

/** Minúsculas, sin tildes ni signos, espacios colapsados. */
export function normalizeForMatching(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** `true` si alguno de los textos contiene una expresión de la lista. Nunca lanza. */
export function suggestsCrisis(...texts: readonly (string | undefined)[]): boolean {
  const joined = normalizeForMatching(texts.filter((text): text is string => typeof text === "string").join(" "));
  if (joined.length === 0) return false;
  return CRISIS_EXPRESSIONS.some((expression) => joined.includes(expression));
}
