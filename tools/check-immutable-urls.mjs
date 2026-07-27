#!/usr/bin/env node
// Guarda anti-caché-invisible: falla el build si dist/ contiene una URL bajo
// /uploads/ o /fonts/ cuyo nombre de archivo NO lleva un hash de contenido.
//
// POR QUÉ: public/ se copia literal a dist/, y Cloudflare sirve /uploads/* y
// /fonts/* con cache-control: max-age=31536000 (un año), por nombre estable.
// Si el contenido de un archivo cambia pero su nombre no, el CDN (y el
// navegador del visitante) siguen sirviendo los bytes viejos indefinidamente
// — así se rompió el recorte del hero (1300x731 -> 1300x1089): el archivo se
// regeneró bajo el mismo nombre y producción siguió sirviendo el viejo,
// dando un encuadre mal calibrado que parecía (pero no era) un bug de CSS.
// La única cura estructural es que la URL se derive de los bytes: cambian
// los bytes, cambia la URL, el CDN ya no puede servir lo viejo.
//
// Esta guarda NO arregla el pipeline de hashing (eso es un cambio aparte en
// tools/generate-responsive-images.mjs). Lo que hace es escanear la SALIDA
// ya construida (dist/**/*.html, *.css, *.xml, *.json) en vez de las
// fuentes: hay más de 20 URLs armadas con template literals dinámicos (ej.
// `/uploads/og/blog-${post.id}-es.webp` en src/pages/es/blog/*.astro, o
// heroImage/cardImage saliendo de src/data/posts.ts) que ningún análisis
// estático de código fuente resolvería sin duplicar esa lógica aquí. Al
// mirar la salida ya renderizada, todas esas URLs llegan resueltas a texto
// plano y quedan cubiertas sin que este script entienda una sola línea de
// Astro.
import { readdirSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, 'dist');

// Extensiones de la salida construida que pueden contener URLs de asset.
// (Hoy dist/ no tiene .css ni .json sueltos —el CSS crítico va inline en
// <style> dentro del HTML— pero los cubrimos igual: es barato y evita un
// agujero silencioso si el build cambia de forma más adelante.)
const SCAN_EXT = new Set(['.html', '.css', '.xml', '.json']);

// Sufijo de hash de contenido que añade el pipeline de imágenes responsivas:
// 8 caracteres hex justo antes de la extensión, ej.
// "buen-momento-pareja-1200.a1b2c3d4.webp". Regex tolerante a la
// implementación exacta (la define, en paralelo, otro cambio sobre
// tools/generate-responsive-images.mjs) — solo nos importa la FORMA del
// sufijo, no cómo se generó.
const HASHED_RE = /\.[0-9a-f]{8}\.[a-z0-9]+$/i;

// URLs bajo /uploads/ o /fonts/, con o sin esquema+host absoluto delante
// (JSON-LD/schema.org necesita URLs absolutas, ej.
// "https://inessentia.mx/uploads/logo-patricio-ruiz.webp"). El set de
// caracteres del path excluye comillas, paréntesis, ángulos y espacios a
// propósito, para no arrastrar el delimitador que sigue (funciona igual
// dentro de src="...", href="...", url(...)format(...) y JSON plano).
const URL_RE = /(?:https?:\/\/[a-zA-Z0-9.-]+)?\/(?:uploads|fonts)\/[a-zA-Z0-9._\-/]+/g;

