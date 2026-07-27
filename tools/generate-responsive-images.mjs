#!/usr/bin/env node
// Genera variantes responsivas (srcset) + copias hasheadas por contenido de
// TODO asset local servible (imágenes, svg, video, fuentes) y escribe un
// manifiesto que consumen src/components/Img.astro y src/lib/resolve-asset.ts.
//
// Se corre antes de `astro build`/`astro dev` (ver package.json), local Y en
// CI (.github/workflows/deploy.yml). Es idempotente: si el nombre hasheado ya
// existe en disco, no se regenera.
//
// POR QUÉ hashear los BYTES DE SALIDA y no los del master: public/ se copia
// LITERAL a dist/ y Cloudflare sirve /uploads/* y /fonts/* con
// cache-control: max-age=31536000 (un año). Si el nombre de archivo no
// cambia cuando cambia el contenido, el CDN (y el navegador) pueden seguir
// sirviendo bytes viejos para siempre — esto ya causó un bug real (ver
// tools/responsive-config.mjs). Hasheamos los bytes que sharp/fs realmente
// escriben a disco, no los del master, porque si mañana cambia QUALITY, la
// escalera WIDTHS, o la versión de sharp, los bytes de una variante pueden
// cambiar SIN que el master cambie — hashear el master dejaría ese vector
// abierto.
//
// Uso: node tools/generate-responsive-images.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import {
  WIDTHS,
  QUALITY,
  OUT_DIR,
  RASTER_EXT,
  COPY_EXT,
  SKIP_DIRS,
  NO_VARIANT_DIRS,
  MIN_VARIANT_WIDTH,
  MANIFEST_PATH,
  HASH_LENGTH,
  FONTS_DIR,
  FONTS_OUT_DIR,
  FONTS_CSS_PATH,
} from './responsive-config.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const UPLOADS = path.join(ROOT, 'public', 'uploads');
const OUT_ABS = path.join(UPLOADS, OUT_DIR);
const FONTS_ABS = path.join(ROOT, FONTS_DIR);
const FONTS_OUT_ABS = path.join(FONTS_ABS, FONTS_OUT_DIR);

