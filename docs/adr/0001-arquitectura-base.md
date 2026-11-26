# ADR-0001: Monolito modular local-first en Next.js, con features aisladas y núcleo de dominio puro

- **Estado:** propuesta
- **Fecha:** 2026-11-25
- **Decisores:** arquitecto (pendiente de aceptación por el responsable del producto)

## Contexto

"Gimnasio Mental" es una web app de entrenamiento cognitivo contra los efectos del uso pasivo de IA y del doomscrolling. Tiene cuatro módulos de prioridad alta (Patio de juegos, Lectura, Habilidades, Bienestar), uno de prioridad baja (Progreso) y dos para el futuro (Recompensas, Rankings).

Punto de partida: Next.js 16 (App Router, `cacheComponents` activado), React 19, TypeScript estricto y Tailwind 4. El scaffold solo tiene `src/app/layout.tsx` y `src/app/page.tsx` de ejemplo. No hay backend.

Qué pesa en la decisión:

- **Privacidad:** no habrá cuentas ni datos personales por ahora. Lo que se escribe en Bienestar (emociones, reflexiones) es sensible aunque se quede en el dispositivo.
- **Trabajo en paralelo:** varios desarrolladores o agentes van a construir los módulos a la vez sin pisarse.
- **Escalabilidad (requisito explícito):** tiene que poder añadirse un juego o un módulo sin tocar el núcleo. Más adelante llegarán backend, cuentas, rankings y recompensas sin reescribir nada.
- **Dependencias:** solo las justificadas. Nada para sonido ni animación.
- **Rigor:** la evidencia sobre transferencia del entrenamiento cognitivo es limitada. El diseño mide el rendimiento en la tarea, no promete efectos clínicos.

Supuestos (sin confirmar):

- S1. Al principio cada persona usa un solo dispositivo; perder datos al borrar el navegador es aceptable si se avisa.
- S2. Habrá menos de unos miles de sesiones por usuario y año; caben en localStorage (unos 5 MB).
- S3. El contenido (puzzles, textos, lecciones, meditaciones) lo escribe el equipo y se versiona en el repositorio. No hay contenido generado por usuarios.
- S4. Solo en español por ahora.

## Decisión

1. **Monolito modular en una sola app Next.js.** Cada módulo es una feature aislada en `src/features/<modulo>/` y tiene su ruta en `src/app/<modulo>/`. Sin microservicios, sin DDD formal y sin capas que solo deleguen.
2. **Núcleo de dominio puro en `src/core/`.** Solo TypeScript, sin React, Next ni ORM. Contiene los contratos compartidos (`types.ts`), la dificultad adaptativa, la repetición espaciada, la persistencia y el registro de módulos. Cada feature sigue la misma regla en su carpeta `domain/`.
3. **Local-first, detrás de un puerto.** La persistencia pasa por la interfaz asíncrona `ProgressStore`. El adaptador de hoy (`createLocalProgressStore`) usa localStorage con:
   - un sobre versionado `{ v, data }`;
   - migraciones paso a paso;
   - validación al leer;
   - try/catch en cada acceso;
   - comportamiento seguro en el servidor (SSR-safe).

   IndexedDB solo entrará cuando se acerque el límite de S2. Será otro adaptador del mismo puerto y no exigirá dependencias (sin `idb`). Un adaptador remoto (API y cuentas) también implementará `ProgressStore`, así que los consumidores no cambian.
4. **Contratos listos para sincronizar:**
   - ids estables (UUID para sesiones; `deckId:itemId` para tarjetas);
   - fechas ISO 8601 en UTC;
   - `updatedAt` en todo lo que se puede modificar;
   - `SessionResult` como evento inmutable con su propio `schemaVersion`;
   - `recordSession` idempotente por `id`.
5. **Registros para crecer sin tocar el núcleo.**
   - `src/core/modules-registry.ts` alimenta la navegación. Solo se añaden entradas.
   - Cada feature tiene su propio registro interno, por ejemplo `features/patio/registry.ts` con la lista de juegos. Añadir un juego solo toca la carpeta de la feature.
