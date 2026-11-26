import type { ContentPack } from "@/core/types";
import type { MeditationScript } from "@/features/bienestar/domain/types";

const pack: ContentPack<MeditationScript> = {
  id: "meditaciones-basicas",
  module: "bienestar",
  version: 1,
  locale: "es",
  title: "Meditaciones básicas",
  items: [
    {
      id: "atencion-respiracion",
      title: "Atención a la respiración",
      intro:
        "Busca una postura en la que estés a gusto, sentado o tumbado. Puedes cerrar los ojos o dejar la mirada apoyada en un punto del suelo. No hay una forma correcta de hacerlo.",
      steps: [
        {
          id: "llegar",
          text: "Nota el contacto de tu cuerpo con la silla, el suelo o la cama. Deja que el peso se apoye.",
        },
        {
          id: "localizar",
          text: "Lleva la atención a la respiración tal como es ahora, sin cambiarla. Busca dónde la notas más: en la nariz, en el pecho o en el abdomen.",
        },
        {
          id: "anclar",
          weight: 2,
          text: "Quédate con las sensaciones de cada inspiración y cada espiración. Si te ayuda, puedes decir por dentro «entra» y «sale».",
        },
        {
          id: "distraccion",
          weight: 2,
          text: "En algún momento la mente se irá a otra cosa: un plan, un recuerdo, un ruido. Es lo normal. Cuando te des cuenta, nota adónde se fue y vuelve con amabilidad a la respiración.",
        },
        {
          id: "volver",
          weight: 2,
          text: "Cada vez que vuelves estás practicando. No hace falta tener la mente en blanco; basta con regresar, una y otra vez.",
        },
        {
          id: "ampliar",
          text: "Ahora abre un poco la atención: el cuerpo entero respirando, los sonidos de alrededor, la temperatura del aire.",
        },
      ],
      closing:
        "Antes de terminar, date un momento para notar cómo estás, sin juzgarlo. Cuando quieras, mueve un poco las manos y los pies y vuelve a tu día.",
    },
    {
      id: "escaneo-corporal",
      title: "Escaneo corporal",
      intro:
        "Vas a recorrer el cuerpo con la atención, de los pies a la cabeza, solo para notar lo que hay. Si alguna zona te resulta incómoda, puedes pasar de largo o cambiar de postura: tú decides.",
      steps: [
        {
          id: "postura",
          text: "Acomódate y haz un par de respiraciones a tu ritmo. Nota el cuerpo apoyado.",
        },
        {
          id: "pies",
          text: "Lleva la atención a los pies: los dedos, las plantas, los talones. Quizá notes calor, frío, presión, hormigueo o nada en particular. Todo vale.",
        },
        {
          id: "piernas",
          text: "Sube despacio por los tobillos, las pantorrillas, las rodillas y los muslos. Solo observa.",
        },
        {
          id: "abdomen",
          text: "Pasa a la cadera, la zona baja de la espalda y el abdomen. Puede que notes cómo se mueve con la respiración.",
        },
        {
          id: "pecho-espalda",
          text: "Ahora el pecho y la espalda. Si encuentras tensión, no hace falta quitarla; puedes simplemente reconocerla.",
        },
        {
          id: "brazos",
          text: "Recorre las manos, los brazos y los hombros. Los hombros suelen guardar tensión; si quieres, déjalos bajar un poco.",
        },
        {
          id: "cara",
          text: "Llega al cuello, la mandíbula, la boca, los ojos y la frente. Nota si hay algún gesto apretado y, si te apetece, suéltalo.",
        },
        {
          id: "cuerpo-entero",
          weight: 2,
          text: "Para terminar, siente el cuerpo entero a la vez, respirando. Si la mente se ha ido muchas veces, también está bien: volver es la práctica.",
        },
      ],
      closing:
        "Tómate unos segundos antes de levantarte. Mueve los dedos, estírate si lo necesitas y vuelve poco a poco.",
    },
  ],
};

export default pack;
