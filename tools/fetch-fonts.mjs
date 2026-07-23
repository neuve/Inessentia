#!/usr/bin/env node
// Descarga los woff2 (subset latin) de Mulish + Bitter desde Google Fonts y
// los deja en public/fonts/ para auto-hospedarlos (sin dependencia CDN en
// runtime). Los archivos se versionan; este script es sólo para refrescarlos.
//
// Uso: node tools/fetch-fonts.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const OUT = path.join(ROOT, 'public', 'fonts');

// UA moderno para que Google sirva woff2 (con UA viejo devuelve ttf).
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;500;600;700;800' +
  '&family=Bitter:wght@500;600;700&display=swap';

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text();

  // Cada @font-face viene precedido por un comentario /* latin */, /* latin-ext */, etc.
  // Nos quedamos SÓLO con los bloques "latin" (cubren ES/EN).
  const blocks = css.split('/*').slice(1);
  const wanted = [];
  for (const b of blocks) {
    const subset = b.slice(0, b.indexOf('*/')).trim();
    if (subset !== 'latin') continue;
    const family = (b.match(/font-family:\s*'([^']+)'/) || [])[1];
    const weight = (b.match(/font-weight:\s*(\d+)/) || [])[1];
    const url = (b.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/) || [])[1];
    if (family && weight && url) wanted.push({ family, weight, url });
  }

  if (!wanted.length) throw new Error('No se encontraron bloques latin/woff2 en el CSS de Google.');

  for (const { family, weight, url } of wanted) {
    const name = `${slug(family)}-${weight}.woff2`;
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await fs.writeFile(path.join(OUT, name), buf);
    console.log(`✓ ${name} (${(buf.length / 1024).toFixed(1)} KiB)`);
  }
  console.log(`\n${wanted.length} fuentes en public/fonts/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
