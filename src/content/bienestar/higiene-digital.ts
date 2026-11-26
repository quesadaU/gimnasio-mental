import type { ContentPack } from "@/core/types";
import type { DigitalChallenge, SelfCheckQuestion } from "@/features/bienestar/domain/types";

export const selfCheckPack: ContentPack<SelfCheckQuestion> = {
  id: "autoobservacion-digital",
  module: "bienestar",
  version: 1,
  locale: "es",
  title: "Cómo uso las pantallas y la IA",
  items: [
    {
      id: "solo-un-momento",
      area: "desplazamiento",
      statement: "Abro una red social o una app de vídeos «solo un momento» y se me va mucho más tiempo del que quería.",
      reflection:
        "Le pasa a muchísima gente: estas apps están diseñadas para que sigamos deslizando. Decidir el final del rato antes de empezar suele ayudar más que la fuerza de voluntad.",
      suggestedChallengeId: "final-pactado",
    },
    {
      id: "noticias-negativas",
      area: "desplazamiento",
      statement: "Sigo leyendo noticias o comentarios negativos aunque noto que me hacen sentir peor.",
      reflection:
        "Estar informado es valioso, pero el flujo continuo de malas noticias puede dejar un poso de inquietud. Elegir un momento concreto para informarte puede darte el mismo dato con menos desgaste.",
      suggestedChallengeId: "dosis-noticias",
    },
    {
      id: "movil-en-cama",
      area: "descanso",
      statement: "Miro el móvil en la cama antes de dormir o nada más despertar.",
      reflection:
        "La pantalla en la cama alarga la noche y llena el primer minuto del día con lo que otros quieren. Probar a dejar el móvil fuera del alcance es un cambio pequeño que mucha gente nota.",
      suggestedChallengeId: "dormitorio-sin-movil",
    },
    {
      id: "leer-sin-mirar",
      area: "atencion",
      statement: "Me cuesta leer o concentrarme un rato seguido sin mirar el móvil.",
      reflection:
        "La atención sostenida es como un músculo que se desacostumbra. Ratos cortos y protegidos, sin el móvil cerca, son una buena forma de volver a entrenarla.",
      suggestedChallengeId: "bloque-lectura",
    },
    {
      id: "ia-antes-de-pensar",
      area: "ia",
      statement: "Pregunto a una IA antes de intentar pensar el problema por mi cuenta.",
      reflection:
        "La IA puede ser una gran ayuda. Intentarlo primero unos minutos, aunque no llegues a la solución, hace que lo que aprendas después se te quede mejor.",
      suggestedChallengeId: "intentar-primero",
    },
    {
      id: "ia-sin-revisar",
      area: "ia",
      statement: "Uso respuestas de una IA sin revisarlas ni comprobar si las entiendo.",
      reflection:
        "Las respuestas de una IA pueden sonar seguras y estar equivocadas. Explicarlas con tus palabras es una forma sencilla de comprobar si las entiendes y si encajan.",
      suggestedChallengeId: "explicar-con-tus-palabras",
    },
  ],
};

export const challengesPack: ContentPack<DigitalChallenge> = {
  id: "micro-retos-digitales",
  module: "bienestar",
  version: 1,
  locale: "es",
  title: "Micro-retos",
  items: [
    {
      id: "bloque-lectura",
      area: "atencion",
      title: "Un bloque de lectura sin pantalla",
      durationDays: 1,
      description: "Hoy, 20 minutos de lectura en papel (o en un lector sin notificaciones) con el móvil en otra habitación.",
      steps: [
        "Elige el momento y el libro antes de empezar.",
        "Deja el móvil fuera de la vista, en silencio.",
        "Si te distraes, apunta la idea en un papel y vuelve a la página.",
      ],
    },
    {
      id: "final-pactado",
      area: "desplazamiento",
      title: "Ponerle final al rato",
      durationDays: 1,
      description: "Hoy, cada vez que abras una red social, decide antes cuánto rato quieres estar y para qué.",
      steps: [
        "Antes de abrirla, di para ti: «cinco minutos, para ver los mensajes» (o lo que elijas).",
        "Pon un temporizador si te ayuda.",
        "Al terminar, nota cómo estás. Sin juzgarte si se alargó.",
      ],
    },
    {
      id: "explicar-con-tus-palabras",
      area: "ia",
      title: "Explicarlo con tus palabras",
      durationDays: 1,
      description: "Hoy, cuando uses una respuesta de una IA, intenta explicarla en dos o tres frases propias antes de usarla.",
      steps: [
        "Lee la respuesta completa.",
        "Escribe o di en voz alta qué dice y por qué.",
        "Si algo no lo puedes explicar, es una buena pista de qué revisar.",
      ],
    },
    {
      id: "dormitorio-sin-movil",
      area: "descanso",
      title: "El móvil duerme fuera",
      durationDays: 7,
      description: "Durante una semana, deja el móvil cargando fuera del alcance de la cama.",
      steps: [
        "Elige un sitio fijo para cargarlo, lejos de la cama.",
        "Si lo usas de despertador, prueba con uno sencillo o deja el móvil lejos y con volumen.",
        "Marca cada mañana en que lo hayas conseguido.",
      ],
    },
    {
      id: "dosis-noticias",
      area: "desplazamiento",
      title: "Noticias con hora",
      durationDays: 7,
      description: "Durante una semana, infórmate en uno o dos momentos elegidos del día, en vez de a ratos sueltos.",
      steps: [
        "Elige cuándo (por ejemplo, después de comer) y una o dos fuentes de confianza.",
        "Fuera de ese momento, si te entran ganas de mirar, nota la curiosidad y déjala pasar.",
        "Marca los días en que lo hayas probado.",
      ],
    },
    {
      id: "intentar-primero",
      area: "ia",
      title: "Primero lo intento yo",
      durationDays: 7,
      description: "Durante una semana, antes de preguntar a una IA, dedica 10 minutos a pensar el problema por tu cuenta.",
      steps: [
        "Escribe qué sabes y qué te falta para resolverlo.",
        "Prueba al menos una idea, aunque no estés seguro.",
        "Después pregunta a la IA y compara con lo que habías pensado.",
      ],
    },
  ],
};
