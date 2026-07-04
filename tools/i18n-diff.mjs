#!/usr/bin/env node
/**
 * Compara páginas ES vs EN y marca discrepancias sospechosas:
 *  - términos técnicos del glosario mal traducidos o ausentes
 *  - texto en EN que dejó español sin traducir (acentos, ¿ ¡)
 *  - calcos / falsos amigos comunes del español al inglés
 *  - deriva estructural: distinto número de párrafos, o un párrafo
 *    mucho más corto/largo de lo esperado (posible aplanamiento de tono)
 *
 * No reemplaza una lectura humana — es un filtro de precisión para saber
 * qué páginas llevar a revisión en Cowork, con la línea exacta a mirar.
 *
 * Uso: node tools/i18n-diff.mjs [--json] [--only=slug1,slug2]
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const onlyArg = args.find((a) => a.startsWith('--only='));
const onlyFilter = onlyArg ? new Set(onlyArg.split('=')[1].split(',')) : null;

// ---------------------------------------------------------------------------
// 1. Descubrir pares de páginas ES/EN
// ---------------------------------------------------------------------------

function pagePairsFromPosts() {
  const src = readFileSync(path.join(ROOT, 'src/data/posts.ts'), 'utf8');
  const pairs = [];
  // Cada entrada trae id/slugEs/slugEn como líneas propias (ver posts.ts)
  const idRe = /id:\s*'([^']+)'/g;
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
//    Si el ES aparece en la página, se espera que el EN traiga alguna de
//    las variantes válidas. Añade términos aquí según crezca el sitio.
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
// Nota: se dejaron fuera del glosario términos genéricos como "terapia
// corporal" o "trauma" — tienen varias traducciones naturales válidas
// (body-based therapy / body therapy / somatic therapy) y generaban falsos
// positivos. El glosario solo cubre nombres propios/técnicos con una
// traducción fija esperada.

// Calcos / falsos amigos comunes ES→EN (no exhaustivo, pero cazan los
// errores típicos de traducción literal en textos de psicología/terapia).
const CALQUE_PATTERNS = [
  { re: /\brealize the therapy\b|\brealize a session\b/i, note: '"realize" usado como "realizar" (hacer) — calco directo' },
  { re: /\bassist to\b/i, note: '"assist to" — calco de "asistir a" (debería ser "attend")' },
  { re: /\bpretend to\b/i, note: '"pretend to" — posible calco de "pretender" (debería ser "intend to")' },
  { re: /\bsensible\b/i, note: '"sensible" — revisa si el ES decía "sensible" (sería "sensitive"), falso amigo clásico' },
  { re: /\bactual\b(?!ly)/i, note: '"actual" — revisa si el ES decía "actual" (sería "current"), falso amigo' },
  { re: /\bin the other hand\b/i, note: '"in the other hand" — calco; la expresión correcta es "on the other hand"' },
  { re: /\baccording to me\b/i, note: '"according to me" — calco de "según yo"; en inglés natural sería "in my view" / "I think"' },
  { re: /\bhave (\d+|many|a lot of) years?\b/i, note: '"have X years" — calco de "tener X años"; en inglés es "be X years old" / "for X years"' },
];

// Señal fuerte: quedó texto en español sin traducir dentro de la página EN
// (o viceversa) — acentos, ¿ ¡, o palabras españolas comunes.
const SPANISH_LEFTOVER_RE = /[¿¡]|[áéíóúñÁÉÍÓÚÑ]{1}\w*(?:ción|dad|mente)\b/;
const ENGLISH_LEFTOVER_RE = /\b(the|and|with|from|through|because|however)\b/i;

// ---------------------------------------------------------------------------
// 3. Extracción de texto visible de un .astro
// ---------------------------------------------------------------------------

function extractBlocks(raw) {
  // Quita el frontmatter (--- ... ---) y los <script>/<style>
  let body = raw.replace(/^---[\s\S]*?---/, '');
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');

  const blocks = [];
  const tagRe = /<(h1|h2|h3|p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = tagRe.exec(body))) {
    let text = m[2]
      .replace(/<[^>]+>/g, ' ') // quita sub-tags (strong, em, a, etc.)
      .replace(/\{[^{}]*\}/g, ' ') // quita expresiones Astro tipo {i.foo}
      .replace(/&amp;/g, '&')
      .replace(/&mdash;/g, '—')
      .replace(/\s+/g, ' ')
      .trim();
    if (text && !/^\s*$/.test(text)) {
      blocks.push({ tag: m[1].toLowerCase(), text });
    }
  }
  return blocks;
}

function wordCount(s) {
  return (s.match(/[\p{L}’']+/gu) || []).length;
}

// ---------------------------------------------------------------------------
// 4. Análisis de un par de páginas
// ---------------------------------------------------------------------------

function analyzePair(pair) {
  const esRaw = readFileSync(path.join(ROOT, pair.es), 'utf8');
  const enRaw = readFileSync(path.join(ROOT, pair.en), 'utf8');
  const esBlocks = extractBlocks(esRaw);
  const enBlocks = extractBlocks(enRaw);
  const esText = esBlocks.map((b) => b.text).join(' ');
  const enText = enBlocks.map((b) => b.text).join(' ');

  const flags = [];

  // --- Glosario ---
  for (const term of GLOSSARY) {
    const inEs = term.es.test(esText);
    if (!inEs) continue;
    const okInEn = term.en.some((re) => re.test(enText));
    if (!okInEn) {
      flags.push({
        severity: 'alta',
        type: 'glosario',
        detail: `"${term.label}" aparece en ES pero no se encontró su traducción esperada en EN (${term.en.map((r) => r.source).join(' | ')}).`,
      });
    }
  }

  // --- Deriva estructural: número de bloques ---
  if (esBlocks.length !== enBlocks.length) {
    flags.push({
      severity: 'media',
      type: 'estructura',
      detail: `Distinto número de bloques de texto: ES tiene ${esBlocks.length}, EN tiene ${enBlocks.length}. Puede indicar un párrafo fusionado, cortado, o no traducido.`,
    });
  }

  // --- Ratio de longitud por párrafo (proxy de aplanamiento de tono) ---
  const n = Math.min(esBlocks.length, enBlocks.length);
  const ratios = [];
  for (let i = 0; i < n; i++) {
    // Los encabezados se adaptan libremente por longitud (títulos cortos);
    // solo vale la pena medir la proporción en párrafos y listas.
    if (esBlocks[i].tag !== enBlocks[i]?.tag || !['p', 'li'].includes(esBlocks[i].tag)) continue;
    const esW = wordCount(esBlocks[i].text);
    const enW = wordCount(enBlocks[i].text);
    if (esW < 10) continue; // ignora bloques muy cortos (labels, CTAs, frases sueltas)
    const ratio = enW / esW;
    ratios.push(ratio);
    if (ratio < 0.55 || ratio > 1.7) {
      flags.push({
        severity: ratio < 0.4 || ratio > 2 ? 'alta' : 'media',
        type: 'longitud',
        index: i,
        detail: `Párrafo ${i + 1}: ES ${esW} palabras vs EN ${enW} palabras (ratio ${ratio.toFixed(2)}) — posible resumen/aplanamiento o expansión inesperada.`,
        es: esBlocks[i].text.slice(0, 160),
        en: enBlocks[i].text.slice(0, 160),
      });
    }
  }

  // --- Texto en español sobreviviente en la página EN ---
  for (let i = 0; i < enBlocks.length; i++) {
    if (SPANISH_LEFTOVER_RE.test(enBlocks[i].text) && !ENGLISH_LEFTOVER_RE.test(enBlocks[i].text)) {
      flags.push({
        severity: 'alta',
        type: 'sin-traducir',
        index: i,
        detail: `Bloque EN ${i + 1} parece tener texto en español sin traducir.`,
        en: enBlocks[i].text.slice(0, 160),
      });
    }
  }

  // --- Calcos / falsos amigos en EN ---
  for (let i = 0; i < enBlocks.length; i++) {
    for (const pat of CALQUE_PATTERNS) {
      if (pat.re.test(enBlocks[i].text)) {
        flags.push({
          severity: 'media',
          type: 'calco',
          index: i,
          detail: `Bloque EN ${i + 1}: ${pat.note}`,
          en: enBlocks[i].text.slice(0, 160),
        });
      }
    }
  }

  return { pair, esBlocks, enBlocks, flags };
}

// ---------------------------------------------------------------------------
// 5. Run
// ---------------------------------------------------------------------------

const allPairs = [...pagePairsFromPosts(), ...STATIC_PAIRS].filter(
  (p) => !onlyFilter || onlyFilter.has(p.slug)
);

const results = allPairs.map(analyzePair).filter((r) => r.flags.length > 0);

// Ordena por severidad (más "alta" primero) y cantidad de flags
const sevScore = { alta: 2, media: 1 };
results.sort((a, b) => {
  const scoreA = a.flags.reduce((s, f) => s + sevScore[f.severity], 0);
  const scoreB = b.flags.reduce((s, f) => s + sevScore[f.severity], 0);
  return scoreB - scoreA;
});

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

console.log(`\nComparación ES/EN — ${allPairs.length} páginas revisadas, ${results.length} con discrepancias sospechosas.\n`);

for (const r of results) {
  const scoreA = r.flags.filter((f) => f.severity === 'alta').length;
  const scoreM = r.flags.filter((f) => f.severity === 'media').length;
  console.log(`\n\x1b[1m${r.pair.slug}\x1b[0m  (${r.pair.es} ↔ ${r.pair.en})  [${scoreA} alta, ${scoreM} media]`);
  for (const f of r.flags) {
    const color = f.severity === 'alta' ? '\x1b[31m' : '\x1b[33m';
    console.log(`  ${color}● [${f.type}]\x1b[0m ${f.detail}`);
    if (f.es) console.log(`      ES: ${f.es}${f.es.length >= 160 ? '…' : ''}`);
    if (f.en) console.log(`      EN: ${f.en}${f.en.length >= 160 ? '…' : ''}`);
  }
}

console.log(`\n${results.length} página(s) marcadas para revisión de ${allPairs.length} totales.`);
console.log('Tip: usa --json para exportar y --only=slug1,slug2 para acotar.\n');
