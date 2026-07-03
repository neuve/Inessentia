export function initHeroParallax() {
  var els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ticking = false;

  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function(img) {
      var container = img.parentElement;
      var rect = container.getBoundingClientRect();
      var total = vh + rect.height;
      var progress = (vh - rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));
      var range = rect.height * 0.15;
      var offset = (progress - 0.5) * range * 2;
      img.style.setProperty('--parallax-y', offset.toFixed(1) + 'px');
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
