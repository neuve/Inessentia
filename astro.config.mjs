// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://inessentia.mx',
  output: 'static',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      filter: (page) =>
        page !== 'https://inessentia.mx/' &&
        !page.includes('/red/registro') &&
        !page.includes('/testimonios/nuevo') &&
        !page.includes('/testimonials/new'),
    }),
  ],
});