/** sha256 de un Buffer, truncado a HASH_LENGTH chars hex. */
function hashOf(buf) {
  return createHash('sha256').update(buf).digest('hex').slice(0, HASH_LENGTH);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Recorre `dir` saltando SKIP_DIRS; devuelve rutas absolutas de TODOS los
 * archivos (rasters, svg, video...) — el filtrado por extensión pasa en main(). */
async function collectFiles(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await collectFiles(path.join(dir, entry.name))));
    } else {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/** Escribe `buf` en outAbs solo si ese nombre hasheado no existe ya
 * (idempotente: mismo contenido -> mismo hash -> mismo nombre -> no-op). */
async function writeIfMissing(outAbs, buf) {
  if (await exists(outAbs)) return false;
  await fs.writeFile(outAbs, buf);
  return true;
}

/** Borra de dirAbs cualquier archivo cuyo nombre no esté en keepNames. Sin
 * esto, cada regeneración de un asset deja su hash anterior huérfano en
 * disco para siempre — en local se acumula sin techo, y el dist local deja
 * de coincidir con el de CI (que parte de un checkout limpio cada vez). */
async function sweep(dirAbs, keepNames) {
  let removed = 0;
  for (const name of await fs.readdir(dirAbs)) {
    if (!keepNames.has(name)) {
      await fs.rm(path.join(dirAbs, name));
      removed++;
    }
  }
  return removed;
}

async function main() {
  await fs.mkdir(OUT_ABS, { recursive: true });
  const files = (await collectFiles(UPLOADS)).sort();
  const manifest = {};
  const keepUploads = new Set();
  let generated = 0;

  for (const abs of files) {
    const rel = path.relative(UPLOADS, abs); // p.ej. "og/blog-x-es.webp"
    const ext = path.extname(rel).toLowerCase();
    const parts = rel.split(path.sep);
    const topDir = parts.length > 1 ? parts[0] : null;
    const publicUrl = '/uploads/' + parts.join('/');
    const base = rel.slice(0, -ext.length).split(path.sep).join('-');

    if (RASTER_EXT.has(ext)) {
      // Fallo duro (no warn-and-skip): con hashing, que una imagen se caiga
      // silenciosamente del manifiesto la vuelve "envenenable" otra vez sin
      // que se note en pantalla — mejor que el build truene.
      let meta;
      try {
        meta = await sharp(abs).metadata();
      } catch (err) {
        throw new Error(`generate-responsive-images: no pude leer ${rel}: ${err.message}`);
      }
      const intrinsicW = meta.width ?? 0;
      const intrinsicH = meta.height ?? 0;
      if (!intrinsicW || !intrinsicH) {
        throw new Error(`generate-responsive-images: ${rel} no reportó dimensiones válidas`);
      }

      // Copia hasheada del MASTER, sin re-encode (fs.copyFile) y con su
      // extensión original — hay masters .jpg (hero-crops) además de .webp;
      // construir siempre ".webp" produciría un archivo .webp con bytes JPEG
      // adentro.
      const srcBuf = await fs.readFile(abs);
      const masterName = `${base}.${hashOf(srcBuf)}${ext}`;
      keepUploads.add(masterName);
      const masterAbs = path.join(OUT_ABS, masterName);
      if (!(await exists(masterAbs))) await fs.copyFile(abs, masterAbs);
      const masterUrl = `/uploads/${OUT_DIR}/${masterName}`;

      const srcset = [];
      const skipVariants = topDir && NO_VARIANT_DIRS.has(topDir);
      if (!skipVariants) {
        const targets = WIDTHS.filter((w) => w >= MIN_VARIANT_WIDTH && w < intrinsicW);
        for (const w of targets) {
          const buf = await sharp(abs).resize({ width: w }).webp({ quality: QUALITY }).toBuffer();
          const outName = `${base}-${w}.${hashOf(buf)}.webp`;
          keepUploads.add(outName);
          const outAbs = path.join(OUT_ABS, outName);
          if (await writeIfMissing(outAbs, buf)) generated++;
          srcset.push({ w, url: `/uploads/${OUT_DIR}/${outName}` });
        }
      }
      // El master (hasheado) es el candidato de mayor resolución del srcset.
      srcset.push({ w: intrinsicW, url: masterUrl });

      manifest[publicUrl] = { width: intrinsicW, height: intrinsicH, srcset, src: masterUrl };
    } else if (COPY_EXT.has(ext)) {
      // svg/mp4/webm: hash-por-copia, sin transcodificar.
      const buf = await fs.readFile(abs);
      const outName = `${base}.${hashOf(buf)}${ext}`;
      keepUploads.add(outName);
      const outAbs = path.join(OUT_ABS, outName);
      if (await writeIfMissing(outAbs, buf)) generated++;
      manifest[publicUrl] = { src: `/uploads/${OUT_DIR}/${outName}` };
    }
    // Cualquier otra extensión (no hay ninguna hoy bajo public/uploads) se
    // ignora: ni se hashea ni entra al manifiesto, igual que antes con SVG.
  }

  const removedUploads = await sweep(OUT_ABS, keepUploads);

  // --- Fuentes (public/fonts/*.woff2) ---------------------------------
  // Copia hasheada de cada woff2 versionado. No pasan por sharp (no son
  // rasters); es hash-por-copia igual que svg/mp4/webm, pero en su propio
  // árbol de salida porque public/fonts/ es un directorio hermano de
  // public/uploads/, no un subdirectorio.
  await fs.mkdir(FONTS_OUT_ABS, { recursive: true });
  const fontFiles = (await fs.readdir(FONTS_ABS, { withFileTypes: true })).filter(
    (e) => e.isFile() && e.name.toLowerCase().endsWith('.woff2')
  );
  const keepFonts = new Set();
  for (const f of fontFiles) {
    const abs = path.join(FONTS_ABS, f.name);
    const buf = await fs.readFile(abs);
    const base = f.name.slice(0, -'.woff2'.length);
    const outName = `${base}.${hashOf(buf)}.woff2`;
    keepFonts.add(outName);
    const outAbs = path.join(FONTS_OUT_ABS, outName);
    if (await writeIfMissing(outAbs, buf)) generated++;
    manifest[`/fonts/${f.name}`] = { src: `/fonts/${FONTS_OUT_DIR}/${outName}` };
  }
  const removedFonts = await sweep(FONTS_OUT_ABS, keepFonts);

  // Fragmento CSS con los @font-face apuntando a las copias hasheadas
  // vigentes. DECISIÓN DE DISEÑO: global.css es un archivo estático (no pasa
  // por el frontmatter de ningún .astro), así que no puede leer el
  // manifiesto ni recibir las URLs por custom property — @font-face no
  // resuelve `src: url(var(--x))` de forma confiable entre navegadores (no
  // está atado a ningún elemento, así que el cascade de custom properties no
  // aplica). La alternativa simple que SÍ funciona: el generador escribe este
  // fragmento con las URLs ya resueltas como strings literales, y global.css
  // lo importa con @import. Astro/Vite hashea global.css (con el @import ya
  // inlineado, ver `inlineStylesheets: 'always'` en astro.config.mjs) como
  // cualquier otro CSS, así que la propagación del hash de fuente es gratis.
  // Los <link rel=preload as=font> de Base.astro usan resolveAsset() sobre
  // las mismas rutas (/fonts/mulish-var.woff2, /fonts/bitter-var.woff2) para
  // que preload y @font-face src apunten SIEMPRE a la misma URL — si no
  // coincidieran, el navegador descargaría la fuente dos veces.
  const mulishUrl = manifest['/fonts/mulish-var.woff2']?.src;
  const bitterUrl = manifest['/fonts/bitter-var.woff2']?.src;
  if (!mulishUrl || !bitterUrl) {
    throw new Error(
      'generate-responsive-images: falta public/fonts/mulish-var.woff2 o bitter-var.woff2 ' +
        '(ver tools/fetch-fonts.mjs)'
    );
  }
  const fontsCss =
    `/* GENERADO por tools/generate-responsive-images.mjs — no editar a mano.\n` +
    `   global.css importa este fragmento (ver @import al inicio del archivo) en vez de\n` +
    `   declarar @font-face con rutas literales, para que el src apunte siempre a la\n` +
    `   copia hasheada vigente de public/fonts/*.woff2. */\n` +
    `@font-face { font-family: 'Mulish'; font-style: normal; font-weight: 200 1000; font-display: swap; src: url('${mulishUrl}') format('woff2'); }\n` +
    `@font-face { font-family: 'Bitter'; font-style: normal; font-weight: 100 900; font-display: swap; src: url('${bitterUrl}') format('woff2'); }\n`;
  await fs.writeFile(path.join(ROOT, FONTS_CSS_PATH), fontsCss);

  // Salida determinista (llaves ordenadas) para diffs limpios.
  const ordered = {};
  for (const k of Object.keys(manifest).sort()) ordered[k] = manifest[k];
  const manifestAbs = path.join(ROOT, MANIFEST_PATH);
  await fs.mkdir(path.dirname(manifestAbs), { recursive: true });
  await fs.writeFile(manifestAbs, JSON.stringify(ordered, null, 2) + '\n');

  console.log(
    `✓ assets: ${Object.keys(ordered).length} en el manifiesto, ${generated} archivo(s) generado(s), ` +
      `${removedUploads + removedFonts} huérfano(s) barrido(s).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
