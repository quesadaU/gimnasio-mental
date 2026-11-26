import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "correlacion-no-es-causa",
  title: "Que dos cosas vayan juntas no significa que una cause la otra",
  summary: "Tres maneras de explicar una correlación sin que haya causa directa, y cómo se intenta distinguirlas.",
  topic: "pensamiento-critico",
  level: "inicial",
  words: 380,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "Imagina un titular: «Los días en que más helados se venden hay más ahogamientos en las playas». Los datos podrían ser ciertos. Lo que sería un error es concluir que los helados provocan ahogamientos. Lo que ocurre es que ambas cosas aumentan cuando hace calor: con buen tiempo se venden más helados y también se baña más gente. El calor es una tercera variable que mueve a las otras dos a la vez.",
    "Cuando dos medidas suben y bajan juntas decimos que están correlacionadas. La correlación es un dato útil, porque indica que vale la pena investigar, pero por sí sola no dice qué causa qué. Antes de aceptar una explicación causal conviene revisar al menos tres alternativas.",
    "La primera es la que ya hemos visto: un factor común, a menudo llamado variable de confusión, que influye en ambas. La segunda es la causalidad inversa. Si se observa que las personas que hacen más ejercicio duermen mejor, puede que el ejercicio mejore el sueño, pero también puede que quien duerme bien tenga más energía para moverse, o que ocurran ambas cosas. La tercera es la casualidad. Si se comparan cientos de variables entre sí, algunas parecerán relacionadas por puro azar, del mismo modo que, si lanzas muchas monedas, alguna sacará varias caras seguidas.",
    "¿Cómo se sale de la duda? La herramienta más potente es el experimento controlado con asignación aleatoria: se reparte a las personas al azar entre dos grupos, se cambia una sola cosa en uno de ellos y se comparan los resultados. Como el azar reparte por igual las demás diferencias, si aparece un efecto es razonable atribuirlo a lo que se cambió. Cuando un experimento así no es posible o no es ético, los investigadores combinan otras pistas: si la causa precede al efecto, si hay una relación de dosis, si el resultado se repite en poblaciones distintas y si existe un mecanismo plausible.",
    "Nada de esto convierte la correlación en algo inútil. Muchas investigaciones importantes empezaron con una correlación llamativa. La clave está en tratarla como una pregunta y no como una respuesta. La próxima vez que leas que algo «está ligado» a otra cosa, prueba a preguntarte: ¿qué tercera variable podría explicar ambas?, ¿podría ser al revés?, ¿cuántas comparaciones se hicieron antes de encontrar esta?",
  ],
  questions: [
    {
      id: "q-helados",
      kind: "literal",
      prompt: "En el ejemplo inicial, ¿qué explica a la vez la venta de helados y los ahogamientos?",
      options: [
        "Que comer helado antes de nadar es peligroso",
        "El calor, que aumenta ambas cosas",
        "Que los datos estaban mal recogidos",
        "La casualidad",
      ],
      correctIndex: 1,
      explanation:
        "El primer párrafo lo explica: con calor se venden más helados y se baña más gente. Es un factor común, no una causa directa entre helados y ahogamientos.",
    },
    {
      id: "q-tipo-error",
      kind: "inferencial",
      prompt:
        "Un estudio encuentra que los niños que tienen más libros en casa leen mejor. Según el texto, ¿qué sería una explicación alternativa a «los libros mejoran la lectura»?",
      options: [
        "Ninguna: la correlación demuestra la causa",
        "Que la lectura empeora al tener libros",
        "Que haya un factor común, como el tiempo y los recursos de la familia, que influya en ambas cosas",
        "Que los libros solo funcionan si son nuevos",
      ],
      correctIndex: 2,
      explanation:
        "Hay que aplicar las alternativas del texto a un caso nuevo. Un factor común (por ejemplo, familias con más tiempo o recursos) podría explicar tanto los libros como la habilidad lectora. También cabría la causalidad inversa: a quien le gusta leer acumula más libros. El texto no dice que la correlación pruebe nada.",
    },
    {
      id: "q-confusion",
      kind: "vocabulario",
      prompt: "En el texto, una «variable de confusión» es…",
      options: [
        "un factor que influye en las dos medidas y crea una relación aparente entre ellas",
        "un dato mal anotado por error",
        "una pregunta difícil de entender en una encuesta",
        "el resultado de un experimento fallido",
      ],
      correctIndex: 0,
      explanation:
        "El tercer párrafo la define como «un factor común que influye en ambas», como el calor en el ejemplo de los helados.",
    },
    {
      id: "q-aleatoria",
      kind: "inferencial",
      prompt: "¿Por qué la asignación aleatoria ayuda a identificar causas?",
      options: [
        "Porque garantiza que el experimento salga positivo",
        "Porque elimina la necesidad de medir resultados",
        "Porque permite elegir a los participantes que mejor encajan",
        "Porque reparte por igual las demás diferencias, de modo que un efecto puede atribuirse a lo que se cambió",
      ],
      correctIndex: 3,
      explanation:
        "El cuarto párrafo lo explica: el azar equilibra entre grupos las otras diferencias (incluidas las variables de confusión). Elegir a mano a los participantes haría justo lo contrario.",
    },
  ],
  keyIdeas: [
    {
      id: "tres-alternativas",
      prompt: "¿Qué tres explicaciones alternativas hay que revisar antes de aceptar que una correlación es causal?",
      answer: "Un factor común (variable de confusión), la causalidad inversa y la casualidad.",
    },
    {
      id: "experimento-aleatorio",
      prompt: "¿Qué herramienta permite distinguir mejor causa de correlación y por qué?",
      answer:
        "El experimento con asignación aleatoria: el azar reparte por igual las demás diferencias, así que un efecto puede atribuirse a lo que se cambió.",
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
