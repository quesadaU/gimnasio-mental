/**
 * Intérprete propio de un mini-lenguaje de expresiones con sintaxis de Python.
 * Sirve para aceptar respuestas equivalentes en "completar código" (p. ej. `i < 6` y `i <= 5`)
 * sin ejecutar nunca código del usuario: no usa eval, new Function ni ningún motor externo.
 *
 * Gramática admitida (y nada más): números, True/False, variables, paréntesis,
 * + - * / // % **, comparaciones encadenadas (== != < <= > >=) y not/and/or.
 * Sin llamadas, sin atributos, sin cadenas, sin asignaciones. Longitud acotada.
 */

export type Valor = number | boolean;

export type Nodo =
  | { k: "num"; v: number }
  | { k: "bool"; v: boolean }
  | { k: "var"; nombre: string }
  | { k: "unario"; op: "-" | "+" | "not"; arg: Nodo }
  | { k: "binario"; op: "+" | "-" | "*" | "/" | "//" | "%" | "**"; izq: Nodo; der: Nodo }
  | { k: "logico"; op: "and" | "or"; izq: Nodo; der: Nodo }
  | { k: "comparacion"; ops: OpComparacion[]; operandos: Nodo[] };

type OpComparacion = "==" | "!=" | "<" | "<=" | ">" | ">=";

export class ErrorExpresion extends Error {}

const MAX_LONGITUD = 200;
const MAX_PROFUNDIDAD = 40;

type Token =
  | { t: "num"; v: number }
  | { t: "id"; v: string }
  | { t: "op"; v: string }
  | { t: "fin" };

const OPERADORES = ["**", "//", "==", "!=", "<=", ">=", "+", "-", "*", "/", "%", "<", ">", "(", ")"];

