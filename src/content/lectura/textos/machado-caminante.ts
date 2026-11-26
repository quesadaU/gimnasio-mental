import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "machado-caminante",
  title: "Caminante, no hay camino",
  summary: "Un poema breve de Antonio Machado para leer despacio y más de una vez.",
  topic: "literatura",
  level: "inicial",
  words: 50,
  form: "verso",
  source: {
    kind: "dominio-publico",
    author: "Antonio Machado (1875-1939)",
    work: "Campos de Castilla, «Proverbios y cantares», XXIX",
    license:
      "Dominio público en España (autor fallecido en 1939: más de 80 años desde su muerte, según la Ley de Propiedad Intelectual)",
    reference:
      "Texto de dominio público; puede cotejarse en cualquier edición de Campos de Castilla o en la Biblioteca Virtual Miguel de Cervantes (cervantesvirtual.com).",
  },
  paragraphs: [
    "Caminante, son tus huellas\nel camino y nada más;\ncaminante, no hay camino,\nse hace camino al andar.",
    "Al andar se hace camino,\ny al volver la vista atrás\nse ve la senda que nunca\nse ha de volver a pisar.",
    "Caminante, no hay camino,\nsino estelas en la mar.",
  ],
  questions: [
    {
      id: "q-huellas",
      kind: "literal",
      prompt: "Según el poema, ¿qué es el camino?",
      options: [
        "Una senda trazada de antemano",
        "Un mapa que hay que seguir",
        "Las huellas del caminante, y nada más",
        "El lugar al que se quiere llegar",
      ],
      correctIndex: 2,
      explanation: "Lo dicen los dos primeros versos: «son tus huellas / el camino y nada más».",
    },
    {
      id: "q-sentido",
      kind: "inferencial",
      prompt: "¿Qué idea sobre la vida sugiere el poema?",
      options: [
        "Que el recorrido no está trazado de antemano: se construye con lo que uno va haciendo",
        "Que es mejor no salir nunca de casa",
        "Que todos los caminos llevan al mismo sitio",
        "Que hay que planificarlo todo antes de empezar",
      ],
      correctIndex: 0,
      explanation:
        "Si «no hay camino» y «se hace camino al andar», el camino no existe antes de recorrerlo. Leído como imagen de la vida, sugiere que la trayectoria se construye con los propios pasos.",
    },
    {
      id: "q-estelas",
      kind: "vocabulario",
      prompt: "En el último verso, «estelas en la mar» son…",
      options: [
        "estrellas reflejadas en el agua",
        "monumentos de piedra junto al mar",
        "olas muy altas",
        "el rastro que deja un barco en el agua y que pronto desaparece",
      ],
      correctIndex: 3,
      explanation:
        "Una estela es el rastro que deja una embarcación al moverse. En el agua se borra enseguida, lo que refuerza la idea de la senda que «nunca se ha de volver a pisar». («Estela» también puede ser un monumento de piedra, pero aquí el contexto marino lo descarta.)",
    },
    {
      id: "q-repeticion",
      kind: "estructura",
      prompt: "¿Qué efecto tiene repetir «caminante, no hay camino» al principio y al final?",
      options: [
        "Indica que el poema está incompleto",
        "Cierra el poema volviendo a la idea central, ahora con una imagen nueva (las estelas)",
        "Cambia de tema por completo",
        "Es un error del autor",
      ],
      correctIndex: 1,
      explanation:
        "La repetición enmarca el poema y lo cierra sobre su idea principal; la variación final («sino estelas en la mar») añade la imagen de lo que no deja una huella permanente.",
    },
  ],
  keyIdeas: [
    {
      id: "camino-al-andar",
      prompt: "¿Qué dice Machado sobre el camino en «Caminante, no hay camino»?",
      answer: "Que no existe de antemano: son las propias huellas, y se hace al andar.",
    },
    {
      id: "estelas",
      prompt: "¿Qué sugiere la imagen final de las «estelas en la mar»?",
      answer: "Que el rastro del camino recorrido no permanece: como la estela de un barco, se borra y no se puede volver a pisar.",
    },
  ],
};

const pack: ContentPack<ReadingText> = {
  id: text.id,
  module: "lectura",
  version: 1,
  locale: "es",
  title: text.title,
  items: [text],
};

export default pack;
