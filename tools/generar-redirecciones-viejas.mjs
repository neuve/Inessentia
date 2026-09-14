// Integración de Astro que, al terminar el build, escribe un archivo .html
// plano en dist/ por cada URL vieja del sitio pre-Astro listada en
// src/data/redirecciones-viejas.mjs.
//
// POR QUÉ una integración y no el bloque `redirects` de astro.config.mjs:
// se comprobó con un build de prueba que Astro 7, para una clave de
// `redirects` que termina en `.html` (ej. '/sobre-mi.html'), genera
// dist/sobre-mi.html/index.html — una CARPETA llamada "sobre-mi.html" con
// un index.html adentro — no el archivo dist/sobre-mi.html que GitHub Pages
// necesita para servir esa URL exacta (GitHub Pages sirve el árbol de dist/
// tal cual, sin reescritura de rutas). El hook astro:build:done corre
// después de que Astro ya escribió su propia salida, así que puede crear el
// archivo plano sin que el paso de `redirects` lo pise ni lo convierta en
// carpeta.
//
// Cada página generada lleva meta-refresh (funciona sin JS, que es el caso
// común de un crawler o un navegador viejo siguiendo un enlace indexado),
// canonical al destino (para que un motor de búsqueda transfiera la señal
// de la URL vieja a la nueva). Sin noindex: junto al canonical manda señales
// contradictorias, y Google ya trata un meta-refresh de 0 s como redirección.
// Se agrega location.replace() como respaldo: en el caso de un user-agent
// que ejecute JS pero ignore el meta-refresh, igual termina en el destino, y con replace() no
// deja la URL vieja en el historial de "atrás".
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { redireccionesViejas } from '../src/data/redirecciones-viejas.mjs';

const SITE = 'https://inessentia.mx';

function paginaRedireccion(destino) {
  const destinoAbsoluta = SITE + destino;
  const lang = destino.startsWith('/en/') ? 'en' : 'es';
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>Redirigiendo…</title>
<meta http-equiv="refresh" content="0; url=${destino}">
<link rel="canonical" href="${destinoAbsoluta}">
<script>location.replace(${JSON.stringify(destino)});</script>
</head>
<body>
<p>Esta página se movió. Si no te redirige automáticamente, <a href="${destino}">haz clic aquí</a>.</p>
</body>
</html>
`;
}

/**
 * @param {{ outDir?: string }} [opts] outDir es sólo para pruebas — en el
 *   build real Astro lo pasa via dir.pathname en astro:build:done.
 */
export default function redireccionesViejasIntegration() {
  return {
    name: 'redirecciones-viejas',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = path.resolve(dir.pathname ?? dir.toString());
        let escritos = 0;
        for (const { from, to } of redireccionesViejas) {
          // from siempre empieza con '/' y termina en '.html' — el nombre
          // de archivo destino es esa misma ruta, relativa a dist/.
          const rel = from.replace(/^\//, '');
          const destinoArchivo = path.join(distDir, rel);
          await mkdir(path.dirname(destinoArchivo), { recursive: true });
          await writeFile(destinoArchivo, paginaRedireccion(to), 'utf8');
          escritos++;
        }
        logger.info(`[redirecciones-viejas] ${escritos} archivo(s) de redirección escritos en dist/`);
      },
    },
  };
}