function tokenizar(fuente: string): Token[] {
  if (fuente.length > MAX_LONGITUD) throw new ErrorExpresion("La expresión es demasiado larga.");
  const tokens: Token[] = [];
  let i = 0;
  while (i < fuente.length) {
    const c = fuente[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    const numero = /^(\d+(\.\d+)?|\.\d+)/.exec(fuente.slice(i));
    if (numero) {
      tokens.push({ t: "num", v: Number(numero[0]) });
      i += numero[0].length;
      continue;
    }
    const ident = /^[A-Za-z_][A-Za-z0-9_]*/.exec(fuente.slice(i));
    if (ident) {
      tokens.push({ t: "id", v: ident[0] });
      i += ident[0].length;
      continue;
    }
    const op = OPERADORES.find((candidato) => fuente.startsWith(candidato, i));
    if (op) {
      tokens.push({ t: "op", v: op });
      i += op.length;
      continue;
    }
    throw new ErrorExpresion(`Símbolo no admitido: «${c}».`);
  }
  tokens.push({ t: "fin" });
  return tokens;
}

const PALABRAS_RESERVADAS = new Set(["and", "or", "not", "True", "False"]);

/** Analiza la expresión y devuelve su árbol. Lanza ErrorExpresion si no es válida. */
export function analizar(fuente: string): Nodo {
  const tokens = tokenizar(fuente);
  let pos = 0;
  let profundidad = 0;

  const actual = () => tokens[pos];
  const esOp = (v: string) => {
    const tk = actual();
    return tk.t === "op" && tk.v === v;
  };
  const esId = (v: string) => {
    const tk = actual();
    return tk.t === "id" && tk.v === v;
  };

  function entrar() {
    profundidad++;
    if (profundidad > MAX_PROFUNDIDAD) throw new ErrorExpresion("La expresión está demasiado anidada.");
  }

  function o(): Nodo {
    let izq = y();
    while (esId("or")) {
      pos++;
      izq = { k: "logico", op: "or", izq, der: y() };
    }
    return izq;
  }

  function y(): Nodo {
    let izq = no();
    while (esId("and")) {
      pos++;
      izq = { k: "logico", op: "and", izq, der: no() };
    }
    return izq;
  }

  function no(): Nodo {
    if (esId("not")) {
      pos++;
      entrar();
      const arg = no();
      profundidad--;
      return { k: "unario", op: "not", arg };
    }
    return comparacion();
  }

  function comparacion(): Nodo {
    const primero = suma();
    const ops: OpComparacion[] = [];
    const operandos: Nodo[] = [primero];
    for (;;) {
      const tk = actual();
      if (tk.t === "op" && ["==", "!=", "<", "<=", ">", ">="].includes(tk.v)) {
        pos++;
        ops.push(tk.v as OpComparacion);
        operandos.push(suma());
      } else break;
    }
    return ops.length === 0 ? primero : { k: "comparacion", ops, operandos };
  }

  function suma(): Nodo {
    let izq = producto();
    while (esOp("+") || esOp("-")) {
      const op = (actual() as { v: "+" | "-" }).v;
      pos++;
      izq = { k: "binario", op, izq, der: producto() };
    }
    return izq;
  }

  function producto(): Nodo {
    let izq = unario();
    while (esOp("*") || esOp("/") || esOp("//") || esOp("%")) {
      const op = (actual() as { v: "*" | "/" | "//" | "%" }).v;
      pos++;
      izq = { k: "binario", op, izq, der: unario() };
    }
    return izq;
  }

  function unario(): Nodo {
    if (esOp("-") || esOp("+")) {
      const op = (actual() as { v: "-" | "+" }).v;
      pos++;
      entrar();
      const arg = unario();
      profundidad--;
      return { k: "unario", op, arg };
    }
    return potencia();
  }

  function potencia(): Nodo {
    const base = atomo();
    if (esOp("**")) {
      pos++;
      entrar();
      const exponente = unario(); // asociativa por la derecha, como en Python
      profundidad--;
      return { k: "binario", op: "**", izq: base, der: exponente };
    }
    return base;
  }

  function atomo(): Nodo {
    const tk = actual();
    if (tk.t === "num") {
      pos++;
      return { k: "num", v: tk.v };
    }
    if (tk.t === "id") {
      if (tk.v === "True" || tk.v === "False") {
        pos++;
        return { k: "bool", v: tk.v === "True" };
      }
      if (PALABRAS_RESERVADAS.has(tk.v)) throw new ErrorExpresion(`Falta un operando antes de «${tk.v}».`);
      pos++;
      return { k: "var", nombre: tk.v };
    }
    if (esOp("(")) {
      pos++;
      entrar();
      const interior = o();
      profundidad--;
      if (!esOp(")")) throw new ErrorExpresion("Falta cerrar un paréntesis.");
      pos++;
      return interior;
    }
    if (tk.t === "fin") throw new ErrorExpresion("La expresión está incompleta.");
    throw new ErrorExpresion(`No se esperaba «${tk.v}».`);
  }

  const arbol = o();
  if (actual().t !== "fin") {
    const tk = actual();
    throw new ErrorExpresion(`Sobra algo al final: «${tk.t === "fin" ? "" : tk.v}».`);
  }
  return arbol;
}

/** Variables que aparecen en la expresión. */
export function variablesDe(nodo: Nodo, acumuladas: Set<string> = new Set()): Set<string> {
  switch (nodo.k) {
    case "var":
      acumuladas.add(nodo.nombre);
      break;
    case "unario":
      variablesDe(nodo.arg, acumuladas);
      break;
    case "binario":
    case "logico":
      variablesDe(nodo.izq, acumuladas);
      variablesDe(nodo.der, acumuladas);
      break;
    case "comparacion":
      for (const operando of nodo.operandos) variablesDe(operando, acumuladas);
      break;
  }
  return acumuladas;
}

const num = (v: Valor): number => (typeof v === "boolean" ? (v ? 1 : 0) : v);
const verdad = (v: Valor): boolean => (typeof v === "boolean" ? v : v !== 0);

/** Evalúa con semántica de Python (división real, división entera y módulo con suelo). */
export function evaluar(nodo: Nodo, entorno: Readonly<Record<string, Valor>>): Valor {
  switch (nodo.k) {
    case "num":
    case "bool":
      return nodo.v;
    case "var": {
      if (!Object.prototype.hasOwnProperty.call(entorno, nodo.nombre)) {
        throw new ErrorExpresion(`La variable «${nodo.nombre}» no existe en este código.`);
      }
      return entorno[nodo.nombre];
    }
    case "unario": {
      const v = evaluar(nodo.arg, entorno);
      if (nodo.op === "not") return !verdad(v);
      return nodo.op === "-" ? -num(v) : num(v);
    }
    case "logico": {
      const izq = evaluar(nodo.izq, entorno);
      if (nodo.op === "and") return verdad(izq) ? evaluar(nodo.der, entorno) : izq;
      return verdad(izq) ? izq : evaluar(nodo.der, entorno);
    }
    case "comparacion": {
      let izq = evaluar(nodo.operandos[0], entorno);
      for (let i = 0; i < nodo.ops.length; i++) {
        const der = evaluar(nodo.operandos[i + 1], entorno);
        if (!comparar(nodo.ops[i], num(izq), num(der))) return false;
        izq = der;
      }
      return true;
    }
    case "binario": {
      const a = num(evaluar(nodo.izq, entorno));
      const b = num(evaluar(nodo.der, entorno));
      switch (nodo.op) {
        case "+":
          return a + b;
        case "-":
          return a - b;
        case "*":
          return a * b;
        case "**":
          return a ** b;
        case "/":
          if (b === 0) throw new ErrorExpresion("División entre cero.");
          return a / b;
        case "//":
          if (b === 0) throw new ErrorExpresion("División entre cero.");
          return Math.floor(a / b);
        case "%":
          if (b === 0) throw new ErrorExpresion("División entre cero.");
          return a - b * Math.floor(a / b);
      }
    }
  }
}

function comparar(op: OpComparacion, a: number, b: number): boolean {
  switch (op) {
    case "==":
      return a === b;
    case "!=":
      return a !== b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    case ">":
      return a > b;
    case ">=":
      return a >= b;
  }
}

const MAX_COMBINACIONES = 2000;

/** Todas las asignaciones posibles de valores del dominio (producto cartesiano acotado). */
export function combinaciones(dominio: Readonly<Record<string, readonly number[]>>): Record<string, number>[] {
  let resultado: Record<string, number>[] = [{}];
  for (const [nombre, valores] of Object.entries(dominio)) {
    const siguiente: Record<string, number>[] = [];
    for (const parcial of resultado) {
      for (const valor of valores) siguiente.push({ ...parcial, [nombre]: valor });
    }
    resultado = siguiente;
    if (resultado.length > MAX_COMBINACIONES) throw new ErrorExpresion("Dominio de prueba demasiado grande.");
  }
  return resultado;
}

const mismoValor = (a: Valor, b: Valor) => {
  const x = num(a);
  const y = num(b);
  return x === y || Math.abs(x - y) < 1e-9;
};

export type ResultadoEquivalencia =
  | { equivalente: true }
  | { equivalente: false; motivo: string };

/**
 * Compara dos expresiones evaluándolas en todas las combinaciones del dominio.
 * Equivalencia observacional sobre un dominio finito: suficiente para huecos acotados.
 */
export function sonEquivalentes(
  referencia: string,
  candidata: string,
  dominio: Readonly<Record<string, readonly number[]>>,
): ResultadoEquivalencia {
  let arbolCandidata: Nodo;
  try {
    arbolCandidata = analizar(candidata);
  } catch (error) {
    const detalle = error instanceof ErrorExpresion ? error.message : "Expresión no válida.";
    return { equivalente: false, motivo: `No es una expresión válida: ${detalle}` };
  }
  for (const nombre of variablesDe(arbolCandidata)) {
    if (!Object.prototype.hasOwnProperty.call(dominio, nombre)) {
      return { equivalente: false, motivo: `La variable «${nombre}» no existe en este código.` };
    }
  }
  const arbolReferencia = analizar(referencia);
  for (const entorno of combinaciones(dominio)) {
    let esperado: Valor | "error";
    let obtenido: Valor | "error";
    try {
      esperado = evaluar(arbolReferencia, entorno);
    } catch {
      esperado = "error";
    }
    try {
      obtenido = evaluar(arbolCandidata, entorno);
    } catch {
      obtenido = "error";
    }
    const iguales =
      esperado === "error" || obtenido === "error" ? esperado === obtenido : mismoValor(esperado, obtenido);
    if (!iguales) {
      const valores = Object.entries(entorno)
        .map(([nombre, valor]) => `${nombre} = ${valor}`)
        .join(", ");
      return {
        equivalente: false,
        motivo: `Con ${valores || "estos valores"} tu expresión da ${formatear(obtenido)} y debería dar ${formatear(esperado)}.`,
      };
    }
  }
  return { equivalente: true };
}

function formatear(valor: Valor | "error"): string {
  if (valor === "error") return "un error";
  if (typeof valor === "boolean") return valor ? "True" : "False";
  return String(valor);
}
