#!/usr/bin/env node
// Guarda anti-divergencia entre los dos documentos legales: falla el build si el
// consentimiento del portal de pacientes remite a una política de un tercero que
// el aviso de privacidad de este sitio NO menciona.
//
// POR QUÉ: son dos documentos en dos repositorios distintos que tienen que decir
// lo mismo, y hasta hoy nada lo vigilaba. La paciente marca «Acepto» en
// pacientes.inessentia.mx sobre una frase que enumera a quién se le entregan sus
// datos, y esa misma frase la manda a leer el aviso publicado aquí. Si los dos
// no coinciden, acepta una cosa y lee otra.
//
// No es hipotético: el 2026-09-05 el consentimiento ya remitía a la política de
// Bisimplex y el aviso publicado no nombraba esa palabra ni una vez — habían
// divergido durante días sin que nadie se enterara, y sólo salió porque una
// sesión estaba comprobando otra cosa. El CONTRATO.md §8.3.1 del repo hermano
// declara este hueco y admite no poder cerrarlo desde su lado: su suite de
// pruebas no puede leer este sitio. Esta guarda lo cierra desde el único punto
// que sí se ejecuta solo en los dos mundos — el build de .github/workflows/deploy.yml.
//
// QUÉ COMPARA, Y POR QUÉ LOS ENLACES Y NO EL TEXTO: mira los DOMINIOS a los que
// el portal enlaza, no los nombres que escribe. Una lista de nombres propios
// extraída de prosa se rompe con cualquier reescritura —y el portal está siendo
// reescrito ahora mismo, con el consentimiento fundiéndose en un onboarding—,
// mientras que un enlace a la política de un tercero es justo lo que aparece
// cuando se añade un tercero de verdad. Es también el fallo exacto que ocurrió:
// el portal enlazaba a bisimplex.com y el aviso no.
//
// LO QUE NO ATRAPA, dicho de frente: un tercero nombrado en el portal SIN
// enlazar su política. Ese caso se escapa. Se acepta a cambio de que la guarda
// no se rompa sola con cada cambio de redacción, que es la forma en que estas
// cosas dejan de servir.
//
// SI NO HAY RED: en CI falla (cerrado). En local sólo avisa, para no volver
// imposible trabajar sin conexión — `npm run build` no necesitaba red hasta hoy
// y no es esta guarda quien debe cambiar eso para quien está escribiendo una
// entrada del blog en un avión. `CI` lo pone GitHub Actions solo, así que no hay
// ninguna bandera que alguien pueda dejarse puesta por descuido.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORTAL = 'https://pacientes.inessentia.mx/';
const PLAZO_MS = 15000;

// Las dos caras del aviso. Las dos tienen que nombrar a todos: una paciente que
// lee en inglés acepta lo mismo que una que lee en español.
const AVISOS = ['dist/es/privacidad/index.html', 'dist/en/privacy/index.html'];

// Dominios del portal que NO son la política de un encargado y por tanto no
// tienen que aparecer en el aviso. Lista corta y explícita a propósito: cada
// entrada nueva aquí es una excepción que alguien tuvo que justificar.
const NO_SON_TERCEROS = [
  'inessentia.mx',   // el propio sitio y el propio portal
  'wa.me',           // el WhatsApp de contacto, no un tratamiento de datos
  'w3.org',
  'schema.org',
];

const esExcepcion = (host) =>
  NO_SON_TERCEROS.some((d) => host === d || host.endsWith(`.${d}`));

function dominiosDelPortal(html) {
  const hosts = new Set();
  for (const m of html.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) {
    const host = m[1].toLowerCase().replace(/^www\./, '');
    if (!esExcepcion(host)) hosts.add(host);
  }
  return [...hosts].sort();
}

