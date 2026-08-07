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

### 2026-08-06 — follow-up run: fixed the contradictions above

The OUTSTANDING list below (from the first run) is now resolved. A sonnet
multi-agent fan-out staged 19 files locally, each verified by direct read
against the exact spec before upload, then uploaded via
`finalize_plan`/`write_files` (sentinel → 19 files → sentinel), then
re-verified by re-fetching the highest-risk files (`SiteHeader.jsx`,
`TestimonialCard.jsx`, `production-kit/src/tokens.css`,
`guidelines/radius.html`) from the remote project post-upload.

**Tier A — docs/literals corrected**, split "safe" vs "fixed a real
contradiction":
- `guidelines/radius.html`: subtitle, both swatches (22→20, 9→10), and
  `.pill` uppercase/tracking removed.
- `guidelines/type-scale.html`: h3 row 26px → 34px (matches the clamp
  ceiling, same convention as the section/blog-h2 rows).
- `guidelines/elevation.html`: `.card` border-radius 22px → 20px (this one
  was missed by the original review — found by the follow-up audit).
- `guidelines/type-display.html`: `--fs-hero` caption clamp(36→62px) →
  clamp(40→80px) (also missed originally).
- `guidelines/type-body.html`: eyebrow caption "13px · .16em · uppercase"
  → "14px · Title Case".
- `components/content/Card.d.ts` / `Card.jsx`: "22px radius" → "20px
  radius" (doc + docstring).
- `components/forms/Input.jsx`: "9px radius" → "10px radius" (docstring).
- `components/content/Eyebrow.d.ts`, `buttons/Button.d.ts`,
  `buttons/Button.prompt.md`, `layout/SiteHeader.d.ts`: "uppercase" →
  "Title Case" in prose (these feed the design agent's understanding of
  each component's contract).
- `components/content/tags.card.html`: caption font-size 13px → 14px
  (both occurrences).
- `production-kit/src/tokens.css`: patched in place (kept standalone, not
  rewritten to import `tokens/*.css` — see rationale below).
  `.iness-btn-primary/.iness-btn-white` font-size 14→15,
  letter-spacing .06em→0, text-transform uppercase→none;
  `.iness-heading-section` line-height 1.08→1.15;
  `.iness-label-section` font-size 13→14, letter-spacing .16em→0,
  text-transform uppercase→none.
- `production-kit/src/Button.tsx.txt`, `Typography.tsx.txt`: "uppercase"
  → "Title Case" in docstrings.

**Tier B — real rendered-code violations, not just docs.** These change
what actually renders:
- `components/layout/SiteHeader.jsx` `PrimaryBtn` — the site's main CTA
  (`primaryLabel` defaults to "Agenda tu primera cita"): fontSize 14→15,
  letterSpacing '.05em'→'normal', textTransform 'uppercase'→'none'.
- `components/layout/SiteHeader.jsx` `eyebrowEl`: letterSpacing
  '.16em'→'normal', textTransform 'uppercase'→'none'. fontSize kept at 13
  (matches the real `Eyebrow.jsx`; raising it to 14 would have invented a
  new inconsistency rather than removed one).
- `components/content/TestimonialCard.jsx` context-tag pill: same
  letterSpacing/textTransform fix, aligning it with `Tag.jsx`/
  `Tag.prompt.md`, which already forbid all-caps.
- `components/layout/siteheader.card.html` `.tag` preview-chrome caption:
  same fix — preview-only, but it renders inside the picker and was
  modeling the forbidden look right next to the real component.

**`production-kit` was patched, not rewritten**, because it's deliberately
standalone: its own README says "Archived... not separately maintained",
source files are `.txt`-suffixed specifically so the compiler won't bundle
them, and it re-declares its own `:root` colors and `@font-face
src:local()` rather than importing the parent stylesheet. `readme.md`
promises "the archived kit read identical token values, so a design
translates 1:1" — patching restores that promise without touching its
intentional self-containment.

**`--space-5` 18→20 confirmed safe.** A dedicated audit found no file
anywhere consuming `var(--space-5)`. The only literal 18 in a spacing
context in the whole project is an incidental `margin:18px` in
`guidelines/type-display.html` (unrelated layout margin, left alone).

**Deliberately left unchanged, with reasons:**
- `SiteHeader.jsx` L127 `maxWidth: 1200` on the split-layout hero — reads
  as a chosen hero width (the monolith variant uses 960, the stat ribbon
  1120), not a `--container` reference. Swapping in the fluid
  `clamp(1040px,86vw,1600px)` would widen the hero to 1600px on a guess,
  not a confirmed fix.
- `borderRadius: 18/20/999` literals scattered through `SiteHeader.jsx`
  and `Blockquote.jsx`'s `lineHeight: 1.7` — these already render
  correctly by coincidence; tokenizing them is drift-proofing, not a fix,
  and was out of scope for this run.
- `guidelines/spacing-scale.html`'s ramp still skips steps 20 and 26 —
  incomplete, but it never displayed a wrong value, so it's an
  enhancement, not a correction.

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
