// resolveAsset — resuelve una ruta pública de asset local (/uploads/...,
// /fonts/...) a su URL hasheada por contenido, para los pocos lugares donde
// no cabe el componente <Img> (atributos crudos: <source srcset>, <img src>
// fuera de Img.astro, poster/<source> de <video>, meta og:image/twitter:image,
// <link rel=preload as=font>).
//
// Lee el mismo src/data/image-manifest.json que escribe
// tools/generate-responsive-images.mjs y que ya consume Img.astro — mismo
// contrato: si `url` no está en el manifiesto (remoto, no procesado, o
// cualquier caso no contemplado) se devuelve tal cual, nunca rompe el render.
import manifestJson from '../data/image-manifest.json';

interface ManifestEntry {
  src?: string;
  width?: number;
  height?: number;
  srcset?: { w: number; url: string }[];
}

const manifest = manifestJson as Record<string, ManifestEntry>;

export function resolveAsset(url: string): string {
  return manifest[url]?.src ?? url;
}
