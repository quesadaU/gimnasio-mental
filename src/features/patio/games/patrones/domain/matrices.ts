/**
 * Matrices de razonamiento 3×3 (inspiradas en las Matrices Progresivas de Raven, simplificadas)
 * generadas por reglas. Cada figura tiene atributos; en cada fila, cada atributo sigue una regla:
 *
 * - constante: el valor no cambia dentro de la fila;
 * - progresión: el valor sube o baja un paso por columna (solo atributos ordenados);
 * - distribución de tres: cada fila contiene los mismos tres valores en distinto orden.
 *
 * Falta la casilla inferior derecha. Las opciones incorrectas rompen al menos una regla, de modo
 * que la respuesta es única. A más nivel, más atributos varían y los distractores se parecen más.
 */

export type Attribute = "forma" | "cantidad" | "relleno" | "tamano";
export type Rule = "constante" | "progresion" | "distribucion";

export const SHAPES = ["circulo", "cuadrado", "triangulo", "rombo", "hexagono"] as const;
export const FILLS = ["vacio", "rayado", "solido"] as const;
export const SIZES = ["pequeno", "mediano", "grande"] as const;
export const COUNTS = [1, 2, 3, 4] as const;

export type Shape = (typeof SHAPES)[number];
export type Fill = (typeof FILLS)[number];
export type Size = (typeof SIZES)[number];

/** Una figura como índices dentro de cada dominio. */
export interface Figure {
  forma: number;
  cantidad: number;
  relleno: number;
  tamano: number;
}

export const DOMAIN_SIZE: Record<Attribute, number> = {
  forma: SHAPES.length,
  cantidad: COUNTS.length,
  relleno: FILLS.length,
  tamano: SIZES.length,
};

const ORDERED: ReadonlySet<Attribute> = new Set(["cantidad", "relleno", "tamano"]);
const ATTRIBUTES: readonly Attribute[] = ["forma", "cantidad", "relleno", "tamano"];

export interface AttributeRule {
  attribute: Attribute;
  rule: Rule;
  /** Paso de la progresión (+1 o -1). */
  step?: 1 | -1;
}

export interface MatrixPuzzle {
  level: number;
  rules: AttributeRule[];
  /** 9 celdas, fila a fila; la última es la respuesta (no se muestra). */
  cells: Figure[];
  options: Figure[];
  answerIndex: number;
}

export interface LevelSpec {
  varying: number;
  options: number;
  /** Los distractores difieren de la respuesta en un solo atributo (más difícil). */
  closeDistractors: boolean;
  allowedRules: readonly Rule[];
}

export function levelSpec(level: number): LevelSpec {
  const l = Math.min(10, Math.max(1, Math.round(level)));
  if (l === 1) return { varying: 1, options: 4, closeDistractors: false, allowedRules: ["progresion"] };
  if (l === 2) return { varying: 1, options: 4, closeDistractors: false, allowedRules: ["progresion", "distribucion"] };
  if (l === 3) return { varying: 2, options: 4, closeDistractors: false, allowedRules: ["progresion", "distribucion"] };
  if (l === 4) return { varying: 2, options: 6, closeDistractors: false, allowedRules: ["progresion", "distribucion"] };
  if (l === 5) return { varying: 2, options: 6, closeDistractors: true, allowedRules: ["progresion", "distribucion"] };
  if (l === 6) return { varying: 3, options: 6, closeDistractors: false, allowedRules: ["progresion", "distribucion"] };
  if (l === 7) return { varying: 3, options: 6, closeDistractors: true, allowedRules: ["progresion", "distribucion"] };
  if (l === 8) return { varying: 3, options: 8, closeDistractors: true, allowedRules: ["progresion", "distribucion"] };
  if (l === 9) return { varying: 4, options: 8, closeDistractors: true, allowedRules: ["progresion", "distribucion"] };
  return { varying: 4, options: 8, closeDistractors: true, allowedRules: ["distribucion", "progresion"] };
}

export type Random = () => number;

function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length) % items.length];
}

function shuffle<T>(items: T[], random: Random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function sample(count: number, domain: number, random: Random): number[] {
  return shuffle(Array.from({ length: domain }, (_, i) => i), random).slice(0, count);
}

/** Valores de un atributo en la cuadrícula 3×3 (fila a fila) según su regla. */
function attributeGrid(rule: AttributeRule, random: Random): number[] {
  const size = DOMAIN_SIZE[rule.attribute];
  const grid: number[] = [];
  if (rule.rule === "constante") {
    const rows = sample(3, size, random);
    for (let r = 0; r < 3; r++) grid.push(rows[r], rows[r], rows[r]);
  } else if (rule.rule === "progresion") {
    const step = rule.step ?? 1;
    for (let r = 0; r < 3; r++) {
      // El inicio debe dejar sitio a dos pasos dentro del dominio.
      const starts = Array.from({ length: size }, (_, i) => i).filter((s) => s + 2 * step >= 0 && s + 2 * step < size);
      const start = pick(starts, random);
      grid.push(start, start + step, start + 2 * step);
    }
  } else {
    const values = sample(3, size, random);
    const shift = random() < 0.5 ? 1 : 2;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) grid.push(values[(c + r * shift) % 3]);
    }
  }
  return grid;
}

/** ¿Respeta la fila (a, b, c) la regla? Se usa para validar opciones de forma independiente. */
export function rowSatisfies(rule: AttributeRule, row: readonly number[], firstRows: readonly (readonly number[])[]): boolean {
  const [a, b, c] = row;
  if (rule.rule === "constante") return a === b && b === c;
  if (rule.rule === "progresion") {
    const step = rule.step ?? 1;
    return b - a === step && c - b === step;
  }
  // Distribución: la fila usa exactamente el mismo conjunto de tres valores que las anteriores.
  const reference = [...firstRows[0]].sort().join();
  return new Set(row).size === 3 && [...row].sort().join() === reference;
}