// ── EL PISO: terceros que el aviso tiene que nombrar SIEMPRE ────────────────
// La comparación de arriba es reactiva: sólo exige lo que el portal enlaza. Eso
// deja fuera a un encargado que recibe datos sin que el consentimiento del
// portal lo enlace — y no es hipotético: Resend entrega los correos que se le
// mandan a la paciente (su nombre, su correo, y dentro del adjunto de una
// factura su RFC y su razón social) sin que el portal remita a su política ni
// una vez. La guarda reactiva le pasaba por debajo.
//
// Esta lista es un piso, no un techo: lo que esté aquí no puede desaparecer del
// aviso sin que el build falle. Se comprueba ANTES de tocar la red, para que
// también proteja a quien construye sin conexión.
//
// SÓLO CABEN TERCEROS CON POLÍTICA ENLAZADA. Zoom y Google Calendar se nombran
// en el aviso en prosa y sin enlace, así que un dominio no los detecta y esta
// guarda NO los cubre. Que estén nombrados lo sostiene que alguien lo lea.
const TERCEROS_OBLIGATORIOS = [
  { host: 'resend.com', porque: 'entrega los correos que se le mandan a la paciente' },
  { host: 'stripe.com', porque: 'cobra con tarjeta y SPEI; recibe nombre y correo' },
  { host: 'anthropic.com', porque: 'recibe el texto del asistente de agenda' },
  { host: 'bisimplex.com', porque: 'opera FacturaGorila, que recibe los datos fiscales' },
  { host: 'facturagorila.com', porque: 'timbra los comprobantes con los datos fiscales' },
];

const sinPiso = [];
for (const rel of TERCEROS_OBLIGATORIOS.length ? AVISOS : []) {
  const abs = path.join(RAIZ, rel);
  if (!existsSync(abs)) {
    console.error(`[check-terceros] no existe ${rel} — corré "astro build" antes de esta guarda.`);
    process.exit(1);
  }
  const aviso = readFileSync(abs, 'utf8');
  for (const t of TERCEROS_OBLIGATORIOS) {
    if (!aviso.includes(t.host)) sinPiso.push({ rel, ...t });
  }
}

if (sinPiso.length > 0) {
  console.error(
    `\n[check-terceros] el aviso dejó de nombrar a ${sinPiso.length} tercero(s) que SÍ reciben datos:\n`
  );
  for (const f of sinPiso) console.error(`  ${f.host}  →  falta en ${f.rel}  (${f.porque})`);
  console.error(
    '\n  Estos no dependen de que el portal los enlace: reciben datos igual.\n' +
    '  Si uno dejó de ser encargado de verdad, quitalo de TERCEROS_OBLIGATORIOS\n' +
    '  en este archivo y dejá dicho por qué en el mensaje del commit.\n'
  );
  process.exit(1);
}

const enCI = process.env.CI === 'true' || process.env.CI === '1';

let html;
try {
  const r = await fetch(PORTAL, { signal: AbortSignal.timeout(PLAZO_MS) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  html = await r.text();
} catch (exc) {
  const msg = `[check-terceros] no se pudo leer ${PORTAL}: ${exc.message}`;
  if (enCI) {
    console.error(`${msg}\n  En CI esto falla cerrado: sin poder comprobarlo, el aviso no se publica.`);
    process.exit(1);
  }
  console.warn(`${msg}\n  (aviso local, no bloquea; en CI sí fallaría)`);
  process.exit(0);
}

const terceros = dominiosDelPortal(html);
if (terceros.length === 0) {
  console.error(
    '[check-terceros] el portal no enlazó a ningún tercero.\n' +
    '  O cambió su estructura, o esta guarda dejó de ver lo que miraba.\n' +
    '  Un cero aquí NO significa «todo bien»: significa que no se comprobó nada.'
  );
  process.exit(1);
}

const faltantes = [];
for (const rel of AVISOS) {
  const abs = path.join(RAIZ, rel);
  if (!existsSync(abs)) {
    console.error(`[check-terceros] no existe ${rel} — corré "astro build" antes de esta guarda.`);
    process.exit(1);
  }
  const aviso = readFileSync(abs, 'utf8');
  for (const host of terceros) {
    if (!aviso.includes(host)) faltantes.push({ rel, host });
  }
}

if (faltantes.length > 0) {
  console.error(
    `\n[check-terceros] el consentimiento del portal remite a ${faltantes.length} política(s) que el aviso no menciona:\n`
  );
  for (const f of faltantes) console.error(`  ${f.host}  →  falta en ${f.rel}`);
  console.error(
    '\n  La paciente aceptaría una lista de terceros y leería otra.\n' +
    '  Añadí ese tercero al aviso (src/pages/es/privacidad.astro y src/pages/en/privacy.astro),\n' +
    '  o —si de verdad no es un encargado— documentá por qué en NO_SON_TERCEROS de este archivo.\n'
  );
  process.exit(1);
}

console.log(
  `[check-terceros] OK — piso de ${TERCEROS_OBLIGATORIOS.length} tercero(s) obligatorio(s) presente, ` +
  `y el aviso nombra las ${terceros.length} política(s) a las que remite el portal: ${terceros.join(', ')}.`
);
