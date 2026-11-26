# Gimnasio Mental

Web para entrenar la atención, la memoria, el razonamiento y la lectura profunda, pensada como contrapeso al
uso intensivo de feeds y asistentes. Todo funciona en tu navegador: **sin cuentas, sin servidor y sin
seguimiento**. Tu progreso se guarda solo en este dispositivo.

> **Lo que no es.** Gimnasio Mental no promete subir tu CI, prevenir la demencia ni curar nada, y no
> sustituye a un profesional. Entrena tareas concretas; la mejora que mide la investigación suele quedarse en
> la tarea que se practica, por eso se propone alternar dominios.

## Qué incluye

| Módulo | Contenido |
|---|---|
| **Patio de juegos** | Stroop, go/no-go, búsqueda visual, n-back, secuencias, parejas, ajedrez táctico, sudoku, matrices de patrones y deducción lógica. Dificultad adaptativa (escalera 2-arriba/1-abajo). |
| **Lectura** | Textos breves para leer sin distracciones, autoexplicación, preguntas de comprensión y repaso espaciado de las ideas clave. |
| **Habilidades** | Rutas de programación, matemáticas, filosofía, artes y pensamiento crítico con ciclo explicación → intento → ejercicios → recuperación, y repaso intercalado. |
| **Bienestar** | Respiración, atención plena, registro emocional e higiene digital, con recursos de ayuda. |
| **Progreso** | Historial de sesiones, con exportación e importación de una copia en JSON. |

Sin presión obligatoria: los juegos con tiempo de respuesta limitado ofrecen una opción de tiempo ampliado.

## Stack

Next.js 16 (App Router, TypeScript), React 19 y Tailwind CSS 4. Sin dependencias de ejecución añadidas al
scaffold. Persistencia en `localStorage` con esquema versionado y migraciones.

## Desarrollo

Requiere Node.js 20 o superior.

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
node --test "src/**/*.test.ts"   # pruebas de dominio (node:test)
npm run build
```

Esta versión de Next tiene cambios incompatibles con versiones anteriores: consulta `AGENTS.md` y
`node_modules/next/dist/docs/` antes de modificar rutas o configuración.

## Estructura

```
src/core/        Dominio compartido: tipos, dificultad adaptativa, repetición espaciada (Leitner), almacenamiento
src/features/    Un módulo por carpeta (patio, lectura, habilidades, bienestar, progreso)
src/content/     Contenido como datos tipados (textos, lecciones, puzzles), con carga diferida
src/components/  Interfaz compartida y accesible
docs/            Arquitectura (ARQUITECTURA.md), decisiones (adr/) y estado del proyecto (ESTADO.md)
```

El dominio es TypeScript puro, independiente de React y de Next, y está cubierto por pruebas.

## Accesibilidad y privacidad

- Diseñado para móvil primero y WCAG 2.2 AA: HTML semántico, teclado, foco visible, contraste, movimiento reducido.
- Sin cookies, sin analítica y sin peticiones a terceros. Los datos no salen del navegador.
- El estado de la revisión de accesibilidad, con lo verificado y lo que no, está en [`docs/ESTADO.md`](docs/ESTADO.md).

## Publicación en GitHub Pages

La versión pública es una exportación estática (ver [ADR-0003](docs/adr/0003-publicacion-github-pages.md)).
Para generarla en local:

```bash
GITHUB_PAGES=true PAGES_REPO=gimnasio-mental npm run build   # salida en out/
```

Un workflow de GitHub Actions ejecuta tipos, lint y pruebas, y solo si pasan publica el sitio.

## Estado

Proyecto en desarrollo. Consulta [`docs/ESTADO.md`](docs/ESTADO.md) para ver qué está hecho, qué se ha
verificado y qué falta.
