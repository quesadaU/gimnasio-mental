import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "manrique-coplas",
  title: "Recuerde el alma dormida",
  summary: "Las tres primeras coplas de Jorge Manrique: el paso del tiempo y la vida como un río.",
  topic: "literatura",
  level: "intermedio",
  words: 144,
  form: "verso",
  source: {
    kind: "dominio-publico",
    author: "Jorge Manrique (c. 1440-1479)",
    work: "Coplas por la muerte de su padre, coplas I a III",
    year: "Escritas tras la muerte de su padre en 1476",
    license: "Dominio público",
    reference:
      "Texto de dominio público; puede cotejarse en la Biblioteca Virtual Miguel de Cervantes (cervantesvirtual.com) o en cualquier edición crítica.",
    note: "Ortografía modernizada, como es habitual en las ediciones divulgativas.",
  },
  paragraphs: [
    "Recuerde el alma dormida,\navive el seso y despierte\ncontemplando\ncómo se pasa la vida,\ncómo se viene la muerte\ntan callando;\ncuán presto se va el placer,\ncómo, después de acordado,\nda dolor;\ncómo, a nuestro parecer,\ncualquiera tiempo pasado\nfue mejor.",
    "Pues si vemos lo presente\ncómo en un punto se es ido\ny acabado,\nsi juzgamos sabiamente,\ndaremos lo no venido\npor pasado.\nNo se engañe nadie, no,\npensando que ha de durar\nlo que espera\nmás que duró lo que vio,\npues que todo ha de pasar\npor tal manera.",
    "Nuestras vidas son los ríos\nque van a dar en la mar,\nque es el morir;\nallí van los señoríos\nderechos a se acabar\ny consumir;\nallí los ríos caudales,\nallí los otros medianos\ny más chicos,\ny llegados, son iguales\nlos que viven por sus manos\ny los ricos.",
  ],
  questions: [
    {
      id: "q-recuerde",
      kind: "vocabulario",
      prompt: "En el primer verso, «Recuerde el alma dormida», el verbo «recordar» significa…",
      options: ["traer a la memoria", "despertar", "repetir", "agradecer"],
      correctIndex: 1,
      explanation:
        "En castellano antiguo «recordar» también significaba «despertar», y el contexto lo confirma: el alma está «dormida» y los versos siguientes piden que «despierte». Es un buen ejemplo de palabra que cambia de sentido con el tiempo.",
    },
    {
      id: "q-a-nuestro-parecer",
      kind: "inferencial",
      prompt:
        "¿Qué aporta la expresión «a nuestro parecer» a la idea de que «cualquiera tiempo pasado fue mejor»?",
      options: [
        "Confirma que el pasado fue mejor de verdad",
        "Indica que el poeta habla solo de su propia vida",
        "Presenta esa idea como una impresión nuestra, no como un hecho",
        "No aporta nada; es un relleno para la rima",
      ],
      correctIndex: 2,
      explanation:
        "«A nuestro parecer» convierte la frase en una percepción: es lo que nos parece cuando el placer, una vez recordado, da dolor. Por eso es un error citar el verso como si Manrique afirmara que el pasado es mejor.",
    },
    {
      id: "q-rios",
      kind: "literal",
      prompt: "En la tercera copla, ¿qué representa «la mar»?",
      options: ["La muerte", "El olvido", "La riqueza", "El cielo"],
      correctIndex: 0,
      explanation: "Lo dice el propio verso: «la mar, / que es el morir».",
    },
    {
      id: "q-iguales",
      kind: "inferencial",
      prompt:
        "¿Qué idea transmite que, al llegar al mar, «son iguales / los que viven por sus manos / y los ricos»?",
      options: [
        "Que los ricos trabajan con sus manos",
        "Que la muerte iguala a todos, sin importar su riqueza o su poder",
        "Que los ríos pequeños son más importantes",
        "Que hay que repartir la riqueza en vida",
      ],
      correctIndex: 1,
      explanation:
        "Los ríos grandes («caudales»), medianos y chicos acaban en el mismo mar; del mismo modo, quienes viven de su trabajo y los ricos llegan iguales a la muerte. Es el tópico medieval de la muerte igualadora.",
    },
    {
      id: "q-estructura-copla",
      kind: "estructura",
      prompt: "¿Qué tienen en común los versos «contemplando», «tan callando» o «da dolor» dentro de cada estrofa?",
      options: [
        "Son los títulos de cada copla",
        "Repiten siempre la misma palabra",
        "Son versos más largos que los demás",
        "Son versos cortos (de pie quebrado) que cierran cada grupo de tres",
      ],
      correctIndex: 3,
      explanation:
        "Cada copla alterna dos versos de ocho sílabas con uno más corto, el pie quebrado. Ese verso breve frena el ritmo y da énfasis a lo que cierra.",
    },
  ],
  keyIdeas: [
    {
      id: "recordar-despertar",
      prompt: "En «Recuerde el alma dormida», ¿qué significa «recordar»?",
      answer: "Despertar. Era un sentido habitual en el castellano antiguo, y el contexto («dormida», «despierte») lo confirma.",
    },
    {
      id: "rios-mar",
      prompt: "¿Qué metáfora usa Manrique para la vida y la muerte?",
      answer: "Las vidas son ríos que van a dar en la mar, que es la muerte; allí llegan iguales ricos y pobres.",
    },
    {
      id: "a-nuestro-parecer",
      prompt: "¿Afirma Manrique que «cualquiera tiempo pasado fue mejor»?",
      answer: "No como un hecho: dice que nos lo parece («a nuestro parecer»), porque el placer, una vez pasado y recordado, da dolor.",
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
