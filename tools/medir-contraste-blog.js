/* Mide el contraste REAL de cada bloque de texto de los artículos del blog.
   Se pega en la consola (o javascript_tool) de una pestaña del dev server, en el
   mismo origen. No es módulo: define medirBlog(ancho, rutas).

   Para cada nodo de texto: color computado de la letra, fondo = isla opaca más
   cercana si la hay; si no, el lienzo --page-grad interpolado en el % del
   documento donde cae el texto (las paradas se leen del CSS, no se copian aquí).
   Marca contraste < 4.5:1 (< 3:1 si es texto grande). Se salta nav, adornos aria-hidden, imágenes con
   fondo (heros con foto), iframes (Disqus) y texto que cae encima de un
   <img>/<video> (botón ▶ de miniaturas).
   `pie:true` separa lo que cae en el footer (compartido por todo el sitio) del artículo.
   Uso: await medirBlog(1280, ['/es/blog/experiencia-somatica/', ...]) */
async function medirBlog(ancho, rutas) {
  const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const rgba = s => { const m = s.match(/[\d.]+/g).map(Number); return { c: m.slice(0, 3), a: m.length > 3 ? m[3] : 1 }; };
  const mezcla = (f, bg) => f.a >= 1 ? f.c : f.c.map((v, i) => v * f.a + bg[i] * (1 - f.a));
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const fr = document.createElement('iframe');
  fr.style.cssText = `position:fixed;left:0;top:0;width:${ancho}px;height:900px;opacity:0;pointer-events:none;border:0`;
  document.body.appendChild(fr);
  const salida = [];
  for (const ruta of rutas) {
    await new Promise(res => { fr.onload = res; fr.src = ruta; });
    await new Promise(r => setTimeout(r, 700));
    const d = fr.contentDocument, w = fr.contentWindow;
    const H = d.documentElement.scrollHeight;
    const grad = w.getComputedStyle(d.body).backgroundImage;
    const paradas = [...grad.matchAll(/rgb\(([^)]+)\)\s+([\d.]+)%/g)].map(m => ({ c: m[1].split(',').map(Number), p: +m[2] }));
    const lienzo = p => { if (p <= paradas[0].p) return paradas[0].c; for (let i = 1; i < paradas.length; i++) if (p <= paradas[i].p) { const a = paradas[i - 1], b = paradas[i], t = (p - a.p) / (b.p - a.p); return a.c.map((v, k) => v + (b.c[k] - v) * t); } return paradas.at(-1).c; };
    const marcados = []; let medidos = 0, minR = 99;
    const tw = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const n = tw.currentNode; if (!n.textContent.trim()) continue;
      const el = n.parentElement; if (!el || el.closest('nav,script,style,noscript,iframe,svg,[aria-hidden="true"]')) continue;
      const cs = w.getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rg = d.createRange(); rg.selectNodeContents(n); const rc = rg.getBoundingClientRect(); if (!rc.width || !rc.height) continue;
      let bg = null, img = false;
      for (let e = el; e && e !== d.documentElement; e = e.parentElement) {
        const s = w.getComputedStyle(e);
        if (s.backgroundImage !== 'none' && e !== d.body) { img = true; break; }
        const b = rgba(s.backgroundColor); if (b.a >= .95) { bg = b.c; break; }
      }
      if (img) continue;
      const cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2;
      if ([...d.querySelectorAll('img,video,picture,iframe')].some(m => { const b = m.getBoundingClientRect(); return cx >= b.left && cx <= b.right && cy >= b.top && cy <= b.bottom; })) continue;
      const pct = (rc.top + rc.height / 2 + w.scrollY) / H * 100;
      const isla = !!bg; const fondo = bg || lienzo(pct);
      const col = mezcla(rgba(cs.color), fondo);
      const r = ratio(col, fondo); medidos++; if (r < minR) minR = r;
      const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
      if (r < (grande ? 3 : 4.5)) marcados.push({ pct: +pct.toFixed(1), r: +r.toFixed(2), isla, txt: n.textContent.trim().slice(0, 40), col: cs.color, pie: !!el.closest('footer'), px: cs.fontSize, cls: el.className?.toString().slice(0, 30) || el.tagName });
    }
    salida.push({ ruta, H, medidos, minR: +minR.toFixed(2), marcados });
  }
  fr.remove();
  return salida;
}
