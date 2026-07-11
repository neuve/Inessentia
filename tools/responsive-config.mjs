// Fuente única de verdad para el pipeline de imágenes responsivas.
// La usan tools/generate-responsive-images.mjs (genera variantes + manifiesto)
// y, vía el manifiesto que ese script escribe, src/components/Img.astro.
//
// Regla clave que rompe el "bucle de PageSpeed": nunca servimos un archivo de
// tamaño fijo. Generamos una escalera de anchos y dejamos que el navegador baje
// el que corresponde a su viewport × densidad (srcset/sizes). Un solo master ya
// no tiene que satisfacer a la vez desktop (1×) y mobile (2×).

// Escalera de anchos candidata. El generador sólo produce los anchos < ancho
// intrínseco del master (nunca hace upscale) y añade el master como tope.
export const WIDTHS = [96, 192, 320, 480, 640, 768, 960, 1200, 1600, 1920];

// Calidad de re-encode WebP. Los masters ya son webp; 80 mantiene nitidez y
// recorta bytes en las variantes chicas.
export const QUALITY = 80;

// Carpeta (relativa a public/uploads) donde se escriben las variantes.
export const OUT_DIR = 'responsive';

// Extensiones raster que procesamos. SVG y remotos se ignoran (el componente
// cae a <img> normal si el src no está en el manifiesto).
export const RASTER_EXT = new Set(['.webp', '.png', '.jpg', '.jpeg']);

// Se saltan por completo (no son imágenes de contenido a redimensionar):
//  - og/  : tarjetas sociales, ya son 1200×630 exactas (las hace otro script)
//  - responsive/ : la salida de este mismo script
export const SKIP_DIRS = new Set(['og', OUT_DIR]);

// Anchos mínimos: imágenes cuyo master ya es <= este ancho no vale la pena
// variantizar (íconos diminutos, etc.). Aun así entran al manifiesto con su
// master para que el componente les ponga width/height (CLS).
export const MIN_VARIANT_WIDTH = 64;

export const MANIFEST_PATH = 'src/data/image-manifest.json';
