#!/usr/bin/env node
/**
 * Empareja cada página ES con su par EN y extrae el texto visible
 * (encabezados, párrafos, listas) alineado por índice, listo para leer
 * párrafo a párrafo y juzgar la traducción.
 *
 * Por qué no "juzga" la traducción por su cuenta: se intentó con
 * heurísticas (ratio de longitud entre párrafos, conteo de bloques) y
 * dieron falsos positivos/negativos reales — una imagen con texto en
 * español incrustado, una oración añadida a propósito en un idioma, una
 * síntesis editorial legítima, todo se ve igual a un regex que a un error
 * real. Juzgar fidelidad, calcos y tono es un criterio semántico; eso lo
 * hace quien lee (yo o Cowork), no una expresión regular.
 *
 * Lo único que este script sí puede afirmar con confianza es léxico: si
 * un término técnico del glosario aparece en ES, su traducción fija
 * esperada debería aparecer en EN. Eso se reporta como alerta.
 *
 * Uso:
 *   node tools/i18n-diff.mjs                  → lista todas las páginas
 *   node tools/i18n-diff.mjs --pages=slug1,slug2   → solo esas páginas
 *   node tools/i18n-diff.mjs --glossary-only   → solo alertas de glosario, sin el texto alineado
 *   node tools/i18n-diff.mjs --json            → salida estructurada
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const glossaryOnly = args.includes('--glossary-only');
const pagesArg = args.find((a) => a.startsWith('--pages='));
const pagesFilter = pagesArg ? new Set(pagesArg.split('=')[1].split(',')) : null;

// ---------------------------------------------------------------------------
// 1. Descubrir pares de páginas ES/EN
// ---------------------------------------------------------------------------

function pagePairsFromPosts() {
  const src = readFileSync(path.join(ROOT, 'src/data/posts.ts'), 'utf8');
  const pairs = [];
  const blocks = src.split(/\{\s*\n\s*id:/).slice(1);
  for (const block of blocks) {
    const idMatch = block.match(/^\s*'([^']+)'/);
    const slugEsMatch = block.match(/slugEs:\s*'([^']+)'/);
    const slugEnMatch = block.match(/slugEn:\s*'([^']+)'/);
    if (!idMatch || !slugEsMatch || !slugEnMatch) continue;
    const slugEs = slugEsMatch[1];
    const slugEn = slugEnMatch[1];
    const es = `src/pages/es/blog/${slugEs}.astro`;
    const en = `src/pages/en/blog/${slugEn}.astro`;
    if (existsSync(path.join(ROOT, es)) && existsSync(path.join(ROOT, en))) {
      pairs.push({ slug: slugEs, es, en });
    }
  }
  return pairs;
}

// Páginas estáticas: mapeo manual (rutas estables, no vale la pena inferirlas)
const STATIC_PAIRS = [
  { slug: 'home', es: 'src/pages/es/index.astro', en: 'src/pages/en/index.astro' },
  { slug: 'sobre-mi', es: 'src/pages/es/sobre-mi.astro', en: 'src/pages/en/about-me.astro' },
  { slug: 'recursos', es: 'src/pages/es/recursos.astro', en: 'src/pages/en/resources.astro' },
  { slug: 'testimonios', es: 'src/pages/es/testimonios.astro', en: 'src/pages/en/testimonials.astro' },
  { slug: 'red-terapeutica', es: 'src/pages/es/red-terapeutica.astro', en: 'src/pages/en/therapist-network.astro' },
  { slug: 'terapia-individual', es: 'src/pages/es/terapia/individual.astro', en: 'src/pages/en/therapy/individual.astro' },
  { slug: 'terapia-pareja', es: 'src/pages/es/terapia/pareja.astro', en: 'src/pages/en/therapy/couples.astro' },
  { slug: 'terapia-familias', es: 'src/pages/es/terapia/familias.astro', en: 'src/pages/en/therapy/family.astro' },
  { slug: 'privacidad', es: 'src/pages/es/privacidad.astro', en: 'src/pages/en/privacy.astro' },
  { slug: 'terminos', es: 'src/pages/es/terminos.astro', en: 'src/pages/en/terms.astro' },
].filter((p) => existsSync(path.join(ROOT, p.es)) && existsSync(path.join(ROOT, p.en)));

// ---------------------------------------------------------------------------
// 2. Glosario de términos técnicos (ES -> variantes válidas en EN)
//    Único chequeo determinista que se conserva: cubre solo nombres
//    propios/técnicos con una traducción fija esperada. Términos genéricos
//    con varias traducciones válidas (p. ej. "terapia corporal", "trauma")
//    quedan fuera a propósito — daban falsos positivos.
// ---------------------------------------------------------------------------

const GLOSSARY = [
  { es: /teor[ií]a polivagal/i, en: [/polyvagal theory/i], label: 'Teoría Polivagal' },
  { es: /circuito vagal dorsal/i, en: [/dorsal vagal circuit/i], label: 'circuito vagal dorsal' },
  { es: /circuito ventral vagal/i, en: [/ventral vagal circuit/i], label: 'circuito ventral vagal' },
  { es: /sistema simp[aá]tico/i, en: [/sympathetic system/i], label: 'sistema simpático' },
  { es: /neurocepci[oó]n/i, en: [/neuroception/i], label: 'neurocepción' },
  { es: /sistemas familiares internos/i, en: [/internal family systems/i, /\bIFS\b/], label: 'Sistemas Familiares Internos (IFS)' },
  { es: /experiencia som[aá]tica/i, en: [/somatic experiencing/i], label: 'Experiencia Somática' },
  { es: /core energ[eé]tica/i, en: [/core energetics/i], label: 'Core Energética' },
  { es: /sistema nervioso aut[oó]nomo/i, en: [/autonomic nervous system/i], label: 'sistema nervioso autónomo' },
  { es: /co-regulaci[oó]n/i, en: [/co-regulation/i], label: 'co-regulación' },
  { es: /desregulaci[oó]n/i, en: [/dysregulation/i], label: 'desregulación' },
  { es: /disociaci[oó]n/i, en: [/dissociation/i], label: 'disociación' },
  { es: /tapping|EFT/i, en: [/tapping|EFT/i], label: 'Tapping / EFT' },
  { es: /tono vagal/i, en: [/vagal tone/i], label: 'tono vagal' },
  { es: /tel[eé]nc[eé]falo|amígdala/i, en: [/amygdala/i], label: 'amígdala' },
];

// ---------------------------------------------------------------------------
// 3. Extracción de texto visible de un .astro
// ---------------------------------------------------------------------------

function extractBlocks(raw) {
  let body = raw.replace(/^---[\s\S]*?---/, '');
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');

  const blocks = [];
  const tagRe = /<(h1|h2|h3|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = tagRe.exec(body))) {
    const text = m[2]
      .replace(/<[^>]+>/g, ' ') // quita sub-tags (strong, em, a, etc.)
      .replace(/\{[^{}]*\}/g, ' ') // quita expresiones Astro tipo {i.foo}
      .replace(/&amp;/g, '&')
      .replace(/&mdash;/g, '—')
      .replace(/\s+/g, ' ')
      .trim();
    if (text) blocks.push({ tag: m[1].toLowerCase(), text });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// 4. Glosario por página
// ---------------------------------------------------------------------------

function glossaryAlerts(esText, enText) {
  const alerts = [];
  for (const term of GLOSSARY) {
    if (!term.es.test(esText)) continue;
    const ok = term.en.some((re) => re.test(enText));
    if (!ok) {
      alerts.push(
        `"${term.label}" aparece en ES pero no se encontró su traducción esperada en EN (${term.en
          .map((r) => r.source)
          .join(' | ')}).`
      );
    }
  }
  return alerts;
}

// ---------------------------------------------------------------------------
// 5. Run
// ---------------------------------------------------------------------------

const allPairs = [...pagePairsFromPosts(), ...STATIC_PAIRS].filter(
  (p) => !pagesFilter || pagesFilter.has(p.slug)
);

const results = allPairs.map((pair) => {
  const esRaw = readFileSync(path.join(ROOT, pair.es), 'utf8');
  const enRaw = readFileSync(path.join(ROOT, pair.en), 'utf8');
  const esBlocks = extractBlocks(esRaw);
  const enBlocks = extractBlocks(enRaw);
  const alerts = glossaryAlerts(
    esBlocks.map((b) => b.text).join(' '),
    enBlocks.map((b) => b.text).join(' ')
  );
  return { pair, esBlocks, enBlocks, alerts };
});

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

const withAlerts = results.filter((r) => r.alerts.length > 0);
if (withAlerts.length) {
  console.log(`\n\x1b[1mAlertas de glosario\x1b[0m (${withAlerts.length} página(s)):\n`);
  for (const r of withAlerts) {
    console.log(`\x1b[31m● ${r.pair.slug}\x1b[0m`);
    for (const a of r.alerts) console.log(`    ${a}`);
  }
} else {
  console.log('\nSin alertas de glosario en ninguna página.');
}

if (glossaryOnly) process.exit(0);

console.log(`\n\x1b[1m${'─'.repeat(70)}\x1b[0m`);
console.log('Texto alineado por página, para revisión de traducción (fidelidad,');
console.log('calcos, tono). No es un juicio automático — es la lectura rápida.\n');

for (const r of results) {
  console.log(`\n\x1b[1m\x1b[36m▸ ${r.pair.slug}\x1b[0m  (${r.pair.es} ↔ ${r.pair.en})`);
  const n = Math.max(r.esBlocks.length, r.enBlocks.length);
  for (let i = 0; i < n; i++) {
    const es = r.esBlocks[i];
    const en = r.enBlocks[i];
    console.log(`\n  [${i + 1}] \x1b[2m<${es?.tag ?? '—'} / ${en?.tag ?? '—'}>\x1b[0m`);
    console.log(`  ES: ${es ? es.text : '\x1b[33m(sin bloque correspondiente)\x1b[0m'}`);
    console.log(`  EN: ${en ? en.text : '\x1b[33m(sin bloque correspondiente)\x1b[0m'}`);
  }
}

console.log(`\n${allPairs.length} página(s) comparadas. Usa --pages=slug1,slug2 para acotar,`);
console.log('--glossary-only para saltar el texto alineado, --json para exportar.\n');
