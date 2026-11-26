# ADR-0003: Publicación estática en GitHub Pages

Estado: aceptada y publicada el 2026-11-26 en https://quesadau.github.io/gimnasio-mental/. Fecha: 2026-11-26.

## Contexto
La aplicación es local-first: no tiene backend, cuentas ni APIs; todo el progreso vive en el navegador. Se quiere una URL pública sin coste de servidor.

## Decisión
Publicar una exportación estática (`output: "export"`) en GitHub Pages con un workflow de Actions.

- La configuración estática solo se activa con `GITHUB_PAGES=true`. El desarrollo y `npm run build` normales no cambian.
- Pages sirve el proyecto bajo `/<repo>/`, por eso `basePath` y `assetPrefix` se derivan de `PAGES_REPO`.
- `output: "export"` no es compatible con Cache Components (PPR) en Next 16.4: `Invariant: PPR cannot be enabled in export mode`. En el build estático se desactivan `cacheComponents` y `partialPrefetching`. La aplicación no depende de ellos (todo son páginas estáticas con `generateStaticParams`).
- El workflow ejecuta tipos, lint y pruebas antes de construir; si algo falla, no se publica.

## Consecuencias
- Sin cabeceras HTTP propias: Pages no permite configurar CSP, HSTS ni `X-Content-Type-Options`. Mitigación posible: `<meta http-equiv="Content-Security-Policy">`; evaluarlo en la auditoría de seguridad.
- Cada navegador y cada dominio guardan su propio progreso (`localStorage`): cambiar de URL o de dispositivo no lo conserva.
- El avance, los reintentos y el repaso no necesitan servidor, así que no se pierde funcionalidad.
- Pages en repositorios privados requiere un plan de pago de GitHub; se hizo público el repositorio (2026-11-26), así que el código y el historial son visibles. No tiene licencia: todos los derechos reservados hasta que se decida una.
- `next typegen` debe ejecutarse antes de `tsc` en CI: un checkout limpio no tiene los tipos globales que genera Next (`LayoutProps`). Detectado en el primer despliegue.
- Antes de publicar: auditoría (`security-audit`, `production-readiness`) y revisión de accesibilidad.
