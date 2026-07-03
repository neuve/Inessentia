export function initHeroParallax() {
  var els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ranges = new Map();
  var ticking = false;

  function measureOne(img) {
    var container = img.parentElement;
    var containerRect = container.getBoundingClientRect();
    var ratio = img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 0.75;
    var renderedHeight = containerRect.width * ratio;
    ranges.set(img, Math.max(0, renderedHeight - containerRect.height));
  }

  function measureAll() {
    els.forEach(measureOne);
  }

  function update() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    els.forEach(function(img) {
      var container = img.parentElement;
      var rect = container.getBoundingClientRect();
      var total = vh + rect.height;
      var progress = (vh - rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));
      var range = ranges.get(img) || 0;
      img.style.setProperty('--parallax-y', (-progress * range).toFixed(1) + 'px');
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  els.forEach(function(img) {
    if (!img.complete) {
      img.addEventListener('load', function() {
        measureOne(img);
        update();
      }, { once: true });
    }
  });

  measureAll();
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function() {
    measureAll();
    update();
  });
}
