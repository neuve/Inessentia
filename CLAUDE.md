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
Text:    --text #3f3a36  --text-soft #5a544e  --text-muted #6a6460  --text-faint #8B8378
On dark: --on-dark  --on-dark-soft  --on-dark-faint
Borders: --border-card #ece6d8  --border-hair #e2dccc  --surface #fff
Gradients: --grad-brand (100deg brand)  --grad-rail (panel rail)  --grad-soft (cream→warm)
           --veil-purple "38,20,60" → rgba(var(--veil-purple),α) for hero veils
Spacing: --sp-1..16 (4→64)  --section-pad clamp(64px,9vw,120px)  --gutter 32px
Radii:   --r-card 20  --r-panel 18  --r-pill 999  --r-field 10  --r-sm 6
Shadows: --sh-card  --sh-float  --sh-portrait  --sh-btn
Type:    --ff-head 'Bitter',serif  --ff-body 'Mulish',sans-serif
         --fs-display / --fs-h1 / --fs-h2 (=.heading-section) / --fs-h3 / --fs-h4
         --fs-eyebrow 13px  --fs-body  --fs-small  --lh-tight/head/body  --ls-eyebrow
Breakpoints (convention): --bp-sm 560  --bp-md 820  --bp-lg 1024
```

Shared classes: `.section`(+`--cream`/`--purple`), `.container`(+`--narrow`/`--blog`/`--read`), `.section-header`, `.heading-section`(+`--on-dark`), `.label-section`(+`--on-dark`), `.body-text`(+`--on-dark`), `.btn`(+`--primary`/`--white`/`--wine`/`--ghost`), `.card`, `.page-header--soft`, `.form-*`, `.link-underline`.

Fonts: **Mulish** (body), **Bitter 700** (headings) — both self-hosted woff2 in `public/fonts/`. GA: G-LWCY1M4Y9T. Disqus shortname: inessentia.
