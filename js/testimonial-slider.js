(function(){
  document.querySelectorAll('.testi-slider').forEach(function(slider){
    var slides = slider.querySelectorAll('.testi-slide');
    var dots   = slider.querySelectorAll('.testi-dot');
    var prev   = slider.querySelector('.testi-prev');
    var next   = slider.querySelector('.testi-next');
    var cur = 0, timer;

    function show(n){
      var newCur = (n + slides.length) % slides.length;
      var out = slides[cur];
      out.classList.remove('active');
      out.classList.add('exiting');
      dots[cur].classList.remove('active');
      cur = newCur;
      slides[cur].classList.add('active');
      dots[cur].classList.add('active');
      setTimeout(function(){ out.classList.remove('exiting'); }, 500);
    }

    function restart(n){ clearInterval(timer); show(n); timer = setInterval(tick, 5500); }
    function tick(){ show(cur + 1); }

    dots.forEach(function(d,i){ d.addEventListener('click', function(){ restart(i); }); });
    if(prev) prev.addEventListener('click', function(){ restart(cur - 1); });
    if(next) next.addEventListener('click', function(){ restart(cur + 1); });

    slides[0].classList.add('active');
    dots[0].classList.add('active');
    timer = setInterval(tick, 5500);
  });
})();
