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

- Patio de lógica terminado: `SudokuGame`, `PatronesGame` y `DeduccionGame` escritos, con su `index.ts` y registrados en `registry-logica.ts`. Verificados en `next dev`: sudoku (teclado, notas, comprobar, conflictos, resolución completa y guardado), patrones (12 matrices, figuras SVG, explicación de reglas) y deducción (3 acertijos, resolución completa).
- Pasada de móvil y accesibilidad (sesión 2, `next dev`, iframes de 390 px + comprobaciones propias; **no se ejecutó axe-core**: el sistema de permisos bloqueó cargar un script externo y se hizo sin él). Revisado: portada, Patio y sus 10 juegos, Lectura (biblioteca, lector, ajustes, repaso), Habilidades (catálogo, temario, lección completa con los 6 tipos de ejercicio, repaso), Bienestar (respiración), Recompensas, Rankings y Progreso.
  - Sin desbordes horizontales en ninguna pantalla; sin objetivos por debajo de 24 px (WCAG 2.5.8); jerarquía de títulos y hitos correctos; todos los controles con nombre y etiqueta.
  - Contraste calculado sobre los tokens en claro y oscuro: texto ≥4,5:1, bordes de control y foco ≥3:1, sin incumplimientos. Foco con `outline-offset`, enlace de salto, `prefers-reduced-motion`, menú móvil y ajustes del lector con Escape y retorno del foco.
  - Corregido: botón `sm` a 44 px en móvil; enlaces de título de Lectura/Habilidades a 44 px; temario con h2 en vez de h3 (salto h1→h3); huecos de código a 44 px; tablero de sudoku con `role="row"` (ARIA exige filas dentro de `grid`) y notas más legibles.
  - Se mantienen por debajo de 44 px (pero ≥24): las casillas del sudoku (37 px) y del ajedrez (~43 px), inevitables con 8–9 columnas en 390 px, y los enlaces dentro de párrafos (excepción de 2.5.8).
  - **No verificado**: lector de pantalla real (NVDA/VoiceOver/TalkBack), navegación solo con teclado en todos los flujos, emulación táctil real, zoom al 200 %/400 % y texto ampliado, y axe-core. No hay selector manual de tema: solo sigue `prefers-color-scheme`.
- Verificados en navegador (sesión 2, `next dev`, sin errores en consola): Stroop (60 ensayos, adaptativo hasta nivel 10, resumen), n-back (bloque completo, pausa y abandono guardado como «abandonada»), go/no-go (100 letras, frenadas 30/30), búsqueda visual (instrucciones, tiempos agotados y resumen), secuencias (acierto y fallo con la secuencia correcta mostrada), pares (5 rondas, 19 parejas) y ajedrez (pista, mostrar jugada, selección, jaque mate detectado, cierre).
- **No verificado**: la precisión de búsqueda visual con respuestas correctas sostenidas (mi bot de prueba no la midió bien; solo se vio un acierto y el resto de pantallas con tiempo agotado); móvil 390 px, teclado completo y lector de pantalla en todos los juegos. Las respuestas anteriores a que aparezca el estímulo se ignoran en búsqueda visual (comportamiento a revisar si es intencionado).

## Resultado por módulo (cierre de la sesión 1)
Verificado al cerrar: `npx tsc --noEmit` OK, `npm run lint` OK, `node --test` sobre todos los `*.test.ts`: 282/282. **`npm run build` NO se ha ejecutado tras el cierre** (hacerlo primero). Los agentes de Patio, Lectura y Habilidades se detuvieron antes de terminar por límite de sesión.

| Módulo | Estado | Qué falta |
|---|---|---|
| Shell, UI base, Home, Progreso, Recompensas, Rankings | Hecho (verificado por su agente en `next dev`) | Verlo con datos reales, teclado y lector de pantalla, 390 px |
| Bienestar (`/bienestar`) | Hecho y verificado en navegador por su agente | Registrar sesión "abandonada" al salir por enlace del navegador |
| Patio: atención y memoria | Los 6 juegos verificados en navegador en la sesión 2 | Accesibilidad, móvil y modo sin límite de tiempo |
| Patio: lógica | Catálogo, ejecutor, ajedrez, sudoku, patrones y deducción (los tres últimos en la sesión 2) | Verificar el ajedrez en navegador |
| Lectura | **Hecho en la sesión 2** (ver arriba) | Revisión de accesibilidad y móvil |
| Habilidades | **Hecho en la sesión 2** (ver arriba) | Revisión de accesibilidad y móvil |

Los enlaces de navegación a `/lectura` y `/habilidades` pueden dar 404 hasta que se creen sus rutas. Valorar marcarlos como `proximamente` en `src/core/modules-registry.ts` mientras tanto.

## Pendiente para la siguiente sesión (orden recomendado)
0. Prueba con lector de pantalla real y teclado completo; axe-core (requiere autorización para añadirlo como devDependency o cargarlo); revisar el modo sin límite de tiempo en cada juego.
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
