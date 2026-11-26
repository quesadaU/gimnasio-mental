/**
 * Corrección pura de ejercicios. Cada función devuelve si es correcto, una retroalimentación
 * específica sobre el error cometido y la explicación general. Nunca ejecuta código del usuario.
 */

import { sonEquivalentes } from "./expresiones.ts";
import type {
  Correccion,
  Ejercicio,
  EjercicioCompletarCodigo,
  EjercicioNumerico,
  EjercicioOpcionMultiple,
  EjercicioOrdenar,
  EjercicioTexto,
  EjercicioVerdaderoFalso,
  Respuesta,
} from "./types.ts";

const ARTICULOS_INICIALES = /^(el|la|los|las|un|una|unos|unas|lo)\s+/;

/** Minúsculas, sin tildes (conserva la ñ), sin puntuación final, espacios colapsados y sin artículo inicial. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFC")
    .toLowerCase()
    .replace(/ñ/g, "\u0000")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\u0000/g, "ñ")
    .replace(/[¿¡"'«»“”]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*[.,;:!?]+$/g, "")
    .replace(ARTICULOS_INICIALES, "");
}

/**
 * Interpreta un número escrito por una persona: admite coma o punto decimal, signo,
 * fracciones `a/b`, espacios y un `%` final. No admite separador de miles.
 */
export function interpretarNumero(entrada: string): number | null {
  const limpio = entrada
    .replace(/\s+/g, "")
    .replace(/[−–]/g, "-")
    .replace(/%$/, "")
    .replace(",", ".");
  if (limpio === "") return null;
  const fraccion = /^([+-]?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(limpio);
  if (fraccion) {
    const denominador = Number(fraccion[2]);
    return denominador === 0 ? null : Number(fraccion[1]) / denominador;
  }
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(limpio)) return null;
  return Number(limpio);
}

