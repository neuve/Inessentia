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

// --- HOME -------------------------------------------------------------
// master: public/uploads/patricio-ruiz-retrato.webp (1707x2560).
// Caja y eyesY ya validados (ver commit c7f68fc): f resultante = 0.333333,
// que es exactamente el 33.333% que llevaba photoPosition a mano.
const HOME = {
  master: 'patricio-ruiz-retrato.webp',
  // Nombre de salida histórico (incluye las dimensiones del recorte porque
  // así se renombró en e4e7498 para escapar de una caché envenenada por
  // nombre estable — no tiene relación con el hasheado por contenido que
  // aplica el pipeline sobre ESTE archivo de salida).
  outName: 'patricio-ruiz-retrato-hero-cinema-1300x1089.webp',
  extract: { left: 0, top: 562, width: 1300, height: 1089 },
  eyesY: 925,
};

// --- SOBRE-MÍ / ABOUT-ME -----------------------------------------------
// master: public/uploads/patricio-ruiz-retrato-2.jpg (1066x1600).
// width=810 viene del commit 526094d ("solo el 76% izquierdo del ancho
// original": 1066*0.76 ≈ 810). El top NO quedó registrado en ningún commit;
// se recuperó por correlación (búsqueda de mínimo MSE deslizando una
// ventana de 810x650 en left=0 sobre el master, contra el recorte JPEG
// actual) — top=270 fue un mínimo inequívoco: MSE=12.84 contra MSE=55.65
// del segundo mejor candidato (top=271), es decir ~4.3x más error a solo
// 1px de distancia. eyesY se deriva de f=0.75 (el 75% que sí quedó
// registrado en 526094d como photoPosition): eyesY = top + 0.75*height.
const SOBRE_MI = {
  master: 'patricio-ruiz-retrato-2.jpg',
  outName: 'patricio-ruiz-retrato-2-hero-cinema.jpg',
  extract: { left: 0, top: 270, width: 810, height: 650 },
  eyesY: 270 + 0.75 * 650, // 757.5
};

// Rutas públicas (bajo public/uploads/) que consumen las páginas vía
// `photoDesktop` en SiteHeader.astro — son las claves que usa el manifiesto
// y las que resuelve resolveAsset()/resolveAssetPosition().
export const HERO_CROPS = [
  { ...HOME, publicPath: `/uploads/hero-crops/${HOME.outName}` },
  { ...SOBRE_MI, publicPath: `/uploads/hero-crops/${SOBRE_MI.outName}` },
];

/** Directorio (relativo a public/uploads) donde caen los recortes generados. */
export const HERO_CROPS_DIR = 'hero-crops';

/** Resuelve el nombre de archivo del master dentro de public/uploads/. */
export function masterRelPath(entry) {
  return path.posix.join(entry.master);
}
