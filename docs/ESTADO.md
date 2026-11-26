# Estado del proyecto y traspaso

Última actualización: 2026-11-25 (sesión 2). Documento para retomar el trabajo en la siguiente sesión.

## Qué es
Gimnasio Mental: web para entrenar habilidades cognitivas (atención, memoria, lógica, lectura profunda, aprendizaje de habilidades, bienestar) frente al deterioro por abuso de IA y doomscrolling. Local-first, sin backend ni cuentas. Stack: Next.js 16, React 19, Tailwind 4, TypeScript. Sin dependencias añadidas al scaffold.

## Leer primero
1. `AGENTS.md` (esta versión de Next tiene cambios incompatibles; consultar `node_modules/next/dist/docs/`).
2. `docs/adr/0001-arquitectura-base.md` y `docs/ARQUITECTURA.md` (secciones 3, 7 y 8 son vinculantes).

## Hecho en la sesión 1
- Arquitectura y núcleo `src/core` (tipos, escalera adaptativa, Leitner, almacenamiento versionado, registro de módulos). `tsc` y `lint` verificados.
- Contrato de ejercicio `src/components/exercise/contract.ts`, proveedor del store, registros del Patio (`registry.ts` compone `registry-atencion-memoria.ts` y `registry-logica.ts`).
- `allowImportingTsExtensions` activo en `tsconfig.json`: las pruebas de dominio usan `node:test` (`node --test archivo.test.ts`, imports relativos con `.ts`). No hay runner instalado.
- Seis agentes trabajaron en paralelo (ver "Resultado por módulo").

## Sesión 2
- `npm run build` ahora pasa (faltaba `"use client"` en los 6 juegos de atención y memoria).
- Lectura terminada: `src/app/lectura/**` (biblioteca, `[texto]`, `repaso`) y componentes `library`, `reading-session`, `review-session`. Verificado en `next dev`: lectura, autoexplicación, preguntas, guardado, estado "Leído", repaso con reintento y Leitner. **No verificado**: móvil 390 px, teclado y lector de pantalla.
- Habilidades terminado: `src/app/habilidades/**` (catálogo, temario de ruta, lección, repaso intercalado) y componentes `ejercicio-card` (los 6 tipos), `leccion-sesion`, `repaso-sesion`, `catalogo`, `temario`. Verificado en `next dev` con la lección «Variables y asignación»: fases, pistas, corrección, reintentos de recuperación, guardado, repaso entre rutas y cajas Leitner. Módulo activo en `modules-registry.ts`.
- **No verificado**: móvil 390 px, teclado y lector de pantalla; ejercicios de tipo `ordenar` y `completar-codigo` con respuesta correcta (se probaron solo con respuesta errónea, la corrección está cubierta por pruebas de dominio); el resto de lecciones de las 5 rutas.
- Aviso de desarrollo de Next (`instant-shell-url-data`): las páginas dinámicas (`/habilidades/[ruta]/[leccion]` y el mismo patrón en Patio, Lectura y Bienestar) leen `params` fuera de `<Suspense>`. No bloquea el build; pulir envolviendo el contenido en Suspense o con `export const instant = false`.
- Si se sale de un repaso a medias, no se guardan las tarjetas (se guardan al final). Valorar guardar tarjeta a tarjeta como en Lectura.

## Resultado por módulo (cierre de la sesión 1)
Verificado al cerrar: `npx tsc --noEmit` OK, `npm run lint` OK, `node --test` sobre todos los `*.test.ts`: 282/282. **`npm run build` NO se ha ejecutado tras el cierre** (hacerlo primero). Los agentes de Patio, Lectura y Habilidades se detuvieron antes de terminar por límite de sesión.

| Módulo | Estado | Qué falta |
|---|---|---|
| Shell, UI base, Home, Progreso, Recompensas, Rankings | Hecho (verificado por su agente en `next dev`) | Verlo con datos reales, teclado y lector de pantalla, 390 px |
| Bienestar (`/bienestar`) | Hecho y verificado en navegador por su agente | Registrar sesión "abandonada" al salir por enlace del navegador |
| Patio: atención y memoria | Escritos los 6 juegos (Stroop, go/no-go, búsqueda visual, n-back, secuencias, pares) y su registro; su agente fue detenido al empezar la verificación | Abrir cada juego en el navegador y comprobar el recorrido completo, accesibilidad y el modo sin límite de tiempo |
| Patio: lógica | Catálogo `/patio`, ejecutor `/patio/[juego]`, ajedrez con validador propio y banco de puzzles (agente detenido sin verificar el juego en navegador). Sudoku, patrones y deducción: solo dominio y pruebas | Escribir `SudokuGame.tsx`, `PatronesGame.tsx`, `DeduccionGame.tsx`, renombrar `index.ts.pendiente` a `index.ts` en cada carpeta y registrarlos en `registry-logica.ts` |
| Lectura | **Hecho en la sesión 2** (ver arriba) | Revisión de accesibilidad y móvil |
| Habilidades | **Hecho en la sesión 2** (ver arriba) | Revisión de accesibilidad y móvil |

Los enlaces de navegación a `/lectura` y `/habilidades` pueden dar 404 hasta que se creen sus rutas. Valorar marcarlos como `proximamente` en `src/core/modules-registry.ts` mientras tanto.

## Pendiente para la siguiente sesión (orden recomendado)
0. Terminar lo pendiente del Patio (componentes de sudoku/patrones/deducción) y verificar en navegador los juegos de atención y memoria.
1. Ejecutar `npm run build`, `npx tsc --noEmit`, `npm run lint` y todas las pruebas (`node --test "src/**/*.test.ts"`) y corregir lo que falle.
2. Recorrer cada pantalla en el navegador (móvil y escritorio): estados de carga, vacío y error.
3. QA (`qa-specialist`): pruebas del núcleo (escalera, Leitner, ramas de `readVersioned`) y regresión.
4. Accesibilidad (`accessibility`, WCAG 2.2 AA) y revisión UX (`ux-reviewer`), incluida la honestidad del texto (sin promesas clínicas).
5. Seguridad (`security-audit`, `security-specialist`): XSS, importación de JSON, datos locales, cabeceras.
6. ADR-0002 sobre el runner de pruebas (requiere autorización para instalar dependencias).
7. Git ya está inicializado y el remoto es `origin` (privado, `quesadaU/gimnasio-mental`). Commits sin trailer de coautoría de Claude (preferencia del usuario).
8. Después: Progreso completo, exportar/importar, IndexedDB si hace falta, Recompensas y Rankings (fase 2, ver sección 9 de ARQUITECTURA.md).

## Decisiones abiertas
- Ajedrez con validador propio frente a `chess.js` (criterio de adopción en el ADR).
- Runner de pruebas (Vitest o similar) frente a `node:test`.
- Despliegue y hosting: no decidido. No desplegar sin auditoría (`production-readiness`).
