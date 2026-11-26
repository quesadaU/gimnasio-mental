/**
 * Contenido de go/no-go. La distinción go/no-go es de forma (letra), nunca de color.
 * Parámetros por nivel: features/patio/games/go-no-go/domain/params.ts.
 */

export const GO_STIMULI: readonly string[] = ["A", "E", "H", "K", "M", "T"];
export const NO_GO_STIMULUS = "X";

export const GO_NO_GO_KEYS = {
  press: [" ", "j", "J"],
  withhold: ["f", "F"],
} as const;

export const GO_NO_GO_TEXTS = {
  intro: `Aparecerán letras de una en una. Pulsa lo antes posible con cada letra, salvo con la ${NO_GO_STIMULUS}: con la ${NO_GO_STIMULUS} no hagas nada.`,
  why: `La ${NO_GO_STIMULUS} aparece pocas veces, así que pulsar se vuelve automático. El reto es frenar a tiempo.`,
  untimed: `En el modo sin límite cada letra espera: elige «Pulsar» o «Dejar pasar» (con la ${NO_GO_STIMULUS}).`,
  keys: "Teclado: barra espaciadora o J para pulsar; en el modo sin límite, F para dejar pasar.",
  honesty:
    "Practicas el freno de respuestas automáticas en esta tarea. Medimos el progreso en esta tarea; no prometemos efectos fuera de ella.",
  adaptive:
    "Cada 10 letras se revisa la dificultad: si aciertas al menos 9 de 10 en dos bloques seguidos, sube (la X es más rara y el ritmo más rápido); si no, baja.",
  press: "Pulsar",
  withhold: "Dejar pasar",
  feedback: {
    acierto: "Bien",
    "rechazo-correcto": "Bien frenado",
    omision: "No pulsaste",
    anticipacion: "Demasiado pronto",
    comision: `Era ${NO_GO_STIMULUS}: no había que pulsar`,
  },
  nextHint:
    "Para variar, prueba después un ejercicio de memoria o de lógica: alternar tareas es mejor que repetir solo una.",
} as const;
