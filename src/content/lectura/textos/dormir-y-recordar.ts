import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "dormir-y-recordar",
  title: "Lo que el sueño hace con lo aprendido",
  summary: "Qué sabemos con bastante seguridad sobre sueño y memoria, y qué sigue en discusión.",
  topic: "ciencia",
  level: "intermedio",
  words: 389,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "En 1924, dos psicólogos estadounidenses, John Jenkins y Karl Dallenbach, hicieron un experimento modesto que todavía se cita. Dos personas aprendían listas de sílabas sin sentido y después las recordaban al cabo de unas horas. A veces habían pasado ese tiempo despiertas, haciendo su vida normal, y a veces durmiendo. Tras dormir, recordaban más. Los autores pensaron que la vigilia, con todo lo que ocurre en ella, interfiere con lo recién aprendido, y que el sueño lo protege de esas interferencias.",
    "Un siglo de investigación después, la relación entre sueño y memoria se considera bien establecida, aunque la explicación ha cambiado. Hoy se cree que el sueño no solo protege, sino que participa activamente en la consolidación: el proceso por el que un recuerdo recién formado, todavía frágil, se vuelve más estable. En estudios con roedores se ha observado que, durante el sueño, algunas neuronas del hipocampo reproducen patrones de actividad parecidos a los que mostraron mientras el animal exploraba un recorrido, como si repasaran la experiencia.",
    "Conviene separar lo que sabemos con bastante seguridad de lo que sigue abierto. Es sólido que dormir después de aprender suele mejorar la retención frente a pasar el mismo tiempo despierto, y que la falta de sueño empeora la atención y dificulta aprender cosas nuevas al día siguiente. Está mucho menos claro qué fases del sueño hacen exactamente qué, o cuánto dependen los efectos del tipo de material. Los resultados varían entre estudios y los mecanismos se siguen investigando.",
    "También conviene desconfiar de algunas promesas. Aprender idiomas mientras se duerme escuchando grabaciones, por ejemplo, tiene muy poco respaldo: el cerebro dormido apenas registra información compleja nueva. Y una mala noche ocasional no borra lo aprendido; lo que preocupa a los investigadores es la falta de sueño mantenida en el tiempo.",
    "De todo esto se desprende una idea práctica bastante prudente. Si estás aprendiendo algo que te importa, repartir el estudio en varios días deja varias noches de por medio, y cada una es una oportunidad para que lo aprendido se asiente. Recortar horas de sueño para estudiar más puede salir caro, porque se gana tiempo de estudio a costa de las condiciones que permiten conservarlo.",
    "Nada de esto convierte el sueño en una técnica de rendimiento. Dormir bien vale la pena por muchas razones, y la memoria es solo una de ellas.",
  ],
  references: [
    "Jenkins, J. G. y Dallenbach, K. M. (1924). Obliviscence during sleep and waking. The American Journal of Psychology, 35(4), 605-612.",
    "Wilson, M. A. y McNaughton, B. L. (1994). Reactivation of hippocampal ensemble memories during sleep. Science, 265(5172), 676-679.",
    "Rasch, B. y Born, J. (2013). About sleep's role in memory. Physiological Reviews, 93(2), 681-766.",
  ],
  questions: [
    {
      id: "q-jenkins",
      kind: "literal",
      prompt: "¿Qué observaron Jenkins y Dallenbach en 1924?",
      options: [
        "Que se recordaba más tras dormir que tras pasar el mismo tiempo despierto",
        "Que se aprendía mejor durante el sueño",
        "Que el sueño no influía en el recuerdo",
        "Que se recordaba más tras pasar el tiempo despierto",
      ],
      correctIndex: 0,
      explanation:
        "El primer párrafo lo dice: tras dormir, recordaban más. Su explicación era que la vigilia interfiere con lo recién aprendido.",
    },
    {
      id: "q-cambio-explicacion",
      kind: "inferencial",
      prompt: "¿En qué se diferencia la explicación actual de la de Jenkins y Dallenbach?",
      options: [
        "Hoy se cree que el sueño no tiene relación con la memoria",
        "Ellos veían el sueño como protección frente a interferencias; hoy se cree que además participa activamente en la consolidación",
        "Hoy se cree que solo importa la cantidad de horas de sueño",
        "No hay diferencia: la explicación es exactamente la misma",
      ],
      correctIndex: 1,
      explanation:
        "El segundo párrafo dice que «la explicación ha cambiado»: el sueño no solo protege, sino que participa activamente en la consolidación. Hay que comparar los dos primeros párrafos.",
    },
    {
      id: "q-consolidacion",
      kind: "vocabulario",
      prompt: "En el texto, «consolidación» es…",
      options: [
        "el acto de dormir más horas de lo normal",
        "la unión de varios recuerdos en uno solo",
        "el proceso por el que un recuerdo reciente y frágil se vuelve más estable",
        "un tipo de sueño profundo",
      ],
      correctIndex: 2,
      explanation: "Lo define el segundo párrafo: un recuerdo recién formado, todavía frágil, se vuelve más estable.",
    },
    {
      id: "q-seguro-abierto",
      kind: "estructura",
      prompt: "¿Para qué sirve el tercer párrafo dentro del texto?",
      options: [
        "Para narrar otro experimento histórico",
        "Para dar instrucciones sobre cómo dormir",
        "Para negar lo dicho en el segundo párrafo",
        "Para distinguir lo bien establecido de lo que sigue en discusión",
      ],
      correctIndex: 3,
      explanation:
        "Empieza con «Conviene separar lo que sabemos con bastante seguridad de lo que sigue abierto» y hace justo eso: primero lo sólido, luego lo incierto.",
    },
  ],
  keyIdeas: [
    {
      id: "dormir-retencion",
      prompt: "¿Qué relación entre sueño y memoria se considera bien establecida?",
      answer:
        "Dormir después de aprender suele mejorar la retención frente a pasar el mismo tiempo despierto, y la falta de sueño dificulta atender y aprender al día siguiente.",
    },
    {
      id: "consolidacion",
      prompt: "¿Qué es la consolidación de la memoria?",
      answer: "El proceso por el que un recuerdo recién formado, todavía frágil, se vuelve más estable; el sueño parece participar en él.",
    },
    {
      id: "aprender-dormido",
      prompt: "¿Funciona aprender material nuevo escuchando grabaciones mientras se duerme?",
      answer: "Tiene muy poco respaldo: el cerebro dormido apenas registra información compleja nueva.",
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
