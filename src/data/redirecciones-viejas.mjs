// Pares URL vieja -> URL nueva, para las redirecciones del sitio pre-Astro.
//
// Search Console marca 404 en URLs planas .html del sitio anterior (algunas
// todavía reciben clics desde resultados de Google indexados hace años). Este
// archivo es la ÚNICA fuente de esos pares — lo consume
// tools/generar-redirecciones-viejas.mjs (integración astro:build:done),
// registrada en astro.config.mjs.
//
// Se comprobó (build de prueba con una entrada en el bloque `redirects` de
// astro.config.mjs) que Astro 7 genera dist/<ruta>.html/index.html — una
// CARPETA llamada "<ruta>.html" con un index.html adentro — no el archivo
// plano dist/<ruta>.html que GitHub Pages necesita para servir esa URL
// exacta. Por eso estos pares NO van en el bloque `redirects`: la
// integración de tools/generar-redirecciones-viejas.mjs escribe el archivo
// plano directamente en dist/ después del build.
export const redireccionesViejas = [
  // terapia-corporal
  { from: '/blog-terapia-corporal.html', to: '/es/blog/terapia-corporal/', fuente: 'disqus' },
  { from: '/en/blog-body-based-therapy.html', to: '/en/blog/body-based-therapy/', fuente: 'disqus' },
  // teoria-polivagal
  { from: '/blog-teoria-polivagal.html', to: '/es/blog/teoria-polivagal/', fuente: 'disqus' },
  { from: '/en/blog-polyvagal-theory.html', to: '/en/blog/polyvagal-theory/', fuente: 'disqus' },
  // experiencia-somatica
  { from: '/blog-experiencia-somatica.html', to: '/es/blog/experiencia-somatica/', fuente: 'disqus' },
  { from: '/en/blog-somatic-experiencing.html', to: '/en/blog/somatic-experiencing/', fuente: 'disqus' },
  // ease-caballos
  { from: '/blog-ease-caballos.html', to: '/es/blog/ease-caballos/', fuente: 'disqus' },
  { from: '/en/blog-ease-horses.html', to: '/en/blog/ease-horses/', fuente: 'disqus' },
  // sistemas-familiares-internos
  { from: '/blog-sistemas-familiares-internos.html', to: '/es/blog/sistemas-familiares-internos/', fuente: 'disqus' },
  { from: '/en/blog-internal-family-systems.html', to: '/en/blog/internal-family-systems/', fuente: 'disqus' },
  // tapping-eft
  { from: '/blog-tapping-eft.html', to: '/es/blog/tapping-eft/', fuente: 'disqus' },
  { from: '/en/blog-tapping-eft.html', to: '/en/blog/tapping-eft/', fuente: 'disqus' },
  // core-energetica
  { from: '/blog-core-energetica.html', to: '/es/blog/core-energetica/', fuente: 'disqus' },
  { from: '/en/blog-core-energetics.html', to: '/en/blog/core-energetics/', fuente: 'disqus' },
  // que-esperar-de-la-terapia
  { from: '/blog-que-esperar-de-la-terapia.html', to: '/es/blog/que-esperar-de-la-terapia/', fuente: 'disqus' },
  { from: '/en/blog-what-to-expect.html', to: '/en/blog/what-to-expect/', fuente: 'disqus' },
  // primera-cita
  { from: '/blog-primera-cita.html', to: '/es/blog/primera-cita/', fuente: 'disqus' },
  { from: '/en/blog-first-session.html', to: '/en/blog/first-session/', fuente: 'disqus' },
  // cuando-es-buen-momento
  { from: '/blog-cuando-es-buen-momento-para-iniciar.html', to: '/es/blog/cuando-es-buen-momento/', fuente: 'disqus' },
  { from: '/en/blog-when-to-start-therapy.html', to: '/en/blog/good-time-to-start/', fuente: 'disqus' },
  // estres-cronico
  { from: '/blog-estres-cronico.html', to: '/es/blog/estres-cronico/', fuente: 'disqus' },
  { from: '/en/blog-chronic-stress.html', to: '/en/blog/chronic-stress/', fuente: 'disqus' },
  // ansiedad-somatica
  { from: '/blog-ansiedad-somatica.html', to: '/es/blog/ansiedad-somatica/', fuente: 'disqus' },
  { from: '/en/blog-somatic-anxiety.html', to: '/en/blog/somatic-anxiety/', fuente: 'disqus' },
  // regulacion-sistema-nervioso
  { from: '/blog-regulacion-sistema-nervioso.html', to: '/es/blog/regulacion-sistema-nervioso/', fuente: 'disqus' },
  { from: '/en/blog-nervous-system-regulation.html', to: '/en/blog/nervous-system-regulation/', fuente: 'disqus' },
  // trauma-sin-diagnosticar
  { from: '/blog-trauma-sin-diagnosticar.html', to: '/es/blog/trauma-sin-diagnosticar/', fuente: 'disqus' },
  { from: '/en/blog-undiagnosed-trauma.html', to: '/en/blog/undiagnosed-trauma/', fuente: 'disqus' },
  // duelo-somatico
  { from: '/blog-duelo-somatico.html', to: '/es/blog/duelo-somatico/', fuente: 'disqus' },
  { from: '/en/blog-somatic-grief.html', to: '/en/blog/somatic-grief/', fuente: 'disqus' },
  // terapia-adolescentes
  { from: '/blog-terapia-adolescentes.html', to: '/es/blog/terapia-adolescentes/', fuente: 'disqus' },
  { from: '/en/blog-teen-therapy.html', to: '/en/blog/teen-therapy/', fuente: 'disqus' },
  // patrones-de-pareja
  { from: '/blog-patrones-de-pareja.html', to: '/es/blog/patrones-de-pareja/', fuente: 'disqus' },
  { from: '/en/blog-couples-patterns.html', to: '/en/blog/couples-patterns/', fuente: 'disqus' },
  // terapia-individual-o-pareja
  { from: '/blog-terapia-individual-o-pareja.html', to: '/es/blog/terapia-individual-o-pareja/', fuente: 'disqus' },
  { from: '/en/blog-individual-or-couples-therapy.html', to: '/en/blog/individual-or-couples-therapy/', fuente: 'disqus' },
  // terapia-presencial-vs-online
  { from: '/blog-terapia-presencial-vs-online.html', to: '/es/blog/terapia-presencial-vs-online/', fuente: 'disqus' },
  { from: '/en/blog-in-person-vs-online-therapy.html', to: '/en/blog/in-person-vs-online-therapy/', fuente: 'disqus' },
  // psicologo-psicoterapeuta-psiquiatra
  { from: '/blog-psicologo-psicoterapeuta-psiquiatra.html', to: '/es/blog/psicologo-psicoterapeuta-psiquiatra/', fuente: 'disqus' },
  { from: '/en/blog-psychologist-therapist-psychiatrist.html', to: '/en/blog/psychologist-therapist-psychiatrist/', fuente: 'disqus' },
  // tipos-de-terapia
  { from: '/blog-tipos-de-terapia.html', to: '/es/blog/tipos-de-terapia/', fuente: 'disqus' },
  { from: '/en/blog-types-of-therapy.html', to: '/en/blog/types-of-therapy/', fuente: 'disqus' },

  // Páginas sueltas confirmadas en Search Console ("Not found (404)"). El
  // índice CDX de Wayback Machine no tiene NINGUNA captura de inessentia.mx
  // (comprobado: matchType=domain/prefix y url=inessentia.mx/* devuelven [] de
  // forma consistente en 5+ intentos, con control positivo contra wikipedia.org
  // en el mismo endpoint que sí trae datos reales — así que el [] no es la
  // API caída, es la ausencia real de capturas). Sin Wayback, esta lista NO es
  // necesariamente completa: cubre solo los pares que Search Console mostró
  // como ejemplo (12 de las 21 URLs marcadas 404; quedan ~9 sin identificar).
  { from: '/sobre-mi.html', to: '/es/sobre-mi/', fuente: 'search-console' },
  { from: '/privacidad.html', to: '/es/privacidad/', fuente: 'search-console' },
  { from: '/testimonios.html', to: '/es/testimonios/', fuente: 'search-console' },
  { from: '/terapia-de-pareja.html', to: '/es/terapia/pareja/', fuente: 'search-console' },
  { from: '/terapia-individual.html', to: '/es/terapia/individual/', fuente: 'search-console' },
  { from: '/red-inessentia.html', to: '/es/red-terapeutica/', fuente: 'search-console' },
  { from: '/en/inessentia-network.html', to: '/en/therapist-network/', fuente: 'search-console' },
  // .dc.html y mayúscula inicial delatan un artefacto de CMS viejo (Dreamweaver
  // Contribute). Sin Wayback no hay forma de ver qué contenía — se manda al
  // equivalente más cercano por nombre. APROXIMADA.
  { from: '/Pareja.dc.html', to: '/es/terapia/pareja/', fuente: 'search-console', aproximada: true },
];
