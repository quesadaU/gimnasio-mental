/**
 * Sudoku 9×9 en TypeScript puro: resolución por backtracking con máscaras de bits, recuento de
 * soluciones (para garantizar unicidad), resolución "humana" por técnicas y generador por niveles.
 *
 * Una cuadrícula es un array de 81 números; 0 = vacía. Índice = fila * 9 + columna.
 */

export type Grid = number[];

export type Technique = "single-desnudo" | "single-oculto" | "bloqueo" | "par-desnudo" | "busqueda";

export const TECHNIQUE_LABEL: Record<Technique, string> = {
  "single-desnudo": "candidato único",
  "single-oculto": "única casilla posible",
  bloqueo: "candidatos bloqueados",
  "par-desnudo": "parejas desnudas",
  busqueda: "prueba y descarte",
};

export interface LevelConfig {
  level: number;
  /** Pistas objetivo: el generador quita números mientras pueda mantener unicidad y técnicas. */
  clues: number;
  techniques: readonly Technique[];
}

const SINGLES: readonly Technique[] = ["single-desnudo", "single-oculto"];

export const LEVELS: readonly LevelConfig[] = [
  { level: 1, clues: 50, techniques: SINGLES },
  { level: 2, clues: 46, techniques: SINGLES },
  { level: 3, clues: 42, techniques: SINGLES },
  { level: 4, clues: 38, techniques: SINGLES },
  { level: 5, clues: 35, techniques: SINGLES },
  { level: 6, clues: 32, techniques: [...SINGLES, "bloqueo"] },
  { level: 7, clues: 30, techniques: [...SINGLES, "bloqueo", "par-desnudo"] },
  { level: 8, clues: 28, techniques: [...SINGLES, "bloqueo", "par-desnudo", "busqueda"] },
  { level: 9, clues: 26, techniques: [...SINGLES, "bloqueo", "par-desnudo", "busqueda"] },
  { level: 10, clues: 24, techniques: [...SINGLES, "bloqueo", "par-desnudo", "busqueda"] },
];

export function levelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(10, Math.max(1, Math.round(level))) - 1];
}

// ---------------------------------------------------------------------------------------------
// Geometría
// ---------------------------------------------------------------------------------------------

export const rowOf = (index: number) => Math.floor(index / 9);
export const colOf = (index: number) => index % 9;
export const boxOf = (index: number) => Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3);

/** 27 unidades: 9 filas, 9 columnas y 9 cajas, cada una con sus 9 índices. */
export const UNITS: readonly (readonly number[])[] = (() => {
  const units: number[][] = [];
  for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let b = 0; b < 9; b++) {
    const r0 = Math.floor(b / 3) * 3;
    const c0 = (b % 3) * 3;
    units.push(Array.from({ length: 9 }, (_, k) => (r0 + Math.floor(k / 3)) * 9 + c0 + (k % 3)));
  }
  return units;
})();

/** Casillas que comparten fila, columna o caja con cada índice (20 por casilla). */
export const PEERS: readonly (readonly number[])[] = Array.from({ length: 81 }, (_, index) => {
  const peers = new Set<number>();
  for (const unit of UNITS) if (unit.includes(index)) for (const other of unit) peers.add(other);
  peers.delete(index);
  return [...peers];
});

const ALL = 0b1111111110; // bits 1..9

function bitCount(mask: number): number {
  let count = 0;
  for (let m = mask; m; m &= m - 1) count++;
  return count;
}

function lowestDigit(mask: number): number {
  return 31 - Math.clz32(mask & -mask);
}

export function digitsOf(mask: number): number[] {
  const digits: number[] = [];
  for (let d = 1; d <= 9; d++) if (mask & (1 << d)) digits.push(d);
  return digits;
}

/** Candidatos de una casilla vacía según sus vecinas (máscara de bits 1..9). */
export function candidateMask(grid: readonly number[], index: number): number {
  if (grid[index]) return 0;
  let used = 0;
  for (const peer of PEERS[index]) used |= 1 << grid[peer];
  return ALL & ~used;
}

export function candidates(grid: readonly number[], index: number): number[] {
  return digitsOf(candidateMask(grid, index));
}

// ---------------------------------------------------------------------------------------------
// Validación
// ---------------------------------------------------------------------------------------------