export function isValidAnswer(puzzle: Pick<MatrixPuzzle, "rules" | "cells">, candidate: Figure): boolean {
  return ATTRIBUTES.every((attribute) => {
    const rule = puzzle.rules.find((r) => r.attribute === attribute) ?? { attribute, rule: "constante" as Rule };
    const values = puzzle.cells.map((cell) => cell[attribute]);
    const rows = [values.slice(0, 3), values.slice(3, 6)];
    return rowSatisfies(rule, [values[6], values[7], candidate[attribute]], rows);
  });
}

export function sameFigure(a: Figure, b: Figure): boolean {
  return ATTRIBUTES.every((attribute) => a[attribute] === b[attribute]);
}

export function generateMatrix(level: number, random: Random = Math.random): MatrixPuzzle {
  const spec = levelSpec(level);
  const varying = shuffle([...ATTRIBUTES], random).slice(0, spec.varying);
  const rules: AttributeRule[] = ATTRIBUTES.map((attribute) => {
    if (!varying.includes(attribute)) return { attribute, rule: "constante" };
    const allowed = spec.allowedRules.filter((rule) => rule !== "progresion" || ORDERED.has(attribute));
    const rule = pick(allowed.length ? allowed : (["distribucion"] as const), random);
    return rule === "progresion" ? { attribute, rule, step: random() < 0.5 ? 1 : -1 } : { attribute, rule };
  });

  const grids = Object.fromEntries(rules.map((rule) => [rule.attribute, attributeGrid(rule, random)])) as Record<
    Attribute,
    number[]
  >;
  const cells: Figure[] = Array.from({ length: 9 }, (_, i) => ({
    forma: grids.forma[i],
    cantidad: grids.cantidad[i],
    relleno: grids.relleno[i],
    tamano: grids.tamano[i],
  }));
  const answer = cells[8];

  const options: Figure[] = [answer];
  const tryAdd = (figure: Figure) => {
    if (options.length >= spec.options) return;
    if (options.some((option) => sameFigure(option, figure))) return;
    if (isValidAnswer({ rules, cells }, figure)) return;
    options.push(figure);
  };

  // Distractores "cercanos": cambian un único atributo; priorizan los atributos que varían.
  const mutateOne = (attribute: Attribute) => {
    const values = shuffle(Array.from({ length: DOMAIN_SIZE[attribute] }, (_, i) => i), random);
    for (const value of values) {
      if (value !== answer[attribute]) {
        tryAdd({ ...answer, [attribute]: value });
        return;
      }
    }
  };
  const order = [...varying, ...ATTRIBUTES.filter((a) => !varying.includes(a))];
  let guard = 0;
  while (options.length < spec.options && guard++ < 200) {
    if (spec.closeDistractors || guard > 100) {
      mutateOne(order[guard % order.length]);
    } else {
      const figure = { ...answer };
      for (const attribute of shuffle([...ATTRIBUTES], random).slice(0, 2)) {
        figure[attribute] = Math.floor(random() * DOMAIN_SIZE[attribute]);
      }
      tryAdd(figure);
    }
  }

  shuffle(options, random);
  return {
    level,
    rules,
    cells,
    options,
    answerIndex: options.findIndex((option) => sameFigure(option, answer)),
  };
}

// ---------------------------------------------------------------------------------------------
// Texto para lectores de pantalla y para la explicación tras responder
// ---------------------------------------------------------------------------------------------

const SHAPE_NAME: Record<Shape, [string, string]> = {
  circulo: ["círculo", "círculos"],
  cuadrado: ["cuadrado", "cuadrados"],
  triangulo: ["triángulo", "triángulos"],
  rombo: ["rombo", "rombos"],
  hexagono: ["hexágono", "hexágonos"],
};
const FILL_NAME: Record<Fill, [string, string]> = {
  vacio: ["vacío", "vacíos"],
  rayado: ["rayado", "rayados"],
  solido: ["relleno", "rellenos"],
};
const SIZE_NAME: Record<Size, [string, string]> = {
  pequeno: ["pequeño", "pequeños"],
  mediano: ["mediano", "medianos"],
  grande: ["grande", "grandes"],
};
const COUNT_NAME = ["un", "dos", "tres", "cuatro"];

export function describeFigure(figure: Figure): string {
  const count = COUNTS[figure.cantidad];
  const plural = count > 1 ? 1 : 0;
  const shape = SHAPE_NAME[SHAPES[figure.forma]][plural];
  const size = SIZE_NAME[SIZES[figure.tamano]][plural];
  const fill = FILL_NAME[FILLS[figure.relleno]][plural];
  return `${COUNT_NAME[count - 1]} ${shape} ${size} ${fill}`;
}

const ATTRIBUTE_LABEL: Record<Attribute, string> = {
  forma: "la forma",
  cantidad: "la cantidad",
  relleno: "el relleno",
  tamano: "el tamaño",
};

export function explainRules(rules: readonly AttributeRule[]): string[] {
  return rules.map((rule) => {
    const label = ATTRIBUTE_LABEL[rule.attribute];
    if (rule.rule === "constante") return `En cada fila, ${label} no cambia.`;
    if (rule.rule === "progresion") {
      return `En cada fila, ${label} ${rule.step === 1 ? "aumenta" : "disminuye"} un paso de izquierda a derecha.`;
    }
    return `Cada fila contiene los mismos tres valores de ${label.replace(/^(la|el) /, "")}, en distinto orden.`;
  });
}

