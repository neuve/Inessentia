#!/usr/bin/env node
/**
 * Trae `src/data/diez-anos.json` desde el repo de Cadencia, que es quien lo
 * produce: corre ahí `bin/cadencia export-publico` y copia el
 * `publico/data/agregados.json` que sale.
 *
 * Por qué existe: ese JSON es generado y NO se edita a mano (ver CLAUDE.md),
 * pero hasta ahora "regenerarlo" eran tres pasos recordados de memoria en
 * otro repo — correr el export, acordarse de la carpeta de salida, copiar el
 * archivo al sitio. El paso que más fácil se olvidaba era el primero, y el
 * síntoma es silencioso: el sitio compila igual y publica el corte viejo.
 *
 * Por qué corre el export en vez de sólo copiar: `publico/` es una carpeta de
 * salida, así que el archivo que hay ahí es de la última vez que alguien
 * corrió el export, no del estado de la base. Copiar sin regenerar
 * reproduciría exactamente el bug que este script viene a cerrar.
 *
 * NO toca la base de datos de Cadencia: `export-publico` sólo lee. Si el
 * corte que pides no está construido, Cadencia falla con un mensaje que dice
 * qué cortes sí tiene — este script lo deja pasar tal cual en vez de
 * interpretarlo.
 *
 * Uso:
 *   npm run data:diez-anos                    → último corte disponible
 *   npm run data:diez-anos -- --as-of=2026-08-09   → un corte específico
 *   npm run data:diez-anos -- --check         → no escribe; sale 1 si hay cambios
 *
 * El repo de Cadencia se busca en ../cadencia-inessentia; CADENCIA_REPO lo
 * cambia.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(ROOT, 'src/data/diez-anos.json');
const CADENCIA = resolve(process.env.CADENCIA_REPO ?? join(ROOT, '../cadencia-inessentia'));

const args = process.argv.slice(2);
const check = args.includes('--check');
const asOf = args.find((a) => a.startsWith('--as-of='))?.slice('--as-of='.length);

function morir(mensaje) {
  console.error(`✗ ${mensaje}`);
  process.exit(1);
}

const cli = join(CADENCIA, 'bin/cadencia');
if (!existsSync(cli)) {
  morir(
    `no encuentro el repo de Cadencia en ${CADENCIA}.\n` +
      `  Clónalo junto a este repo, o apunta CADENCIA_REPO a donde esté:\n` +
      `  CADENCIA_REPO=/ruta/a/cadencia-inessentia npm run data:diez-anos`,
  );
}

/**
 * El corte a exportar. Cadencia trae su propio default
 * (`config.DEFAULT_AS_OF`), pero es una fecha clavada a mano que se queda
 * atrás de la base en cuanto entra un `rebuild` nuevo, y entonces
 * `export-publico` falla diciendo que ese corte no existe. Para el sitio la
 * respuesta correcta es siempre "el corte más reciente que la base tenga",
 * así que se le pregunta a la base — la misma consulta que el CLI usa
 * internamente, en modo sólo-lectura.
 *
 * Si por lo que sea no se puede resolver, se deja que Cadencia use su
 * default: fallará con su propio mensaje, que dice qué cortes sí hay.
 */
function ultimoCorte() {
  const db = join(CADENCIA, 'cadencia.db');
  if (!existsSync(db)) return null;
  try {
    const salida = execFileSync(
      'python3',
      [
        '-c',
        'import sqlite3,sys\n' +
          'c=sqlite3.connect("file:"+sys.argv[1]+"?mode=ro",uri=True)\n' +
          'print(c.execute("SELECT MAX(as_of) FROM metrics_snapshot").fetchone()[0] or "")',
        db,
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(salida) ? salida : null;
  } catch {
    return null;
  }
}

const corte = asOf ?? ultimoCorte();
console.log(`· Regenerando el agregado en ${CADENCIA}${corte ? ` (corte ${corte})` : ''} …`);
try {
  execFileSync(cli, ['export-publico'], {
    cwd: CADENCIA,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: corte ? { ...process.env, CADENCIA_AS_OF: corte } : process.env,
  });
} catch {
  // Cadencia ya explicó el porqué en stderr (heredado arriba): cortes
  // disponibles, base ausente, etc. Repetirlo con otras palabras sólo
  // taparía el mensaje bueno.
  morir('`bin/cadencia export-publico` falló — ver el error de arriba.');
}

const origen = join(CADENCIA, 'publico/data/agregados.json');
if (!existsSync(origen)) morir(`el export corrió pero no dejó ${origen}.`);

const nuevo = readFileSync(origen, 'utf8');
const previo = existsSync(DESTINO) ? readFileSync(DESTINO, 'utf8') : null;

// El agregado es público por construcción: `build_agregados_publico` reduce
// del lado de Cadencia, sobre las filas sin seudonimizar, justamente para que
// ni un microdato por persona cruce la frontera del repo. Si algún día
// apareciera aquí una lista de fichas, es que esa garantía se rompió allá, y
// vale más romper la copia que publicarla.
const datos = JSON.parse(nuevo);
if (Array.isArray(datos.rows) || Array.isArray(datos.personas)) {
  morir(
    'el archivo trae filas por persona, no un agregado. No lo copio.\n' +
      '  Revisa `build_agregados_publico` en cadencia/export.py antes de seguir.',
  );
}

const k = datos.hero_kpis ?? {};
const resumen = `corte ${datos.corte} · ${k.personas_atendidas} personas · ${k.sesiones_acompanadas} sesiones`;

if (previo === nuevo) {
  console.log(`· Sin cambios (${resumen}).`);
  process.exit(0);
}

if (check) {
  console.error(`✗ ${DESTINO.replace(ROOT + '/', '')} está desactualizado (${resumen}).`);
  console.error('  Corre `npm run data:diez-anos` y commitea el resultado.');
  process.exit(1);
}

writeFileSync(DESTINO, nuevo);
const antes = previo ? JSON.parse(previo).corte : null;
console.log(`✓ ${DESTINO.replace(ROOT + '/', '')} actualizado — ${resumen}${antes ? ` (venía de ${antes})` : ''}.`);
