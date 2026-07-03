// Fraction of the photo's own height, at each end, that's empty margin
// (grass / raised legs, no faces) — the parallax travel never enters these
// zones, so it always settles on faces at both ends of the scroll.
var TOP_DEAD_ZONE = 0.38;
var BOTTOM_DEAD_ZONE = 0.10;

export function initHeroParallax() {
  var els = document.querySelectorAll('[data-parallax]');
  if (!els.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var bounds = new Map();
  var ticking = false;

  function measureOne(img) {
    var container = img.parentElement;
    var containerRect = container.getBoundingClientRect();
    var ratio = img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1;
    var renderedHeight = containerRect.width * ratio;
    var topDead = renderedHeight * TOP_DEAD_ZONE;
    var bottomDead = renderedHeight * BOTTOM_DEAD_ZONE;
    // offset range: image top edge (y=0) aligns with -topDead at the "latest"
    // position, and the bottom-most usable position keeps bottomDead clear
    // beneath the container.
    var maxOffset = -topDead;
    var minOffset = -(renderedHeight - bottomDead - containerRect.height);
    if (minOffset > maxOffset) minOffset = maxOffset;
    bounds.set(img, { min: minOffset, max: maxOffset });
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
      var b = bounds.get(img) || { min: 0, max: 0 };
      // reversed: starts at the bottom of the photo (lower faces), ends at
      // the top of the photo (upper faces).
      var offset = b.min + progress * (b.max - b.min);
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
