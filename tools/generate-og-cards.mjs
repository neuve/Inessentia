#!/usr/bin/env node
/**
 * Genera las tarjetas de social preview (Open Graph / WhatsApp / Instagram)
 * a 1200x630 en public/uploads/og/ — reemplaza el logo genérico que se
 * mostraba antes en todos los links del sitio.
 *
 * Tres templates, mismo sistema visual (degradado de marca de
 * SiteHeader.astro:131, ícono del sol, tipografías reales del sitio):
 *   - blog:     ícono grande + categoría + título, uno por post por idioma
 *   - retrato:  recorte de terapia-hero.webp + label (Sobre mí / terapia/*)
 *   - default:  ícono + "Patricio Ruiz" + tagline (home y páginas legales)
 *
 * Requiere ImageMagick (`convert`) instalado en el sistema. Las fuentes
 * (Zilla Slab, Mulish) se descargan de fonts.gstatic.com la primera vez y
 * se cachean en .cache/fonts/ (no versionado) — no hace falta volver a
 * bajarlas en corridas siguientes.
 *
 * Uso: node tools/generate-og-cards.mjs
 */
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const UPLOADS = path.join(ROOT, 'public/uploads');
const OUT_DIR = path.join(UPLOADS, 'og');
const FONT_DIR = path.join(ROOT, '.cache/fonts');
const TMP_DIR = path.join(ROOT, '.cache/og-tmp');

const W = 1200;
const H = 630;
const BRAND = {
  stops: [
    { pct: 0, color: '#341A54' },
    { pct: 30, color: '#46276E' },
    { pct: 56, color: '#7E4E77' },
    { pct: 83, color: '#C2B07E' },
    { pct: 100, color: '#EAE5D9' },
  ],
  cream: '#EAE5D9',
  sand: '#C2B07E',
  purple: '#3C1F5E',
};

for (const dir of [OUT_DIR, FONT_DIR, TMP_DIR]) mkdirSync(dir, { recursive: true });

function sh(cmd, args) {
  execFileSync(cmd, args, { stdio: ['ignore', 'ignore', 'inherit'] });
}

// ---------------------------------------------------------------------------
// Fonts (cached locally, downloaded from Google Fonts on first run)
// ---------------------------------------------------------------------------

