import type { ContentPack } from "@/core/types";
import type { ReadingText } from "@/features/lectura/domain/types";

const text: ReadingText = {
  id: "quijote-del-mucho-leer",
  title: "Del poco dormir y del mucho leer",
  summary: "El comienzo del Quijote: un hidalgo que lee tanto que confunde los libros con el mundo.",
  topic: "literatura",
  level: "avanzado",
  words: 411,
  source: {
    kind: "dominio-publico",
    author: "Miguel de Cervantes Saavedra (1547-1616)",
    work: "El ingenioso hidalgo don Quijote de la Mancha, primera parte, capítulo I",
    year: "1605",
    license: "Dominio público",
    reference:
      "Texto de dominio público; puede cotejarse con la edición del Proyecto Gutenberg (Don Quijote, eBook n.º 2000) o con una edición crítica como la del Instituto Cervantes.",
    note: "Fragmento abreviado: se omite un pasaje, señalado con […]. Ortografía y puntuación parcialmente modernizadas; puede haber pequeñas variantes respecto a otras ediciones.",
  },
  paragraphs: [
    "En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lentejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda. El resto della concluían sayo de velarte, calzas de velludo para las fiestas, con sus pantuflos de lo mesmo, y los días de entresemana se honraba con su vellorí de lo más fino.",
    "Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben; aunque por conjeturas verosímiles se deja entender que se llamaba Quejana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad.",
    "Es, pues, de saber que este sobredicho hidalgo, los ratos que estaba ocioso, que eran los más del año, se daba a leer libros de caballerías con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza, y aun la administración de su hacienda; y llegó a tanto su curiosidad y desatino en esto, que vendió muchas hanegas de tierra de sembradura para comprar libros de caballerías en que leer, y así, llevó a su casa todos cuantos pudo haber dellos. […]",
    "En resolución, él se enfrascó tanto en su lectura, que se le pasaban las noches leyendo de claro en claro, y los días de turbio en turbio; y así, del poco dormir y del mucho leer, se le secó el celebro, de manera que vino a perder el juicio. Llenósele la fantasía de todo aquello que leía en los libros, así de encantamentos como de pendencias, batallas, desafíos, heridas, requiebros, amores, tormentas y disparates imposibles; y asentósele de tal modo en la imaginación que era verdad toda aquella máquina de aquellas sonadas soñadas invenciones que leía, que para él no había otra historia más cierta en el mundo.",
  ],
  questions: [
    {
      id: "q-que-leia",
      kind: "literal",
      prompt: "¿Qué tipo de libros leía el hidalgo?",
      options: ["Libros de historia", "Libros de caballerías", "Libros de caza", "Libros de agricultura"],
      correctIndex: 1,
      explanation:
        "El tercer párrafo lo dice dos veces: se daba a leer libros de caballerías, y vendió tierras para comprar más.",
    },
    {
      id: "q-ironia",
      kind: "inferencial",
      prompt:
        "El narrador dice que los ratos en que el hidalgo estaba ocioso «eran los más del año». ¿Qué tono revela ese comentario?",
      options: [
        "Admiración por lo trabajador que era",
        "Tristeza por su pobreza",
        "Ironía: el hidalgo apenas tenía ocupaciones",
        "Miedo a lo que pudiera hacer",
      ],
      correctIndex: 2,
      explanation:
        "El inciso desmonta con humor la expresión «los ratos que estaba ocioso»: no eran ratos, eran casi todo el año. Es una ironía típica del narrador, que también juega con la duda sobre su nombre.",
    },
    {
      id: "q-celebro",
      kind: "vocabulario",
      prompt: "En el texto, «se le secó el celebro» significa que…",
      options: [
        "perdió el juicio, la cordura",
        "sufrió una enfermedad física del cerebro",
        "se quedó dormido",
        "dejó de recordar lo que había leído",
      ],
      correctIndex: 0,
      explanation:
        "«Celebro» es una forma antigua de «cerebro», y la propia frase lo aclara: «de manera que vino a perder el juicio». Es una expresión figurada, no un diagnóstico.",
    },
    {
      id: "q-hanegas",
      kind: "vocabulario",
      prompt: "Vendió «muchas hanegas de tierra de sembradura». Por el contexto, una «hanega» es…",
      options: ["un tipo de libro", "una moneda", "una herramienta de labranza", "una medida de superficie de tierra"],
      correctIndex: 3,
      explanation:
        "Se venden hanegas «de tierra de sembradura», así que es una medida de tierra (hoy se escribe «fanega»). El contexto basta para deducirlo aunque no se conozca la palabra.",
    },
    {
      id: "q-estructura",
      kind: "estructura",
      prompt: "¿Cómo está organizado el fragmento?",
      options: [
        "Retrato del hidalgo y su vida cotidiana, después su afición a leer y por último sus consecuencias",
        "Diálogo entre el hidalgo y su sobrina",
        "Descripción de un viaje por la Mancha",
        "Relato de una batalla seguido de su explicación",
      ],
      correctIndex: 0,
      explanation:
        "Los dos primeros párrafos retratan al personaje (comida, ropa, casa, edad, nombre). El tercero presenta la afición y el cuarto su consecuencia: pierde el juicio y toma por verdad lo que lee.",
    },
  ],
  keyIdeas: [
    {
      id: "confundir-ficcion",
      prompt: "En el capítulo I del Quijote, ¿qué le ocurre al hidalgo por leer tanto?",
      answer:
        "Del poco dormir y del mucho leer pierde el juicio y llega a creer que todo lo que cuentan los libros de caballerías es verdad.",
    },
    {
      id: "narrador-ironico",
      prompt: "¿Qué rasgo del narrador se aprecia en este comienzo?",
      answer:
        "La ironía: comentarios como «que eran los más del año» o la duda fingida sobre el nombre del hidalgo crean distancia y humor.",
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
