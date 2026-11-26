# ADR-0003: Publicación estática en GitHub Pages

Estado: propuesta (pendiente de autorización para publicar). Fecha: 2026-11-26.

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
- Pages en repositorios privados requiere un plan de pago de GitHub; con repositorio público es gratuito. Publicar hace público el código si el repositorio se hace público.
- Antes de publicar: auditoría (`security-audit`, `production-readiness`) y revisión de accesibilidad.
