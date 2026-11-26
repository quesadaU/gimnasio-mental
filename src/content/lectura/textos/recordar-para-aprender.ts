import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "recordar-para-aprender",
  title: "Recordar también es aprender",
  summary: "Por qué intentar recordar lo leído fija mejor el contenido que volver a leerlo, y por qué no lo parece.",
  topic: "memoria",
  level: "intermedio",
  words: 428,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "A finales del siglo XIX, el psicólogo alemán Hermann Ebbinghaus se tomó a sí mismo como sujeto de estudio. Memorizaba listas de sílabas sin sentido y medía cuánto le costaba volver a aprenderlas al cabo de horas o días. Encontró que el olvido es rápido al principio y se va frenando después. Aquella forma de curva, con muchas variaciones según el material y la persona, se ha observado una y otra vez desde entonces.",
    "Si olvidamos tan deprisa, parece lógico pensar que la solución es repasar: volver a leer los apuntes, subrayar, releer el capítulo. Releer resulta cómodo y da una sensación agradable de dominio, porque el texto nos suena. Pero que algo nos resulte familiar no garantiza que seamos capaces de recuperarlo cuando no lo tenemos delante.",
    "Aquí entra uno de los hallazgos más sólidos de la psicología del aprendizaje: el efecto de la práctica de recuperación. En un estudio muy citado, Henry Roediger y Jeffrey Karpicke pidieron a estudiantes que leyeran textos breves. Unos los volvían a leer; otros, en cambio, intentaban escribir de memoria todo lo que recordaban. En una prueba hecha a los pocos minutos, releer funcionaba igual o algo mejor. Una semana después, quienes habían practicado el recuerdo retenían bastante más. Y, sin embargo, los estudiantes que releían se sentían más seguros de lo que iban a recordar.",
    "Esa discrepancia es la parte interesante. El esfuerzo de recuperar, que se vive como una dificultad, es precisamente lo que fortalece el recuerdo. El investigador Robert Bjork habla de dificultades deseables: obstáculos que hacen el aprendizaje más lento o más incómodo en el momento, pero más duradero. No toda dificultad es deseable, claro. Si no conseguimos recordar casi nada, conviene volver al texto y comprobar qué faltaba; recuperar con algún tipo de corrección funciona mejor que hacerlo a ciegas.",
    "El segundo aliado es el espaciado. Repartir los repasos en varios días suele dar mejores resultados a largo plazo que concentrarlos en una sola sesión, aunque concentrarlos parezca más eficaz en el momento. La práctica de recuperación y el espaciado se combinan bien: recordar hoy, volver a intentarlo dentro de unos días y, si sale bien, esperar algo más la siguiente vez.",
    "Eso es lo que intenta hacer el repaso de este módulo. Después de cada lectura se guardan algunas ideas clave, y unos días más tarde se te pide que las recuperes antes de ver la respuesta. No es un examen ni una puntuación que defender. Es una forma de comprobar, con honestidad, qué parte de lo leído sigue disponible cuando ya no está delante.",
  ],
  references: [
    "Ebbinghaus, H. (1885). Über das Gedächtnis. Leipzig: Duncker & Humblot.",
    "Roediger, H. L. y Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249-255.",
    "Bjork, E. L. y Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning.",
    "Cepeda, N. J. et al. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354-380.",
  ],
  questions: [
    {
      id: "q-curva-olvido",
      kind: "literal",
      prompt: "¿Qué encontró Ebbinghaus sobre el ritmo del olvido?",
      options: [
        "Que es lento al principio y se acelera con el tiempo",
        "Que es constante: se olvida lo mismo cada día",
        "Que es rápido al principio y se va frenando después",
        "Que no se olvida nada si el material no tiene sentido",
      ],
      correctIndex: 2,
      explanation:
        "El primer párrafo lo dice explícitamente: el olvido es rápido al principio y se frena después. El texto añade que la forma exacta varía según el material y la persona.",
    },
    {
      id: "q-seguridad-enganosa",
      kind: "inferencial",
      prompt:
        "Los estudiantes que releían se sentían más seguros y, sin embargo, recordaban menos a la semana. ¿Qué se puede deducir?",
      options: [
        "Que la sensación de dominio no es una guía fiable de lo que recordaremos",
        "Que releer es siempre inútil",
        "Que la confianza mejora la memoria a largo plazo",
        "Que la prueba de la semana siguiente estaba mal diseñada",
      ],
      correctIndex: 0,
      explanation:
        "El segundo y el cuarto párrafo apuntan a lo mismo: la familiaridad da sensación de dominio, pero no garantiza poder recuperar. No se dice que releer sea inútil (a los pocos minutos funcionaba igual o mejor), solo que esa sensación engaña sobre el largo plazo.",
    },
    {
      id: "q-dificultad-deseable",
      kind: "vocabulario",
      prompt: "En el texto, una «dificultad deseable» es…",
      options: [
        "cualquier obstáculo, porque todo esfuerzo mejora el aprendizaje",
        "un obstáculo que incomoda en el momento pero hace el aprendizaje más duradero",
        "una prueba difícil diseñada para suspender",
        "un tipo de memoria que solo tienen los expertos",
      ],
      correctIndex: 1,
      explanation:
        "El cuarto párrafo la define así y además matiza: «No toda dificultad es deseable». Si no se recuerda casi nada, hay que volver al texto y corregir.",
    },
    {
      id: "q-orden-argumento",
      kind: "estructura",
      prompt: "¿Cómo avanza el argumento del texto?",
      options: [
        "Empieza por la conclusión y luego cuenta la historia de Ebbinghaus",
        "Compara dos teorías opuestas sin tomar partido",
        "Enumera consejos sin apoyarlos en estudios",
        "Plantea un problema (el olvido), descarta una solución intuitiva, presenta la evidencia y la aplica al módulo",
      ],
      correctIndex: 3,
      explanation:
        "El orden es: el olvido (párrafo 1), la solución intuitiva de releer y su límite (2), la evidencia de la recuperación y el espaciado (3 a 5) y su aplicación en el repaso de la app (6).",
    },
  ],
  keyIdeas: [
    {
      id: "practica-recuperacion",
      prompt: "¿Qué es la práctica de recuperación y por qué funciona mejor que releer a largo plazo?",
      answer:
        "Intentar recordar sin mirar el texto. El esfuerzo de recuperar fortalece el recuerdo; releer da familiaridad, pero no garantiza poder recuperarlo después.",
    },
    {
      id: "familiaridad-enganosa",
      prompt: "¿Por qué no basta con que un texto «nos suene»?",
      answer:
        "Porque la familiaridad produce sensación de dominio aunque no seamos capaces de recuperar el contenido cuando no lo tenemos delante.",
    },
    {
      id: "espaciado",
      prompt: "¿Qué es el espaciado?",
      answer:
        "Repartir los repasos en varios días en lugar de concentrarlos en una sesión. Suele dar mejores resultados a largo plazo, aunque concentrar parezca más eficaz en el momento.",
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
