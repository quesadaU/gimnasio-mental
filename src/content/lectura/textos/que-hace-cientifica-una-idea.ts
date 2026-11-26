import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "que-hace-cientifica-una-idea",
  title: "Qué hace científica una idea",
  summary: "La falsabilidad de Popper, sus límites y por qué la repetición de resultados importa tanto.",
  topic: "ciencia",
  level: "avanzado",
  words: 467,
  source: {
    kind: "original",
    author: "Equipo de Gimnasio Mental",
    license: "Texto original escrito para Gimnasio Mental",
  },
  paragraphs: [
    "Una idea no se vuelve científica por hablar de átomos, de neuronas o de galaxias, ni por ir acompañada de gráficos. Lo que la hace científica es, sobre todo, la manera en que se relaciona con la evidencia. El filósofo Karl Popper propuso en los años treinta del siglo XX un criterio que se ha hecho famoso: una teoría es científica si es falsable, es decir, si prohíbe que ocurran ciertas cosas y, por tanto, podría quedar refutada por una observación.",
    "La afirmación «todos los cisnes son blancos» es falsable: basta encontrar un cisne negro para desmentirla, y de hecho los hay en Australia. En cambio, una afirmación como «todo lo que ocurre es para bien» no prohíbe nada; cualquier desgracia puede reinterpretarse como un bien a largo plazo. Popper sospechaba de las teorías capaces de explicarlo absolutamente todo: lejos de ser una virtud, esa flexibilidad indicaba que no se arriesgaban a nada.",
    "El criterio tiene una intuición valiosa, pero los filósofos e historiadores de la ciencia señalaron pronto sus límites. En la práctica, cuando una predicción falla, no siempre se abandona la teoría. Puede que falle un instrumento, una suposición auxiliar o el cálculo. Un ejemplo célebre es el de Urano: su órbita no encajaba con la mecánica de Newton, pero en lugar de descartar la teoría, varios astrónomos supusieron que otro planeta desconocido tiraba de él. Así se descubrió Neptuno en 1846. Salvar una teoría con una hipótesis adicional puede ser legítimo, siempre que esa hipótesis haga predicciones nuevas que se puedan comprobar.",
    "Por eso hoy se suele describir la ciencia menos como un criterio único y más como un conjunto de prácticas que se refuerzan entre sí: formular predicciones arriesgadas, medir con cuidado, publicar los métodos para que otros los examinen y, muy especialmente, repetir los estudios. Un resultado aislado, por llamativo que sea, vale poco hasta que otros equipos lo reproducen de forma independiente.",
    "La importancia de repetir se hizo muy visible en la última década. En 2015, un amplio proyecto colaborativo intentó replicar cien estudios publicados en revistas de psicología y obtuvo resultados estadísticamente significativos en bastante menos de la mitad de los casos, a menudo con efectos más pequeños que los originales. Algo parecido se ha observado en otras disciplinas. Esto no demuestra que esas ciencias no sirvan; demuestra que el mecanismo de autocorrección funciona cuando se usa, y que conviene desconfiar de los hallazgos que nadie ha repetido.",
    "Para quien lee divulgación, todo esto se traduce en unas pocas preguntas sencillas. ¿Qué tendría que pasar para que esta afirmación fuese falsa? ¿Se ha repetido el resultado o es un único estudio? ¿El efecto es grande o apenas perceptible? Ninguna de ellas exige ser experto, y todas protegen contra la tentación de creer lo que encaja con lo que ya pensábamos.",
  ],
  references: [
    "Popper, K. (1959). The Logic of Scientific Discovery. Londres: Hutchinson (original alemán de 1934).",
    "Open Science Collaboration (2015). Estimating the reproducibility of psychological science. Science, 349(6251), aac4716.",
  ],
  questions: [
    {
      id: "q-falsable",
      kind: "literal",
      prompt: "Según el texto, para Popper una teoría es científica si…",
      options: [
        "ha sido confirmada por muchos experimentos",
        "podría quedar refutada por alguna observación",
        "la defienden la mayoría de los científicos",
        "utiliza matemáticas avanzadas",
      ],
      correctIndex: 1,
      explanation:
        "El primer párrafo define la falsabilidad: la teoría prohíbe ciertas cosas y, por tanto, una observación podría refutarla. La confirmación repetida no basta para Popper.",
    },
    {
      id: "q-neptuno",
      kind: "inferencial",
      prompt: "¿Qué muestra el caso de Urano y Neptuno sobre el criterio de falsabilidad?",
      options: [
        "Que la mecánica de Newton quedó refutada en 1846",
        "Que los astrónomos ignoraban las observaciones que no les gustaban",
        "Que ante una predicción fallida puede ser razonable mantener la teoría si la hipótesis añadida hace predicciones comprobables",
        "Que la falsabilidad es un criterio inútil",
      ],
      correctIndex: 2,
      explanation:
        "El fallo de la órbita no llevó a abandonar a Newton: se añadió una hipótesis (otro planeta) que predecía algo nuevo y comprobable, y se confirmó. Matiza el criterio, pero no lo declara inútil.",
    },
    {
      id: "q-no-prohibe",
      kind: "inferencial",
      prompt: "¿Por qué «todo lo que ocurre es para bien» no sería falsable?",
      options: [
        "Porque cualquier suceso puede reinterpretarse para encajar en ella, así que no prohíbe nada",
        "Porque es demasiado optimista",
        "Porque nadie la ha investigado todavía",
        "Porque trata de cosas que no se pueden medir con instrumentos caros",
      ],
      correctIndex: 0,
      explanation:
        "El segundo párrafo dice que no prohíbe nada: toda desgracia puede reinterpretarse como un bien a largo plazo. Ninguna observación posible la contradiría.",
    },
    {
      id: "q-replicar",
      kind: "vocabulario",
      prompt: "En el texto, «replicar» un estudio significa…",
      options: [
        "responder a sus críticos",
        "copiar sus conclusiones en otro artículo",
        "traducirlo a otro idioma",
        "repetirlo de forma independiente para ver si se obtiene el mismo resultado",
      ],
      correctIndex: 3,
      explanation:
        "Por el contexto del cuarto y quinto párrafo, replicar es reproducir el estudio de forma independiente. En el uso general «replicar» también puede significar contestar, pero aquí no es ese sentido.",
    },
    {
      id: "q-funcion-final",
      kind: "estructura",
      prompt: "¿Qué papel tiene el último párrafo?",
      options: [
        "Introduce un criterio que sustituye al de Popper",
        "Traduce las ideas del texto en preguntas prácticas para el lector",
        "Resume la biografía de Popper",
        "Defiende que solo los expertos pueden evaluar la ciencia",
      ],
      correctIndex: 1,
      explanation:
        "Convierte la discusión en tres preguntas que cualquiera puede hacerse al leer divulgación, y dice expresamente que no exigen ser experto.",
    },
  ],
  keyIdeas: [
    {
      id: "falsabilidad",
      prompt: "¿Qué es la falsabilidad según Popper?",
      answer:
        "Que una teoría prohíba ciertas observaciones y, por tanto, pueda quedar refutada. Una teoría que lo explica todo no arriesga nada.",
    },
    {
      id: "hipotesis-auxiliar",
      prompt: "¿Cuándo es legítimo salvar una teoría con una hipótesis adicional?",
      answer:
        "Cuando la hipótesis añadida hace predicciones nuevas que se pueden comprobar, como la existencia de Neptuno para explicar la órbita de Urano.",
    },
    {
      id: "replicacion",
      prompt: "¿Por qué importa tanto la replicación?",
      answer:
        "Porque un resultado aislado vale poco hasta que otros lo reproducen de forma independiente; los intentos de replicación muestran qué hallazgos se sostienen.",
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