6. **Contenido separado del código.** Vive en `src/content/<modulo>/` como datos tipados (`ContentPack<T>`), cada paquete con `id` y `version`. Se carga con `import()` dinámico (`ContentLoader<T>`) para que cada paquete sea un chunk aparte.
7. **Code splitting por ruta.** El App Router ya separa por segmento. Dentro de cada ruta, los juegos pesados se cargan con `next/dynamic` o `import()`. La shell, la navegación y las páginas de presentación son Server Components estáticos. Lo que lee el almacenamiento local es un Client Component hoja (compatible con `cacheComponents`).
8. **Ajedrez sin `chess.js` en la fase 1.** Un puzzle táctico solo necesita:
   - leer el FEN;
   - aplicar jugadas UCI, incluidos enroque, captura al paso y promoción;
   - comparar la jugada con la línea de solución y las alternativas aceptadas que vienen en los datos.

   Son unas 150 líneas de dominio puro y testeable en `features/patio/games/ajedrez/domain/`. Se adoptará `chess.js` (licencia BSD-2, sin dependencias transitivas) si aparece alguno de estos requisitos: marcar las jugadas legales, juego libre contra un motor, detectar el mate para aceptar soluciones no previstas, o importar puzzles masivos sin revisar. En ese caso se cargará solo en la ruta de ajedrez.
9. **Ninguna dependencia nueva.** Animaciones con CSS y Tailwind, respetando `prefers-reduced-motion`. Sonido opcional con Web Audio nativo, desactivado por defecto. Validación con type guards propios mientras el contenido sea interno. Para las pruebas unitarias del dominio hará falta un runner (por ejemplo Vitest), pero esa decisión va en un ADR aparte y requiere autorización.

## Alternativas consideradas

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| **A. Monolito modular local-first (elegida)** | Sin servidor que operar ni datos personales que proteger. Funciona sin conexión tras la primera carga. Límites claros para trabajar en paralelo. El puerto permite añadir backend después. | Los datos se pierden si se borra el navegador. No hay sincronización entre dispositivos. Varias pestañas abiertas: gana la última escritura. |
| B. Backend y cuentas desde el inicio (Next Route Handlers + BD) | Sincronización y rankings inmediatos. | Supone autenticación, RGPD, tratar datos sensibles de Bienestar, operar infraestructura y hacer una auditoría de seguridad antes de lanzar. Nada de eso aporta al valor principal, que es entrenar. |
| C. Estructura por tipo técnico (`components/`, `hooks/`, `lib/` globales) | Es lo habitual en Next. | Los módulos se mezclan, hay conflictos al trabajar en paralelo y no hay límites que se puedan comprobar. |
| D. Monorepo con paquetes por módulo | Límites fuertes impuestos por el gestor de paquetes. | Herramientas y configuración desproporcionadas para un equipo pequeño y una sola app. |
| E. `chess.js` desde el inicio | Reglas completas y probadas. | Ninguno de los requisitos actuales lo necesita. Mientras no se pida juego libre, es una dependencia sin uso. |

## Consecuencias

- **Positivas:**
  - Cero infraestructura.
  - Privacidad por diseño.
  - Cada módulo se desarrolla y se revisa por separado.
  - El núcleo se puede probar sin navegador.
  - Añadir backend consiste en escribir un adaptador nuevo de `ProgressStore` y un proceso de sincronización.
- **Negativas / deuda aceptada:**
  - No hay copia de seguridad. Para mitigarlo, el módulo Progreso tendrá exportar/importar JSON.
  - Conflictos entre pestañas.
  - Las sesiones se limitan a 1000 por usuario; las antiguas se descartan hasta que exista IndexedDB o backend.
  - La comprobación de límites entre módulos depende de una regla de ESLint (`no-restricted-imports`) que todavía hay que configurar.
- **Cómo se verificará que la decisión funciona:**
  - Pruebas unitarias del núcleo: escalera, Leitner y migraciones del almacenamiento.
  - Lint con reglas de límites sin infracciones.
  - `next build` muestra un chunk separado por ruta y por paquete de contenido.
  - Añadir un juego de prueba no modifica nada fuera de `features/patio` ni `content/patio`.

## Revisión

Reconsiderar cuando ocurra alguna de estas cosas:

- se pidan sincronización entre dispositivos o cuentas (pasar a la fase 1 descrita en `docs/ARQUITECTURA.md`);
- el estado guardado supere unos 2 MB;
- aparezca contenido creado por usuarios;
- haga falta juego libre de ajedrez.

Como máximo, revisar en 2027-05.

---
Ubicación: `docs/adr/0001-arquitectura-base.md`. Los ADR no se editan una vez aceptados; se sustituyen con uno nuevo.
