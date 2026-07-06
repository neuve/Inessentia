export function initTestimonialCarousel({ gridSel, slotSel, dotsSel, items, dotStyle = 'flat', intervalMs = 4500 }) {
  var grid = document.querySelector(gridSel);
  var dotsWrap = document.querySelector(dotsSel);
  if (!grid || !items || !items.length) return;

  var start = 0;
  var timer;

  function cardHTML(t) {
    var nameInner = t.link
      ? '<a href="' + t.link + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none;border-bottom:1px solid rgba(70,39,110,.3);padding-bottom:1px;">' + t.name + '</a>'
      : t.name;
    var tag = t.tag ? ' <span style="font-family:Mulish,sans-serif;font-weight:400;color:#8a837a;font-size:14px;">· ' + t.tag + '</span>' : '';
    return '<div style="background:var(--cream-2);border-radius:20px;padding:34px 32px;">' +
      '<div style="font-family:\'Mulish\',sans-serif;font-size:54px;line-height:.6;color:var(--sand);margin-bottom:6px;">&ldquo;</div>' +
      '<p style="font-size:17px;line-height:1.6;color:#34302c;margin:0 0 22px;">' + t.q + '</p>' +
      '<p style="margin:0;font-family:\'Zilla Slab\',serif;font-weight:600;color:var(--purple);font-size:18px;">' + nameInner + tag + '</p>' +
    '</div>';
  }

  function render(immediate) {
    var slots = grid.querySelectorAll(slotSel);
    if (!slots.length) return;
    function set() {
      slots.forEach(function(s, i) { s.innerHTML = cardHTML(items[(start + i) % items.length]); });
      requestAnimationFrame(function() { slots.forEach(function(s) { s.style.opacity = '1'; }); });
      syncDots();
    }
    if (immediate) { set(); }
    else { slots.forEach(function(s) { s.style.opacity = '0'; }); setTimeout(set, 380); }
  }

  function goTo(i) {
    start = i;
    render(false);
    clearInterval(timer);
    timer = setInterval(advance, intervalMs);
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    items.forEach(function(_, i) {
      var d = document.createElement('button');
      d.setAttribute('aria-label', 'Testimonio ' + (i + 1));
      if (dotStyle === 'nested') {
        d.style.cssText = 'width:24px;height:24px;border-radius:50%;border:none;padding:0;cursor:pointer;background:transparent;transition:background .3s,transform .3s;display:flex;align-items:center;justify-content:center;';
        var dot = document.createElement('span');
        dot.style.cssText = 'width:9px;height:9px;border-radius:50%;background:#d6cdbb;transition:background .3s,transform .3s;pointer-events:none;';
        d.appendChild(dot);
      } else {
        d.style.cssText = 'width:9px;height:9px;border-radius:50%;border:none;padding:0;cursor:pointer;background:#d6cdbb;transition:background .3s,transform .3s;';
      }
      d.onclick = function() { goTo(i); };
      dotsWrap.appendChild(d);
    });
  }

  function syncDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('button').forEach(function(d, i) {
      var active = i === start;
      var target = dotStyle === 'nested' ? d.querySelector('span') : d;
      if (target) { target.style.background = active ? 'var(--wine)' : '#d6cdbb'; target.style.transform = active ? 'scale(1.35)' : 'scale(1)'; }
    });
  }

  function advance() { start = (start + 1) % items.length; render(false); }

  buildDots();
  render(true);
  timer = setInterval(advance, intervalMs);
}
