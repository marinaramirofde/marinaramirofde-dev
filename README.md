# Marina Ramiro Portfolio

Portfolio profesional bilingue de Marina Ramiro, creado con Astro, TypeScript y Three.js.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Personalizacion

- `src/config/portfolio.config.ts`: identidad, dominio, secciones, enlaces, formulario, intro XR.
- `src/i18n/es.ts` y `src/i18n/en.ts`: textos centralizados.
- `src/data/*.ts`: servicios, skills, redes y galeria.
- `src/content/*`: contenido ampliable para proyectos, investigacion, eventos y charlas.

Los enlaces reales de redes, CV, comunidad y formulario estan preparados como campos vacios para completarlos cuando esten disponibles.

## GitHub Pages

El workflow de `.github/workflows/deploy.yml` genera el sitio con Astro y lo publica en GitHub Pages.

Si el repositorio usa una ruta tipo `usuario.github.io/repositorio`, define `BASE_PATH=/repositorio` en el workflow o en las variables del entorno.
