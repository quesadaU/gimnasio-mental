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

## Resultado por módulo
(Se rellena al recibir los informes de los agentes; ver abajo.)

## Pendiente para la siguiente sesión (orden recomendado)
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
