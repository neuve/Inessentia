// Receta de los recortes fijos del hero cinema (home y sobre-mí) —
// FUENTE ÚNICA DE VERDAD. Nadie debe escribir a mano el object-position
// vertical de estos heroes nunca más.
//
// POR QUÉ EXISTE ESTE ARCHIVO: el hero cinema sirve, en desktop, un recorte
// apaisado fijo (public/uploads/hero-crops/*) en vez del retrato vertical
// original — ver SiteHeader.astro `photoDesktop`. Con object-fit:cover, si
// el object-position vertical `p` es igual a la fracción `f` a la que caen
// los ojos DENTRO del recorte, los ojos quedan a esa misma fracción del
// hero en cualquier ancho de viewport (la prueba está en el commit
// c7f68fc). El problema es que `f` depende de la caja de extracción del
// recorte: si alguien regenera el recorte con otra caja, `f` cambia, y un
// object-position escrito a mano en 4 archivos .astro se queda obsoleto SIN
// que nada lo detecte — eso ya pasó (el recorte del home pasó de 1300x731 a
// 1300x1089 y el encuadre quedó mal calibrado, ver check-immutable-urls.mjs).
//
// La cura: declarar aquí la caja de extracción Y la coordenada Y de los
// ojos EN EL MASTER (no en el recorte). tools/generate-responsive-images.mjs
// hace el .extract() con esta receta y CALCULA f = (eyesY - top) / height
// — el recorte y su f nacen del mismo número y no pueden desincronizarse.
//
// Coordenadas: todas en píxeles, en el sistema de coordenadas del MASTER
// (no del recorte final).

import path from 'node:path';

// LA REGLA DE ENCUADRE, en dos ejes (criterio del terapeuta, 2026-08-03):
//
//   VERTICAL   — la mirada va al TERCIO SUPERIOR del hero.
//   HORIZONTAL — el eje del sujeto va al TERCIO DERECHO. Nunca centrado.
//
// Ambas se cumplen eligiendo la caja `extract`, sin tocar CSS:
//
//   vertical:   el pipeline calcula f = (eyesY - top) / height y ese f
//               acaba siendo el object-position vertical, así que basta
//               con top = eyesY - height/3  =>  f = 1/3.
//
//   horizontal: el hero muestra SIEMPRE el ancho completo del recorte. La
//               caja del hero es más apaisada que el recorte, así que
//               object-fit:cover ajusta por ancho y lo que sobra se corta
//               de alto, no de ancho. Por eso la posición horizontal del
//               sujeto es exactamente headX/width del recorte, y como
//               `left` ya está en 0 (no hay más lienzo a la izquierda), el
//               tercio derecho se consigue con  width = headX / (2/3).
//
// headX y eyesY están MEDIDOS sobre el master con una regla dibujada encima,
// no derivados de un object-position previo. Ese fue el error del valor
// anterior de sobre-mí: eyesY salía de dar por hecho que su f=0.75 marcaba
// los ojos, y no los marcaba — de ahí que la mirada quedara al 75%, en el
// tercio INFERIOR.
//
// Masters regenerados el 2026-08-03 desde tomas con más lienzo alrededor del
// sujeto (~1.7x más lado, ~2.9x más área). Ese aire es lo que permite bajar
// `top` hasta el tercio superior y recortar por la derecha para llevar el eje
// al tercio, sin quedarse sin imagen — margen que las tomas viejas no tenían.

// --- HOME -------------------------------------------------------------
// master: public/uploads/patricio-ruiz-retrato.webp (1686x2528).
// headX=858 => width = 858/(2/3) = 1287. Se conserva la razón 1300:1089 del
// recorte histórico, así que la banda vertical visible no cambia de altura.
const HOME = {
  master: 'patricio-ruiz-retrato.webp',
  outName: 'patricio-ruiz-retrato-hero-cinema.webp',
  extract: { left: 0, top: 634, width: 1287, height: 1078 },
  eyesY: 993,
};

// --- SOBRE-MÍ / ABOUT-ME -----------------------------------------------
// master: public/uploads/patricio-ruiz-retrato-2.webp (1684x2528).
// headX=795 => width = 795/(2/3) ≈ 1193. Se conserva la razón 810:650.
const SOBRE_MI = {
  master: 'patricio-ruiz-retrato-2.webp',
  outName: 'patricio-ruiz-retrato-2-hero-cinema.webp',
  extract: { left: 0, top: 749, width: 1193, height: 957 },
  eyesY: 1068,
};

// --- VARIANTES DE MÓVIL ------------------------------------------------
// POR QUÉ EXISTEN: debajo de 821px el <picture> sirve `photo`, no
// `photoDesktop`. Hasta ahora `photo` era el MASTER EN CRUDO, y ahí la regla
// horizontal no se cumplía nunca: medido en vivo a 362px de ancho, la caja
// queda en 362x428 y la imagen ajusta POR ANCHO — se ve el ancho completo del
// master y solo se recortan ~115px de alto. Sin recorte horizontal el sujeto
// sale donde caiga en el master, que es centrado. (Ojo: el comentario de
// SiteHeader.astro decía que a este ancho la imagen es height-bound. Lo era
// antes de que --photo-drop acortara la caja; ya no.)
//
// La cura es la misma receta, con otra caja: mismo `width` que el recorte de
// desktop (el ancho es lo que fija el eje en el tercio derecho) y mismo eyesY,
// pero más alto.
//
// El alto se elige con holgura a propósito: H/W = 1.45 frente al 1.18 de la
// caja medida. Mientras el recorte sea MÁS alto en proporción que la caja, la
// imagen sigue ajustando por ancho — se ve el ancho entero (eje en el tercio)
// y lo que sobra se corta de alto, que es justo lo que gobierna
// object-position. Si el recorte fuera más apaisado que la caja se invertiría:
// ajustaría por alto, recortaría de ancho y el eje se saldría del tercio en
// los teléfonos más altos.
const HOME_MOVIL = {
  master: 'patricio-ruiz-retrato.webp',
  outName: 'patricio-ruiz-retrato-hero-movil.webp',
  extract: { left: 0, top: 371, width: 1287, height: 1866 },
  eyesY: 993,
};

const SOBRE_MI_MOVIL = {
  master: 'patricio-ruiz-retrato-2.webp',
  outName: 'patricio-ruiz-retrato-2-hero-movil.webp',
  extract: { left: 0, top: 491, width: 1193, height: 1730 },
  eyesY: 1068,
};

// Rutas públicas (bajo public/uploads/) que consumen las páginas vía
// `photoDesktop` en SiteHeader.astro — son las claves que usa el manifiesto
// y las que resuelve resolveAsset()/resolveAssetPosition().
export const HERO_CROPS = [
  { ...HOME, publicPath: `/uploads/hero-crops/${HOME.outName}` },
  { ...SOBRE_MI, publicPath: `/uploads/hero-crops/${SOBRE_MI.outName}` },
  { ...HOME_MOVIL, publicPath: `/uploads/hero-crops/${HOME_MOVIL.outName}` },
  { ...SOBRE_MI_MOVIL, publicPath: `/uploads/hero-crops/${SOBRE_MI_MOVIL.outName}` },
];

/** Directorio (relativo a public/uploads) donde caen los recortes generados. */
export const HERO_CROPS_DIR = 'hero-crops';

/** Resuelve el nombre de archivo del master dentro de public/uploads/. */
export function masterRelPath(entry) {
  return path.posix.join(entry.master);
}