/** Normaliza código para comparar: comillas unificadas y sin espacios no significativos. */
export function normalizarCodigo(codigo: string): string {
  return codigo
    .replace(/[‘’']/g, '"')
    .replace(/[“”]/g, '"')
    .replace(/\s*([()[\]{}:,=<>!+\-*/%])\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

export function corregirOpcionMultiple(ejercicio: EjercicioOpcionMultiple, opcion: string): Correccion {
  const elegida = ejercicio.opciones.find((candidata) => candidata.id === opcion);
  if (!elegida) return { correcto: false, retro: "Elige una opción.", explicacion: ejercicio.explicacion };
  if (elegida.id === ejercicio.correcta) {
    return { correcto: true, retro: "Correcto.", explicacion: ejercicio.explicacion };
  }
  return {
    correcto: false,
    retro: elegida.retro ?? "Esa opción no es la correcta.",
    explicacion: ejercicio.explicacion,
  };
}

export function corregirNumerico(ejercicio: EjercicioNumerico, entrada: string): Correccion {
  const valor = interpretarNumero(entrada);
  if (valor === null) {
    return {
      correcto: false,
      retro: "No reconozco un número. Usa cifras, coma o punto decimal, o una fracción como 3/4.",
      explicacion: ejercicio.explicacion,
    };
  }
  const tolerancia = ejercicio.tolerancia ?? 0;
  if (Math.abs(valor - ejercicio.respuesta) <= tolerancia + 1e-9) {
    return { correcto: true, retro: "Correcto.", explicacion: ejercicio.explicacion };
  }
  const comun = ejercicio.erroresComunes?.find((error) => Math.abs(error.valor - valor) <= tolerancia + 1e-9);
  return {
    correcto: false,
    retro: comun?.retro ?? (valor > ejercicio.respuesta ? "Tu resultado es mayor que el correcto." : "Tu resultado es menor que el correcto."),
    explicacion: ejercicio.explicacion,
  };
}

export function corregirTexto(ejercicio: EjercicioTexto, entrada: string): Correccion {
  const normalizada = normalizarTexto(entrada);
  if (normalizada === "") {
    return { correcto: false, retro: "Escribe una respuesta.", explicacion: ejercicio.explicacion };
  }
  if (ejercicio.aceptadas.some((aceptada) => normalizarTexto(aceptada) === normalizada)) {
    return { correcto: true, retro: "Correcto.", explicacion: ejercicio.explicacion };
  }
  const comun = ejercicio.erroresComunes?.find((error) => normalizarTexto(error.respuesta) === normalizada);
  return {
    correcto: false,
    retro: comun?.retro ?? "No coincide con la respuesta esperada.",
    explicacion: ejercicio.explicacion,
  };
}

export function corregirOrden(ejercicio: EjercicioOrdenar, orden: readonly string[]): Correccion {
  const esperado = ejercicio.pasos.map((paso) => paso.id);
  const mismaColeccion =
    orden.length === esperado.length && [...orden].sort().join("|") === [...esperado].sort().join("|");
  if (!mismaColeccion) {
    return { correcto: false, retro: "Coloca todos los pasos.", explicacion: ejercicio.explicacion };
  }
  const primerFallo = orden.findIndex((id, indice) => id !== esperado[indice]);
  if (primerFallo === -1) return { correcto: true, retro: "Correcto.", explicacion: ejercicio.explicacion };
  const bienColocados = orden.filter((id, indice) => id === esperado[indice]).length;
  const texto = (id: string) => ejercicio.pasos.find((paso) => paso.id === id)?.texto ?? id;
  return {
    correcto: false,
    retro: `Tienes ${bienColocados} de ${esperado.length} pasos en su sitio. El primer desajuste está en la posición ${primerFallo + 1}: ahí va «${texto(esperado[primerFallo])}», no «${texto(orden[primerFallo])}».`,
    explicacion: ejercicio.explicacion,
  };
}

/** Resultado de un único hueco: útil para que la UI marque cuál falla. */
export function corregirHueco(
  hueco: EjercicioCompletarCodigo["huecos"][number],
  entrada: string,
): { correcto: boolean; motivo?: string } {
  const normalizada = normalizarCodigo(entrada);
  if (normalizada === "") return { correcto: false, motivo: "Está vacío." };
  if (hueco.aceptadas.some((aceptada) => normalizarCodigo(aceptada) === normalizada)) return { correcto: true };
  if (hueco.equivalencia) {
    const resultado = sonEquivalentes(hueco.aceptadas[0], entrada, hueco.equivalencia);
    if (resultado.equivalente) return { correcto: true };
    return { correcto: false, motivo: hueco.retro ? `${resultado.motivo} ${hueco.retro}` : resultado.motivo };
  }
  return { correcto: false, motivo: hueco.retro };
}

export function corregirCompletarCodigo(
  ejercicio: EjercicioCompletarCodigo,
  entradas: readonly string[],
): Correccion & { huecos: boolean[] } {
  const resultados = ejercicio.huecos.map((hueco, indice) => corregirHueco(hueco, entradas[indice] ?? ""));
  const huecos = resultados.map((resultado) => resultado.correcto);
  if (huecos.every(Boolean)) {
    return { correcto: true, retro: "Correcto.", explicacion: ejercicio.explicacion, huecos };
  }
  const fallos = resultados
    .map((resultado, indice) => ({ ...resultado, indice }))
    .filter((resultado) => !resultado.correcto)
    .map((resultado) => {
      const prefijo = ejercicio.huecos.length > 1 ? `Hueco ${resultado.indice + 1}: ` : "";
      return `${prefijo}${resultado.motivo ?? "no es lo que necesita el código."}`;
    });
  return { correcto: false, retro: fallos.join(" "), explicacion: ejercicio.explicacion, huecos };
}

export function corregirVerdaderoFalso(
  ejercicio: EjercicioVerdaderoFalso,
  valor: boolean,
  justificacion: string,
): Correccion {
  const valorOk = valor === ejercicio.esVerdadera;
  const justificacionOk = justificacion === ejercicio.justificacionCorrecta;
  if (valorOk && justificacionOk) return { correcto: true, retro: "Correcto.", explicacion: ejercicio.explicacion };
  const elegida = ejercicio.justificaciones.find((opcion) => opcion.id === justificacion);
  if (!elegida) {
    return { correcto: false, retro: "Elige también una justificación.", explicacion: ejercicio.explicacion };
  }
  if (valorOk) {
    return {
      correcto: false,
      retro: `Aciertas el valor de verdad, pero la justificación no lo explica. ${elegida.retro ?? ""}`.trim(),
      explicacion: ejercicio.explicacion,
    };
  }
  return {
    correcto: false,
    retro: `La afirmación es ${ejercicio.esVerdadera ? "verdadera" : "falsa"}. ${elegida.retro ?? ""}`.trim(),
    explicacion: ejercicio.explicacion,
  };
}

/** Punto de entrada único: despacha según el tipo. */
export function corregir(ejercicio: Ejercicio, respuesta: Respuesta): Correccion {
  if (ejercicio.tipo !== respuesta.tipo) {
    return { correcto: false, retro: "Respuesta de otro tipo.", explicacion: ejercicio.explicacion };
  }
  switch (ejercicio.tipo) {
    case "opcion-multiple":
      return corregirOpcionMultiple(ejercicio, (respuesta as { opcion: string }).opcion);
    case "numerica":
      return corregirNumerico(ejercicio, (respuesta as { valor: string }).valor);
    case "texto":
      return corregirTexto(ejercicio, (respuesta as { valor: string }).valor);
    case "ordenar":
      return corregirOrden(ejercicio, (respuesta as { orden: readonly string[] }).orden);
    case "completar-codigo":
      return corregirCompletarCodigo(ejercicio, (respuesta as { huecos: readonly string[] }).huecos);
    case "verdadero-falso": {
      const r = respuesta as { valor: boolean; justificacion: string };
      return corregirVerdaderoFalso(ejercicio, r.valor, r.justificacion);
    }
  }
}

/** Cuenta los marcadores `___` de una plantilla. */
export function contarHuecos(plantilla: string): number {
  return plantilla.split("___").length - 1;
}

/** Hash FNV-1a de 32 bits: semilla estable a partir del id del ejercicio. */
function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Baraja de forma determinista (misma semilla, mismo orden: estable entre servidor y cliente)
 * y garantiza que el resultado no coincide con el orden original si hay más de un elemento.
 */
export function barajarDeterminista<T>(elementos: readonly T[], semilla: string): T[] {
  const copia = [...elementos];
  let estado = hash(semilla) || 1;
  const aleatorio = () => {
    estado ^= estado << 13;
    estado ^= estado >>> 17;
    estado ^= estado << 5;
    return (estado >>> 0) / 0x100000000;
  };
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  if (copia.length > 1 && copia.every((elemento, indice) => elemento === elementos[indice])) {
    copia.push(copia.shift() as T);
  }
  return copia;
}
