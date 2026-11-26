import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "papel-y-pantalla",
  title: "Leer en papel, leer en pantalla",
  summary: "Qué dicen los estudios sobre comprensión según el soporte, y por qué importa más el modo de leer.",
  topic: "ciencia",
  level: "avanzado",
  words: 341,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "¿Se entiende peor un texto leído en una pantalla que en papel? La pregunta parece sencilla, pero la respuesta exige cuidado, porque «pantalla» puede significar cosas muy distintas: un lector de tinta electrónica, un ordenador o un móvil lleno de notificaciones.",
    "En 2018, un equipo de investigadores españoles e israelíes publicó un metaanálisis, es decir, un estudio que combina estadísticamente los resultados de muchos otros. Reunieron decenas de experimentos en los que se comparaba la comprensión de los mismos textos en papel y en pantalla. El resultado general fue una ventaja del papel, pequeña pero consistente. Esa ventaja aparecía sobre todo con textos informativos, no tanto con textos narrativos, y era mayor cuando los lectores tenían un tiempo limitado. Tampoco desaparecía en los estudios más recientes, como cabría esperar si solo fuera cuestión de acostumbrarse a las pantallas.",
    "Una de las explicaciones propuestas tiene que ver con la actitud con que se lee. En pantalla solemos leer deprisa, saltando, buscando lo esencial, porque es así como leemos la mayor parte de lo que aparece en ella. Algunos investigadores sugieren que llevamos ese modo de lectura superficial a textos que exigirían otro más pausado. Además, en pantalla tendemos a sobrestimar lo que hemos entendido, lo que nos lleva a dedicar menos esfuerzo del necesario.",
    "Esto no convierte el papel en un remedio mágico ni la pantalla en un enemigo. Los efectos son pequeños, varían mucho entre personas y situaciones, y hay buenas razones para leer en digital: el acceso, el tamaño de letra ajustable o la posibilidad de buscar. Lo que sugieren estos estudios es que el soporte importa menos que el modo de leer, y que el modo de leer se puede elegir.",
    "Para leer bien en una pantalla ayudan algunas condiciones: eliminar las interrupciones, darse tiempo suficiente, leer el texto completo antes de saltar a otro y, al terminar, comprobar qué se ha entendido en lugar de suponerlo. Este lector intenta reunir esas condiciones, aunque la decisión más importante sigue siendo la tuya: quedarte con el texto hasta el final.",
  ],
  references: [
    "Delgado, P., Vargas, C., Ackerman, R. y Salmerón, L. (2018). Don't throw away your printed books: A meta-analysis on the effects of reading media on reading comprehension. Educational Research Review, 25, 23-38.",
  ],
  questions: [
    {
      id: "q-ventaja-papel",
      kind: "literal",
      prompt: "¿Con qué tipo de textos aparecía sobre todo la ventaja del papel?",
      options: ["Con textos narrativos", "Con textos informativos", "Con poesía", "Con todos por igual"],
      correctIndex: 1,
      explanation:
        "El segundo párrafo dice que la ventaja aparecía sobre todo con textos informativos, no tanto con narrativos, y que era mayor con tiempo limitado.",
    },
    {
      id: "q-no-costumbre",
      kind: "inferencial",
      prompt:
        "Que la ventaja del papel no desapareciera en los estudios recientes, ¿qué hipótesis pone en duda?",
      options: [
        "Que la pantalla daña la vista",
        "Que el papel es más caro",
        "Que la diferencia se debía solo a la falta de costumbre de leer en pantalla",
        "Que los textos informativos son más difíciles",
      ],
      correctIndex: 2,
      explanation:
        "El texto lo sugiere con «como cabría esperar si solo fuera cuestión de acostumbrarse»: si fuera falta de costumbre, la diferencia debería reducirse con los años, y no lo hacía.",
    },
    {
      id: "q-metaanalisis",
      kind: "vocabulario",
      prompt: "Un «metaanálisis» es…",
      options: [
        "un estudio que combina estadísticamente los resultados de muchos otros estudios",
        "un análisis muy detallado de un único experimento",
        "una opinión de expertos sin datos",
        "un experimento realizado en varios países a la vez",
      ],
      correctIndex: 0,
      explanation: "El propio texto lo define en el segundo párrafo, entre comas, justo después de usar la palabra.",
    },
    {
      id: "q-sobreestimar",
      kind: "inferencial",
      prompt: "¿Por qué sobrestimar lo que se ha entendido puede empeorar la comprensión?",
      options: [
        "Porque cansa más la vista",
        "Porque obliga a leer más despacio",
        "Porque hace olvidar el título del texto",
        "Porque lleva a dedicar menos esfuerzo del que el texto necesita",
      ],
      correctIndex: 3,
      explanation:
        "El tercer párrafo enlaza ambas cosas: quien cree haber entendido más de lo que entiende dedica menos esfuerzo del necesario. Por eso el último párrafo propone comprobar en vez de suponer.",
    },
  ],
  keyIdeas: [
    {
      id: "ventaja-pequena",
      prompt: "¿Qué encontró el metaanálisis de 2018 sobre comprensión en papel y en pantalla?",
      answer:
        "Una ventaja pequeña pero consistente del papel, sobre todo con textos informativos y con tiempo limitado, que no desaparecía en los estudios recientes.",
    },
    {
      id: "modo-de-leer",
      prompt: "Según el texto, ¿qué importa más que el soporte?",
      answer:
        "El modo de leer: sin interrupciones, con tiempo, completo y comprobando al final lo entendido en lugar de suponerlo.",
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
