import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "sesgo-de-confirmacion",
  title: "La regla del 2, 4, 6",
  summary: "Un experimento clásico sobre por qué tendemos a buscar pruebas que nos den la razón.",
  topic: "pensamiento-critico",
  level: "intermedio",
  words: 386,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "En 1960, el psicólogo británico Peter Wason propuso un juego sencillo. Les decía a los participantes que la serie de números 2, 4, 6 cumplía una regla que él tenía en mente, y les pedía que la descubrieran. Para ello podían proponer otras series de tres números; él les respondía si cumplían o no la regla. Cuando se sintieran seguros, debían anunciarla.",
    "Muchos participantes pensaban enseguida en una hipótesis, por ejemplo «números pares que aumentan de dos en dos», y proponían series como 8, 10, 12 o 20, 22, 24. Todas cumplían la regla, así que su confianza crecía y anunciaban su hipótesis. Pero estaba equivocada. La regla de Wason era mucho más amplia: cualquier serie de tres números en orden creciente. 1, 7, 50 también la cumplía.",
    "El problema no era de inteligencia ni de cálculo. El problema era de estrategia. Casi todas las series propuestas estaban pensadas para confirmar la hipótesis, no para ponerla a prueba. Una serie como 3, 2, 1 o 1, 2, 9, que la hipótesis prohibía o no preveía, habría dado información mucho más valiosa: si también cumplía la regla, la hipótesis quedaba descartada. Pocos participantes probaban series así.",
    "A esa inclinación a buscar, interpretar y recordar la información de modo que confirme lo que ya pensamos se la conoce como sesgo de confirmación. El experimento de Wason se ha discutido mucho, y algunos autores han señalado que buscar casos positivos no siempre es irracional: depende de cómo sea el problema. Pero la lección práctica se mantiene: si solo buscamos lo que nos da la razón, podemos sentirnos cada vez más seguros de una idea equivocada.",
    "El sesgo no desaparece por conocerlo, aunque sí se puede contrarrestar con hábitos. Uno es preguntarse qué observación nos haría cambiar de opinión, y luego ir a buscarla. Otro es formular la alternativa más fuerte posible a nuestra idea antes de defenderla. Un tercero, muy útil al leer, es fijarse en qué parte de un texto nos resulta incómoda o nos cuesta aceptar, porque a menudo es la que más tiene que enseñarnos.",
    "Fíjate en que el texto que acabas de leer también te ha pedido que confíes en él. Un buen ejercicio es comprobar si sus afirmaciones se sostienen: buscar el experimento original, leer las críticas que recibió y decidir por tu cuenta.",
  ],
  references: [
    "Wason, P. C. (1960). On the failure to eliminate hypotheses in a conceptual task. Quarterly Journal of Experimental Psychology, 12(3), 129-140.",
    "Klayman, J. y Ha, Y.-W. (1987). Confirmation, disconfirmation, and information in hypothesis testing. Psychological Review, 94(2), 211-228.",
    "Nickerson, R. S. (1998). Confirmation bias: A ubiquitous phenomenon in many guises. Review of General Psychology, 2(2), 175-220.",
  ],
  questions: [
    {
      id: "q-regla-real",
      kind: "literal",
      prompt: "¿Cuál era en realidad la regla de Wason?",
      options: [
        "Números pares que aumentan de dos en dos",
        "Cualquier serie de tres números en orden creciente",
        "Números que suman doce",
        "Tres números pares cualesquiera",
      ],
      correctIndex: 1,
      explanation:
        "El segundo párrafo lo dice: la regla era cualquier serie de tres números crecientes. «Pares de dos en dos» era la hipótesis típica de los participantes.",
    },
    {
      id: "q-mejor-prueba",
      kind: "inferencial",
      prompt:
        "Alguien cree que la regla es «pares de dos en dos». ¿Qué serie le daría más información para comprobarlo?",
      options: ["10, 12, 14", "100, 102, 104", "1, 2, 9", "4, 6, 8"],
      correctIndex: 2,
      explanation:
        "Las series que la hipótesis predice que cumplen la regla no pueden refutarla. 1, 2, 9 no encaja en su hipótesis: si el experimentador dice que sí cumple la regla, la hipótesis queda descartada. Es la estrategia que el texto echa en falta.",
    },
    {
      id: "q-sesgo-definicion",
      kind: "vocabulario",
      prompt: "Según el texto, el «sesgo de confirmación» consiste en…",
      options: [
        "buscar, interpretar y recordar la información de forma que confirme lo que ya pensamos",
        "confirmar siempre los datos con una segunda fuente",
        "no tener ninguna opinión hasta disponer de todas las pruebas",
        "equivocarse al hacer cálculos sencillos",
      ],
      correctIndex: 0,
      explanation:
        "Es la definición del cuarto párrafo. El tercero aclara que el problema de los participantes no era de cálculo sino de estrategia.",
    },
    {
      id: "q-ultimo-parrafo",
      kind: "estructura",
      prompt: "¿Qué hace el último párrafo?",
      options: [
        "Resume los datos numéricos del experimento",
        "Retira las conclusiones de los párrafos anteriores",
        "Presenta un segundo experimento distinto",
        "Aplica la lección al propio texto e invita a comprobarlo en lugar de creerlo sin más",
      ],
      correctIndex: 3,
      explanation:
        "El texto se vuelve sobre sí mismo: también te pide confianza, así que propone aplicarle el mismo hábito de buscar pruebas y críticas. No retira nada de lo dicho.",
    },
    {
      id: "q-matiz",
      kind: "inferencial",
      prompt: "¿Por qué el texto menciona que el experimento «se ha discutido mucho»?",
      options: [
        "Para matizar: buscar casos positivos no siempre es irracional, aunque la lección práctica se mantiene",
        "Para demostrar que el experimento era falso",
        "Para criticar a Wason por falta de rigor",
        "Para decir que el sesgo de confirmación no existe",
      ],
      correctIndex: 0,
      explanation:
        "Es una matización, coherente con el propio mensaje del texto: presenta una crítica razonable sin abandonar la conclusión práctica. No dice que el experimento sea falso.",
    },
  ],
  keyIdeas: [
    {
      id: "probar-para-refutar",
      prompt: "En el problema 2-4-6, ¿qué estrategia daba más información?",
      answer:
        "Proponer series que la propia hipótesis no prevé, como 1, 2, 9: si cumplen la regla, la hipótesis queda descartada. Confirmar casos esperados no permite refutarla.",
    },
    {
      id: "definicion-sesgo",
      prompt: "¿Qué es el sesgo de confirmación?",
      answer:
        "La inclinación a buscar, interpretar y recordar la información de modo que confirme lo que ya pensamos.",
    },
    {
      id: "contrarrestar",
      prompt: "Nombra un hábito para contrarrestar el sesgo de confirmación.",
      answer:
        "Preguntarse qué observación nos haría cambiar de opinión y buscarla; formular la alternativa más fuerte a nuestra idea; prestar atención a lo que nos incomoda de un texto.",
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
