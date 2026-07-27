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
- **Components**: Navbar, MobileMenu, Footer, WhatsApp, TestimonialCarousel, DisqusComments, RevealOnScroll — all in `src/components/`.
- **Styles**: `src/styles/global.css` is the **single source of truth** for the design system — an expanded `:root` token layer (color, text/greys, borders, brand gradients, spacing, radii, shadows, and a role-based type-scale) plus shared utility classes. Always consume tokens/classes instead of hardcoding hex/px inline. The React package `inessentia-design-kit` (sibling repo) is **archived/divergent — do not use it as a reference** (it drifted to Zilla Slab; the site uses Bitter).
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
Brand:   --purple #46276E  --purple-d #3C1F5E  --wine #8E2B5D
         --cream #EAE5D9  --cream-2 #F4F0E6  --sand #C2B07E  --sand-d #A8945C
         --ink #262321  --warm #FCFBF6
Text:    --text #3f3a36  --text-soft #5a544e  --text-muted #6a6460  --text-faint #797267
On dark: --on-dark  --on-dark-soft  --on-dark-faint
Borders: --border-card #ece6d8  --border-hair #e2dccc  --surface #fff
Gradients: --grad-brand (100deg brand)  --grad-rail (panel rail)
           --veil-purple "38,20,60" → rgba(var(--veil-purple),α) for hero veils
Layout:  --container-w clamp(1040px,86vw,1600px)   ← tope de ancho del contenido
         --container-pad-w = --container-w + 2×--gutter  (ver "Márgenes" abajo)
         --gutter 32px  ← ÚNICO gutter lateral del sitio  --section-pad clamp(64px,9vw,120px)
Spacing: --sp-1..12 (4→48)
Radii:   --r-card 20  --r-panel 18  --r-pill 999  --r-field 10
Shadows: --sh-card  --sh-btn
Type:    --ff-head 'Bitter',serif  --ff-body 'Mulish',sans-serif
         --fs-display / --fs-h1 / --fs-h2 (=.heading-section) / --fs-h3 / --fs-h4
         --fs-body  --fs-small  --lh-tight/head/body
Breakpoints (convention): --bp-sm 560  --bp-md 820  --bp-lg 1024
```

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

Shared classes: `.section`(+`--cream`/`--purple`), `.container`(+`--narrow`/`--blog`/`--read`), `.section-header`, `.heading-section`(+`--on-dark`), `.label-section`(+`--on-dark`/`--plain`), `.body-text`(+`--on-dark`), `.btn`(+`--primary`/`--white`/`--wine`/`--gold`/`--secondary`), `.card`, `.page-header--soft`, `.form-*`, `.link-underline`, `.icon-disc`.

Fonts: **Mulish** (body), **Bitter 700** (headings) — both self-hosted woff2 in `public/fonts/`. GA: G-LWCY1M4Y9T. Disqus shortname: inessentia.