export function isValidGridShape(grid: readonly number[]): boolean {
  return grid.length === 81 && grid.every((v) => Number.isInteger(v) && v >= 0 && v <= 9);
}

/** Índices de casillas que repiten número en su fila, columna o caja. */
export function findConflicts(grid: readonly number[]): Set<number> {
  const conflicts = new Set<number>();
  for (const unit of UNITS) {
    const seen = new Map<number, number>();
    for (const index of unit) {
      const value = grid[index];
      if (!value) continue;
      const previous = seen.get(value);
      if (previous !== undefined) {
        conflicts.add(previous);
        conflicts.add(index);
      } else {
        seen.set(value, index);
      }
    }
  }
  return conflicts;
}

export function isSolved(grid: readonly number[]): boolean {
  return grid.every((v) => v > 0) && findConflicts(grid).size === 0;
}

/** Casillas rellenadas por el usuario que no coinciden con la solución. */
export function wrongCells(grid: readonly number[], solution: readonly number[]): number[] {
  return grid.flatMap((value, index) => (value && value !== solution[index] ? [index] : []));
}

// ---------------------------------------------------------------------------------------------
// Backtracking
// ---------------------------------------------------------------------------------------------

/**
 * Cuenta soluciones hasta `limit` (por defecto 2: basta para saber si es única).
 * Si `firstSolution` se pasa, se rellena con la primera solución encontrada.
 */
export function countSolutions(grid: readonly number[], limit = 2, firstSolution?: Grid): number {
  if (findConflicts(grid).size > 0) return 0;
  const work = grid.slice();
  let count = 0;

  const search = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (work[i]) continue;
      const mask = candidateMask(work, i);
      const n = bitCount(mask);
      if (n === 0) return false;
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 1) break;
      }
    }
    if (best < 0) {
      count++;
      if (count === 1 && firstSolution) firstSolution.splice(0, 81, ...work);
      return count >= limit;
    }
    for (let m = bestMask; m; m &= m - 1) {
      work[best] = lowestDigit(m);
      if (search()) return true;
    }
    work[best] = 0;
    return false;
  };

  search();
  return count;
}

export function solve(grid: readonly number[]): Grid | null {
  const solution: Grid = [];
  return countSolutions(grid, 1, solution) === 1 ? solution : null;
}

// ---------------------------------------------------------------------------------------------
// Resolución por técnicas humanas
// ---------------------------------------------------------------------------------------------

export interface LogicResult {
  solved: boolean;
  used: Set<Technique>;
  grid: Grid;
}

