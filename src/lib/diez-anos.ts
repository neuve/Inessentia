// Cálculos de presentación para «Diez años en números» (/es/diez-anos/,
// /en/ten-years/), a partir de src/data/diez-anos.json.
//
// Ese JSON ya es agregado —lo produce `cadencia/export.py:build_agregados_publico`
// del lado del servidor, sin microdato por persona— así que aquí NO se
// recalcula nada sobre datos crudos; solo se reordena y da forma a lo que ya
// viene contado, igual que hacían los `render*()` de `front/publico.html`
// sobre los mismos números, pero del lado del cliente. `src/data/diez-anos.json`
// es generado: no se edita a mano — ver CLAUDE.md.
import raw from '../data/diez-anos.json';

export type Locale = 'es' | 'en';

interface AgregadosBanda {
  id: string;
  n: number;
  pct: number;
  n_mediana: number;
  mediana_dias: number | null;
  mediana_sesiones: number | null;
}

interface Agregados {
  corte: string;
  hero_kpis: {
    personas_atendidas: number;
    sesiones_acompanadas: number;
    primer_anio: number;
    anios_practica: number;
    en_curso_hoy: number;
  };
  bandas_permanencia: {
    total_procesos: number;
    bandas: AgregadosBanda[];
    mediana_general: { n_mediana: number; mediana_dias: number | null; mediana_sesiones: number | null };
    sesiones_totales: number;
    sesiones_banda_vida: number;
    personas_una_sesion: number;
  };
  sesiones_por_mes: { anio_desde: number; anio_hasta: number; sesiones_por_mes: number[] };
  rejilla_dia_hora: { grid: number[][]; total_sesiones: number; total_con_horario: number; sesiones_suprimidas: number };
  modalidad_barra: { presencial: number; online: number; hibrido: number; sin_dato: number; n_procesos_base3: number };
  piramide_edad_genero: {
    piramide: Record<string, { mujer: number; hombre: number }>;
    personas_total: number;
    personas_sin_clasificar: number;
    personas_suprimidas: number;
  };
  duracion_por_grupo: {
    n_base3_total: number;
    por_genero: { lbl: string; n: number; mediana_dias: number | null; mediana_sesiones: number | null }[];
    por_edad: { lbl: string; n: number; mediana_dias: number | null; mediana_sesiones: number | null }[];
    por_tipo_proceso: { lbl: string; n: number; mediana_dias: number | null; mediana_sesiones: number | null }[];
    // Procesos que cayeron en un grupo con menos de 5 casos y por eso se
    // omitieron ENTEROS de las tres listas de arriba (no basta con poner la
    // celda en 0: la mediana de un grupo de 1-4 es casi el dato exacto de
    // esas personas). Ver `_UMBRAL_SUPRESION_CELDA` en cadencia/export.py.
    procesos_suprimidos: number;
  };
  excluidos: { procesos_menos_de_3_sesiones: number };
}

export const agregados = raw as Agregados;

// Mismos cortes que `_BANDAS_PERMANENCIA` en `cadencia/export.py` y que
// `BANDAS` en `front/publico.html` (acuerdo del terapeuta, 2026-08-04):
// 1-3 / 4-7 / 8-21 / 22+. El color sube de intensidad con la profundidad.
export const BANDAS_ORDEN = ['inicial', 'basico', 'profundo', 'vida'] as const;
export const BANDAS_COLOR: Record<string, string> = {
  inicial: 'var(--border-card)',
  basico: 'var(--sand-d)',
  profundo: 'var(--wine)',
  vida: 'var(--purple)',
};

const MESES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function mesesCortos(locale: Locale): string[] {
  return locale === 'es' ? MESES_ES : MESES_EN;
}

// weekday 0 = lunes (ver `_auditoria_publica`/rejilla_dia_hora en export.py).
const DIAS_SEM_ES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const DIAS_SEM_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const DIA_LARGO_ES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const DIA_LARGO_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export function diasSemana(locale: Locale): string[] {
  return locale === 'es' ? DIAS_SEM_ES : DIAS_SEM_EN;
}
export function diasSemanaLargo(locale: Locale): string[] {
  return locale === 'es' ? DIA_LARGO_ES : DIA_LARGO_EN;
}

/** Días -> la unidad en que una persona piensa ese lapso. Espejo de
 * `duracionCorta()` en `front/publico.html`. */
export function duracionCorta(dias: number | null, locale: Locale): string {
  if (dias === null || dias === undefined || isNaN(dias)) return '—';
  if (dias < 60) {
    return locale === 'es'
      ? `${dias} ${dias === 1 ? 'día' : 'días'}`
      : `${dias} ${dias === 1 ? 'day' : 'days'}`;
  }
  const meses = Math.round(dias / 30.44);
  if (meses < 18) return locale === 'es' ? `${meses} meses` : `${meses} months`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  if (locale === 'es') {
    return `${anios}${anios === 1 ? ' año' : ' años'}${resto ? ' y ' + resto + ' m' : ''}`;
  }
  return `${anios}${anios === 1 ? ' year' : ' years'}${resto ? ' ' + resto + ' mo' : ''}`;
}

export function hero() {
  const k = agregados.hero_kpis;
  return {
    personas: k.personas_atendidas,
    sesiones: k.sesiones_acompanadas,
    primerAnio: k.primer_anio,
    corteAnio: +agregados.corte.slice(0, 4),
    anios: k.anios_practica,
    enCursoHoy: k.en_curso_hoy,
  };
}

