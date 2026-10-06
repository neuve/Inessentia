// Único origen del enlace de WhatsApp del sitio. Ninguna página escribe
// «wa.me» a mano: todas piden el enlace aquí.

export const WA_NUMERO = 'patriciomx';
export const WA_VISIBLE = `wa.me/${WA_NUMERO}`;
export const WA_BASE = `https://${WA_VISIBLE}`;

/** Enlace de WhatsApp; con `texto`, abre el chat con ese mensaje prellenado. */
export function waLink(texto?: string): string {
  if (!texto) return WA_BASE;
  // encodeURIComponent deja pasar el apóstrofo recto; el enlace histórico lo codifica.
  return `${WA_BASE}?text=${encodeURIComponent(texto).replace(/'/g, '%27')}`;
}

/** Mensaje prellenado de los enlaces genéricos (los que no traen texto propio). */
export const WA_TEXTO_GENERICO = {
  es: 'Hola, vi tu página y me interesa tomar terapia contigo. ¿Me puedes dar más información?',
  en: "Hi, I saw your website and I'm interested in starting therapy with you. Could you give me more information?",
} as const;

/** Enlace genérico de WhatsApp con el mensaje prellenado del idioma de la página. */
export function waGenerico(locale: 'es' | 'en'): string {
  return waLink(WA_TEXTO_GENERICO[locale]);
}
