# Mapa de contenido

Guía rápida de dónde vive cada tipo de contenido del sitio — para trabajar textos y gráficos sin tener que leer el código Astro completo. Complementa a [CLAUDE.md](./CLAUDE.md) (guía técnica).

## Textos

| Qué es | Dónde vive | Notas |
|---|---|---|
| Strings de UI (menú, botones, footer, labels genéricos) | `src/i18n/es.json` y `src/i18n/en.json` | Un archivo por idioma, mismas llaves en ambos. Cambiar aquí actualiza el string en todas las páginas que lo usan. |
| Metadatos de cada blog post (título, descripción, categoría, imagen, id de Disqus) | `src/data/posts.ts` | Fuente única para ambos idiomas — evita duplicar datos entre la página del post y el grid de "Recursos". |
| Cuerpo de cada blog post | `src/pages/es/blog/*.astro` y `src/pages/en/blog/*.astro` | Un archivo `.astro` por post por idioma. **El nombre del archivo es el slug de la URL — no renombrar**, los identificadores de Disqus dependen de la URL vieja para conservar los hilos de comentarios existentes. |
| Testimonios de clientes | `src/data/testimonials.ts` | Usado en el carrusel de home y en la página de testimonios. |
| Páginas estáticas (home, sobre mí, privacidad, términos, recursos, terapia individual/pareja/familia, red de terapeutas) | `src/pages/es/*.astro` y `src/pages/en/*.astro` | Cada página tiene su par ES/EN, excepto `red-terapeutica.astro` que por ahora solo existe en español. |

## Gráficos

### Placeholders de blog (los "fondos de emoji")

15 SVGs pequeños en `public/uploads/placeholder-*.svg`, uno por post (de los 20 posts, los otros 5 usan foto real en vez de placeholder — ver tabla de imágenes hero abajo). Se referencian desde `src/data/posts.ts`. Para cambiar el ícono/fondo de un post, se edita o reemplaza el SVG correspondiente por su nombre de archivo.

### "Arrays radiales" (fondos decorativos de sección)

**No son archivos de imagen** — se generan 100% con CSS: un patrón de líneas radiales (`repeating-conic-gradient`) recortado en forma de anillo con una máscara circular (`radial-gradient` como `mask`). Para cambiar el patrón, el grosor del anillo o el color, se edita este bloque CSS directo en el archivo — no hay imagen que reemplazar.

Snippet base (varía color, tamaño y opacidad según la sección):

```css
background: repeating-conic-gradient(<color> 0deg .55deg, transparent .55deg 7deg);
-webkit-mask: radial-gradient(circle, transparent 29%, #000 30%, #000 49%, transparent 50%);
mask: radial-gradient(circle, transparent 29%, #000 30%, #000 49%, transparent 50%);
```

Las 5 ubicaciones exactas:

| Archivo | Línea | Sección |
|---|---|---|
| `src/pages/es/index.astro` | 44 | Hero (arriba) |
| `src/pages/es/index.astro` | 229 | Sección de testimonios |
| `src/pages/es/sobre-mi.astro` | 29 | Superior |
| `src/pages/es/sobre-mi.astro` | 156 | Inferior |
| `src/components/Footer.astro` | 53–55 | Footer (afecta todas las páginas) |

Nota: las versiones en inglés (`src/pages/en/index.astro`, `en/about-me.astro`) tienen el mismo patrón replicado — si se cambia el diseño, hay que replicarlo también ahí a mano (no comparten un componente).

### Imágenes hero / fotos reales

En `public/uploads/`, formato WebP: `buen-momento-pareja.webp`, `primera-cita-terapia.webp`, `terapia-corporal.webp`, `que-esperar-terapia.webp`, `tipos-terapia.webp` (usadas en los 5 posts sin placeholder SVG), más `terapia-hero.webp` (páginas de terapia).

### Branding / logos

`logo-patricio-ruiz.webp`, `logo-icon.webp` / `.png`, `patricio-ruiz-retrato.webp` en `public/uploads/`.

`patricio-mandala-brand.webp` también vive ahí — **no se usa en ninguna página del sitio**, pero sí lo consume el proyecto Stripe-Calendar (correos automáticos) vía URL absoluta `https://inessentia.mx/uploads/patricio-mandala-brand.webp`. No borrar aunque `grep` en este repo no muestre referencias.