export function bandas() {
  const b = agregados.bandas_permanencia;
  const total = b.total_procesos || 1;
  const minVida = 22; // ver BANDAS_ORDEN — 'vida' empieza en 22 sesiones
  const lista = BANDAS_ORDEN.map((id) => b.bandas.find((x) => x.id === id)!).filter(Boolean);
  return {
    lista,
    total: b.total_procesos,
    medianaGeneral: b.mediana_general,
    sesionesTotales: b.sesiones_totales,
    sesionesBandaVida: b.sesiones_banda_vida,
    personasUnaSesion: b.personas_una_sesion,
    vidaN: lista.find((x) => x.id === 'vida')?.n ?? 0,
    vidaPct: Math.round((100 * (lista.find((x) => x.id === 'vida')?.n ?? 0)) / total),
    sesVidaPct: Math.round((100 * b.sesiones_banda_vida) / (b.sesiones_totales || 1)),
    minVida,
  };
}

export function mesesDelAnio() {
  const s = agregados.sesiones_por_mes;
  const conteo = s.sesiones_por_mes;
  const orden = conteo
    .map((n, m) => ({ m, n }))
    .sort((a, b) => b.n - a.n);
  const llenos = orden.slice(0, 3).map((o) => o.m);
  const flacos = orden.slice(-3).map((o) => o.m).reverse();
  const maxS = Math.max(1, ...conteo);
  return { conteo, llenos, flacos, maxS, anioDesde: s.anio_desde, anioHasta: s.anio_hasta };
}

export function horarios() {
  const r = agregados.rejilla_dia_hora;
  const grid = r.grid; // [weekday 0..6][hora 0..23]
  let hMin = 24, hMax = -1;
  for (let wd = 0; wd < 7; wd++) {
    for (let h = 0; h < 24; h++) {
      if (grid[wd][h] > 0) {
        if (h < hMin) hMin = h;
        if (h > hMax) hMax = h;
      }
    }
  }
  if (hMin > hMax) { hMin = 7; hMax = 21; }
  let max = 1, picoWd = 0, picoH = hMin, picoN = 0;
  for (let wd = 0; wd < 7; wd++) {
    for (let h = hMin; h <= hMax; h++) {
      const n = grid[wd][h];
      max = Math.max(max, n);
      if (n > picoN) { picoN = n; picoWd = wd; picoH = h; }
    }
  }
  const faltan = r.total_sesiones - r.total_con_horario;
  return { grid, hMin, hMax, max, picoWd, picoH, picoN, totalSched: r.total_con_horario, totalAll: r.total_sesiones, faltan };
}

export function modalidad() {
  const m = agregados.modalidad_barra;
  const conDato = m.presencial + m.online + m.hibrido;
  const total = conDato || 1;
  return {
    presencial: m.presencial, online: m.online, hibrido: m.hibrido, sinDato: m.sin_dato,
    conDato, total, nBase3: m.n_procesos_base3,
    mayorPresencial: m.presencial >= m.online,
    pctPresencial: Math.round((100 * m.presencial) / total),
    pctOnline: Math.round((100 * m.online) / total),
    pctHibrido: Math.round((100 * m.hibrido) / total),
  };
}

// Orden de la pirámide, de mayor a menor edad (arriba->abajo), espejo de
// `TRAMOS_PIR` en `front/publico.html`.
export const TRAMOS_PIR = ['46 o más', '36 a 45', '26 a 35', '18 a 25', '17 o menos'];

export function piramide() {
  const p = agregados.piramide_edad_genero;
  const filas = TRAMOS_PIR.map((t) => ({ tramo: t, mujer: p.piramide[t]?.mujer ?? 0, hombre: p.piramide[t]?.hombre ?? 0 }));
  const max = Math.max(1, ...filas.map((f) => Math.max(f.mujer, f.hombre)));
  const totM = filas.reduce((s, f) => s + f.mujer, 0);
  const totH = filas.reduce((s, f) => s + f.hombre, 0);
  const ado = filas.find((f) => f.tramo === '17 o menos')!;
  const dentro = totM + totH;
  return {
    filas, max, totM, totH, dentro,
    fuera: p.personas_sin_clasificar,
    personasTotal: p.personas_total,
    adoM: ado.mujer, adoH: ado.hombre, adoTotal: ado.mujer + ado.hombre,
    suprimidas: p.personas_suprimidas,
  };
}

export function duracionPorGrupo() {
  return agregados.duracion_por_grupo;
}

export function excluidos() {
  return agregados.excluidos;
}

export const corte = agregados.corte;

// `duracion_por_grupo` y `piramide_edad_genero` traen sus etiquetas de grupo
// (género, tramo de edad, tipo de proceso) ya en español, escritas así por
// `cadencia/export.py` porque son categorías fijas, no texto libre. La
// página en inglés traduce aquí; si el catálogo de origen gana un grupo
// nuevo, esta tabla es el único lugar que hace falta tocar.
const ETIQUETA_EN: Record<string, string> = {
  'Mujer': 'Woman', 'Hombre': 'Man',
  'Individual': 'Individual', 'Pareja': 'Couple', 'Familiar': 'Family',
  '17 o menos': '17 or under', '18 a 25': '18–25', '26 a 35': '26–35',
  '36 a 45': '36–45', '46 o más': '46+',
};
export function etiqueta(lbl: string, locale: Locale): string {
  if (locale === 'es') return lbl;
  return ETIQUETA_EN[lbl] ?? lbl;
}
