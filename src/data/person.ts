// Fuente única de verdad para la identidad profesional de Patricio.
// Usada como schema Person en sobre-mí/about-me y como `author` (por @id)
// en cada blog post, para que Google atribuya los artículos a la persona
// con estas credenciales (señal E-E-A-T en categoría de salud / YMYL).
import type { Locale } from '../i18n/utils';

// @id estable: ancla la MISMA entidad a través de todo el sitio.
export const PERSON_ID = 'https://inessentia.mx/#patricio';

// Nombre canónico completo — coincide con el directorio oficial de
// Experiencia Somática, y desambigua de otros "Patricio Ruiz" en la web.
export const PERSON_NAME = 'Patricio Michel Ruiz Abrín';
export const PERSON_ALT_NAME = 'Patricio Ruiz Abrín';

const KNOWS_ABOUT: Record<Locale, string[]> = {
  es: [
    'Experiencia Somática (SE)',
    'Teoría polivagal',
    'Sistemas Familiares Internos (IFS)',
    'Terapia familiar sistémica',
    'Core Energética',
    'Enfoque centrado en la persona',
    'Trauma',
    'Psicoterapia corporal',
  ],
  en: [
    'Somatic Experiencing (SE)',
    'Polyvagal theory',
    'Internal Family Systems (IFS)',
    'Systemic family therapy',
    'Core Energetics',
    'Person-centered approach',
    'Trauma',
    'Body psychotherapy',
  ],
};

const DESCRIPTION: Record<Locale, string> = {
  es: 'Psicoterapeuta con enfoque de base somática, en formación sistémica, en CDMX y en línea. Somatic Experiencing Practitioner (SE) y maestrante en Terapia Familiar Sistémica.',
  en: 'Psychotherapist with a somatic-based approach, training in systemic therapy, in Mexico City and online. Somatic Experiencing Practitioner (SE) and a graduate student in Systemic Family Therapy.',
};

const org = (name: string) => ({ '@type': 'EducationalOrganization', name });

const credential = (name: string, recognizedBy: string) => ({
  '@type': 'EducationalOccupationalCredential',
  'name': name,
  'credentialCategory': 'certification',
  'recognizedBy': { '@type': 'Organization', name: recognizedBy },
});

// Perfiles externos que apuntan a esta misma persona. sameAs le dice a Google
// "todas estas URLs son la misma entidad", consolidando autoridad hacia
// inessentia.mx. patricioruiz.mx se mantiene como puente hasta que redirija.
const SAME_AS = [
  'https://www.instagram.com/neuve',
  'https://experienciasomaticamexico.com/terapeutas/patricio-michel-ruiz-abrin/',
  'https://www.patricioruiz.mx',
];

export function personSchema(locale: Locale) {
  const isEs = locale === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    'name': PERSON_NAME,
    'alternateName': PERSON_ALT_NAME,
    'jobTitle': isEs ? 'Psicoterapeuta' : 'Psychotherapist',
    'description': DESCRIPTION[locale],
    'url': `https://inessentia.mx/${locale}/${isEs ? 'sobre-mi' : 'about-me'}/`,
    'image': 'https://inessentia.mx/uploads/patricio-ruiz-retrato.webp',
    'worksFor': { '@type': 'Organization', 'name': 'Inessentia', 'url': 'https://inessentia.mx/' },
    'knowsAbout': KNOWS_ABOUT[locale],
    'alumniOf': [
      org('Facultad de Arquitectura, UNAM'),
      org('Instituto Córpore'),
      org('Instituto de Humanidades y Psicología Gestalt (IHPG)'),
      org('Instituto Crisol'),
    ],
    'hasCredential': [
      credential(
        isEs ? 'Somatic Experiencing Practitioner (SE)' : 'Somatic Experiencing Practitioner (SE)',
        'Experiencia Somática México',
      ),
      credential('Core Energetics Practitioner', 'Instituto Córpore'),
      credential(
        isEs ? 'Especialidad en Enfoque Centrado en la Persona' : 'Specialist in Person-Centered Approach',
        'Instituto de Humanidades y Psicología Gestalt (IHPG)',
      ),
    ],
    'sameAs': SAME_AS,
  };
}

// Referencia ligera por @id — para usar como `author` en artículos sin
// repetir todo el nodo (Google resuelve la persona completa por su @id).
export const personRef = { '@id': PERSON_ID, '@type': 'Person', 'name': PERSON_NAME };

// @id estable del negocio, para poder referenciarlo desde otros nodos.
export const BUSINESS_ID = 'https://inessentia.mx/#inessentia';

// Schema del negocio para el home. Tipado como MedicalBusiness + ProfessionalService
// (categoría de salud, señal YMYL) y con `founder` apuntando por @id a la persona
// con credenciales. La descripción varía por idioma, se pasa desde la página.
export function businessSchema(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'ProfessionalService'],
    '@id': BUSINESS_ID,
    'name': 'Inessentia — Patricio Ruiz Abrín',
    'description': description,
    'url': `https://inessentia.mx/${locale}/`,
    'image': 'https://inessentia.mx/uploads/patricio-ruiz-retrato.webp',
    'logo': 'https://inessentia.mx/uploads/logo-patricio-ruiz.webp',
    'telephone': '+525532020488',
    'email': 'patricio@inessentia.mx',
    'priceRange': locale === 'es' ? '$1700–$2600 MXN' : '$90–$140 USD',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Georgia 114, Oficina 303',
      'addressLocality': 'Nápoles, Benito Juárez',
      'postalCode': '03840',
      'addressRegion': 'CDMX',
      'addressCountry': 'MX',
    },
    'geo': { '@type': 'GeoCoordinates', 'latitude': 19.3936, 'longitude': -99.1714 },
    'areaServed': locale === 'es' ? 'Ciudad de México' : 'Mexico City',
    'availableLanguage': ['es', 'en'],
    'founder': personRef,
    'employee': personRef,
    'sameAs': SAME_AS,
  };
}
