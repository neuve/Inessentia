#!/usr/bin/env node
// Genera variantes responsivas (srcset) de cada imagen raster en public/uploads
// y escribe un manifiesto que consume src/components/Img.astro.
//
// Se corre antes de `astro build`/`astro dev` (ver package.json). Es idempotente:
// sólo regenera una variante si falta o si el master es más nuevo.
//
// Uso: node tools/generate-responsive-images.mjs

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  WIDTHS,
  QUALITY,
  OUT_DIR,
  RASTER_EXT,
  SKIP_DIRS,
  MIN_VARIANT_WIDTH,
  MANIFEST_PATH,
} from './responsive-config.mjs';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const UPLOADS = path.join(ROOT, 'public', 'uploads');
const OUT_ABS = path.join(UPLOADS, OUT_DIR);

/** Recorre public/uploads saltando SKIP_DIRS; devuelve rutas absolutas de rasters. */
async function collectImages(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await collectImages(path.join(dir, entry.name))));
    } else if (RASTER_EXT.has(path.extname(entry.name).toLowerCase())) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/** ¿Hay que (re)generar dst a partir de src? (falta o el master es más nuevo) */
async function needsBuild(src, dst) {
  try {
    const [s, d] = await Promise.all([fs.stat(src), fs.stat(dst)]);
    return s.mtimeMs > d.mtimeMs;
  } catch {
    return true; // dst no existe
  }
}

async function main() {
  await fs.mkdir(OUT_ABS, { recursive: true });
  const images = (await collectImages(UPLOADS)).sort();
  const manifest = {};
  let generated = 0;

  for (const abs of images) {
    const rel = path.relative(UPLOADS, abs); // p.ej. "que-esperar-terapia.webp"
    const publicUrl = '/uploads/' + rel.split(path.sep).join('/');
    const base = rel.slice(0, -path.extname(rel).length).split(path.sep).join('-');

    let meta;
    try {
      meta = await sharp(abs).metadata();
    } catch (err) {
      console.warn(`  ⚠ omito ${rel}: ${err.message}`);
      continue;
    }
    const intrinsicW = meta.width ?? 0;
    const intrinsicH = meta.height ?? 0;
    if (!intrinsicW || !intrinsicH) continue;

    const targets = WIDTHS.filter((w) => w >= MIN_VARIANT_WIDTH && w < intrinsicW);
    const srcset = [];

    for (const w of targets) {
      const outName = `${base}-${w}.webp`;
      const outAbs = path.join(OUT_ABS, outName);
      if (await needsBuild(abs, outAbs)) {
        await sharp(abs).resize({ width: w }).webp({ quality: QUALITY }).toFile(outAbs);
        generated++;
      }
      srcset.push({ w, url: `/uploads/${OUT_DIR}/${outName}` });
    }
    // El master es el candidato de mayor resolución del srcset.
    srcset.push({ w: intrinsicW, url: publicUrl });

    manifest[publicUrl] = { width: intrinsicW, height: intrinsicH, srcset };
  }

  // Salida determinista (llaves ordenadas) para diffs limpios.
  const ordered = {};
  for (const k of Object.keys(manifest).sort()) ordered[k] = manifest[k];
  const manifestAbs = path.join(ROOT, MANIFEST_PATH);
  await fs.mkdir(path.dirname(manifestAbs), { recursive: true });
  await fs.writeFile(manifestAbs, JSON.stringify(ordered, null, 2) + '\n');

  console.log(
    `✓ imágenes responsivas: ${Object.keys(ordered).length} en el manifiesto, ` +
      `${generated} variante(s) generada(s).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