// ALLOWLIST — URLs ABSOLUTAS exactas (no nombres de archivo, ver nota abajo)
// que aparecen en JSON-LD/schema.org y deben permanecer con nombre estable
// A PROPÓSITO, porque son identidad canónica que buscadores como Google
// asocian a esa URL específica (E-E-A-T del autor / marca). Si esa imagen
// necesita reemplazarse de verdad, se sube con un nombre nuevo como
// cualquier otro asset — esto no es una excepción al hashing, es contenido
// que no se espera que cambie bajo ese nombre.
const ALLOWLIST = new Set([
  // src/data/person.ts — Person.image (schema.org Person, usado para el
  // E-E-A-T del autor). El retrato "de identidad": debe ser la MISMA URL
  // siempre para que la señal que Google acumula sobre esa imagen no se
  // resetee en cada build.
  'https://inessentia.mx/uploads/patricio-ruiz-retrato.webp',
  // src/data/person.ts (ProfessionalService.logo) y
  // src/layouts/BlogPost.astro (Article.publisher.logo.url) — el logo de la
  // organización en schema.org. Misma razón: identidad de marca estable.
  'https://inessentia.mx/uploads/logo-patricio-ruiz.webp',
]);
//
// OJO — deliberadamente NO está en esta allowlist:
//   "image": `https://inessentia.mx${heroImage}` en src/layouts/BlogPost.astro
// (schema.org Article.image). Aunque vive en el mismo archivo que el logo de
// arriba, es un template literal DINÁMICO con el heroImage de cada post —no
// es identidad estable, es el mismo heroImage que ya se sirve crudo desde
// <Img> (el agujero principal que esta guarda existe para pescar). Meterlo
// en la allowlist "porque está en BlogPost.astro" sería exactamente la
// trampa de allowlistear solo para que el build pase.
//
// Tampoco compara por nombre de archivo: patricio-ruiz-retrato.webp también
// aparece como `src` relativo crudo (/uploads/patricio-ruiz-retrato.webp,
// sin esquema) en el <img> del hero de varias páginas —eso sigue siendo el
// mismo bug de Img.astro (hoy emite `src={src}` sin pasar por el manifiesto
// hasheado) y por diseño la guarda debe seguir marcándolo como fallo hasta
// que se arregle. Comparar por string absoluto exacto evita que compartir
// archivo con una entrada de la allowlist tape ese uso.

function isHashed(url) {
  const withoutQuery = url.split(/[?#]/)[0];
  return HASHED_RE.test(withoutQuery);
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (SCAN_EXT.has(path.extname(name))) {
      out.push(full);
    }
  }
  return out;
}

let files;
try {
  statSync(DIST);
  files = walk(DIST);
} catch {
  console.error(`[check-immutable-urls] no existe ${DIST} — corré "astro build" antes de esta guarda.`);
  process.exit(1);
}

const violations = [];
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const seenInFile = new Set(); // no repetir la misma URL varias veces por archivo
  for (const match of content.matchAll(URL_RE)) {
    const url = match[0];
    if (seenInFile.has(url)) continue;
    seenInFile.add(url);
    if (ALLOWLIST.has(url)) continue;
    if (isHashed(url)) continue;
    violations.push({ file: path.relative(ROOT, file), url });
  }
}

if (violations.length > 0) {
  console.error(`\n[check-immutable-urls] ${violations.length} URL(s) bajo /uploads/ o /fonts/ sin hash de contenido:\n`);
  const MAX_PRINT = 50;
  for (const v of violations.slice(0, MAX_PRINT)) {
    console.error(`  ${v.file}`);
    console.error(`    ${v.url}`);
  }
  if (violations.length > MAX_PRINT) {
    console.error(`  … y ${violations.length - MAX_PRINT} más`);
  }
  console.error(`
Por qué falla: estas URLs tienen nombre de archivo ESTABLE. Cloudflare las
sirve con cache-control: max-age=31536000 (un año); si el contenido cambia
bajo el mismo nombre, el CDN (y el navegador) siguen sirviendo la versión
vieja indefinidamente — así se rompió el recorte del hero en producción.

Qué hacer:
  - Si es una imagen de public/uploads/: serví la con <Img src="..."> (lee
    src/data/image-manifest.json y emite srcset hasheado) en vez de un
    <img src="..."> crudo, o con el helper que resuelva la URL hasheada del
    manifiesto para el atributo src.
  - Si es una fuente (/fonts/*.woff2): necesita su propio paso de hashing
    (hoy tools/fetch-fonts.mjs las deja con nombre estable) — no lo arregles
    acá, repórtalo como pendiente.
  - Si de verdad tiene que ser estable a propósito (identidad canónica en
    schema.org, ej. el retrato/logo de autor), agregala a ALLOWLIST en este
    archivo con el porqué explícito — no la agregues solo para que el build
    pase.
`);
  process.exit(1);
}

console.log(`[check-immutable-urls] OK — ${files.length} archivo(s) de dist/ escaneados, todas las URLs de /uploads/ y /fonts/ están hasheadas o en la allowlist.`);
