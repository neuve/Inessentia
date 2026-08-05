# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Bilingual (ES/EN) therapy website for Patricio Ruiz Abrín at inessentia.mx. Built with Astro v7, deployed to GitHub Pages.

## Commands

```bash
npm run dev      # Start dev server (localhost:4321)
npm run build    # Build static site to dist/
npm run preview  # Preview built site locally
```

## Architecture

- **i18n**: Both languages use explicit URL prefixes (`/es/`, `/en/`). Configured in `astro.config.mjs` with `prefixDefaultLocale: true`.
- **Translations**: UI strings in `src/i18n/es.json` and `en.json`. Helper `t(locale)` in `src/i18n/utils.ts`.
- **Pages**: Each locale has its own `.astro` files under `src/pages/es/` and `src/pages/en/`. They share layouts and components but have locale-specific content.
- **Layouts**: `Base.astro` handles head, fonts, GA, hreflang, OG, nav, footer. `BlogPost.astro` extends Base for blog posts with Disqus.
- **Components** (`src/components/`): `SiteHeader` (hero estándar, variantes `cinema`/`panel`), `Navbar` + `MobileMenu` + `MenuOverlay`, `Footer`, `StatsBand` (cifras con conteo animado), `PermanenceCurve`, `TestimonialCarousel`, `BlogCard`, `Img` (responsive, vía `image-manifest.json`), `VideoEmbed`, `ParallaxImages`, `RevealOnScroll`, `DisqusComments`, `CookieConsent` (montaje pausado; GA carga desde `Base.astro`).
- **Styles**: `src/styles/global.css` is the **single source of truth** for the design system — un `:root` de tokens (marca, texto/grises, bordes, gradientes, spacing, radios, sombras, type-scale por roles), la **capa de tema**, la **capa de lienzo/zonas** y las clases compartidas. Always consume tokens/classes instead of hardcoding hex/px inline. The React package `inessentia-design-kit` (sibling repo) is **archived/divergent — do not use it as a reference** (it drifted to Zilla Slab; the site uses Bitter).
- **Blog posts**: Static `.astro` pages (not content collections) using `BlogPost.astro` layout.
- **No JS framework**: Pure Astro components with vanilla JS via `<script is:inline>` for carousel, mobile menu, scroll effects, and podcast form.

## Key Patterns

- When adding a page, create it in both `/es/` and `/en/` directories.
- Internal links must use locale-prefixed paths: `/es/terapia/individual/`, `/en/therapy/individual/`.
- Blog post Disqus identifiers use the OLD URL paths (e.g., `/blog-que-esperar-de-la-terapia.html`) to preserve comment threads.
- Images live in `public/uploads/` and are referenced as `/uploads/filename.webp`.
- The `data-reveal` attribute triggers scroll-based reveal animations via `RevealOnScroll.astro`.

## Design Tokens

Full set defined in `src/styles/global.css` `:root`. Consume these — never hardcode the literal values inline.

```
Brand (constantes, NO flipan con el tema):
         --purple #46276E  --purple-d #3C1F5E  --wine #8E2B5D
         --cream #EAE5D9  --cream-2* #F4F0E6  --sand #C2B07E  --sand-d #A8945C
         --ink #262321  --warm #FCFBF6        (*--cream-2 sí flipa: es el fondo de .section--cream)
Semánticos (los redefine la capa de tema — ver abajo):
Text:    --text  --text-soft  --text-muted  --text-faint
Fondo:   --bg  --surface  --heading  --border-card  --border-hair
Acento:  --accent (=wine)  --gold (sand en oscuro, wine en claro)
On dark: --on-dark  --on-dark-soft  --on-dark-faint
Lienzo:  --page-grad (gradiente continuo del body)  --canvas-top #26143C (arranque unificado)
         --veil-purple "38,20,60" (= --canvas-top en triplete) → rgba(var(--veil-purple),α) en velos de hero
         --dawn-at (punto del recorrido en que la barra "amanece"; lo lee Navbar.astro)
Zonas:   --on-canvas  --on-canvas-soft  --on-canvas-faint  --heading-canvas  --accent-canvas
         --field-bg  --field-bg-focus  --field-border
Gradientes: --grad-brand (100deg marca)  --grad-rail (riel del panel)
         --grad-btn-gold (.btn--gold)  --grad-disc (disco de ícono; independiente del tema)
Layout:  --container-w clamp(1040px,86vw,1600px)   ← tope de ancho del contenido
         --container-pad-w = --container-w + 2×--gutter  (ver "Márgenes" abajo)
         --gutter 32px  ← ÚNICO gutter lateral del sitio  --section-pad clamp(64px,9vw,120px)
         --nav-h 84px  (altura de la barra; también scroll-padding-top de html)
Spacing: --sp-1..5 (4→20)   ← sp-6/8/10/12 se retiraron por falta de uso
Radii:   --r-card 20  --r-panel 18  --r-pill 999  --r-field 10
Shadows: --sh-card  --sh-btn
Type:    --ff-head 'Bitter',serif  --ff-body 'Mulish',sans-serif
         --fs-display / --fs-h1 / --fs-h2 (=.heading-section) / --fs-h3 / --fs-h4
         --fs-body  --fs-small  --lh-tight/head/body
Breakpoints (convention): --bp-sm 560  --bp-md 820  --bp-lg 1024
```

