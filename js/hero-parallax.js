(function(){
  var hero = document.querySelector('.page-hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var FACTOR = 0.35;
  var ticking = false;
  var lastY = window.scrollY;

  function applyParallax() {
    ticking = false;
    hero.style.transform = 'translateY(' + (lastY * FACTOR) + 'px)';
  }

  window.addEventListener('scroll', function() {
    lastY = window.scrollY;
    if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
  }, { passive: true });
})();
