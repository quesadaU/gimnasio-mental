import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "por-que-cuesta-parar",
  title: "Por qué cuesta tanto dejar de deslizar",
  summary: "Recompensas impredecibles, ausencia de finales y algunas formas de recuperar los puntos de parada.",
  topic: "atencion",
  level: "intermedio",
  words: 379,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "Casi todo el mundo conoce la escena: abres una aplicación para mirar una cosa y, un rato después, sigues deslizando el dedo sin recordar qué buscabas. No es una cuestión de falta de carácter. Varias características del diseño de estas aplicaciones hacen que parar sea más difícil de lo que parece, y entenderlas ayuda a recuperar algo de control.",
    "La primera tiene que ver con lo impredecible. En los años cincuenta, el psicólogo B. F. Skinner y sus colaboradores estudiaron cómo los animales de laboratorio respondían a distintos patrones de recompensa. Cuando la recompensa llegaba de forma variable, a veces tras pocos intentos y a veces tras muchos, los animales mantenían la conducta con gran persistencia, incluso cuando las recompensas dejaban de llegar. Un feed tiene algo de ese patrón: la mayoría de las publicaciones no nos interesan, pero de vez en cuando aparece una que sí, y nunca sabemos cuándo.",
    "La segunda es la desaparición de los finales. Un periódico en papel, un capítulo o un episodio terminan, y ese final ofrece una pausa natural en la que decidir si seguimos. Cuando el contenido se carga solo y sin límite, esas pausas desaparecen. La decisión de parar ya no la propicia el medio: tiene que tomarla la persona, una y otra vez, contra una corriente que no se detiene.",
    "Conviene no exagerar. Comparar un feed con una caja de experimentación es una analogía, no una equivalencia, y los investigadores siguen debatiendo si tiene sentido hablar de adicción en estos casos. El uso de pantallas tiene efectos muy distintos según la persona, el contenido y lo que ese uso desplaza. Lo que sí parece razonable es que un entorno diseñado para no tener final pone las cosas más difíciles a quien quiere parar.",
    "La buena noticia es que los puntos de parada se pueden reconstruir. Decidir de antemano para qué abres una aplicación y cerrarla cuando lo has hecho. Usar temporizadores o versiones sin feed cuando existen. Dejar el móvil fuera del alcance en los momentos en que quieres concentrarte. Y, sobre todo, elegir actividades que tengan un final propio: un texto completo, una partida, un capítulo.",
    "Este texto, por ejemplo, termina aquí. Puedes tomarte un momento antes de pasar a las preguntas y comprobar qué recuerdas de él.",
  ],
  references: [
    "Ferster, C. B. y Skinner, B. F. (1957). Schedules of Reinforcement. Nueva York: Appleton-Century-Crofts.",
    "Orben, A. y Przybylski, A. K. (2019). The association between adolescent well-being and digital technology use. Nature Human Behaviour, 3, 173-182.",
  ],
  questions: [
    {
      id: "q-recompensa-variable",
      kind: "literal",
      prompt: "En los estudios de Skinner, ¿qué patrón de recompensa producía una conducta más persistente?",
      options: [
        "La recompensa en cada intento",
        "La ausencia total de recompensa",
        "La recompensa que llegaba de forma variable e impredecible",
        "La recompensa a horas fijas",
      ],
      correctIndex: 2,
      explanation:
        "El segundo párrafo lo dice: con recompensas variables, los animales mantenían la conducta con gran persistencia, incluso cuando las recompensas dejaban de llegar.",
    },
    {
      id: "q-finales",
      kind: "inferencial",
      prompt: "Según el texto, ¿por qué el final de un capítulo ayuda a dejar de leer o mirar?",
      options: [
        "Porque ofrece una pausa en la que decidir si seguir, sin tener que luchar contra un flujo continuo",
        "Porque obliga a dejar de leer",
        "Porque los capítulos son siempre aburridos al final",
        "Porque el papel cansa más la vista",
      ],
      correctIndex: 0,
      explanation:
        "El tercer párrafo contrasta los medios con final, que ofrecen una pausa natural para decidir, con el contenido infinito, donde la decisión hay que tomarla una y otra vez. El final no obliga a nada: facilita la decisión.",
    },
    {
      id: "q-analogia",
      kind: "vocabulario",
      prompt: "Cuando el texto dice que la comparación es «una analogía, no una equivalencia», quiere decir que…",
      options: [
        "un feed y una caja de experimentación son exactamente lo mismo",
        "la comparación es falsa y debe descartarse",
        "la comparación es una metáfora literaria sin relación con la ciencia",
        "hay semejanzas útiles entre ambos, pero no son idénticos y no se pueden trasladar todas las conclusiones",
      ],
      correctIndex: 3,
      explanation:
        "Una analogía señala parecidos que ayudan a entender; una equivalencia afirmaría que son lo mismo. El cuarto párrafo usa esta distinción para no exagerar.",
    },
    {
      id: "q-cuarto-parrafo",
      kind: "estructura",
      prompt: "¿Qué hace el cuarto párrafo respecto a los dos anteriores?",
      options: [
        "Añade un tercer mecanismo de diseño",
        "Limita el alcance de lo dicho y reconoce lo que está en debate",
        "Contradice todo lo anterior",
        "Da consejos prácticos",
      ],
      correctIndex: 1,
      explanation:
        "Empieza con «Conviene no exagerar» y matiza: la analogía tiene límites y la idea de adicción se discute. Los consejos llegan en el quinto párrafo.",
    },
  ],
  keyIdeas: [
    {
      id: "recompensa-impredecible",
      prompt: "¿Qué mecanismo de un feed se parece a los programas de recompensa variable estudiados por Skinner?",
      answer:
        "La mayoría del contenido no interesa, pero de vez en cuando aparece algo que sí, sin saber cuándo; ese patrón impredecible sostiene la conducta de seguir buscando.",
    },
    {
      id: "puntos-de-parada",
      prompt: "¿Qué son los puntos de parada y cómo se pueden recuperar?",
      answer:
        "Pausas naturales, como el final de un capítulo, en las que decidir si seguir. Se recuperan decidiendo antes para qué se abre una aplicación, usando temporizadores y eligiendo actividades con final propio.",
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
