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
