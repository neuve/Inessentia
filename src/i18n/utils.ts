import es from './es.json';
import en from './en.json';

const translations: Record<string, typeof es> = { es, en };

export type Locale = 'es' | 'en';

export function getLocale(url: URL): Locale {
  const seg = url.pathname.split('/')[1];
  return seg === 'en' ? 'en' : 'es';
}

export function t(locale: Locale) {
  return translations[locale];
}

export function localePath(locale: Locale, path: string): string {
  return `/${locale}${path.startsWith('/') ? path : '/' + path}`;
}

export function altLocalePath(locale: Locale, esPath: string, enPath: string): string {
  const alt = locale === 'es' ? 'en' : 'es';
  return `/${alt}${alt === 'es' ? esPath : enPath}`;
}

const sitePaths = {
  privacy: { es: '/es/privacidad/', en: '/en/privacy/' },
  terms: { es: '/es/terminos/', en: '/en/terms/' },
  resources: { es: '/es/recursos/', en: '/en/resources/' },
  testimonials: { es: '/es/testimonios/', en: '/en/testimonials/' },
} as const;

/** Locale-aware path for the handful of standalone pages referenced by
 * multiple components (Footer, TestimonialCarousel, BlogPost's back-link),
 * so the ES/EN URL pairs live in one place instead of a ternary per file. */
export function sitePath(locale: Locale, key: keyof typeof sitePaths): string {
  return sitePaths[key][locale];
}

export function navLinks(locale: Locale) {
  const i = t(locale);
  const base = `/${locale}`;
  const therapy = locale === 'es' ? 'terapia' : 'therapy';
  const about = locale === 'es' ? 'sobre-mi' : 'about-me';
  const resources = locale === 'es' ? 'recursos' : 'resources';
  const network = locale === 'es' ? 'red-terapeutica' : 'therapist-network';
  return [
    { label: i.nav.home, href: `${base}/` },
    { label: i.nav.about, href: `${base}/${about}/` },
    { label: i.nav.individual, href: `${base}/${therapy}/individual/` },
    { label: i.nav.couples, href: `${base}/${therapy}/${locale === 'es' ? 'pareja' : 'couples'}/` },
    { label: i.nav.family, href: `${base}/${therapy}/${locale === 'es' ? 'familias' : 'family'}/` },
    { label: i.nav.resources, href: `${base}/${resources}/` },
    { label: i.nav.network, href: `${base}/${network}/` },
  ];
}