function fetchFontCss(family, weight) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`;
  const out = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0', url]).toString();
  const m = out.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!m) throw new Error(`No pude resolver la URL de fuente para ${family} ${weight}`);
  return m[1];
}

function ensureFont(file, family, weight) {
  const dest = path.join(FONT_DIR, file);
  if (existsSync(dest)) return dest;
  const url = fetchFontCss(family, weight);
  sh('curl', ['-sS', '-o', dest, url]);
  return dest;
}

const ZILLA_BOLD = ensureFont('zilla-slab-bold.ttf', 'Zilla+Slab', '700');
const MULISH_BOLD = ensureFont('mulish-bold.ttf', 'Mulish', '700');

// ---------------------------------------------------------------------------
// Brand gradient background (cached — same for every card)
// ---------------------------------------------------------------------------

function buildGradient() {
  const dest = path.join(TMP_DIR, 'gradient.png');
  if (existsSync(dest)) return dest;
  const segFiles = [];
  for (let i = 0; i < BRAND.stops.length - 1; i++) {
    const a = BRAND.stops[i];
    const b = BRAND.stops[i + 1];
    const segW = Math.round((W * (b.pct - a.pct)) / 100);
    const seg = path.join(TMP_DIR, `seg-${i}.png`);
    sh('convert', ['-size', `${H}x${segW}`, `gradient:${a.color}-${b.color}`, '-rotate', '-90', seg]);
    segFiles.push(seg);
  }
  sh('convert', [...segFiles, '+append', dest]);
  return dest;
}

const GRADIENT = buildGradient();

// ---------------------------------------------------------------------------
// Blog card: big logo (left) + category/title stacked (right), centered as
// one composition with equal side margins.
// ---------------------------------------------------------------------------

function makeBlogCard(category, title, outPath) {
  const logoSize = 300;
  const gap = 40;
  const textW = 760;
  const totalW = logoSize + gap + textW;
  const margin = Math.round((W - totalW) / 2);
  const textBlock = path.join(TMP_DIR, 'textblock.png');

  sh('convert', [
    '-size', `${textW}x420`, 'xc:none',
    '-gravity', 'NorthWest',
    '-fill', BRAND.cream, '-font', MULISH_BOLD, '-pointsize', '30',
    '-annotate', '+0+15', category.toUpperCase(),
    '(', '-size', `${textW}x300`, '-background', 'none',
         '-fill', 'white', '-font', ZILLA_BOLD, '-pointsize', '58',
         '-gravity', 'NorthWest', `caption:${title}`, ')',
    '-gravity', 'NorthWest', '-geometry', '+0+90', '-composite',
    textBlock,
  ]);

  sh('convert', [
    GRADIENT,
    '(', path.join(UPLOADS, 'logo-icon.webp'), '-resize', `${logoSize}x${logoSize}`, ')',
    '-gravity', 'West', '-geometry', `+${margin}+0`, '-composite',
    textBlock,
    '-gravity', 'West', '-geometry', `+${margin + logoSize + gap}+0`, '-composite',
    '-quality', '85',
    outPath,
  ]);
}

// ---------------------------------------------------------------------------
// Portrait card: face-framed crop of terapia-hero.webp + bottom scrim + label
// ---------------------------------------------------------------------------

function buildPortraitBase() {
  const dest = path.join(TMP_DIR, 'portrait-base.png');
  if (existsSync(dest)) return dest;
  sh('convert', [
    path.join(UPLOADS, 'terapia-hero.webp'),
    '-resize', `${W}x`,
    '-gravity', 'North', '-crop', `${W}x${H}+0+380`, '+repage',
    dest,
  ]);
  return dest;
}

function makePortraitCard(label, outPath) {
  const base = buildPortraitBase();
  const scrim = path.join(TMP_DIR, 'scrim.png');
  sh('convert', ['-size', `${H}x220`, `gradient:none-${BRAND.purple}`, scrim]);
  sh('convert', [
    base,
    scrim, '-gravity', 'South', '-geometry', '+0+0', '-compose', 'over', '-composite',
    '(', path.join(UPLOADS, 'logo-icon.webp'), '-resize', '56x56', ')',
    '-gravity', 'SouthWest', '-geometry', '+50+90', '-composite',
    '-gravity', 'SouthWest', '-fill', 'white', '-font', ZILLA_BOLD, '-pointsize', '46',
    '-annotate', '+125+96', label,
    '-quality', '85',
    outPath,
  ]);
}

// ---------------------------------------------------------------------------
// Default fallback card: icon + name + tagline, used site-wide when no other
// image applies (home, costos, terminos, privacidad, testimonios, recursos).
// ---------------------------------------------------------------------------

function makeDefaultCard(outPath) {
  const textBlock = path.join(TMP_DIR, 'default-textblock.png');
  sh('convert', [
    '-size', `${W}x120`, 'xc:none',
    '-gravity', 'North',
    '-fill', 'white', '-font', ZILLA_BOLD, '-pointsize', '56',
    '-annotate', '+0+0', 'Patricio Ruiz',
    '-fill', BRAND.sand, '-font', MULISH_BOLD, '-pointsize', '26',
    '-annotate', '+0+78', 'Psicoterapia psicosomática y sistémica · CDMX y en línea',
    textBlock,
  ]);
  sh('convert', [
    GRADIENT,
    '(', path.join(UPLOADS, 'logo-icon.webp'), '-resize', '200x200', ')',
    '-gravity', 'North', '-geometry', '+0+70', '-composite',
    textBlock,
    '-gravity', 'North', '-geometry', '+0+300', '-composite',
    '-quality', '85',
    outPath,
  ]);
}

// ---------------------------------------------------------------------------
// posts.ts parsing (regex block-split, same approach as tools/i18n-diff.mjs —
// avoids eval-ing repo content)
// ---------------------------------------------------------------------------

function parsePosts() {
  const src = readFileSync(path.join(ROOT, 'src/data/posts.ts'), 'utf8');
  const blocks = src.split(/\n {2}\{\n {4}id:/).slice(1);
  const posts = [];
  for (const block of blocks) {
    const id = block.match(/^\s*'([^']+)'/)?.[1];
    const esTitle = block.match(/es:\s*\{\s*title:\s*(['"])((?:\\.|(?!\1).)*)\1/)?.[2];
    const esCategory = block.match(/es:\s*\{[^}]*category:\s*'([^']+)'/)?.[1];
    const enTitle = block.match(/en:\s*\{\s*title:\s*(['"])((?:\\.|(?!\1).)*)\1/)?.[2];
    const enCategory = block.match(/en:\s*\{[^}]*category:\s*'([^']+)'/)?.[1];
    if (!id || !esTitle || !enTitle) continue;
    posts.push({
      id,
      es: { title: esTitle.replace(/\\'/g, "'"), category: esCategory },
      en: { title: enTitle.replace(/\\'/g, "'"), category: enCategory },
    });
  }
  return posts;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const posts = parsePosts();
console.log(`posts.ts: ${posts.length} posts encontrados`);

for (const post of posts) {
  for (const locale of ['es', 'en']) {
    const meta = post[locale];
    const outPath = path.join(OUT_DIR, `blog-${post.id}-${locale}.webp`);
    makeBlogCard(meta.category, meta.title, outPath);
    console.log('✓', path.relative(ROOT, outPath));
  }
}

const PORTRAIT_PAGES = [
  { label: 'Sobre mí', out: 'sobre-mi.webp' },
  { label: 'About me', out: 'about-me.webp' },
  { label: 'Terapia individual', out: 'terapia-individual.webp' },
  { label: 'Individual Therapy', out: 'therapy-individual.webp' },
  { label: 'Terapia de pareja', out: 'terapia-pareja.webp' },
  { label: 'Couples Therapy', out: 'therapy-couples.webp' },
  { label: 'Terapia familiar', out: 'terapia-familias.webp' },
  { label: 'Family Therapy', out: 'therapy-family.webp' },
];
for (const p of PORTRAIT_PAGES) {
  const outPath = path.join(OUT_DIR, p.out);
  makePortraitCard(p.label, outPath);
  console.log('✓', path.relative(ROOT, outPath));
}

const defaultPath = path.join(OUT_DIR, 'default.webp');
makeDefaultCard(defaultPath);
console.log('✓', path.relative(ROOT, defaultPath));

console.log('Listo.');
