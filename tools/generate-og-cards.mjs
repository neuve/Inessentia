#!/usr/bin/env node
/**
 * Genera las tarjetas de social preview (Open Graph / WhatsApp / Instagram)
 * a 1200x630 en public/uploads/og/ — reemplaza el logo genérico que se
 * mostraba antes en todos los links del sitio.
 *
 * Tres templates, mismo sistema visual (degradado de marca de
 * SiteHeader.astro:131, tipografías reales del sitio):
 *   - icon:     ícono grande + eyebrow + título — blog posts (ícono del sol)
 *               y terapia individual/pareja/familias (su propio
 *               icono-terapia-*.webp, el mismo que usa su SiteHeader)
 *   - split:    panel con degradado morado→dorado (#C2B07E) + retrato al lado
 *               (home, Sobre mí / About me)
 *   - default:  ícono + "Patricio Ruiz" + tagline (páginas legales/utilitarias)
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
// Icon card: big icon (left) + eyebrow/title stacked (right), centered as
// one composition with equal side margins. Used by blog posts (icon =
// brand sun mark) and by the therapy modality pages (icon = that page's own
// icono-terapia-*.webp, same one used in its SiteHeader).
// ---------------------------------------------------------------------------

function makeIconCard(iconPath, eyebrow, title, outPath) {
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
    '-annotate', '+0+15', eyebrow.toUpperCase(),
    '(', '-size', `${textW}x300`, '-background', 'none',
         '-fill', 'white', '-font', ZILLA_BOLD, '-pointsize', '58',
         '-gravity', 'NorthWest', `caption:${title}`, ')',
    '-gravity', 'NorthWest', '-geometry', '+0+90', '-composite',
    textBlock,
  ]);

  sh('convert', [
    GRADIENT,
    '(', iconPath, '-resize', `${logoSize}x${logoSize}`, ')',
    '-gravity', 'West', '-geometry', `+${margin}+0`, '-composite',
    textBlock,
    '-gravity', 'West', '-geometry', `+${margin + logoSize + gap}+0`, '-composite',
    '-quality', '85',
    outPath,
  ]);
}

function makeBlogCard(category, title, outPath) {
  makeIconCard(path.join(UPLOADS, 'logo-icon.webp'), category, title, outPath);
}

// ---------------------------------------------------------------------------
// Split card: brand panel (left, 460px) + face-framed photo (right, 740px).
// Panel gradient is vertical — dark purple through ~55%, then blends into the
// site's actual sand tone (#C2B07E) for the bottom ~45% — approved design
// for home + Sobre mí / About me (2026-07-08 feedback: "un poco de dorado
// abajo para que el texto contraste", using the real hero gradient color,
// not a generic gold).
// ---------------------------------------------------------------------------

function buildSplitPanelGradient() {
  const dest = path.join(TMP_DIR, 'panel-gradient.png');
  if (existsSync(dest)) return dest;
  const panelW = 460;
  const topH = Math.round(H * 0.55);
  const bottomH = H - topH;
  const top = path.join(TMP_DIR, 'panel-seg-top.png');
  const bottom = path.join(TMP_DIR, 'panel-seg-bottom.png');
  sh('convert', ['-size', `${panelW}x${topH}`, `gradient:#341A54-${BRAND.purple}`, top]);
  sh('convert', ['-size', `${panelW}x${bottomH}`, `gradient:${BRAND.purple}-${BRAND.sand}`, bottom]);
  sh('convert', [top, bottom, '-append', dest]);
  return dest;
}

function buildSplitPhoto() {
  const dest = path.join(TMP_DIR, 'split-photo.png');
  if (existsSync(dest)) return dest;
  sh('convert', [
    path.join(UPLOADS, 'terapia-hero.webp'),
    '-resize', '740x',
    '-gravity', 'North', '-crop', `740x${H}+0+250`, '+repage',
    dest,
  ]);
  return dest;
}

function makeSplitCard({ eyebrow, title, subtitle }, outPath) {
  const panelW = 460;
  const panel = buildSplitPanelGradient();
  const photo = buildSplitPhoto();
  const textBlock = path.join(TMP_DIR, 'split-textblock.png');

  const args = ['-size', `${panelW}x630`, 'xc:none', '-gravity', 'North'];
  let y = 90;
  args.push('(', path.join(UPLOADS, 'logo-icon.webp'), '-resize', '130x130', ')', '-gravity', 'North', '-geometry', `+0+${y}`, '-composite');
  y += 160;
  if (eyebrow) {
    args.push('-gravity', 'North', '-fill', BRAND.cream, '-font', MULISH_BOLD, '-pointsize', '26', '-annotate', `+0+${y}`, eyebrow.toUpperCase());
    y += 50;
  }
  args.push('-gravity', 'North', '-fill', 'white', '-font', ZILLA_BOLD, '-pointsize', '42', '-annotate', `+0+${y}`, title);
  y += 70;
  if (subtitle) {
    args.push(
      '(', '-size', '380x90', '-background', 'none', '-fill', BRAND.cream, '-font', MULISH_BOLD, '-pointsize', '20',
           '-gravity', 'North', `caption:${subtitle}`, ')',
      '-gravity', 'North', '-geometry', `+0+${y}`, '-composite',
    );
  }
  sh('convert', [...args, textBlock]);

  sh('convert', [
    panel, textBlock, '-gravity', 'NorthWest', '-geometry', '+0+0', '-composite',
    photo, '+append',
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

// Páginas de terapia: mismo template que blog (ícono grande + eyebrow +
// título) pero con el ícono propio de cada modalidad (el mismo que usa su
// SiteHeader) en vez del logo del sitio.
const THERAPY_PAGES = [
  { icon: 'icono-terapia-individual.webp', eyebrow: 'Psicoterapia individual', title: 'Procesos uno a uno para transformarte y aliviar lo que te sobrepasa.', out: 'terapia-individual.webp' },
  { icon: 'icono-terapia-individual.webp', eyebrow: 'Individual psychotherapy', title: 'One-on-one work to transform and ease what overwhelms you.', out: 'therapy-individual.webp' },
  { icon: 'icono-terapia-pareja.webp', eyebrow: 'Psicoterapia de pareja', title: 'Un refugio seguro para reencontrarte con tu compañero/a de vida.', out: 'terapia-pareja.webp' },
  { icon: 'icono-terapia-pareja.webp', eyebrow: 'Couples psychotherapy', title: 'A safe space to reconnect with your life partner.', out: 'therapy-couples.webp' },
  { icon: 'icono-terapia-familiar.webp', eyebrow: 'Psicoterapia familiar', title: 'Resignifica tus relaciones familiares.', out: 'terapia-familias.webp' },
  { icon: 'icono-terapia-familiar.webp', eyebrow: 'Family psychotherapy', title: 'Redefine your family relationships.', out: 'therapy-family.webp' },
];
for (const p of THERAPY_PAGES) {
  const outPath = path.join(OUT_DIR, p.out);
  makeIconCard(path.join(UPLOADS, p.icon), p.eyebrow, p.title, outPath);
  console.log('✓', path.relative(ROOT, outPath));
}

// Home + Sobre mí / About me: split panel + photo (approved 2026-07-08)
const SPLIT_PAGES = [
  { eyebrow: null, title: 'Patricio Ruiz', subtitle: 'Psicoterapia relacional y psicosomática. Presencial en la Ciudad de México y en línea.', out: 'home-es.webp' },
  { eyebrow: null, title: 'Patricio Ruiz', subtitle: 'Relational and psychosomatic psychotherapy. In person in Mexico City and online.', out: 'home-en.webp' },
  { eyebrow: 'Sobre mí', title: 'Patricio Ruiz', subtitle: null, out: 'sobre-mi.webp' },
  { eyebrow: 'About me', title: 'Patricio Ruiz', subtitle: null, out: 'about-me.webp' },
];
for (const p of SPLIT_PAGES) {
  const outPath = path.join(OUT_DIR, p.out);
  makeSplitCard(p, outPath);
  console.log('✓', path.relative(ROOT, outPath));
}

const defaultPath = path.join(OUT_DIR, 'default.webp');
makeDefaultCard(defaultPath);
console.log('✓', path.relative(ROOT, defaultPath));

console.log('Listo.');