/** Resuelve aplicando solo las técnicas permitidas; no adivina. */
export function solveLogically(grid: readonly number[], allowed: readonly Technique[]): LogicResult {
  const work = grid.slice();
  const masks = work.map((_, i) => candidateMask(work, i));
  const used = new Set<Technique>();
  const allow = new Set(allowed);

  const place = (index: number, digit: number) => {
    work[index] = digit;
    masks[index] = 0;
    for (const peer of PEERS[index]) masks[peer] &= ~(1 << digit);
  };

  const nakedSingles = (): boolean => {
    let progress = false;
    for (let i = 0; i < 81; i++) {
      if (!work[i] && bitCount(masks[i]) === 1) {
        place(i, lowestDigit(masks[i]));
        progress = true;
      }
    }
    return progress;
  };

  const hiddenSingles = (): boolean => {
    let progress = false;
    for (const unit of UNITS) {
      for (let d = 1; d <= 9; d++) {
        const bit = 1 << d;
        if (unit.some((i) => work[i] === d)) continue;
        const spots = unit.filter((i) => masks[i] & bit);
        if (spots.length === 1) {
          place(spots[0], d);
          progress = true;
        }
      }
    }
    return progress;
  };

  const lockedCandidates = (): boolean => {
    let progress = false;
    const boxes = UNITS.slice(18);
    const lines = UNITS.slice(0, 18);
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      // Apuntado: en una caja, el dígito solo cabe en una fila/columna → se elimina del resto de esa línea.
      for (const box of boxes) {
        const spots = box.filter((i) => masks[i] & bit);
        if (spots.length < 2) continue;
        for (const line of lines) {
          if (spots.every((i) => line.includes(i))) {
            for (const i of line) {
              if (!box.includes(i) && masks[i] & bit) {
                masks[i] &= ~bit;
                progress = true;
              }
            }
          }
        }
      }
      // Reclamo: en una línea, el dígito solo cabe en una caja → se elimina del resto de la caja.
      for (const line of lines) {
        const spots = line.filter((i) => masks[i] & bit);
        if (spots.length < 2) continue;
        const box = boxes.find((b) => spots.every((i) => b.includes(i)));
        if (!box) continue;
        for (const i of box) {
          if (!line.includes(i) && masks[i] & bit) {
            masks[i] &= ~bit;
            progress = true;
          }
        }
      }
    }
    return progress;
  };

  const nakedPairs = (): boolean => {
    let progress = false;
    for (const unit of UNITS) {
      const pairs = unit.filter((i) => !work[i] && bitCount(masks[i]) === 2);
      for (let a = 0; a < pairs.length; a++) {
        for (let b = a + 1; b < pairs.length; b++) {
          const mask = masks[pairs[a]];
          if (mask !== masks[pairs[b]]) continue;
          for (const i of unit) {
            if (i !== pairs[a] && i !== pairs[b] && masks[i] & mask) {
              masks[i] &= ~mask;
              progress = true;
            }
          }
        }
      }
    }
    return progress;
  };

  const steps: [Technique, () => boolean][] = [
    ["single-desnudo", nakedSingles],
    ["single-oculto", hiddenSingles],
    ["bloqueo", lockedCandidates],
    ["par-desnudo", nakedPairs],
  ];

  let progress = true;
  while (progress) {
    progress = false;
    if (work.some((v, i) => !v && masks[i] === 0)) break; // contradicción
    for (const [technique, step] of steps) {
      if (!allow.has(technique)) continue;
      if (step()) {
        used.add(technique);
        progress = true;
        break; // vuelve a empezar por la técnica más sencilla
      }
    }
  }
  return { solved: isSolved(work), used, grid: work };
}

// ---------------------------------------------------------------------------------------------
// Generación
// ---------------------------------------------------------------------------------------------

export type Random = () => number;

/** Generador determinista (mulberry32) para pruebas y para poder reproducir un sudoku por semilla. */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: Random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function generateSolvedGrid(random: Random): Grid {
  const grid: Grid = new Array(81).fill(0);
  const fill = (index: number): boolean => {
    if (index === 81) return true;
    const digits = shuffle(candidates(grid, index), random);
    for (const d of digits) {
      grid[index] = d;
      if (fill(index + 1)) return true;
    }
    grid[index] = 0;
    return false;
  };
  fill(0);
  return grid;
}

export interface SudokuPuzzle {
  level: number;
  puzzle: Grid;
  solution: Grid;
  clues: number;
  /** Técnicas que necesitó el resolutor lógico (o "busqueda" si no bastan). */
  techniques: Technique[];
}

/**
 * Genera un sudoku de solución única para el nivel. Quita números por parejas simétricas
 * (simetría rotacional, la convención clásica) mientras la solución siga siendo única y
 * resoluble con las técnicas del nivel.
 */
export function generateSudoku(level: number, random: Random = Math.random): SudokuPuzzle {
  const config = levelConfig(level);
  const solution = generateSolvedGrid(random);
  const puzzle = solution.slice();
  const requiresSearch = config.techniques.includes("busqueda");
  const logical = config.techniques.filter((t) => t !== "busqueda");

  const order = shuffle(Array.from({ length: 41 }, (_, i) => i), random);
  let clues = 81;
  for (const index of order) {
    if (clues <= config.clues) break;
    const mirror = 80 - index;
    const removed = index === mirror ? [index] : [index, mirror];
    const backup = removed.map((i) => puzzle[i]);
    for (const i of removed) puzzle[i] = 0;

    const unique = countSolutions(puzzle, 2) === 1;
    const solvable = unique && (requiresSearch || solveLogically(puzzle, logical).solved);
    if (solvable) {
      clues -= removed.length;
    } else {
      removed.forEach((i, k) => (puzzle[i] = backup[k]));
    }
  }

  const logic = solveLogically(puzzle, logical);
  const techniques = [...logic.used];
  if (!logic.solved) techniques.push("busqueda");
  return { level: config.level, puzzle, solution, clues, techniques };
}
