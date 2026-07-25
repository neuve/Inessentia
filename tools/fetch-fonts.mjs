#!/usr/bin/env node
// Descarga los woff2 (subset latin) de Mulish + Bitter desde Google Fonts y
// los deja en public/fonts/ para auto-hospedarlos (sin dependencia CDN en
// runtime). Los archivos se versionan; este script es sólo para refrescarlos.
//
// Uso: node tools/fetch-fonts.mjs
//
// OJO — ambas familias son FUENTES VARIABLES: Google sirve UN solo archivo por
// familia que cubre todo el eje wght. La versión anterior de este script pedía
// pesos discretos (wght@300;400;500…) y guardaba ese mismo binario con un
// nombre por peso, así que el navegador descargaba hasta 6 copias idénticas
// (~180 KiB en vez de 30 KiB) y eso dominaba el LCP en móvil. Ahora se pide el
// RANGO del eje y se escribe un único archivo por familia: mulish-var.woff2 y
// bitter-var.woff2, que es lo que declaran los @font-face de global.css.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const OUT = path.join(ROOT, 'public', 'fonts');

// UA moderno para que Google sirva woff2 (con UA viejo devuelve ttf).
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Se pide el RANGO del eje wght (sintaxis `a..b`) para que Google devuelva la
// fuente variable. Los rangos deben coincidir con los @font-face de global.css.
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Mulish:wght@200..1000' +
  '&family=Bitter:wght@100..900&display=swap';

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

  // Una familia variable devuelve la MISMA url para todo el rango: agrupamos por
  // familia y nos quedamos con la url única. Si alguna familia trajera más de una
  // url distinta, dejó de ser variable y global.css necesitaría volver a declarar
  // un @font-face por peso — mejor fallar ruidosamente que escribir archivos que
  // el CSS no referencia.
  const byFamily = new Map();
  for (const { family, url } of wanted) {
    if (!byFamily.has(family)) byFamily.set(family, new Set());
    byFamily.get(family).add(url);
  }

  for (const [family, urls] of byFamily) {
    if (urls.size !== 1) {
      throw new Error(
        `${family} devolvió ${urls.size} archivos distintos: ya no es variable. ` +
          'Revisa los @font-face de src/styles/global.css antes de continuar.'
      );
    }
    const url = [...urls][0];
    const name = `${slug(family)}-var.woff2`;
    const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await fs.writeFile(path.join(OUT, name), buf);
    console.log(`✓ ${name} (${(buf.length / 1024).toFixed(1)} KiB) — variable, cubre todo el eje wght`);
  }
  console.log(`\n${byFamily.size} fuentes en public/fonts/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
