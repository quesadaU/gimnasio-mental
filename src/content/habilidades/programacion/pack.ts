import type { ContentPack } from "@/core/types";
import type { Leccion } from "@/features/habilidades/domain/types";

/**
 * Ruta de Programación. Los ejemplos usan Python 3. Ningún fragmento se ejecuta en la app:
 * las respuestas se comprueban por comparación normalizada o con el intérprete propio de
 * expresiones (features/habilidades/domain/expresiones.ts).
 */
const programacion: ContentPack<Leccion> = {
  id: "programacion",
  module: "habilidades",
  version: 1,
  locale: "es",
  title: "Programación",
  items: [
    {
      id: "variables",
      titulo: "Variables y asignación",
      descripcion: "Qué significa realmente `=` y cómo cambian los valores línea a línea.",
      nivel: 1,
      minutos: 8,
      objetivos: [
        "Distinguir asignación (`=`) de comparación (`==`).",
        "Predecir el valor de una variable siguiendo el programa en orden.",
      ],
      explicacion: [
        "Una variable es un nombre que apunta a un valor. En Python se crea al asignarle algo: `edad = 30`.",
        "El signo `=` no significa «es igual», como en matemáticas: significa «calcula lo de la derecha y guárdalo con el nombre de la izquierda». Por eso `x = x + 1` tiene sentido: toma el valor actual de `x`, le suma 1 y lo guarda otra vez en `x`.",
        "Python ejecuta las líneas de arriba abajo. El valor de una variable en un momento dado es el de la última asignación que se ha ejecutado hasta ese momento.",
      ],
      ejemplo: {
        enunciado: "¿Qué imprime este programa?",
        codigo: "a = 5\nb = a\na = 8\nprint(b)",
        pasos: [
          "Línea 1: `a` vale 5.",
          "Línea 2: `b` toma el valor que tiene `a` en ese momento, 5. No queda «enlazada» a `a`.",
          "Línea 3: `a` pasa a valer 8. `b` no cambia, porque no se le ha asignado nada nuevo.",
          "Línea 4: se imprime 5.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "numerica",
          id: "intento-traza",
          enunciado: "Predice qué número imprime este programa.",
          codigo: "x = 3\ny = x * 2\nx = x + 1\nprint(x + y)",
          respuesta: 10,
          explicacion: "Tras la línea 2, `y` vale 6. La línea 3 cambia `x` a 4, pero no recalcula `y`. Se imprime 4 + 6 = 10.",
          erroresComunes: [
            { valor: 12, retro: "Has recalculado `y` con el nuevo `x` (4 × 2 = 8). Pero `y` se calculó en la línea 2 y no cambia sola." },
            { valor: 9, retro: "Has olvidado la línea 3: `x = x + 1` cambia `x` de 3 a 4." },
          ],
        },
        pistas: [
          "Haz una tabla con una columna por variable y avanza línea a línea.",
          "Después de la línea 2, `y` vale 6. ¿Cambia `y` cuando cambia `x` en la línea 3?",
          "En la línea 3, `x` pasa de 3 a 4; `y` sigue valiendo 6. Solo queda sumar.",
        ],
        solucion: [
          "Línea 1: x = 3.",
          "Línea 2: y = 3 × 2 = 6.",
          "Línea 3: x = 3 + 1 = 4. La variable y no se toca.",
          "Línea 4: se imprime x + y = 4 + 6 = 10.",
        ],
      },
      ejercicios: [
        {
          tipo: "opcion-multiple",
          id: "significado-acumular",
          enunciado: "¿Qué hace la instrucción `total = total + precio`?",
          opciones: [
            { id: "a", texto: "Comprueba si total es igual a total + precio.", retro: "Comparar es `==`. Un solo `=` asigna." },
            { id: "b", texto: "Suma precio al valor actual de total y guarda el resultado en total." },
            { id: "c", texto: "Da error, porque total aparece a los dos lados.", retro: "Es válido si total ya tenía un valor: primero se evalúa la derecha y después se guarda." },
          ],
          correcta: "b",
          explicacion: "Python evalúa primero la expresión de la derecha con los valores actuales y después guarda el resultado en la variable de la izquierda.",
        },
        {
          tipo: "completar-codigo",
          id: "intercambio-auxiliar",
          enunciado: "Completa el código para intercambiar los valores de a y b usando una variable auxiliar. Al final, a debe valer 2 y b debe valer 1.",
          plantilla: "a = 1\nb = 2\naux = a\na = ___\nb = ___",
          huecos: [
            { aceptadas: ["b"], retro: "En ese momento `a` debe recibir el valor de `b`." },
            { aceptadas: ["aux"], retro: "Si usas `a`, ya vale 2: por eso se guardó el valor original de `a` en `aux`." },
          ],
          explicacion: "Sin la variable auxiliar perderíamos el valor original de a al sobrescribirlo. aux lo conserva para dárselo después a b.",
        },
        {
          tipo: "numerica",
          id: "traza-tres-lineas",
          enunciado: "¿Qué imprime este programa?",
          codigo: "n = 10\nn = n - 3\nn = n * 2\nprint(n)",
          respuesta: 14,
          erroresComunes: [
            { valor: 4, retro: "Has hecho 10 − 3 × 2 en una sola expresión. Son líneas separadas: primero n vale 7 y después 7 × 2." },
          ],
          explicacion: "n vale 10, después 10 − 3 = 7 y por último 7 × 2 = 14.",
        },
        {
          tipo: "verdadero-falso",
          id: "reasignar-no-arrastra",
          enunciado: "Tras ejecutar `a = 2`, luego `b = a` y luego `a = 9`, la variable b vale 9.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "b recibió el valor que tenía a en ese momento (2); reasignar a después solo cambia a qué apunta a." },
            { id: "j2", texto: "a y b quedan enlazadas y cambian siempre juntas.", retro: "En Python, reasignar un nombre no afecta a otros nombres que apuntaban al valor anterior." },
            { id: "j3", texto: "Python evalúa todo el programa a la vez y se queda con el último valor.", retro: "Python ejecuta las líneas en orden, de arriba abajo." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "b vale 2. La asignación `a = 9` solo cambia a.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "simbolo-asignacion",
          enunciado: "En Python, ¿qué símbolo se usa para asignar un valor a una variable?",
          aceptadas: ["=", "igual", "signo igual", "el signo igual"],
          erroresComunes: [{ respuesta: "==", retro: "`==` compara dos valores; `=` asigna." }],
          explicacion: "Un solo signo igual asigna: `x = 5`.",
        },
        {
          tipo: "numerica",
          id: "reasignacion-producto",
          enunciado: "Si `x = 4` y después se ejecuta `x = x * 3`, ¿cuánto vale x?",
          respuesta: 12,
          erroresComunes: [{ valor: 4, retro: "La segunda línea sí cambia x: guarda 4 × 3 en x." }],
          explicacion: "Se evalúa 4 × 3 = 12 y se guarda en x.",
        },
        {
          tipo: "opcion-multiple",
          id: "orden-ejecucion",
          enunciado: "¿En qué orden ejecuta Python las líneas de un programa sin bucles ni funciones?",
          opciones: [
            { id: "a", texto: "De arriba abajo, una tras otra." },
            { id: "b", texto: "Todas a la vez.", retro: "Si fuese así, `x = x + 1` no tendría sentido: el orden importa." },
            { id: "c", texto: "De abajo arriba.", retro: "El orden es el de lectura: de arriba abajo." },
          ],
          correcta: "a",
          explicacion: "Por eso para predecir un programa se sigue línea a línea.",
        },
      ],
      resumen: [
        "`=` asigna: calcula la derecha y la guarda en el nombre de la izquierda.",
        "`==` compara, no asigna.",
        "El valor de una variable es el de su última asignación ejecutada; cambiar una variable no cambia otras.",
        "Para predecir un programa, haz una tabla con una columna por variable.",
      ],
    },
    {
      id: "condicionales",
      titulo: "Condicionales: if, elif y else",
      descripcion: "Cómo decide un programa qué camino seguir.",
      nivel: 2,
      minutos: 10,
      objetivos: [
        "Escribir condiciones con comparaciones y con and, or y not.",
        "Predecir qué rama de una cadena if/elif/else se ejecuta.",
      ],
      explicacion: [
        "`if` evalúa una condición, que da `True` o `False`. Si es `True`, se ejecuta el bloque sangrado debajo. La sangría (los espacios al principio) es la que marca qué pertenece al bloque.",
        "`elif` (abreviatura de «else if») añade otra condición que solo se comprueba si todas las anteriores fueron falsas. `else` no lleva condición: recoge todos los casos restantes. En una cadena if/elif/else se ejecuta como mucho una rama: la primera cuya condición es verdadera.",
        "Comparaciones: `==` (igual), `!=` (distinto), `<`, `<=`, `>`, `>=`. Se combinan con `and` (las dos deben ser ciertas), `or` (basta una) y `not` (invierte).",
      ],
      ejemplo: {
        enunciado: "¿Qué imprime este programa?",
        codigo: 'nota = 7\nif nota >= 9:\n    print("Sobresaliente")\nelif nota >= 5:\n    print("Aprobado")\nelse:\n    print("Suspenso")',
        pasos: [
          "`nota >= 9` es falso (7 no llega a 9): se salta ese bloque.",
          "Como la anterior fue falsa, se comprueba `nota >= 5`: es verdadero.",
          "Se imprime «Aprobado» y el resto de la cadena (else) se salta.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "texto",
          id: "intento-cadena-elif",
          enunciado: "Predice qué palabra imprime este programa.",
          codigo: 't = 25\nif t > 30:\n    print("calor")\nelif t > 20:\n    print("templado")\nelif t > 10:\n    print("fresco")\nelse:\n    print("frío")',
          aceptadas: ["templado"],
          erroresComunes: [
            { respuesta: "fresco", retro: "`t > 10` también es cierto, pero ese elif solo se comprueba si los anteriores fueron falsos, y `t > 20` ya fue verdadero." },
            { respuesta: "templado fresco", retro: "En una cadena if/elif/else solo se ejecuta una rama: la primera verdadera." },
            { respuesta: "calor", retro: "25 no es mayor que 30, así que la primera condición es falsa." },
          ],
          explicacion: "t > 30 es falso; t > 20 es verdadero, así que se imprime «templado» y el resto se salta.",
        },
        pistas: [
          "Recorre las condiciones de arriba abajo y detente en la primera que sea verdadera.",
          "¿Es 25 mayor que 30? ¿Y mayor que 20?",
          "La segunda condición, `t > 20`, es la primera verdadera. Después de ejecutar su rama, el programa no mira las demás.",
        ],
        solucion: [
          "t > 30: 25 > 30 es falso.",
          "t > 20: 25 > 20 es verdadero. Se ejecuta print(\"templado\").",
          "Las ramas siguientes no se comprueban, aunque t > 10 también sea cierto.",
        ],
      },
      ejercicios: [
        {
          tipo: "completar-codigo",
          id: "condicion-par",
          enunciado: "Completa la condición para que el programa imprima «par» cuando n es par.",
          plantilla: 'if ___:\n    print("par")\nelse:\n    print("impar")',
          huecos: [
            {
              aceptadas: ["n % 2 == 0"],
              equivalencia: { n: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7] },
              retro: "Un número es par si el resto de dividirlo entre 2 es 0. El resto se obtiene con `%`.",
            },
          ],
          explicacion: "`n % 2` es el resto de dividir n entre 2. Vale 0 exactamente cuando n es par.",
        },
        {
          tipo: "opcion-multiple",
          id: "and-limite",
          enunciado: "¿Qué imprime este programa?",
          codigo: 'x = 5\nif x > 3 and x < 5:\n    print("A")\nelse:\n    print("B")',
          opciones: [
            { id: "a", texto: "A", retro: "`x < 5` es falso, porque 5 no es menor que 5. Con `and` hacen falta las dos." },
            { id: "b", texto: "B" },
            { id: "c", texto: "Nada", retro: "Con else siempre se ejecuta una de las dos ramas." },
            { id: "d", texto: "A y B", retro: "if y else son excluyentes: solo se ejecuta una." },
          ],
          correcta: "b",
          explicacion: "x > 3 es verdadero, pero x < 5 es falso. `and` exige que ambas sean verdaderas, así que se ejecuta else.",
        },
        {
          tipo: "completar-codigo",
          id: "rango-incluido",
          enunciado: "Completa la condición para que sea verdadera cuando edad está entre 18 y 65, ambos incluidos.",
          plantilla: 'if ___:\n    print("en rango")',
          huecos: [
            {
              aceptadas: ["edad >= 18 and edad <= 65", "18 <= edad <= 65"],
              equivalencia: { edad: [0, 17, 18, 19, 40, 64, 65, 66, 100] },
              retro: "Ambos extremos están incluidos: usa `>=` y `<=`, unidos con `and` porque deben cumplirse las dos cosas.",
            },
          ],
          explicacion: "Una forma es `edad >= 18 and edad <= 65`. Python también admite comparaciones encadenadas: `18 <= edad <= 65`.",
        },
        {
          tipo: "verdadero-falso",
          id: "una-sola-rama",
          enunciado: "En una cadena if/elif/else, si varias condiciones son verdaderas, se ejecutan todas sus ramas.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "Solo se ejecuta la primera rama cuya condición es verdadera; las demás se saltan." },
            { id: "j2", texto: "Se ejecutan todas, porque Python revisa cada condición.", retro: "Eso ocurriría con varios if independientes, no con elif." },
            { id: "j3", texto: "Se ejecuta la última condición verdadera.", retro: "Es al revés: gana la primera verdadera, de arriba abajo." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "elif significa «si no, y además…»: solo se mira si lo anterior falló.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "palabra-elif",
          enunciado: "¿Qué palabra clave de Python introduce una condición alternativa que solo se comprueba si las anteriores fueron falsas?",
          aceptadas: ["elif"],
          erroresComunes: [{ respuesta: "else", retro: "else no lleva condición: recoge todos los casos restantes." }],
          explicacion: "elif añade una condición más a la cadena.",
        },
        {
          tipo: "opcion-multiple",
          id: "operador-igualdad",
          enunciado: "¿Qué operador comprueba si dos valores son iguales?",
          opciones: [
            { id: "a", texto: "==" },
            { id: "b", texto: "=", retro: "Un solo `=` asigna un valor; no compara." },
            { id: "c", texto: "!=", retro: "`!=` comprueba si son distintos." },
          ],
          correcta: "a",
          explicacion: "`==` devuelve True si ambos valores son iguales.",
        },
        {
          tipo: "opcion-multiple",
          id: "and-or",
          enunciado: "¿Qué hace falta para que `p and q` sea verdadero?",
          opciones: [
            { id: "a", texto: "Que p y q sean verdaderas las dos." },
            { id: "b", texto: "Que al menos una sea verdadera.", retro: "Eso describe `or`." },
            { id: "c", texto: "Que sean distintas entre sí.", retro: "Eso sería `p != q`." },
          ],
          correcta: "a",
          explicacion: "and exige las dos condiciones; or se conforma con una.",
        },
      ],
      resumen: [
        "if ejecuta un bloque solo si su condición es verdadera; la sangría marca el bloque.",
        "En una cadena if/elif/else se ejecuta como mucho una rama: la primera verdadera.",
        "and exige las dos condiciones; or, al menos una; not invierte.",
        "Cuidado con los extremos: `<` excluye el límite y `<=` lo incluye.",
      ],
    },
    {
      id: "bucles",
      titulo: "Bucles: for y while",
      descripcion: "Repetir instrucciones sin copiar código, y saber cuántas veces se repiten.",
      nivel: 2,
      minutos: 10,
      objetivos: [
        "Saber qué valores genera `range` y cuántas vueltas da un bucle.",
        "Usar un acumulador y detectar un bucle infinito.",
      ],
      explicacion: [
        "`for` recorre una secuencia elemento a elemento. `range(a, b)` genera los enteros desde a hasta b − 1: el final no se incluye. `range(n)` empieza en 0 y genera n valores: 0, 1, …, n − 1.",
        "`while` repite su bloque mientras la condición sea verdadera, y la comprueba antes de cada vuelta. Si nada dentro del bucle hace que la condición llegue a ser falsa, el bucle no termina nunca.",
        "Patrón acumulador: se crea una variable antes del bucle (por ejemplo `total = 0`) y en cada vuelta se le suma algo. Al terminar contiene el resultado.",
      ],
      ejemplo: {
        enunciado: "¿Qué imprime este programa?",
        codigo: "total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)",
        pasos: [
          "`range(1, 5)` genera 1, 2, 3 y 4 (el 5 no se incluye).",
          "total va valiendo 0 → 1 → 3 → 6 → 10.",
          "Al acabar el bucle se imprime 10.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "numerica",
          id: "intento-acumulador",
          enunciado: "Predice qué número imprime este programa.",
          codigo: "s = 0\nfor i in range(2, 6):\n    s = s + i\nprint(s)",
          respuesta: 14,
          erroresComunes: [
            { valor: 20, retro: "Has incluido el 6. `range(2, 6)` termina en 5." },
            { valor: 9, retro: "Te falta una vuelta: `range(2, 6)` genera 2, 3, 4 y 5." },
          ],
          explicacion: "range(2, 6) genera 2, 3, 4 y 5. Su suma es 14.",
        },
        pistas: [
          "Primero escribe la lista de valores que toma i.",
          "`range(2, 6)` empieza en 2. ¿Incluye el 6?",
          "No incluye el 6: los valores son 2, 3, 4 y 5. Súmalos.",
        ],
        solucion: [
          "i toma los valores 2, 3, 4 y 5.",
          "s pasa por 0 → 2 → 5 → 9 → 14.",
          "Se imprime 14.",
        ],
      },
      ejercicios: [
        {
          tipo: "numerica",
          id: "vueltas-while",
          enunciado: "¿Cuántas veces se ejecuta `print` en este programa?",
          codigo: "i = 10\nwhile i > 0:\n    print(i)\n    i = i - 3",
          respuesta: 4,
          unidad: "veces",
          erroresComunes: [{ valor: 3, retro: "Cuenta también la vuelta con i = 1: 1 > 0 es verdadero." }],
          explicacion: "i toma los valores 10, 7, 4 y 1, que cumplen i > 0. Después vale −2 y el bucle termina: 4 veces.",
        },
        {
          tipo: "completar-codigo",
          id: "range-hasta-diez",
          enunciado: "Completa para que el bucle imprima los números del 1 al 10, ambos incluidos.",
          plantilla: "for n in range(1, ___):\n    print(n)",
          huecos: [
            {
              aceptadas: ["11"],
              equivalencia: {},
              retro: "range excluye el final: para que el último valor sea 10, el final tiene que ser 11.",
            },
          ],
          explicacion: "range(1, 11) genera 1, 2, …, 10.",
        },
        {
          tipo: "ordenar",
          id: "pasos-media",
          enunciado: "Ordena los pasos para calcular con un bucle la media de una lista de números.",
          pasos: [
            { id: "p1", texto: "Crear la variable total con valor 0." },
            { id: "p2", texto: "Recorrer cada número de la lista." },
            { id: "p3", texto: "Sumar el número a total." },
            { id: "p4", texto: "Al terminar el bucle, dividir total entre la cantidad de números." },
          ],
          explicacion: "El acumulador se inicializa antes del bucle, se actualiza dentro y se usa después.",
        },
        {
          tipo: "opcion-multiple",
          id: "bucle-infinito",
          enunciado: "¿Qué ocurre al ejecutar este programa?",
          codigo: "i = 0\nwhile i < 5:\n    print(i)",
          opciones: [
            { id: "a", texto: "Imprime 0 sin parar, porque i nunca cambia." },
            { id: "b", texto: "Imprime 0, 1, 2, 3 y 4.", retro: "Para eso haría falta `i = i + 1` dentro del bucle." },
            { id: "c", texto: "No imprime nada.", retro: "0 < 5 es verdadero, así que entra en el bucle." },
          ],
          correcta: "a",
          explicacion: "La condición depende de i, pero el bloque nunca modifica i: es un bucle infinito.",
        },
      ],
      recuperacion: [
        {
          tipo: "opcion-multiple",
          id: "valores-range",
          enunciado: "¿Qué números genera `range(3)`?",
          opciones: [
            { id: "a", texto: "0, 1, 2" },
            { id: "b", texto: "1, 2, 3", retro: "Si no se indica inicio, range empieza en 0." },
            { id: "c", texto: "0, 1, 2, 3", retro: "El final no se incluye." },
          ],
          correcta: "a",
          explicacion: "range(n) genera n valores empezando en 0.",
        },
        {
          tipo: "numerica",
          id: "vueltas-range",
          enunciado: "¿Cuántas vueltas da `for i in range(2, 8)`?",
          respuesta: 6,
          unidad: "vueltas",
          erroresComunes: [{ valor: 7, retro: "El 8 no se incluye: los valores son 2, 3, 4, 5, 6 y 7." }],
          explicacion: "De 2 a 7 hay 8 − 2 = 6 valores.",
        },
        {
          tipo: "verdadero-falso",
          id: "while-cero-veces",
          enunciado: "Un bucle while siempre se ejecuta al menos una vez.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "Si la condición es falsa desde el principio, el bloque no se ejecuta ninguna vez." },
            { id: "j2", texto: "while comprueba la condición al final de cada vuelta.", retro: "En Python, while comprueba la condición antes de cada vuelta." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Por ejemplo, `while 1 > 2:` no entra nunca.",
        },
      ],
      resumen: [
        "range(a, b) va de a hasta b − 1; range(n), de 0 a n − 1. Hay b − a vueltas.",
        "while comprueba la condición antes de cada vuelta; algo dentro debe acercarla a ser falsa.",
        "Acumulador: inicializar antes, actualizar dentro, usar después.",
      ],
    },
    {
      id: "funciones",
      titulo: "Funciones: parámetros y return",
      descripcion: "Empaquetar un cálculo con nombre y distinguir devolver de imprimir.",
      nivel: 3,
      minutos: 10,
      objetivos: [
        "Definir funciones con parámetros y usar return.",
        "Distinguir entre devolver un valor (return) y mostrarlo (print).",
      ],
      explicacion: [
        "Una función se define con `def nombre(parámetros):` y un bloque sangrado. Se ejecuta al llamarla: `nombre(3, 4)`. Los argumentos se asignan a los parámetros por posición.",
        "`return valor` termina la función en ese momento y entrega el valor a quien la llamó, que puede guardarlo o usarlo en otra expresión. Lo que va detrás de un return ejecutado no se ejecuta.",
        "`print` solo muestra algo en pantalla; no devuelve nada. Una función que termina sin ejecutar ningún return devuelve el valor especial `None`.",
      ],
      ejemplo: {
        enunciado: "¿Qué imprime este programa?",
        codigo: "def area_rectangulo(base, altura):\n    return base * altura\n\na = area_rectangulo(3, 4)\nprint(a + 1)",
        pasos: [
          "La llamada asigna base = 3 y altura = 4.",
          "La función devuelve 3 × 4 = 12, que se guarda en a.",
          "Se imprime 12 + 1 = 13.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "numerica",
          id: "intento-composicion",
          enunciado: "Predice qué número imprime este programa.",
          codigo: "def doble(x):\n    return x * 2\n\ndef suma_doble(a, b):\n    return doble(a) + doble(b)\n\nprint(suma_doble(3, 4))",
          respuesta: 14,
          erroresComunes: [
            { valor: 7, retro: "suma_doble aplica doble a cada argumento antes de sumar." },
            { valor: 10, retro: "Has duplicado solo uno de los dos argumentos." },
          ],
          explicacion: "doble(3) = 6 y doble(4) = 8; su suma es 14.",
        },
        pistas: [
          "Resuelve primero las llamadas de dentro.",
          "Dentro de suma_doble, a = 3 y b = 4. ¿Cuánto devuelve doble(3)? ¿Y doble(4)?",
          "doble(3) devuelve 6 y doble(4) devuelve 8. suma_doble devuelve la suma de ambos.",
        ],
        solucion: [
          "suma_doble(3, 4) asigna a = 3 y b = 4.",
          "doble(3) devuelve 6; doble(4) devuelve 8.",
          "suma_doble devuelve 6 + 8 = 14 y print lo muestra.",
        ],
      },
      ejercicios: [
        {
          tipo: "completar-codigo",
          id: "funcion-mayor-edad",
          enunciado: "Completa la función para que devuelva True si edad es 18 o más, y False en otro caso.",
          plantilla: "def es_mayor_de_edad(edad):\n    return ___",
          huecos: [
            {
              aceptadas: ["edad >= 18"],
              equivalencia: { edad: [0, 10, 17, 18, 19, 30, 80] },
              retro: "Con 18 años ya se cumple: el 18 tiene que dar True.",
            },
          ],
          explicacion: "Una comparación ya es un valor True o False, así que se puede devolver directamente: `return edad >= 18`.",
        },
        {
          tipo: "opcion-multiple",
          id: "print-frente-return",
          enunciado: "¿Qué muestra este programa?",
          codigo: "def f(x):\n    print(x + 1)\n\nr = f(2)\nprint(r)",
          opciones: [
            { id: "a", texto: "3 y después None" },
            { id: "b", texto: "3 y después 3", retro: "f imprime 3, pero no lo devuelve: sin return, devuelve None." },
            { id: "c", texto: "Solo 3", retro: "La última línea, print(r), también se ejecuta; r vale None." },
            { id: "d", texto: "Un error", retro: "Llamar a una función sin return es válido; simplemente devuelve None." },
          ],
          correcta: "a",
          explicacion: "Dentro de f, print muestra 3. Como f no tiene return, devuelve None, que es lo que se guarda en r y se imprime después.",
        },
        {
          tipo: "verdadero-falso",
          id: "return-termina",
          enunciado: "Dentro de una función, las instrucciones escritas después de un return que se ejecuta no se ejecutan.",
          esVerdadera: true,
          justificaciones: [
            { id: "j1", texto: "return termina la función en ese momento y devuelve el valor." },
            { id: "j2", texto: "return solo marca qué valor devolver; la función sigue hasta el final.", retro: "No: al ejecutarse return, la función termina en ese mismo instante." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Por eso return se usa a veces para salir pronto de una función.",
        },
        {
          tipo: "numerica",
          id: "argumentos-posicion",
          enunciado: "¿Qué imprime este programa?",
          codigo: "def resta(a, b):\n    return a - b\n\nprint(resta(2, 10))",
          respuesta: -8,
          erroresComunes: [{ valor: 8, retro: "Los argumentos se asignan por posición: a = 2 y b = 10, así que es 2 − 10." }],
          explicacion: "a = 2 y b = 10; 2 − 10 = −8.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "palabra-return",
          enunciado: "¿Qué palabra clave hace que una función entregue un valor a quien la llamó?",
          aceptadas: ["return"],
          erroresComunes: [{ respuesta: "print", retro: "print muestra en pantalla, pero no devuelve nada." }],
          explicacion: "return valor devuelve el valor y termina la función.",
        },
        {
          tipo: "opcion-multiple",
          id: "devuelve-none",
          enunciado: "¿Qué devuelve en Python una función que termina sin ejecutar ningún return?",
          opciones: [
            { id: "a", texto: "None" },
            { id: "b", texto: "0", retro: "0 es un número; la ausencia de valor en Python es None." },
            { id: "c", texto: "Un error", retro: "No es un error: devuelve None." },
          ],
          correcta: "a",
          explicacion: "None representa «sin valor».",
        },
        {
          tipo: "texto",
          id: "palabra-def",
          enunciado: "¿Con qué palabra clave se define una función en Python?",
          aceptadas: ["def"],
          explicacion: "def nombre(parámetros): seguido de un bloque sangrado.",
        },
      ],
      resumen: [
        "def define una función; se ejecuta al llamarla y los argumentos se asignan por posición.",
        "return entrega un valor y termina la función.",
        "print muestra, no devuelve. Sin return, la función devuelve None.",
      ],
    },
    {
      id: "lectura-codigo",
      titulo: "Leer código: trazar a mano",
      descripcion: "Entender un programa antes de ejecutarlo, también el que te propone una IA.",
      nivel: 3,
      minutos: 12,
      objetivos: [
        "Trazar un programa con una tabla de variables.",
        "Encontrar un error leyendo, sin ejecutar.",
      ],
      explicacion: [
        "Trazar (también se llama «prueba de escritorio») es seguir un programa línea a línea anotando en una tabla el valor de cada variable. En un bucle se añade una fila por vuelta.",
        "Antes de ejecutar, predice el resultado. Si la ejecución no coincide con tu predicción, has encontrado algo que no entendías: es la parte más valiosa del ejercicio.",
        "Esta habilidad es la que permite revisar código que no has escrito tú, incluido el que genera un asistente de IA. Que un fragmento funcione con un ejemplo no demuestra que sea correcto: hay que entender qué hace y probar los casos límite (vacío, cero, el primer y el último valor).",
      ],
      ejemplo: {
        enunciado: "Traza el programa y di qué imprime.",
        codigo: "x = 1\nfor i in range(3):\n    x = x * 2\nprint(x)",
        pasos: [
          "Antes del bucle: x = 1.",
          "Vuelta i = 0: x = 2. Vuelta i = 1: x = 4. Vuelta i = 2: x = 8.",
          "range(3) da 3 vueltas, así que se imprime 8.",
        ],
      },
      intento: {
        ejercicio: {
          tipo: "numerica",
          id: "intento-traza-condicional",
          enunciado: "Traza el programa y predice qué número imprime.",
          codigo: "cuenta = 0\nfor n in range(1, 7):\n    if n % 3 == 0:\n        cuenta = cuenta + n\nprint(cuenta)",
          respuesta: 9,
          erroresComunes: [
            { valor: 2, retro: "Estás contando cuántos múltiplos de 3 hay, pero el código suma n, no 1." },
            { valor: 3, retro: "range(1, 7) llega hasta 6, que también es múltiplo de 3." },
          ],
          explicacion: "n va de 1 a 6. Solo 3 y 6 cumplen n % 3 == 0, y se suman: 3 + 6 = 9.",
        },
        pistas: [
          "Escribe los valores de n y, al lado, si cumplen la condición.",
          "n toma los valores 1, 2, 3, 4, 5 y 6. ¿Cuáles tienen resto 0 al dividir entre 3?",
          "Cumplen 3 y 6. Fíjate en que se suma n, no 1.",
        ],
        solucion: [
          "n = 1, 2: no cumplen. n = 3: cuenta = 3.",
          "n = 4, 5: no cumplen. n = 6: cuenta = 3 + 6 = 9.",
          "Se imprime 9.",
        ],
      },
      ejercicios: [
        {
          tipo: "ordenar",
          id: "pasos-traza",
          enunciado: "Ordena los pasos de una traza a mano.",
          pasos: [
            { id: "p1", texto: "Dibujar una columna por cada variable." },
            { id: "p2", texto: "Anotar los valores iniciales." },
            { id: "p3", texto: "Ejecutar una línea y actualizar solo las variables que cambian." },
            { id: "p4", texto: "Repetir hasta el final y anotar lo que se imprime." },
          ],
          explicacion: "Primero se prepara la tabla, después se avanza línea a línea y al final se compara con la predicción.",
        },
        {
          tipo: "numerica",
          id: "traza-maximo",
          enunciado: "¿Qué imprime este programa?",
          codigo: "m = 0\nfor v in [4, 9, 2, 7]:\n    if v > m:\n        m = v\nprint(m)",
          respuesta: 9,
          erroresComunes: [
            { valor: 7, retro: "m guarda el mayor visto hasta ahora. Al llegar al 7, 7 > 9 es falso y m sigue en 9." },
            { valor: 4, retro: "m se actualiza cada vez que aparece un valor mayor, no solo la primera." },
          ],
          explicacion: "m pasa por 0 → 4 → 9 y ya no cambia: el programa calcula el máximo.",
        },
        {
          tipo: "opcion-multiple",
          id: "error-range",
          enunciado: "Este código debería sumar los números del 1 al 5 (resultado 15), pero imprime 10. ¿Cuál es el error?",
          codigo: "total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)",
          opciones: [
            { id: "a", texto: "range(1, 5) no incluye el 5; debería ser range(1, 6)." },
            { id: "b", texto: "total debería empezar en 1.", retro: "Daría 11, y además estaría sumando un 1 que no está en la lista." },
            { id: "c", texto: "Falta un return.", retro: "return solo tiene sentido dentro de una función; aquí basta print." },
          ],
          correcta: "a",
          explicacion: "Con range(1, 5) se suman 1 + 2 + 3 + 4 = 10. Es el error «por uno» (off-by-one), uno de los más frecuentes.",
        },
        {
          tipo: "completar-codigo",
          id: "contar-pares",
          enunciado: "Completa la condición para que el programa cuente cuántos números pares hay entre 0 y 9.",
          plantilla: "pares = 0\nfor n in range(10):\n    if ___:\n        pares = pares + 1\nprint(pares)",
          huecos: [
            {
              aceptadas: ["n % 2 == 0"],
              equivalencia: { n: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
              retro: "Un número es par si `n % 2` vale 0.",
            },
          ],
          explicacion: "Hay 5 pares: 0, 2, 4, 6 y 8.",
        },
      ],
      recuperacion: [
        {
          tipo: "texto",
          id: "nombre-traza",
          enunciado: "¿Cómo se llama la técnica de seguir un programa línea a línea anotando el valor de cada variable?",
          aceptadas: ["traza", "trazar", "traza a mano", "tabla de traza", "prueba de escritorio", "seguimiento"],
          explicacion: "Se llama trazar el programa o hacer una prueba de escritorio.",
        },
        {
          tipo: "verdadero-falso",
          id: "ia-un-ejemplo",
          enunciado: "Si un fragmento de código generado por una IA funciona con un ejemplo, ya sabemos que es correcto.",
          esVerdadera: false,
          justificaciones: [
            { id: "j1", texto: "Un ejemplo que funciona no prueba que funcione en todos los casos; hay que entenderlo y probar casos límite." },
            { id: "j2", texto: "Si funciona una vez, funciona siempre.", retro: "Muchos errores solo aparecen en casos límite, como una lista vacía o el último valor de un rango." },
          ],
          justificacionCorrecta: "j1",
          explicacion: "Un ejemplo puede mostrar un error, pero no puede demostrar que no los haya.",
        },
        {
          tipo: "opcion-multiple",
          id: "error-por-uno",
          enunciado: "¿Qué es un error «por uno» (off-by-one)?",
          opciones: [
            { id: "a", texto: "Hacer una vuelta de más o de menos, normalmente por confundir un límite incluido con uno excluido." },
            { id: "b", texto: "Un error en la primera línea del programa.", retro: "No tiene que ver con la posición del error, sino con los límites de un rango." },
            { id: "c", texto: "Un error que solo ocurre una vez.", retro: "Es un error sistemático en un límite: ocurre siempre que se usa ese rango." },
          ],
          correcta: "a",
          explicacion: "Por ejemplo, usar range(1, 5) cuando se quería llegar al 5.",
        },
      ],
      resumen: [
        "Trazar: una columna por variable, una fila por línea o por vuelta.",
        "Predice antes de ejecutar; la sorpresa señala lo que no entendías.",
        "Revisa los límites: muchos errores son «por uno».",
        "Un ejemplo que funciona no demuestra que el código sea correcto, tampoco si lo escribió una IA.",
      ],
    },
  ],
};

export default programacion;
