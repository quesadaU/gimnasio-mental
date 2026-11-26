import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "la-caverna",
  title: "Las sombras de la caverna",
  summary: "Un repaso, con palabras propias, de la alegoría de la caverna de Platón y de algunas lecturas posibles.",
  topic: "filosofia",
  level: "intermedio",
  words: 402,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental (paráfrasis, no traducción)",
    note: "Resume con palabras propias la alegoría del libro VII de la República de Platón; no cita ninguna traducción.",
  },
  paragraphs: [
    "En el libro VII de la República, Platón pone en boca de Sócrates una imagen que lleva más de dos mil años dando que pensar. Pide que imaginemos a unas personas que viven desde niñas en una cueva, encadenadas de tal modo que solo pueden mirar la pared del fondo. Detrás de ellas arde un fuego, y entre el fuego y los prisioneros pasan otras personas llevando objetos y figuras. Lo único que los prisioneros ven son las sombras de esas figuras proyectadas en la pared.",
    "Como nunca han visto otra cosa, los prisioneros toman las sombras por la realidad. Ponen nombre a cada forma, aprenden a prever cuál vendrá después y hasta premian a quien mejor lo adivina. Su mundo es coherente; simplemente, no es el mundo completo.",
    "Un día, uno de ellos es liberado y obligado a girarse. El fuego le hace daño en los ojos y, al principio, las figuras reales le parecen menos claras que las sombras a las que estaba acostumbrado. Cuando lo sacan de la cueva, la luz del sol lo deslumbra todavía más. Solo poco a poco, mirando primero los reflejos en el agua y luego los objetos, llega a poder contemplar el sol mismo, y comprende que es la fuente de la luz que hace visibles las cosas.",
    "Entonces el liberado recuerda a sus compañeros y vuelve a bajar. Pero ahora, a oscuras, ve peor que ellos las sombras y se equivoca en el juego de adivinarlas. Los demás se burlan y concluyen que salir de la cueva estropea la vista. Sócrates añade que, si pudieran, llegarían a matar a quien intentara liberarlos, algo que suele leerse como una alusión a la condena a muerte del propio Sócrates.",
    "Platón presenta la alegoría como una imagen de la educación: aprender no es meter conocimientos en una mente vacía, sino girar la mirada hacia otra parte. Dentro de su filosofía, la salida de la cueva representa el paso del mundo cambiante de las apariencias al conocimiento de las ideas, y el sol, la idea del bien.",
    "No hace falta compartir toda la metafísica platónica para que la imagen siga siendo útil. Sugiere que el desconcierto es una parte normal del aprendizaje, que lo familiar puede parecer más claro que lo verdadero y que quien cambia de perspectiva puede encontrarse, durante un tiempo, peor adaptado que los demás. Cada lector puede preguntarse cuáles son sus propias paredes.",
  ],
  references: ["Platón, República, libro VII (514a-517a)."],
  questions: [
    {
      id: "q-que-ven",
      kind: "literal",
      prompt: "¿Qué es lo único que ven los prisioneros?",
      options: [
        "El fuego que arde detrás de ellos",
        "La luz del sol que entra por la entrada",
        "Las sombras de figuras proyectadas en la pared",
        "Los rostros de sus compañeros",
      ],
      correctIndex: 2,
      explanation:
        "El primer párrafo lo dice: solo pueden mirar la pared del fondo, donde se proyectan las sombras de las figuras que pasan delante del fuego.",
    },
    {
      id: "q-burla",
      kind: "inferencial",
      prompt: "¿Por qué los prisioneros concluyen que salir de la cueva «estropea la vista»?",
      options: [
        "Porque el liberado vuelve ciego para siempre",
        "Porque juzgan con su único criterio, acertar sombras, y con ese criterio el liberado ahora lo hace peor",
        "Porque el liberado les miente sobre lo que vio",
        "Porque saben que el sol es peligroso",
      ],
      correctIndex: 1,
      explanation:
        "Hay que relacionar el cuarto párrafo con el segundo: el prestigio dentro de la cueva consiste en adivinar sombras. El liberado, recién llegado de la luz, falla en eso, y los prisioneros no tienen otra vara de medir.",
    },
    {
      id: "q-girar-mirada",
      kind: "vocabulario",
      prompt: "En el texto, la expresión «girar la mirada hacia otra parte» describe…",
      options: [
        "una forma de entender la educación como cambio de orientación, no como llenar un recipiente",
        "un ejercicio físico para descansar la vista",
        "la costumbre de distraerse durante una clase",
        "el castigo que reciben los prisioneros",
      ],
      correctIndex: 0,
      explanation:
        "El quinto párrafo opone dos ideas de educación: meter conocimientos en una mente vacía frente a orientar la mirada. La expresión es metafórica.",
    },
    {
      id: "q-ultimo-parrafo",
      kind: "estructura",
      prompt: "¿Qué distingue al último párrafo de los anteriores?",
      options: [
        "Narra el final de la historia del liberado",
        "Cita textualmente a Platón",
        "Refuta la alegoría",
        "Separa la imagen de la filosofía de Platón y propone lecturas que no exigen compartirla",
      ],
      correctIndex: 3,
      explanation:
        "Los párrafos 1 a 4 narran, el 5 explica la lectura de Platón y el 6 propone una lectura más general («No hace falta compartir toda la metafísica platónica…»). No cita ni refuta.",
    },
  ],
  keyIdeas: [
    {
      id: "sombras-realidad",
      prompt: "En la alegoría de la caverna, ¿por qué los prisioneros toman las sombras por la realidad?",
      answer:
        "Porque nunca han visto otra cosa: su mundo es coherente, pero incompleto. Lo familiar les parece lo verdadero.",
    },
    {
      id: "educacion-giro",
      prompt: "¿Qué idea de la educación propone Platón con la alegoría?",
      answer:
        "Educar no es llenar una mente vacía, sino girar la mirada hacia otra parte. Ese giro desconcierta al principio, como la luz que deslumbra al liberado.",
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
