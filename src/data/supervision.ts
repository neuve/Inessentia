// Grupo de Actualización en Terapia Corporal — fuente única del ciclo.
//
// La consumen la página del grupo (/es/supervision/), las memorias de cada
// sesión (/es/supervision/sesion-N/) y la lectura de entrada, para que las
// tres hablen del mismo calendario y enlacen lo mismo.
//
// PARA PUBLICAR LA MEMORIA DE UNA SESIÓN NUEVA (2 a 9):
//   1. Llena aquí su bloque `memoria` (título, bajada, og) y, si los hay,
//      `lectura` y `audio`. El audio va en public/uploads/audio/ como MP3 mono
//      de 64 kbps; anota su duración en segundos.
//   2. Copia src/pages/es/supervision/sesion-1.astro a sesion-N.astro, cambia
//      `n` y escribe la prosa en sus slots.
//   3. La navegación entre sesiones, la tarjeta en /es/supervision/ y el
//      llamado a inscribirse salen solos de este archivo.
//
// PRIVACIDAD — regla de toda memoria: se publican las IDEAS de la sesión, no
// sus historias. Nada identificable de participantes ni de consultantes
// (nombres, casos, motivos de consulta, anécdotas reconocibles). Las únicas
// atribuciones son a maestros y a escuelas o corrientes.

export const SUPERVISION_PATH = '/es/supervision/';
export const SUPERVISION_NOMBRE = 'Grupo de Actualización en Terapia Corporal';

export const SUPERVISION_WA =
  'https://wa.me/patriciomx?text=Hola%20Patricio%2C%20me%20interesa%20el%20Grupo%20de%20Actualizaci%C3%B3n%20en%20Terapia%20Corporal.%20%C2%BFMe%20cuentas%20m%C3%A1s%3F';

export interface Lectura {
  titulo: string;
  href: string;
  /** Una línea: de qué va y para qué se leyó. */
  nota: string;
}

export interface AudioResumen {
  /** Ruta del master bajo /uploads/ (se resuelve a su URL hasheada). */
  src: string;
  titulo: string;
  segundos: number;
  bytes: number;
}

export interface Memoria {
  titulo: string;
  /** Frase que resume la sesión; va de subtítulo y de descripción. */
  bajada: string;
  ogImage: string;
  publicada: string; // ISO
}

export interface Sesion {
  n: number;
  /** Tema del recorrido (capítulos de «The Ethics of Caring»). */
  tema: string;
  fechaISO: string;
  fecha: string;
  /** Nota logística que acompaña la fecha en el calendario. */
  nota: string;
  memoria?: Memoria;
  lectura?: Lectura;
  audio?: AudioResumen;
}

export const sesiones: Sesion[] = [
  {
    n: 1,
    tema: 'Introducción',
    fechaISO: '2026-10-03',
    fecha: 'Sábado 3 de octubre de 2026',
    nota: 'Inicio',
    memoria: {
      titulo: 'El quehacer terapéutico',
      bajada: 'Qué hace terapia a la terapia, de qué sí nos hacemos cargo y por qué este oficio necesita alianzas más que heroínas.',
      ogImage: '/uploads/og/supervision-sesion-1.webp',
      publicada: '2026-10-04',
    },
    lectura: {
      titulo: 'Presencia, alianza, mirada y permiso',
      href: '/es/blog/presencia-alianza-mirada-permiso/',
      nota: 'Los cuatro niveles de un arco terapéutico y lo que nos ofrecemos entre terapeutas al supervisar.',
    },
    audio: {
      src: '/uploads/audio/supervision-sesion-1-resumen.mp3',
      titulo: 'Resumen de la sesión 1: el quehacer terapéutico',
      segundos: 1267,
      bytes: 10139523,
    },
  },
  { n: 2, tema: 'Dinero', fechaISO: '2026-10-17', fecha: 'Sábado 17 de octubre de 2026', nota: '' },
  { n: 3, tema: 'Sexualidad', fechaISO: '2026-10-31', fecha: 'Sábado 31 de octubre de 2026', nota: '' },
  { n: 4, tema: 'Poder', fechaISO: '2026-11-14', fecha: 'Sábado 14 de noviembre de 2026', nota: '' },
  { n: 5, tema: 'Amor', fechaISO: '2026-12-05', fecha: 'Sábado 5 de diciembre de 2026', nota: '2ª exhibición del plan en 2 pagos' },
  { n: 6, tema: 'Verdad', fechaISO: '2026-12-12', fecha: 'Sábado 12 de diciembre de 2026', nota: '' },
  { n: 7, tema: 'Insight', fechaISO: '2027-01-09', fecha: 'Sábado 9 de enero de 2027', nota: 'Reanuda' },
  { n: 8, tema: 'Unidad', fechaISO: '2027-01-16', fecha: 'Sábado 16 de enero de 2027', nota: '' },
  { n: 9, tema: 'Cierre', fechaISO: '2027-02-06', fecha: 'Sábado 6 de febrero de 2027', nota: 'Cierre' },
];

export function getSesion(n: number): Sesion {
  const s = sesiones.find((x) => x.n === n);
  if (!s) throw new Error(`supervision.ts: no existe la sesión ${n}`);
  return s;
}

export function memoriaPath(n: number): string {
  return `${SUPERVISION_PATH}sesion-${n}/`;
}

/** Fecha corta para la navegación entre sesiones: «3 oct», «9 ene». */
export function fechaCorta(s: Sesion): string {
  const [, m, d] = s.fechaISO.split('-').map(Number);
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d} ${meses[m - 1]}`;
}

/** «21 min» a partir de los segundos del audio. */
export function minutos(segundos: number): string {
  return `${Math.round(segundos / 60)} min`;
}

// Llamado a sumarse. Vive aquí para que la página del grupo, las memorias y la
// lectura inviten con las mismas palabras. Sin cifras ni fechas: las
// condiciones para integrarse con el ciclo ya iniciado las da Patricio por
// WhatsApp.
export const LLAMADO = {
  rotulo: 'El grupo sigue abierto',
  titulo: 'Todavía puedes sumarte',
  texto: 'El ciclo ya empezó y las inscripciones siguen abiertas. Lee la memoria, escucha el resumen y, si esto es lo que quieres para tu práctica, escríbeme: te cuento cómo integrarte.',
  boton: 'Quiero sumarme',
};
