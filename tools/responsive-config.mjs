// Fuente única de verdad para el pipeline de assets locales (imágenes, video,
// svg y fuentes bajo public/uploads y public/fonts).
// La usan tools/generate-responsive-images.mjs (genera variantes + copias
// hasheadas + manifiesto) y, vía el manifiesto que ese script escribe,
// src/components/Img.astro y src/lib/resolve-asset.ts.
//
// Regla clave que rompe el "bucle de PageSpeed": nunca servimos un archivo de
// tamaño fijo. Generamos una escalera de anchos y dejamos que el navegador baje
// el que corresponde a su viewport × densidad (srcset/sizes). Un solo master ya
// no tiene que satisfacer a la vez desktop (1×) y mobile (2×).
//
// Regla clave #2 (direccionamiento por contenido): CADA archivo que emitimos
// —variante de ancho, copia del master, svg/mp4/webm/woff2 copiado tal cual—
// lleva en su nombre un hash de SUS PROPIOS bytes de salida. Si el contenido
// cambia, el nombre cambia, y un CDN con cache-control de un año (ver
// public/uploads/*, public/fonts/*) no puede seguir sirviendo bytes viejos
// bajo una URL que nadie volvió a pedir. Ver tools/generate-responsive-images.mjs
// para el porqué se hashean los bytes DE SALIDA y no los del master.

// Escalera de anchos candidata. El generador sólo produce los anchos < ancho
// intrínseco del master (nunca hace upscale) y añade el master como tope.
export const WIDTHS = [96, 192, 320, 480, 640, 768, 960, 1200, 1600, 1920];

// Calidad de re-encode WebP. Los masters ya son webp; 80 mantiene nitidez y
// recorta bytes en las variantes chicas.
export const QUALITY = 80;

// Carpeta (relativa a public/uploads) donde se escriben las variantes y
// copias hasheadas.
export const OUT_DIR = 'responsive';

// Extensiones raster que redimensionamos (escalera de anchos + copia
// hasheada del master).
export const RASTER_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg']);

// Extensiones que se hashean POR COPIA, sin transcodificar: no tiene sentido
// "redimensionar" un svg (vectorial) ni reencodear video con este pipeline.
export const COPY_EXT = new Set(['.svg', '.mp4', '.webm']);

// Se salta por completo: es la salida del propio script, no un input.
// OJO: 'og' YA NO se salta (antes sí) — las tarjetas sociales también deben
// hashearse para que un recorte regenerado bajo el mismo nombre no quede
// atrapado detrás del cache-control de un año de Cloudflare. Ver
// NO_VARIANT_DIRS para por qué no llevan escalera de anchos.
export const SKIP_DIRS = new Set([OUT_DIR]);

// Directorios cuyo contenido SÍ entra al manifiesto (hasheado) pero SIN
// escalera de anchos, porque son de tamaño fijo a propósito:
//  - og/         : tarjetas sociales, siempre exactas 1200×630.
//  - hero-crops/ : recortes fijos para <picture><source> del hero cinema (ver
//                  SiteHeader.astro `photoDesktop`) — se sirven tal cual,
//                  sin srcset, porque solo se muestran en un rango de
//                  viewport acotado a un tamaño predecible y el <source> que
//                  los consume no declara `sizes` (un solo candidato).
export const NO_VARIANT_DIRS = new Set(['og', 'hero-crops']);

// Anchos mínimos: imágenes cuyo master ya es <= este ancho no vale la pena
// variantizar (íconos diminutos, etc.). Aun así entran al manifiesto con su
// master para que el componente les ponga width/height (CLS).
export const MIN_VARIANT_WIDTH = 64;

export const MANIFEST_PATH = 'src/data/image-manifest.json';

// Longitud del hash (hex) que se antepone/sufija a cada nombre de archivo
// generado. 8 chars hex = 32 bits — de sobra para las ~350 rutas del sitio,
// sin nombres kilométricos.
export const HASH_LENGTH = 8;

// --- Fuentes (public/fonts/*.woff2) ---------------------------------------
// Viven fuera de public/uploads, así que su copia hasheada usa su propia
// subcarpeta de salida, en vez de reusar OUT_DIR (que es relativo a
// public/uploads). Ver la sección de fuentes en generate-responsive-images.mjs.
export const FONTS_DIR = 'public/fonts';
export const FONTS_OUT_DIR = 'responsive';

// Fragmento CSS generado con los @font-face apuntando a las copias hasheadas
// vigentes. global.css lo importa en vez de declarar @font-face con rutas
// literales (ver comentario en generate-responsive-images.mjs: por qué un
// archivo aparte y no custom properties).
export const FONTS_CSS_PATH = 'src/styles/fonts.generated.css';
