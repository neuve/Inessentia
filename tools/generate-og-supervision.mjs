#!/usr/bin/env node
/**
 * Tarjetas de social preview (1200x630) de las memorias del Grupo de
 * Actualización en Terapia Corporal → public/uploads/og/supervision-sesion-N.webp
 *
 * Mismo lenguaje que public/uploads/og/supervision.webp (morado, sol de la
 * marca, rótulo dorado, título en Bitter). Para una sesión nueva, añade su
 * renglón a TARJETAS y corre:  node tools/generate-og-supervision.mjs
 *
 * Requiere ImageMagick 7 (`magick`). Las fuentes se bajan de Google Fonts la
 * primera vez y se cachean en .cache/fonts/ (no versionado), igual que en
 * tools/generate-og-cards.mjs.
 */
import { mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const UPLOADS = path.join(ROOT, 'public/uploads');
const OUT_DIR = path.join(UPLOADS, 'og');
const FONT_DIR = path.join(ROOT, '.cache/fonts');

// El texto de cada tarjeta es público: mismo cuidado que la memoria.
const TARJETAS = [
  {
    n: 1,
    rotulo: 'MEMORIA · SESIÓN 1 DE 9',
    titulo: 'El quehacer terapéutico',
    frase: 'La terapia ya no necesita héroes: necesita alianzas.',
  },
];

const W = 1200, H = 630;
const sh = (args) => execFileSync('magick', args, { stdio: ['ignore', 'ignore', 'inherit'] });

function ensureFont(file, query) {
  mkdirSync(FONT_DIR, { recursive: true });
  const dest = path.join(FONT_DIR, file);
  if (existsSync(dest)) return dest;
  const css = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0', `https://fonts.googleapis.com/css2?family=${query}&display=swap`]).toString();
  const m = css.match(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/);
  if (!m) throw new Error(`No pude resolver la fuente ${query}`);
  execFileSync('curl', ['-sS', '-o', dest, m[1]]);
  return dest;
}

const BITTER_BOLD = ensureFont('bitter-bold.ttf', 'Bitter:wght@700');
const BITTER_ITALIC = ensureFont('bitter-italic.ttf', 'Bitter:ital,wght@1,500');
const MULISH_BOLD = ensureFont('mulish-bold.ttf', 'Mulish:wght@700');
const MULISH_XBOLD = ensureFont('mulish-extrabold.ttf', 'Mulish:wght@800');

for (const t of TARJETAS) {
  const out = path.join(OUT_DIR, `supervision-sesion-${t.n}.webp`);
  sh([
    // fondo: morado de marca en diagonal, con dos círculos tenues
    '-size', `${W}x${H}`, '-define', 'gradient:angle=135', 'gradient:#341A54-#6B3A78',
    '-fill', 'rgba(255,255,255,0.05)', '-draw', 'circle 1120,60 1120,330', '-draw', 'circle 60,610 60,840',
    // sol de la marca
    '(', path.join(UPLOADS, 'logo-icon.png'), '-resize', '150x150', ')', '-gravity', 'NorthWest', '-geometry', '+90+70', '-composite',
    // número grande de la sesión, a la derecha
    '-gravity', 'NorthEast', '-font', BITTER_BOLD, '-pointsize', '300', '-fill', 'rgba(194,176,126,0.22)', '-annotate', '+80+20', String(t.n),
    // textos
    '-gravity', 'NorthWest',
    '-font', MULISH_XBOLD, '-pointsize', '27', '-kerning', '3', '-fill', '#C2B07E', '-annotate', '+90+262', t.rotulo,
    '-kerning', '0',
    '(', '-size', '1020x170', '-background', 'none', '-fill', 'white', '-font', BITTER_BOLD, '-pointsize', '76', '-gravity', 'SouthWest', `caption:${t.titulo}`, ')',
    '-gravity', 'NorthWest', '-geometry', '+90+290', '-composite',
    '(', '-size', '1020x100', '-background', 'none', '-fill', '#EAE5D9', '-font', BITTER_ITALIC, '-pointsize', '34', '-gravity', 'NorthWest', `caption:${t.frase}`, ')',
    '-gravity', 'NorthWest', '-geometry', '+90+476', '-composite',
    '-font', MULISH_BOLD, '-pointsize', '22', '-fill', 'rgba(255,255,255,0.85)', '-annotate', '+90+566', 'Grupo de Actualización en Terapia Corporal · Patricio Ruiz',
    '-quality', '86', out,
  ]);
  console.log('✓', path.relative(ROOT, out));
}
