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
  costs: { es: '/es/costos/', en: '/en/costs/' },
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

/** Curated subset shown inline in the simple bar (the full menu lives in the
 * overlay): Sobre mí · Tipos de terapia (→ hub "cómo trabajo") · Agenda una sesión. */
export function barLinks(locale: Locale) {
  const i = t(locale);
  const base = `/${locale}`;
  const about = locale === 'es' ? 'sobre-mi' : 'about-me';
  const therapyTypesSlug = locale === 'es' ? 'tipos-de-terapia' : 'types-of-therapy';
  return [
    { label: i.nav.about, href: `${base}/${about}/` },
    { label: i.nav.therapyTypes, href: `${base}/blog/${therapyTypesSlug}/` },
    { label: i.nav.cta, href: 'https://wa.me/patriciomx' },
  ];
}

export interface MenuLink {
  label: string;
  href: string;
  current: boolean;
  cta?: boolean;
  external?: boolean;
}

/** Two-column editorial menu for the desktop overlay. `current` marks the
 * active page by comparing normalized pathnames. */
export function menuColumns(locale: Locale, pathname: string): [MenuLink[], MenuLink[]] {
  const i = t(locale);
  const base = `/${locale}`;
  const therapy = locale === 'es' ? 'terapia' : 'therapy';
  const about = locale === 'es' ? 'sobre-mi' : 'about-me';
  const resources = locale === 'es' ? 'recursos' : 'resources';
  const network = locale === 'es' ? 'red-terapeutica' : 'therapist-network';
  const norm = (p: string) => (p.endsWith('/') ? p : p + '/');
  const here = norm(pathname);
  const link = (label: string, href: string, extra: Partial<MenuLink> = {}): MenuLink => ({
    label, href, current: norm(href) === here, ...extra,
  });
  const col1: MenuLink[] = [
    link(i.nav.home, `${base}/`),
    link(i.nav.about, `${base}/${about}/`),
    link(i.nav.resources, `${base}/${resources}/`),
    link(i.menu.framing, sitePath(locale, 'terms')),
    link(i.nav.network, `${base}/${network}/`),
  ];
  const col2: MenuLink[] = [
    link(i.menu.individual, `${base}/${therapy}/individual/`),
    link(i.menu.couplesShort, `${base}/${therapy}/${locale === 'es' ? 'pareja' : 'couples'}/`),
    link(i.menu.familyShort, `${base}/${therapy}/${locale === 'es' ? 'familias' : 'family'}/`),
    link(i.menu.testimonials, sitePath(locale, 'testimonials')),
    link(i.menu.book, 'https://wa.me/patriciomx', { cta: true, external: true }),
  ];
  return [col1, col2];
}
