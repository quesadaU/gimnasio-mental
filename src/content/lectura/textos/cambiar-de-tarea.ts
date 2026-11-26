import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "cambiar-de-tarea",
  title: "Cambiar de tarea tiene un precio",
  summary: "Qué ocurre en la atención cuando saltamos de una tarea a otra, y por qué conviene elegir el foco.",
  topic: "atencion",
  level: "inicial",
  words: 311,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "Solemos decir que hacemos varias cosas a la vez. Respondemos un mensaje mientras escuchamos una reunión, o miramos el móvil mientras leemos. Pero, cuando las dos tareas exigen pensar, lo que hacemos casi nunca es atender a ambas al mismo tiempo: lo que hacemos es alternar entre ellas con rapidez.",
    "La psicología experimental lleva décadas estudiando esa alternancia. En los experimentos de cambio de tarea, las personas responden más despacio y cometen más errores justo después de cambiar de tarea que cuando repiten la misma. A esa diferencia se la llama coste de cambio. En cada cambio es pequeña, a menudo de décimas de segundo, pero aparece de forma muy consistente y se acumula cuando los cambios son constantes.",
    "Hay además un efecto menos visible. Al volver a una tarea interrumpida, una parte de la mente sigue ocupada con la anterior: el mensaje que no contestamos, la notificación que vimos de reojo. La investigadora Sophie Leroy llamó a este fenómeno residuo atencional. No hace falta que la interrupción sea larga; basta con que deje algo pendiente.",
    "Nada de esto significa que la atención sea débil ni que haya que vivir aislado. Significa que la atención funciona mejor como un foco que se dirige que como una luz que lo ilumina todo a la vez. Elegir qué iluminar, y durante cuánto tiempo, es una decisión que se puede tomar a propósito: silenciar avisos durante un rato, terminar una idea antes de abrir otra, dejar anotado lo pendiente para que no siga reclamando espacio.",
    "Por eso leer un texto entero sin interrupciones es un ejercicio valioso. No porque convierta a nadie en una persona más inteligente, sino porque permite comprobar algo sencillo: cuando el foco se queda quieto el tiempo suficiente, las ideas de un texto tienen ocasión de conectarse entre sí, y lo leído deja de ser una colección de frases sueltas.",
  ],
  references: [
    "Monsell, S. (2003). Task switching. Trends in Cognitive Sciences, 7(3), 134-140.",
    "Leroy, S. (2009). Why is it so hard to do my work? The challenge of attention residue when switching between work tasks. Organizational Behavior and Human Decision Processes, 109(2), 168-181.",
  ],
  questions: [
    {
      id: "q-despues-del-cambio",
      kind: "literal",
      prompt: "Según el texto, ¿qué se observa justo después de cambiar de tarea?",
      options: [
        "Se responde más rápido gracias a la novedad",
        "Se responde más despacio y con más errores",
        "No hay ninguna diferencia medible",
        "Se olvida por completo la tarea anterior",
      ],
      correctIndex: 1,
      explanation:
        "El segundo párrafo lo dice de forma explícita: tras un cambio, las respuestas son más lentas y con más errores que cuando se repite la misma tarea. Esa diferencia es el coste de cambio.",
    },
    {
      id: "q-se-acumula",
      kind: "inferencial",
      prompt: "¿Por qué el texto insiste en que el coste de cambio «se acumula»?",
      options: [
        "Porque cada cambio dura varios minutos",
        "Porque la atención se agota para siempre tras muchos cambios",
        "Porque cada cambio cuesta poco, pero muchos cambios seguidos suman una pérdida apreciable",
        "Porque solo afecta a las personas que se distraen con facilidad",
      ],
      correctIndex: 2,
      explanation:
        "El texto dice que en cada cambio el coste es pequeño (décimas de segundo). Hay que deducir que la importancia práctica viene de la repetición: con cambios constantes, esas pérdidas pequeñas se suman. El texto no habla de minutos ni de un agotamiento permanente.",
    },
    {
      id: "q-residuo",
      kind: "vocabulario",
      prompt: "En el texto, la expresión «residuo atencional» se refiere a…",
      options: [
        "la parte de la atención que sigue ocupada con una tarea anterior",
        "el cansancio físico que deja una lectura larga",
        "un trastorno clínico de la atención",
        "los recuerdos de lecturas antiguas",
      ],
      correctIndex: 0,
      explanation:
        "El tercer párrafo lo define por el contexto: al volver a una tarea, una parte de la mente sigue ocupada con la anterior, sobre todo si quedó algo pendiente. No es un diagnóstico ni cansancio físico.",
    },
    {
      id: "q-funcion-cuarto",
      kind: "estructura",
      prompt: "¿Qué función cumple el cuarto párrafo dentro del texto?",
      options: [
        "Presenta un experimento nuevo con sus cifras",
        "Cuenta una anécdota personal del autor",
        "Repite literalmente lo dicho en el primer párrafo",
        "Matiza lo anterior para evitar una conclusión exagerada y propone qué hacer",
      ],
      correctIndex: 3,
      explanation:
        "Empieza con «Nada de esto significa…»: es una matización. Evita concluir que la atención es débil o que hay que aislarse, y pasa a proponer decisiones concretas sobre el foco.",
    },
  ],
  keyIdeas: [
    {
      id: "coste-de-cambio",
      prompt: "¿Qué es el coste de cambio de tarea?",
      answer:
        "La pérdida de rapidez y precisión que aparece justo después de pasar de una tarea a otra. Es pequeña en cada cambio, pero se acumula cuando los cambios son constantes.",
    },
    {
      id: "residuo-atencional",
      prompt: "¿Qué es el residuo atencional?",
      answer:
        "La parte de la atención que sigue enganchada a una tarea anterior, sobre todo si quedó algo pendiente, cuando ya hemos vuelto a otra.",
    },
    {
      id: "foco-elegido",
      prompt: "¿Qué propone el texto en lugar de intentar atenderlo todo a la vez?",
      answer:
        "Tratar la atención como un foco que se dirige a propósito: silenciar avisos un rato, terminar una idea antes de abrir otra y anotar lo pendiente.",
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
