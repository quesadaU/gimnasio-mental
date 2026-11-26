# Estado del proyecto y traspaso

Última actualización: 2026-11-25 (sesión 1). Documento para retomar el trabajo en la siguiente sesión.

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

## Resultado por módulo (cierre de la sesión 1)
Verificado al cerrar: `npx tsc --noEmit` OK, `npm run lint` OK, `node --test` sobre todos los `*.test.ts`: 282/282. **`npm run build` NO se ha ejecutado tras el cierre** (hacerlo primero). Los agentes de Patio, Lectura y Habilidades se detuvieron antes de terminar por límite de sesión.

| Módulo | Estado | Qué falta |
|---|---|---|
| Shell, UI base, Home, Progreso, Recompensas, Rankings | Hecho (verificado por su agente en `next dev`) | Verlo con datos reales, teclado y lector de pantalla, 390 px |
| Bienestar (`/bienestar`) | Hecho y verificado en navegador por su agente | Registrar sesión "abandonada" al salir por enlace del navegador |
| Patio: atención y memoria | Escritos los 6 juegos (Stroop, go/no-go, búsqueda visual, n-back, secuencias, pares) y su registro; su agente fue detenido al empezar la verificación | Abrir cada juego en el navegador y comprobar el recorrido completo, accesibilidad y el modo sin límite de tiempo |
| Patio: lógica | Catálogo `/patio`, ejecutor `/patio/[juego]`, ajedrez con validador propio y banco de puzzles (agente detenido sin verificar el juego en navegador). Sudoku, patrones y deducción: solo dominio y pruebas | Escribir `SudokuGame.tsx`, `PatronesGame.tsx`, `DeduccionGame.tsx`, renombrar `index.ts.pendiente` a `index.ts` en cada carpeta y registrarlos en `registry-logica.ts` |
| Lectura | Dominio, pruebas y 12 textos en `src/content/lectura`; algunos componentes (preferencias del lector) | **Faltan** rutas `src/app/lectura/**`, biblioteca, lector, cuestionario, repaso, e `index.ts` de la feature |
| Habilidades | Dominio, pruebas y contenido de 5 rutas en `src/content/habilidades` | **Faltan** rutas `src/app/habilidades/**`, componentes de lección y repaso, `index.ts` y registro |

Los enlaces de navegación a `/lectura` y `/habilidades` pueden dar 404 hasta que se creen sus rutas. Valorar marcarlos como `proximamente` en `src/core/modules-registry.ts` mientras tanto.

## Pendiente para la siguiente sesión (orden recomendado)
0. Terminar lo marcado como pendiente en la tabla anterior (prioridad: rutas de Lectura y Habilidades, componentes de sudoku/patrones/deducción).
1. Ejecutar `npm run build`, `npx tsc --noEmit`, `npm run lint` y todas las pruebas (`node --test "src/**/*.test.ts"`) y corregir lo que falle.
2. Recorrer cada pantalla en el navegador (móvil y escritorio): estados de carga, vacío y error.
3. QA (`qa-specialist`): pruebas del núcleo (escalera, Leitner, ramas de `readVersioned`) y regresión.
4. Accesibilidad (`accessibility`, WCAG 2.2 AA) y revisión UX (`ux-reviewer`), incluida la honestidad del texto (sin promesas clínicas).
5. Seguridad (`security-audit`, `security-specialist`): XSS, importación de JSON, datos locales, cabeceras.
6. ADR-0002 sobre el runner de pruebas (requiere autorización para instalar dependencias).
7. Inicializar git y primer commit (el directorio aún no es repositorio). Sin trailer de coautoría de Claude en commits (preferencia del usuario).
8. Después: Progreso completo, exportar/importar, IndexedDB si hace falta, Recompensas y Rankings (fase 2, ver sección 9 de ARQUITECTURA.md).

## Decisiones abiertas
- Ajedrez con validador propio frente a `chess.js` (criterio de adopción en el ADR).
- Runner de pruebas (Vitest o similar) frente a `node:test`.
- Despliegue y hosting: no decidido. No desplegar sin auditoría (`production-readiness`).
