// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import redireccionesViejas from './tools/generar-redirecciones-viejas.mjs';

export default defineConfig({
  site: 'https://inessentia.mx',
  output: 'static',
  build: {
    // Inline all component CSS into the page HTML instead of splitting it
    // into separate <link> stylesheets — avoids extra render-blocking
    // requests (default 'auto' only inlines files under 4KB, which left
    // SiteHeader.css and therapist-network.css as blocking network fetches).
    inlineStylesheets: 'always',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  redirects: {
    '/es/supervisión/': '/es/supervision/',
  },
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://inessentia.mx/' &&
        !page.includes('/red/registro') &&
        !page.includes('/testimonios/nuevo') &&
        !page.includes('/testimonials/new'),
    }),
    // Escribe dist/<url-vieja>.html (archivo plano, no carpeta) por cada par
    // en src/data/redirecciones-viejas.mjs — ver el comentario en ese
    // archivo y en tools/generar-redirecciones-viejas.mjs para el porqué de
    // no usar el bloque `redirects` de arriba para estas URLs .html.
    redireccionesViejas(),
  ],
});
