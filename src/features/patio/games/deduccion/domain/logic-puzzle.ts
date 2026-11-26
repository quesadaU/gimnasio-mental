/**
 * Acertijos de deducción tipo "quién vive dónde" con solución única verificada.
 *
 * Hay N personas y K categorías (la primera siempre es la casa, numerada de izquierda a
 * derecha). Una solución asigna a cada persona un valor distinto de cada categoría. El generador
 * elige una solución al azar, añade pistas verdaderas hasta que solo queda una asignación
 * compatible (comprobado por enumeración exhaustiva) y después quita las pistas sobrantes.
 */

export type Random = () => number;

export interface Category {
  id: "casa" | "mascota" | "bebida" | "aficion";
  label: string;
  values: readonly string[];
}

const PEOPLE = ["Ana", "Luis", "Marta", "Pablo", "Sara"] as const;

const CATEGORY_POOL: Record<Exclude<Category["id"], "casa">, Omit<Category, "id">> = {
  mascota: { label: "Mascota", values: ["gato", "perro", "pez", "loro", "conejo"] },
  bebida: { label: "Bebida", values: ["té", "café", "zumo", "agua", "leche"] },
  aficion: { label: "Afición", values: ["ajedrez", "lectura", "música", "pintura", "jardinería"] },
};

/** Referencia a un rasgo: categoría -1 = persona; si no, índice en `categories`. */
export interface Ref {
  category: number;
  value: number;
}

export type Clue =
  | { kind: "mismo"; a: Ref; b: Ref }
  | { kind: "distinto"; a: Ref; b: Ref }
  | { kind: "izquierda"; a: Ref; b: Ref }
  | { kind: "al-lado"; a: Ref; b: Ref }
  | { kind: "antes"; a: Ref; b: Ref };

export interface LogicPuzzle {
  level: number;
  people: readonly string[];
  categories: readonly Category[];
  /** solution[c][persona] = índice del valor de la categoría c. */
  solution: number[][];
  clues: Clue[];
}

export interface LevelSpec {
  people: number;
  categories: Category["id"][];
  /** Peso relativo de las pistas directas ("Ana tiene el gato") frente a las relacionales. */
  directWeight: number;
}

export function levelSpec(level: number): LevelSpec {
  const l = Math.min(10, Math.max(1, Math.round(level)));
  const table: Record<number, LevelSpec> = {
    1: { people: 3, categories: ["casa", "mascota"], directWeight: 3 },
    2: { people: 3, categories: ["casa", "mascota"], directWeight: 1.5 },
    3: { people: 3, categories: ["casa", "mascota", "bebida"], directWeight: 2 },
    4: { people: 4, categories: ["casa", "mascota"], directWeight: 2 },
    5: { people: 4, categories: ["casa", "mascota"], directWeight: 1 },
    6: { people: 4, categories: ["casa", "mascota", "bebida"], directWeight: 1.5 },
    7: { people: 4, categories: ["casa", "mascota", "bebida"], directWeight: 0.7 },
    8: { people: 5, categories: ["casa", "mascota"], directWeight: 1 },
    9: { people: 5, categories: ["casa", "mascota"], directWeight: 0.4 },
    10: { people: 4, categories: ["casa", "mascota", "bebida"], directWeight: 0.2 },
  };
  return table[l];
}

// ---------------------------------------------------------------------------------------------
// Combinatoria
// ---------------------------------------------------------------------------------------------

export function permutations(n: number): number[][] {
  if (n === 0) return [[]];
  const result: number[][] = [];
  for (const rest of permutations(n - 1)) {
    for (let i = 0; i <= rest.length; i++) result.push([...rest.slice(0, i), n - 1, ...rest.slice(i)]);
  }
  return result;
}

/** Todas las asignaciones posibles (producto cartesiano de permutaciones por categoría). */
export function allAssignments(people: number, categories: number): number[][][] {
  const perms = permutations(people);
  let result: number[][][] = [[]];
  for (let c = 0; c < categories; c++) {
    const next: number[][][] = [];
    for (const partial of result) for (const perm of perms) next.push([...partial, perm]);
    result = next;
  }
  return result;
}