## Tema: oscuro fijo

El sitio es **oscuro fijo**. `Base.astro` fija `data-theme="dark"` en el `<head>` (sin
consultar `prefers-color-scheme` ni preferencia guardada) y `:root` declara
`color-scheme: dark` para alinear los controles nativos. La capa
`:root[data-theme="light"]` de `global.css` se conserva **intacta pero inerte**: es lo
que permitiría reactivar el modo claro revirtiendo solo ese bloque del `<head>`, el
script del toggle y los botones de los menús. **Al tocar un token semántico, actualiza
las DOS capas** — si no, el modo claro queda roto en silencio.

## El lienzo continuo y sus zonas

El fondo NO se corta por secciones: el `body` pinta `--page-grad`, un gradiente único
que recorre toda la página de **noche a amanecer** (morado `--canvas-top` → índigo →
vino → arena → crema al 100%, para que el cierre de página quede legible). Por eso
`.section--cream` y `.section--purple` son **transparentes**: flotan sobre el lienzo.

Consecuencia práctica: **el color de texto ya no puede ser fijo**
(`var(--wine)`, `var(--purple)`, `var(--sand)` o hex sueltos desaparecen en el punto
del viaje donde coinciden con el fondo). Un bloque declara en qué tramo vive y consume
los tokens de lienzo:

- `.zone-dark` — tramo oscuro (arranque y medio de la página).
- `.zone-light` — tramo claro de cierre (CTA final, footer).
- Islas con fondo propio y fijo: `.on-dark` / `.on-light` (una tarjeta crema dentro de
  una página oscura, o una franja oscura sobre el tramo claro). Se declaran **después**
  de las zonas para ganar por orden, así que una isla dentro de una zona contraria
  conserva su propio tratamiento.

Dentro de cualquiera de ellas usa `--on-canvas` / `--on-canvas-soft` /
`--on-canvas-faint` / `--heading-canvas` / `--accent-canvas`, y en campos de formulario
`--field-bg` / `--field-bg-focus` / `--field-border`.

Los heroes oscuros del tope suben bajo la barra sticky con `margin-top: -var(--nav-h)`
vía `.site-header` o el atributo `[data-nav-overlay]`; la barra "amanece" (velo crema +
contenido oscuro) al pasar `--dawn-at`.

## Márgenes: dos patrones, un solo borde

Todo el contenido del sitio debe resolver al MISMO borde izquierdo. Hay dos estructuras
válidas y **cada una usa un token distinto** — confundirlas es el bug que ya se coló dos veces:

- **Anidado** — `<section class="section">` (aporta el padding) `> <div class="container">`
  (aporta el tope). El `.container` usa `--container-w`.
- **Una sola caja** — `max-width` y `padding` lateral en el MISMO elemento. Aquí el padding
  come por dentro, así que hay que usar **`--container-pad-w`**; con `--container-w` el
  contenido queda un gutter más adentro. Referencia viva: `.navbar__inner` en `Navbar.astro`.

Exentos por legibilidad (conservan su tope angosto): `.container--blog` (820) y
`.container--read` (760), usados en blog, términos y privacidad.

## Clases compartidas

Layout: `.section`(+`--cream`/`--purple`, ambas transparentes sobre el lienzo),
`.container`(+`--narrow`/`--blog`/`--read`), `.section-header`, `.three-two-grid`.
Contexto: `.zone-dark` / `.zone-light` / `.on-dark` / `.on-light`.
Tipografía: `.heading-section`(+`--on-dark`), `.label-section`(+`--on-dark`/`--plain`;
Title Case en vino con raya dorada, **nunca all-caps**), `.body-text`(+`--on-dark`),
`.page-header--soft` (páginas legales/hard-data, no es el hero grande), `.blog-content *`.
Enlaces: `.link-underline` (enlace suelto, 15px fijo) · `.link-inline` (incrustado en un
párrafo, hereda tamaño — úsala siempre a media oración) · `.link-underline--button`
(un `<button>` que debe leerse como enlace; combínalo con `.link-inline`).
Botones — jerarquía de dos niveles: **N1** `.btn--gold` (píldora dorada con `.btn__dot`)
reservado al único CTA de agendar; **N2** `.btn--secondary` (sólido sobrio, sin punto,
ancho ajustado) para todo lo demás. `.btn--primary` / `.btn--wine` siguen disponibles.
Otras: `.card`, `.icon-disc`, `.form-*`.

Fonts: **Mulish** (body), **Bitter 700** (headings) — both self-hosted woff2 in `public/fonts/`. GA: G-LWCY1M4Y9T. Disqus shortname: inessentia.
