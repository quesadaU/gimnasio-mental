import type { ContentPack } from "@/core/types";
import type { Leccion } from "@/features/habilidades/domain/types";

/** Los datos numéricos de los ejemplos son inventados con fines didácticos y así se indica en el texto. */
const pensamientoCritico: ContentPack<Leccion> = {
  id: "pensamiento-critico",
  module: "habilidades",
  version: 1,
  locale: "es",
  title: "Pensamiento crítico",
  items: [
    {
      id: "sesgos-cognitivos",
      titulo: "Sesgos cognitivos",
      descripcion: "Confirmación, anclaje, disponibilidad y automatización: atajos que engañan.",
      nivel: 2,
      minutos: 10,
      objetivos: [
        "Reconocer en situaciones cotidianas los sesgos de confirmación, anclaje, disponibilidad y automatización.",
        "Aplicar una estrategia concreta para contrarrestarlos.",
      ],
      explicacion: [
        "Usamos atajos mentales (heurísticos) para decidir rápido. Suelen funcionar, pero producen errores sistemáticos llamados sesgos. Amos Tversky y Daniel Kahneman los estudiaron en un artículo de 1974 que se convirtió en referencia.",
        "Confirmación: buscar, recordar e interpretar sobre todo lo que confirma lo que ya creemos. Anclaje: un primer número, aunque sea irrelevante, arrastra las estimaciones posteriores. Disponibilidad: juzgar la frecuencia de algo por lo fácil que nos vienen ejemplos a la mente (por ejemplo, porque salen mucho en las noticias). Automatización: confiar en exceso en un sistema automático, como un navegador GPS o un asistente de IA, aunque haya señales de que se equivoca.",
        "Saber que un sesgo existe ayuda poco por sí solo. Funcionan mejor hábitos concretos: buscar activamente pruebas en contra, considerar la hipótesis opuesta, hacer tu estimación antes de ver la de otros y comprobar la salida de una herramienta contra la fuente original.",
      ],
      ejemplo: {
        enunciado: "Una tienda anuncia «Antes 200 €, ahora 120 €». ¿Qué sesgo aprovecha?",
        pasos: [
          "El precio de 200 € funciona como ancla: es el primer número que ves.",
          "Junto a él, 120 € parece barato, aunque no sepas si el producto vale eso.",
          "Estrategia: compara con el precio en otras tiendas, no con el ancla que te ofrecen.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "opcion-multiple",
          id: "intento-disponibilidad",
          enunciado: "Tras ver varias noticias sobre accidentes de avión, Carmen decide hacer un viaje largo en coche porque le parece más seguro. ¿Qué sesgo actúa con más probabilidad?",
          opciones: [
            { id: "a", texto: "Disponibilidad" },
            { id: "b", texto: "Anclaje", retro: "No hay un número inicial que arrastre su estimación." },
            { id: "c", texto: "Confirmación", retro: "No está filtrando información para confirmar una idea previa: su impresión nace de lo que acaba de ver." },
            { id: "d", texto: "Automatización", retro: "No está confiando en un sistema automático." },
          ],
          correcta: "a",
          explicacion: "Los accidentes aéreos son muy visibles en los medios, así que vienen enseguida a la mente. Las estadísticas de accidentes por kilómetro recorrido suelen mostrar que el avión comercial es más seguro que el coche.",
        },
        pistas: [
          "¿De dónde sale la impresión de Carmen: de datos, de un número inicial o de ejemplos recientes?",
          "Sale de noticias recientes y llamativas. ¿Qué sesgo juzga la frecuencia por la facilidad de recordar ejemplos?",
          "Lo que se recuerda con facilidad está «disponible» en la memoria.",
        ],
        solucion: [
          "Su juicio se basa en ejemplos recientes y llamativos.",
          "Juzgar el riesgo por la facilidad de recordar casos es el heurístico de disponibilidad.",
          "Antídoto: buscar tasas (accidentes por kilómetro), no anécdotas.",
        ],
      },
      ejercicios: [
        {
          tipo: "opcion-multiple",
          id: "caso-confirmacion",
          enunciado: "Luis solo lee foros que dicen que su dieta funciona y descarta sin leerlos los estudios que no la apoyan. ¿Qué sesgo es?",
          opciones: [
            { id: "a", texto: "Confirmación" },
            { id: "b", texto: "Disponibilidad", retro: "El problema no es qué recuerda con facilidad, sino que filtra la información según su creencia." },
            { id: "c", texto: "Anclaje", retro: "No hay un valor inicial que arrastre su juicio." },
          ],
          correcta: "a",
          explicacion: "Selecciona la información que encaja con lo que ya cree.",
        },
        {
          tipo: "opcion-multiple",
          id: "caso-anclaje",
          enunciado: "Antes de estimar la población de una ciudad te preguntan si tiene más o menos de 5 millones de habitantes. Tu estimación acaba cerca de 5 millones. ¿Qué sesgo es?",
          opciones: [
            { id: "a", texto: "Anclaje" },
            { id: "b", texto: "Confirmación", retro: "No defiendes una creencia previa: un número sugerido arrastra tu estimación." },
            { id: "c", texto: "Automatización", retro: "No hay ningún sistema automático implicado." },
          ],
          correcta: "a",
          explicacion: "La cifra de la pregunta actúa como ancla, aunque sea arbitraria.",
        },
        {
          tipo: "verdadero-falso",
          id: "conocer-no-basta",
          enunciado: "Conocer un sesgo basta para no caer en él.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "Saber que existe ayuda poco por sí solo; hacen falta hábitos como buscar pruebas en contra o pedir a alguien que revise." },
            { id: "j2", texto: "Es verdadera: una vez que lo conoces, lo detectas siempre.", retro: "Los sesgos operan de forma rápida y poco consciente; por eso conviene apoyarse en procedimientos, no solo en la buena intención." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Los procedimientos externos (listas de comprobación, segundas opiniones) son más fiables que la vigilancia interna.",
        },
        {
          tipo: "opcion-multiple",
          id: "caso-automatizacion",
          enunciado: "Aceptas sin revisar el resumen que te da un asistente de IA porque «la máquina no se equivoca», aunque contradice el documento original que tienes delante. ¿Qué sesgo es?",
          opciones: [
            { id: "a", texto: "Sesgo de automatización" },
            { id: "b", texto: "Anclaje", retro: "No es un número inicial lo que te arrastra, sino la confianza excesiva en la herramienta." },
            { id: "c", texto: "Disponibilidad", retro: "No se trata de qué ejemplos recuerdas, sino de a quién das la razón." },
          ],
          correcta: "a",
          explicacion: "Ante una contradicción entre la herramienta y la fuente original, manda la fuente original.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "nombre-confirmacion",
          enunciado: "¿Qué sesgo nos lleva a buscar y recordar sobre todo la información que confirma lo que ya creemos?",
          aceptadas: ["sesgo de confirmación", "confirmación"],
          erroresComunes: [{ respuesta: "disponibilidad", retro: "La disponibilidad tiene que ver con la facilidad de recordar ejemplos, no con confirmar creencias." }],
          explicacion: "Sesgo de confirmación.",
        },
        {
          tipo: "texto",
          id: "nombre-anclaje",
          enunciado: "¿Cómo se llama el sesgo por el que un primer número influye en las estimaciones posteriores?",
          aceptadas: ["anclaje", "sesgo de anclaje", "efecto ancla", "efecto anclaje", "efecto de anclaje"],
          explicacion: "El primer número actúa como ancla.",
        },
        {
          tipo: "opcion-multiple",
          id: "estrategia-confirmacion",
          enunciado: "Una estrategia útil contra el sesgo de confirmación es…",
          opciones: [
            { id: "a", texto: "buscar activamente pruebas que contradigan tu idea." },
            { id: "b", texto: "leer más fuentes que ya estén de acuerdo contigo.", retro: "Eso refuerza el sesgo en lugar de corregirlo." },
            { id: "c", texto: "decidir más deprisa.", retro: "La prisa favorece los atajos mentales." },
          ],
          correcta: "a",
          explicacion: "Pregúntate: ¿qué prueba me haría cambiar de opinión? Y búscala.",
        },
      ],
      resumen: [
        "Confirmación: ver solo lo que confirma lo que ya crees.",
        "Anclaje: el primer número arrastra los siguientes.",
        "Disponibilidad: lo fácil de recordar parece más frecuente.",
        "Automatización: confiar demasiado en una máquina. Contrasta con la fuente original.",
      ],
    },
    {
      id: "evaluar-fuentes",
      titulo: "Evaluar fuentes de información",
      descripcion: "Lectura lateral y el método SIFT para decidir en qué confiar.",
      nivel: 2,
      minutos: 10,
      objetivos: [
        "Aplicar la lectura lateral y los cuatro pasos del método SIFT.",
        "Distinguir fuentes primarias y secundarias y verificar referencias.",
      ],
      explicacion: [
        "Investigadores de la Universidad de Stanford (el grupo de Sam Wineburg) observaron que los verificadores profesionales evalúan una web saliendo de ella: abren otras pestañas para ver qué dicen otros sobre esa fuente. Lo llamaron lectura lateral. Leer con atención la propia página, su diseño o su «Quiénes somos» dice poco, porque todo eso se puede fabricar.",
        "Mike Caulfield propuso el método SIFT, por sus siglas en inglés: Stop (para antes de compartir o reaccionar), Investigate the source (investiga quién habla), Find better coverage (busca una cobertura mejor en otras fuentes) y Trace claims (rastrea la afirmación, la cita o el dato hasta su contexto original).",
        "Una fuente primaria procede directamente del hecho (el estudio, el documento oficial, el testigo); una secundaria lo resume o comenta. Los asistentes de IA pueden producir referencias plausibles que no existen o que no dicen lo que se les atribuye: antes de usar una cita, localízala y léela.",
      ],
      ejemplo: {
        enunciado: "Un mensaje viral dice: «Un estudio demuestra que el café alarga la vida 10 años». ¿Qué haces?",
        pasos: [
          "Stop: no lo compartas todavía.",
          "Investiga la fuente: ¿quién lo publica? Búscalo fuera de esa web.",
          "Busca otra cobertura: ¿lo recogen medios o instituciones fiables, y cómo lo cuentan?",
          "Rastrea el dato: localiza el estudio original. ¿Existe? ¿Es en personas? ¿Dice «demuestra» o habla de una asociación?",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "opcion-multiple",
          id: "intento-primer-paso",
          enunciado: "Una web con diseño muy profesional publica un artículo alarmante sobre una vacuna. Según la lectura lateral, ¿cuál es el primer paso más eficaz?",
          opciones: [
            { id: "a", texto: "Salir de la página y buscar qué dicen otras fuentes sobre quién está detrás de esa web." },
            { id: "b", texto: "Leer el artículo entero con atención antes de juzgar.", retro: "Los verificadores profesionales hacen lo contrario: primero averiguan quién habla, fuera de la página." },
            { id: "c", texto: "Fijarse en si tiene buen diseño y sección «Quiénes somos».", retro: "El diseño y la autodescripción se pueden fabricar; lo que dicen otros sobre la fuente es más difícil de falsear." },
            { id: "d", texto: "Preguntar a un chatbot si la web es fiable y aceptar su respuesta.", retro: "Puede servir como punto de partida, pero su respuesta también hay que contrastarla: puede equivocarse o inventar fuentes." },
          ],
          correcta: "a",
          explicacion: "La lectura lateral empieza por la reputación de la fuente, consultada fuera de ella.",
        },
        pistas: [
          "Piensa en qué es fácil de fabricar y qué no.",
          "El diseño y el texto de la propia web los controla quien la publica. ¿Quién no controla lo que se dice de ella?",
          "«Lateral» significa abrir otras pestañas: buscar la fuente en otros sitios.",
        ],
        solucion: [
          "Todo lo que hay dentro de la web lo controla su autor.",
          "Lo que dicen otros sobre ella (medios, enciclopedias, verificadores) es más difícil de manipular.",
          "Por eso el primer paso es salir y buscar quién está detrás.",
        ],
      },
      ejercicios: [
        {
          tipo: "ordenar",
          id: "orden-sift",
          enunciado: "Ordena los pasos del método SIFT.",
          pasos: [
            { id: "p1", texto: "Parar y no compartir todavía." },
            { id: "p2", texto: "Investigar quién es la fuente." },
            { id: "p3", texto: "Buscar una cobertura mejor en otras fuentes." },
            { id: "p4", texto: "Rastrear la afirmación hasta su contexto original." },
          ],
          explicacion: "S-I-F-T: Stop, Investigate, Find, Trace.",
        },
        {
          tipo: "opcion-multiple",
          id: "fuente-primaria",
          enunciado: "¿Cuál es una fuente primaria sobre los resultados de un ensayo clínico?",
          opciones: [
            { id: "a", texto: "El artículo científico que publica el ensayo." },
            { id: "b", texto: "Una noticia que resume el ensayo.", retro: "La noticia es secundaria: cuenta lo que dice otra fuente." },
            { id: "c", texto: "Un vídeo de alguien que comenta la noticia.", retro: "Está aún más lejos del original: comenta un resumen." },
          ],
          correcta: "a",
          explicacion: "Cuanto más cerca del origen, menos oportunidades de distorsión.",
        },
        {
          tipo: "verdadero-falso",
          id: "referencia-ia",
          enunciado: "Si un asistente de IA te da una referencia con autor, año y revista, puedes darla por buena.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "Estos sistemas pueden generar referencias plausibles que no existen o que no dicen eso; hay que localizarlas y leerlas." },
            { id: "j2", texto: "Es verdadera: si incluye todos los datos, la referencia existe.", retro: "El formato correcto no garantiza la existencia: una referencia inventada puede tener todos los campos." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Busca la referencia en un catálogo o buscador académico y comprueba que dice lo que se afirma.",
        },
        {
          tipo: "opcion-multiple",
          id: "titular-sin-enlace",
          enunciado: "Un titular dice «Los científicos confirman…» sin enlazar al estudio. ¿Qué haces?",
          opciones: [
            { id: "a", texto: "Buscar el estudio original y comprobar qué dice realmente." },
            { id: "b", texto: "Creerlo, porque habla de científicos.", retro: "Mencionar a «los científicos» no es lo mismo que mostrar el estudio." },
            { id: "c", texto: "Descartarlo, porque todos los titulares mienten.", retro: "El escepticismo total tampoco es pensamiento crítico: hay que comprobar, no rechazar en bloque." },
          ],
          correcta: "a",
          explicacion: "Es el último paso de SIFT: rastrear la afirmación hasta su origen.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "nombre-lectura-lateral",
          enunciado: "¿Cómo se llama la técnica de evaluar una fuente consultando otras webs en lugar de quedarse en la propia página?",
          aceptadas: ["lectura lateral", "leer lateralmente"],
          explicacion: "Lectura lateral: abrir otras pestañas para saber quién habla.",
        },
        {
          tipo: "opcion-multiple",
          id: "ultima-fase-sift",
          enunciado: "En el método SIFT, ¿qué se hace en la última fase?",
          opciones: [
            { id: "a", texto: "Rastrear la afirmación hasta su contexto original." },
            { id: "b", texto: "Compartir la información.", retro: "Compartir no es una fase del método; la primera fase es precisamente parar antes de compartir." },
            { id: "c", texto: "Valorar el diseño de la web.", retro: "El diseño dice poco sobre la fiabilidad." },
          ],
          correcta: "a",
          explicacion: "Trace claims: ir al original.",
        },
        {
          tipo: "texto",
          id: "fuente-primaria-nombre",
          enunciado: "Una fuente que procede directamente del hecho o de quien lo produjo (por ejemplo, el propio estudio) se llama fuente…",
          aceptadas: ["primaria"],
          erroresComunes: [{ respuesta: "secundaria", retro: "La secundaria resume o comenta otra fuente." }],
          explicacion: "Fuente primaria.",
        },
      ],
      resumen: [
        "Lectura lateral: evalúa una fuente saliendo de ella.",
        "SIFT: parar, investigar la fuente, buscar mejor cobertura, rastrear el original.",
        "Prefiere fuentes primarias. Comprueba que las referencias existen, también las que da una IA.",
      ],
    },
    {
      id: "estadistica-cotidiana",
      titulo: "Estadística cotidiana",
      descripcion: "Media y mediana, riesgo relativo y absoluto, correlación y muestras.",
      nivel: 3,
      minutos: 12,
      objetivos: [
        "Elegir entre media y mediana y calcularlas.",
        "Distinguir riesgo relativo de absoluto, y correlación de causalidad.",
      ],
      explicacion: [
        "La media es la suma dividida entre el número de datos; la mediana es el valor central de los datos ordenados. Unos pocos valores extremos mueven mucho la media y poco la mediana, por eso la mediana suele describir mejor los sueldos o los precios de la vivienda.",
        "«Duplica el riesgo» es un dato relativo. Para saber si importa hace falta el riesgo absoluto: no es lo mismo pasar de 1 a 2 casos por cada 10 000 personas que de 10 a 20 casos por cada 100.",
        "Que dos cosas varíen juntas (correlación) no demuestra que una cause la otra: puede haber una tercera variable, causalidad inversa o azar. Y una muestra grande no corrige una muestra sesgada: si solo responden quienes quieren, el resultado puede no representar a la población.",
      ],
      ejemplo: {
        enunciado: "En un pequeño equipo (datos inventados), los sueldos mensuales son 1500, 1600, 1700, 1800 y 20 000 €. ¿Media o mediana?",
        pasos: [
          "Media: (1500 + 1600 + 1700 + 1800 + 20 000) / 5 = 26 600 / 5 = 5320 €.",
          "Mediana: ordenados, el valor central es 1700 €.",
          "La media no describe a nadie del equipo; la mediana describe el sueldo típico.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "numerica",
          id: "intento-riesgo-absoluto",
          enunciado: "Un titular dice que un hábito «duplica el riesgo» de una enfermedad. En el estudio (datos inventados) el riesgo pasa de 1 a 2 casos por cada 10 000 personas. ¿En cuántos casos por cada 10 000 personas aumenta el riesgo absoluto?",
          respuesta: 1,
          unidad: "casos por cada 10 000",
          erroresComunes: [
            { valor: 100, retro: "El 100 % es el aumento relativo (se duplica). En términos absolutos es la diferencia entre ambos riesgos." },
            { valor: 2, retro: "2 es el riesgo final; el aumento es la diferencia: 2 − 1." },
          ],
          explicacion: "El riesgo se duplica (aumento relativo del 100 %), pero en términos absolutos aumenta en 1 caso por cada 10 000 personas.",
        },
        pistas: [
          "Distingue entre cuánto crece el riesgo en proporción y cuántos casos más hay.",
          "Antes: 1 caso por cada 10 000. Después: 2 casos por cada 10 000. ¿Cuál es la diferencia?",
          "La diferencia es 2 − 1. Eso es el aumento absoluto.",
        ],
        solucion: [
          "Riesgo relativo: 2 / 1 = 2 («duplica»).",
          "Riesgo absoluto: 2 − 1 = 1 caso más por cada 10 000 personas.",
          "Para decidir, el dato absoluto es el que te dice cuánto cambia tu situación.",
        ],
      },
      ejercicios: [
        {
          tipo: "numerica",
          id: "calcular-mediana",
          enunciado: "¿Cuál es la mediana de 3, 8, 1, 9 y 4?",
          respuesta: 4,
          erroresComunes: [
            { valor: 5, retro: "5 es la media. La mediana es el valor central tras ordenar." },
            { valor: 1, retro: "Primero hay que ordenar los datos: 1, 3, 4, 8, 9." },
          ],
          explicacion: "Ordenados: 1, 3, 4, 8, 9. El central es 4.",
        },
        {
          tipo: "opcion-multiple",
          id: "helados-ahogamientos",
          enunciado: "En una ciudad, los días en que se venden más helados también hay más ahogamientos. ¿Cuál es la explicación más probable?",
          opciones: [
            { id: "a", texto: "Una tercera variable, el calor, aumenta ambas cosas." },
            { id: "b", texto: "Comer helado causa ahogamientos.", retro: "Correlación no implica causalidad: busca una causa común." },
            { id: "c", texto: "Es pura casualidad.", retro: "El azar es posible, pero aquí hay una causa común muy plausible: con calor se toman más helados y más gente se baña." },
          ],
          correcta: "a",
          explicacion: "Es un ejemplo clásico de variable de confusión.",
        },
        {
          tipo: "verdadero-falso",
          id: "encuesta-grande",
          enunciado: "Si una encuesta en línea la responden 100 000 personas, sus resultados representan bien a toda la población.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "El tamaño no corrige el sesgo de selección: quienes eligen responder pueden ser distintos del resto." },
            { id: "j2", texto: "Es verdadera: con tantas respuestas el error es pequeño.", retro: "Una muestra grande reduce el error aleatorio, no el sesgo de quién responde." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Importa más cómo se elige la muestra que su tamaño.",
        },
        {
          tipo: "opcion-multiple",
          id: "sueldo-tipico",
          enunciado: "Para describir el «sueldo típico» en una empresa con unos pocos sueldos altísimos, ¿qué conviene usar?",
          opciones: [
            { id: "a", texto: "La mediana" },
            { id: "b", texto: "La media", retro: "Los sueldos altísimos inflan la media y la alejan de lo que cobra la mayoría." },
            { id: "c", texto: "El sueldo máximo", retro: "El máximo describe a una sola persona, no a la mayoría." },
          ],
          correcta: "a",
          explicacion: "La mediana es robusta frente a valores extremos.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "nombre-mediana",
          enunciado: "¿Qué medida es el valor central de los datos ordenados?",
          aceptadas: ["mediana"],
          erroresComunes: [
            { respuesta: "media", retro: "La media es la suma dividida entre el número de datos." },
            { respuesta: "moda", retro: "La moda es el valor más frecuente." },
          ],
          explicacion: "La mediana.",
        },
        {
          tipo: "opcion-multiple",
          id: "duplica-relativo",
          enunciado: "«Duplica el riesgo» describe un riesgo…",
          opciones: [
            { id: "a", texto: "relativo." },
            { id: "b", texto: "absoluto.", retro: "El absoluto dice cuántos casos más hay; «duplica» solo dice la proporción." },
          ],
          correcta: "a",
          explicacion: "Para valorarlo hace falta conocer también el riesgo absoluto.",
        },
        {
          tipo: "verdadero-falso",
          id: "correlacion-causalidad",
          enunciado: "Que dos variables estén correlacionadas demuestra que una causa la otra.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "Puede haber una tercera variable, causalidad inversa o azar." },
            { id: "j2", texto: "Es verdadera si la correlación es fuerte.", retro: "Una correlación fuerte puede deberse a una causa común; la fuerza no prueba la dirección causal." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Para hablar de causa hacen falta diseños como los experimentos controlados.",
        },
      ],
      resumen: [
        "Con valores extremos, mejor la mediana que la media.",
        "Pide siempre el riesgo absoluto junto al relativo.",
        "Correlación no es causalidad: busca terceras variables.",
        "Una muestra grande pero sesgada sigue siendo sesgada.",
      ],
    },
  ],
};

export default pensamientoCritico;
