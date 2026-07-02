# Inessentia

Sitio web bilingüe (ES/EN) de Patricio Ruiz Abrín, psicoterapeuta — [inessentia.mx](https://inessentia.mx).

Construido con [Astro](https://astro.build) v7, desplegado a GitHub Pages vía GitHub Actions en cada push a `main`.

## Comandos

```bash
npm install       # Instalar dependencias
npm run dev       # Servidor local en localhost:4321
npm run build     # Compilar sitio estático a dist/
npm run preview   # Previsualizar el build localmente
```

## Dónde está cada cosa

- **Guía técnica para trabajar en el código:** [CLAUDE.md](./CLAUDE.md)
- **Mapa de contenido (textos, gráficos, dónde vive cada cosa):** [CONTENT_MAP.md](./CONTENT_MAP.md)

## Estructura

```
src/
├── components/   # Navbar, Footer, MobileMenu, WhatsApp, TestimonialCarousel, DisqusComments, RevealOnScroll
├── data/         # posts.ts (metadatos de blog ES+EN), testimonials.ts
├── i18n/         # es.json, en.json (strings de UI) + utils.ts
├── layouts/      # Base.astro, BlogPost.astro
├── pages/
│   ├── es/       # Todas las páginas en español
│   └── en/       # Todas las páginas en inglés
├── scripts/      # JS vanilla (carrusel, embeds de video)
└── styles/       # global.css

public/uploads/   # Imágenes y SVGs referenciados como /uploads/archivo.ext
```
