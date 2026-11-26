import type { RutaDefinicion } from "@/features/habilidades/domain/types";

/**
 * Índice ligero de rutas y lecciones: alimenta el catálogo, los temarios y generateStaticParams
 * sin cargar los paquetes. Debe coincidir con cada pack.ts (lo comprueba contenido.test.ts).
 * Los ids son estables: no se renombran una vez publicados.
 */
export const RUTAS: readonly RutaDefinicion[] = [
  {
    slug: "programacion",
    titulo: "Programación",
    descripcion: "Variables, condicionales, bucles y funciones en Python, y sobre todo leer código y predecir qué hace antes de ejecutarlo.",
    lecciones: [
      { id: "variables", titulo: "Variables y asignación", descripcion: "Qué significa realmente `=` y cómo cambian los valores línea a línea.", minutos: 8 },
      { id: "condicionales", titulo: "Condicionales: if, elif y else", descripcion: "Cómo decide un programa qué camino seguir.", minutos: 10 },
      { id: "bucles", titulo: "Bucles: for y while", descripcion: "Repetir instrucciones sin copiar código, y saber cuántas veces se repiten.", minutos: 10 },
      { id: "funciones", titulo: "Funciones: parámetros y return", descripcion: "Empaquetar un cálculo con nombre y distinguir devolver de imprimir.", minutos: 10 },
      { id: "lectura-codigo", titulo: "Leer código: trazar a mano", descripcion: "Entender un programa antes de ejecutarlo, también el que te propone una IA.", minutos: 12 },
    ],
  },
  {
    slug: "matematicas",
    titulo: "Matemáticas",
    descripcion: "Cálculo mental y estimación, fracciones, ecuaciones y probabilidad, resueltos a mano y comprobados por ti.",
    lecciones: [
      { id: "calculo-mental", titulo: "Cálculo mental y estimación", descripcion: "Descomponer, compensar y estimar para detectar resultados absurdos.", minutos: 8 },
      { id: "fracciones", titulo: "Fracciones sin miedo", descripcion: "Sumar, multiplicar, dividir y comparar fracciones entendiendo por qué.", minutos: 10 },
      { id: "algebra", titulo: "Álgebra básica: ecuaciones de primer grado", descripcion: "Despejar la incógnita como quien equilibra una balanza, y comprobar.", minutos: 10 },
      { id: "probabilidad", titulo: "Probabilidad intuitiva", descripcion: "Casos favorables, sucesos independientes y la falacia del jugador.", minutos: 10 },
    ],
  },
  {
    slug: "filosofia",
    titulo: "Filosofía",
    descripcion: "Argumentos y falacias, lógica, ética y epistemología: herramientas para pensar con razones propias.",
    lecciones: [
      { id: "argumentos-falacias", titulo: "Argumentos y falacias", descripcion: "Separar premisas y conclusión, y reconocer razonamientos tramposos.", minutos: 10 },
      { id: "logica-basica", titulo: "Lógica: validez y formas de inferencia", descripcion: "Modus ponens, modus tollens y los dos errores formales más comunes.", minutos: 10 },
      { id: "etica-dilemas", titulo: "Ética: pensar dilemas", descripcion: "Tres grandes enfoques éticos aplicados a casos difíciles.", minutos: 12 },
      { id: "epistemologia", titulo: "Epistemología: ¿qué es saber algo?", descripcion: "Creencia, verdad y justificación, y por qué acertar por suerte no es saber.", minutos: 10 },
    ],
  },
  {
    slug: "artes",
    titulo: "Artes, música e historia del arte",
    descripcion: "El lenguaje visual, la teoría musical básica y un método para leer una obra con tus propios ojos.",
    lecciones: [
      { id: "lenguaje-visual", titulo: "Elementos del lenguaje visual", descripcion: "Punto, línea, forma, color y composición: el vocabulario para mirar.", minutos: 8 },
      { id: "teoria-musical", titulo: "Teoría musical básica", descripcion: "Octavas, tonos y semitonos, la escala mayor, acordes y figuras rítmicas.", minutos: 10 },
      { id: "lectura-obra", titulo: "Leer una obra de arte", descripcion: "Describir, analizar, interpretar y juzgar, con Las Meninas como ejemplo.", minutos: 10 },
    ],
  },
  {
    slug: "pensamiento-critico",
    titulo: "Pensamiento crítico",
    descripcion: "Sesgos cognitivos, evaluación de fuentes y estadística cotidiana para no delegar el juicio.",
    lecciones: [
      { id: "sesgos-cognitivos", titulo: "Sesgos cognitivos", descripcion: "Confirmación, anclaje, disponibilidad y automatización: atajos que engañan.", minutos: 10 },
      { id: "evaluar-fuentes", titulo: "Evaluar fuentes de información", descripcion: "Lectura lateral y el método SIFT para decidir en qué confiar.", minutos: 10 },
      { id: "estadistica-cotidiana", titulo: "Estadística cotidiana", descripcion: "Media y mediana, riesgo relativo y absoluto, correlación y muestras.", minutos: 12 },
    ],
  },
];