/** Persona que tiene el rasgo `ref` en la asignación. */
function personOf(assignment: readonly (readonly number[])[], ref: Ref): number {
  if (ref.category < 0) return ref.value;
  return assignment[ref.category].indexOf(ref.value);
}

function houseOf(assignment: readonly (readonly number[])[], person: number): number {
  return assignment[0][person];
}

export function clueHolds(clue: Clue, assignment: readonly (readonly number[])[]): boolean {
  const a = personOf(assignment, clue.a);
  const b = personOf(assignment, clue.b);
  switch (clue.kind) {
    case "mismo":
      return a === b;
    case "distinto":
      return a !== b;
    case "izquierda":
      return houseOf(assignment, a) + 1 === houseOf(assignment, b);
    case "al-lado":
      return Math.abs(houseOf(assignment, a) - houseOf(assignment, b)) === 1;
    case "antes":
      return houseOf(assignment, a) < houseOf(assignment, b);
  }
}

export function countCompatible(
  candidates: readonly (readonly (readonly number[])[])[],
  clues: readonly Clue[],
  limit = Infinity,
): number {
  let count = 0;
  for (const candidate of candidates) {
    if (clues.every((clue) => clueHolds(clue, candidate))) {
      count++;
      if (count >= limit) break;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------------------------
// Generación
// ---------------------------------------------------------------------------------------------

function shuffle<T>(items: T[], random: Random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function buildCategories(spec: LevelSpec): Category[] {
  return spec.categories.map((id) => {
    if (id === "casa") {
      return { id, label: "Casa", values: Array.from({ length: spec.people }, (_, i) => `casa ${i + 1}`) };
    }
    const pool = CATEGORY_POOL[id];
    return { id, label: pool.label, values: pool.values.slice(0, spec.people) };
  });
}

/** Todas las pistas verdaderas para la solución, con un peso para el muestreo. */
function truthfulClues(solution: number[][], people: number, spec: LevelSpec): { clue: Clue; weight: number }[] {
  const refs: Ref[] = [];
  for (let p = 0; p < people; p++) refs.push({ category: -1, value: p });
  solution.forEach((_, c) => {
    for (let v = 0; v < people; v++) refs.push({ category: c, value: v });
  });
  const pool: { clue: Clue; weight: number }[] = [];
  for (const a of refs) {
    for (const b of refs) {
      if (a.category >= b.category) continue; // un par por combinación de categorías distintas
      const pa = personOf(solution, a);
      const pb = personOf(solution, b);
      if (pa === pb) {
        // "Ana vive en la casa 2" es la pista más directa: peso menor en niveles altos.
        const isPersonHouse = a.category === -1 && b.category === 0;
        pool.push({ clue: { kind: "mismo", a, b }, weight: spec.directWeight * (isPersonHouse ? 0.6 : 1) });
      } else {
        pool.push({ clue: { kind: "distinto", a, b }, weight: 0.8 });
      }
    }
  }
  // Pistas de posición entre rasgos que no son la casa.
  const nonHouse = refs.filter((ref) => ref.category !== 0);
  for (const a of nonHouse) {
    for (const b of nonHouse) {
      const pa = personOf(solution, a);
      const pb = personOf(solution, b);
      if (pa === pb) continue;
      const ha = houseOf(solution, pa);
      const hb = houseOf(solution, pb);
      if (ha + 1 === hb) pool.push({ clue: { kind: "izquierda", a, b }, weight: 1.2 });
      if (Math.abs(ha - hb) === 1 && a.category <= b.category) pool.push({ clue: { kind: "al-lado", a, b }, weight: 1 });
      // "Más a la izquierda" solo se propone si no son contiguas, para no duplicar "justo a la izquierda".
      if (ha < hb && hb - ha > 1) pool.push({ clue: { kind: "antes", a, b }, weight: 0.8 });
    }
  }
  return pool;
}

/** Orden aleatorio ponderado (Efraimidis-Spirakis): mayor peso, más probable que salga antes. */
function weightedOrder<T>(items: { clue: T; weight: number }[], random: Random): T[] {
  return items
    .map((item) => ({ item: item.clue, key: Math.pow(random() || Number.EPSILON, 1 / item.weight) }))
    .sort((x, y) => y.key - x.key)
    .map((entry) => entry.item);
}

export function generateLogicPuzzle(level: number, random: Random = Math.random): LogicPuzzle {
  const spec = levelSpec(level);
  const categories = buildCategories(spec);
  const people = PEOPLE.slice(0, spec.people);
  const perms = permutations(spec.people);
  const solution = categories.map(() => perms[Math.floor(random() * perms.length) % perms.length].slice());
  const candidates = allAssignments(spec.people, categories.length);

  const ordered = weightedOrder(truthfulClues(solution, spec.people, spec), random);
  const clues: Clue[] = [];
  let remaining = candidates;
  for (const clue of ordered) {
    const filtered = remaining.filter((candidate) => clueHolds(clue, candidate));
    if (filtered.length === remaining.length) continue; // no aporta información
    clues.push(clue);
    remaining = filtered;
    if (remaining.length === 1) break;
  }

  // Minimiza: quita cada pista si la solución sigue siendo única sin ella.
  for (const clue of shuffle([...clues], random)) {
    const without = clues.filter((other) => other !== clue);
    if (countCompatible(candidates, without, 2) === 1) clues.splice(clues.indexOf(clue), 1);
  }

  return { level, people, categories, solution, clues: shuffle(clues, random) };
}

// ---------------------------------------------------------------------------------------------
// Respuesta del usuario
// ---------------------------------------------------------------------------------------------

/** answer[c][persona] = índice del valor elegido o null. */
export type Answer = (number | null)[][];

export function emptyAnswer(puzzle: LogicPuzzle): Answer {
  return puzzle.categories.map(() => puzzle.people.map(() => null));
}

export function countMistakes(puzzle: LogicPuzzle, answer: Answer): { wrong: number; missing: number } {
  let wrong = 0;
  let missing = 0;
  puzzle.solution.forEach((row, c) =>
    row.forEach((value, p) => {
      const chosen = answer[c]?.[p];
      if (chosen === null || chosen === undefined) missing++;
      else if (chosen !== value) wrong++;
    }),
  );
  return { wrong, missing };
}

// ---------------------------------------------------------------------------------------------
// Texto de las pistas
// ---------------------------------------------------------------------------------------------

const ARTICLE: Record<string, string> = {
  gato: "el gato",
  perro: "el perro",
  pez: "el pez",
  loro: "el loro",
  conejo: "el conejo",
};

function predicate(puzzle: LogicPuzzle, ref: Ref): string {
  if (ref.category < 0) return `es ${puzzle.people[ref.value]}`;
  const category = puzzle.categories[ref.category];
  const value = category.values[ref.value];
  switch (category.id) {
    case "casa":
      return `vive en la ${value}`;
    case "mascota":
      return `tiene ${ARTICLE[value] ?? value}`;
    case "bebida":
      return `bebe ${value}`;
    case "aficion":
      return `practica ${value}`;
  }
}

function subject(puzzle: LogicPuzzle, ref: Ref): string {
  return ref.category < 0 ? puzzle.people[ref.value] : `quien ${predicate(puzzle, ref)}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function clueText(puzzle: LogicPuzzle, clue: Clue): string {
  // La persona (o el rasgo que no es la casa) va de sujeto para que la frase suene natural.
  let { a, b } = clue;
  const symmetric = clue.kind === "mismo" || clue.kind === "distinto" || clue.kind === "al-lado";
  if (symmetric && b.category < 0) [a, b] = [b, a];
  if (symmetric && a.category === 0 && b.category > 0) [a, b] = [b, a];

  switch (clue.kind) {
    case "mismo":
      return `${capitalize(subject(puzzle, a))} ${predicate(puzzle, b)}.`;
    case "distinto":
      return `${capitalize(subject(puzzle, a))} no ${predicate(puzzle, b)}.`;
    case "izquierda":
      return `${capitalize(subject(puzzle, a))} vive justo a la izquierda de ${subject(puzzle, b)}.`;
    case "al-lado":
      return `${capitalize(subject(puzzle, a))} vive al lado de ${subject(puzzle, b)}.`;
    case "antes":
      return `${capitalize(subject(puzzle, a))} vive más a la izquierda que ${subject(puzzle, b)}.`;
  }
}
