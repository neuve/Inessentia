# design-sync notes

## 2026-08-06 — first run, tokens-only

This repo is a pure Astro site with vanilla JS (`package.json` has only
`astro`, `sharp`, `@astrojs/sitemap` — no React, no Storybook, no
`.stories.*` files). It cannot go through the normal package/storybook
converter: there is nothing to compile into a component bundle.

The user pointed this run at an existing, pre-built claude.ai/design
project, "Inessentia Design System" (`57339fb5-baec-4d08-bbf0-6f2f8d66d961`),
which was NOT created by this skill (no prior `.design-sync/config.json`,
and its file layout doesn't match the converter's output shape — flat
files per group instead of `components/<group>/<Name>/`). It already has
real React components (Button, Card, SiteHeader, TestimonialCard, Mandala,
Link, Blockquote, Eyebrow, Tag, Input), a `production-kit/` with `.tsx`
source, design handoff docs, and guideline pages.

Scope of this run: compare that project's `tokens/*.css` against this
repo's `src/styles/global.css` (the site's actual source of truth) and fix
drift. Only `tokens/spacing.css`, `tokens/typography.css`, and
`tokens/base.css` were touched. Not touched: `tokens/colors.css` (already
matched), `tokens/fonts.css` (intentionally uses Google Fonts CDN instead
of the site's self-hosted woff2 — needed for previews to render fonts),
`tokens/theme.css`, all of `components/`, `production-kit/`, `guidelines/`,
`ui_kits/`, `design_handoff_encabezado_estandar/`, `assets/`, `uploads/`.

### OUTSTANDING — contradictions this run introduced, not yet fixed

Leaving the files above alone was NOT neutral. The token edits were pushed
without first checking their consumers, and several of those consumers
hardcode the old values, so the project currently disagrees with itself.
A code review after the upload found:

- `production-kit/src/tokens.css` is an independent SECOND copy of the same
  decisions and is now stale on the exact three points this run "fixed":
  `.iness-btn-primary` still `font-size:14px; letter-spacing:.06em;
  text-transform:uppercase` (L38-40), `.iness-label-section` still uppercase
  (L96), `.iness-heading-section` still `line-height:1.08` (L87). This is
  the layer named "production" — an engineer copying it gets the all-caps
  and the diacritic-collision line-height back.
- `guidelines/radius.html` hardcodes and labels the OLD radii: swatch
  `border-radius:22px` "22 card" (L11), `9px` "9 input" (L13), and the
  `@dsCard` subtitle "Cards 22 · images 18 · inputs 9 · pill 999" (L1).
  Tokens are now 20 and 10.
- `guidelines/type-scale.html` shows `font-size:26px` "h3 26" (L12); `--fs-h3`
  is now `clamp(24px,3vw,34px)`, i.e. 34px at desktop.
- `guidelines/radius.html` `.pill` (L8) is still `text-transform:uppercase`
  with tracking — the very treatment removed from the buttons because
  `theme.css` forbids it.
- Docstrings state the old radii: `components/content/Card.jsx` L4 says
  "22px radius", `components/forms/Input.jsx` L6 says "9px radius". These
  feed the design agent's understanding of each component's contract.

Fixing these means editing files this run declared out of scope, so it was
left for an explicit decision rather than done silently. Until then, treat
`tokens/*.css` as the source of truth and the above as known-stale.

Also unverified: `--space-5` was changed 18px → 20px purely by index
alignment with the site's `--sp-5`. No consumer of `var(--space-5)` was
located (the spacing-scale guideline ramp skips 18 and 20 entirely), so
whether 18px was a deliberate value is still unknown.

### Known gap — NOT ported, needs a real design pass if wanted

`global.css` has moved to a continuous gradient "canvas" background
(`--page-grad`, `.zone-dark`/`.zone-light`, `.on-dark`/`.on-light`,
`--on-canvas*` tokens) that flows from a dark purple hero through to a
cream/sand close, with text tokens that flip based on which stretch of the
gradient a section sits on. The design-kit project's `tokens/theme.css`
still uses a simpler solid-panel dark/light toggle (`--surface-page:
#221735`, `--surface-card: #2e2140`, etc.) with no equivalent to the
canvas/zone system. Porting this properly means introducing the gradient
and zone tokens and re-checking how every component's dark-mode colors
resolve against them — that's a real design change, not a token-value
sync, so it was intentionally left alone this run.

### Corrected value drift (source: `src/styles/global.css`)

- `tokens/spacing.css`: `--container` 1200px (static) → `clamp(1040px,
  86vw, 1600px)`; `--space-5` 18px → 20px; `--radius-card` 22px → 20px;
  `--radius-input` 9px → 10px; `--bp-mobile` 600px → 560px.
- `tokens/typography.css`: `--fs-hero`, `--fs-h1`, `--fs-h3` updated to
  the site's current fluid clamps; `--lh-tight` 1.08 → 1.15 (global.css
  notes Bitter's diacritics collide with the line above below ~1.12).
- `tokens/base.css`: `.btn-primary`/`.btn-white`/`.label-section` were
  still `text-transform: uppercase` with letter-spacing tracking, which
  contradicts this same project's own `theme.css` hard rule ("NUNCA
  all-caps en botón/rótulo") and the live site's actual CSS. Switched to
  `text-transform: none; letter-spacing: 0`, matching `Button.jsx` and
  `Eyebrow.jsx`, which already did this via inline styles (this holds for
  those two components only — it is NOT evidence the change was
  render-neutral; the class-based consumers in `guidelines/` and
  `production-kit/` still carry the old treatment, see OUTSTANDING above).
  Also bumped
  `.btn-primary`/`.btn-white` font-size 14px → 15px to match the site's
  `.btn`.
