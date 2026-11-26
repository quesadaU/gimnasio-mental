import type { ContentPack } from "@/core/types";
import type { ReappraisalPrompt } from "@/features/bienestar/domain/types";

/**
 * Preguntas de reevaluación cognitiva. No buscan "pensar en positivo" a la fuerza: a veces la
 * emoción encaja con lo que pasa y lo útil es atender a lo que necesitas.
 */
const pack: ContentPack<ReappraisalPrompt> = {
  id: "reevaluacion-guiada",
  module: "bienestar",
  version: 1,
  locale: "es",
  title: "Mirar desde otro ángulo",
  items: [
    {
      id: "persona-querida",
      question: "Si una persona a la que quieres viviera esto, ¿qué le dirías?",
      hint: "A menudo somos más justos y amables con los demás que con nosotros mismos.",
    },
    {
      id: "hechos-suposiciones",
      question: "¿Qué sabes con seguridad y qué estás suponiendo?",
      hint: "Separar los hechos de las interpretaciones puede dar un poco de espacio.",
    },
    {
      id: "otra-explicacion",
      question: "¿Hay otra forma posible de entender lo que pasó?",
      hint: "No hace falta que sea la verdadera; basta con que sea posible.",
    },
    {
      id: "con-tiempo",
      question: "Pensando en dentro de un mes, ¿cómo podrías ver esto?",
      hint: "La distancia en el tiempo a veces cambia el tamaño de las cosas. A veces no, y también está bien.",
    },
    {
      id: "en-tu-mano",
      question: "¿Qué parte de esto depende de ti y qué parte no?",
      hint: "Lo que está en tu mano puede ser pequeño: descansar, pedir ayuda, esperar un poco.",
    },
    {
      id: "que-necesito",
      question: "¿Qué necesitas ahora mismo?",
      hint: "Esta emoción puede estar señalando algo importante para ti. Escucharla también cuenta.",
    },
  ],
};

export default pack;
