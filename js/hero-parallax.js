(function(){
  var hero = document.querySelector('.page-hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var FACTOR = 0.3;
  var ticking = false;
  var baseY = getComputedStyle(hero).backgroundPositionY || '50%';
  if (baseY === 'center') baseY = '50%';

  function applyParallax() {
    ticking = false;
    var sy = window.pageYOffset || window.scrollY;
    hero.style.backgroundPositionY = 'calc(' + baseY + ' + ' + (sy * FACTOR) + 'px)';
  }

  window.addEventListener('scroll', function() {
    if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
  }, { passive: true });

  applyParallax();
})();
