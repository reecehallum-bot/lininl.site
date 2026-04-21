(function(){
  document.querySelectorAll('.testi-slider').forEach(function(slider){
    var slides = slider.querySelectorAll('.testi-slide');
    var dots   = slider.querySelectorAll('.testi-dot');
    var prev   = slider.querySelector('.testi-prev');
    var next   = slider.querySelector('.testi-next');
    var cur = 0, timer, touchX = null;

    function show(n){
      var to = (n + slides.length) % slides.length;
      if(to === cur) return;
      slides[cur].classList.remove('active');
      dots[cur].classList.remove('active');
      cur = to;
      slides[cur].classList.add('active');
      dots[cur].classList.add('active');
    }

    function advance(){ show(cur + 1); }
    function startTimer(){ timer = setInterval(advance, 5500); }
    function stopTimer(){ clearInterval(timer); }
    function restart(n){ stopTimer(); show(n); startTimer(); }

    if(prev) prev.addEventListener('click', function(){ restart(cur - 1); });
    if(next) next.addEventListener('click', function(){ restart(cur + 1); });
    dots.forEach(function(d,i){ d.addEventListener('click', function(){ restart(i); }); });

    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);

    slider.addEventListener('touchstart', function(e){ touchX = e.touches[0].clientX; }, {passive:true});
    slider.addEventListener('touchend', function(e){
      if(touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if(Math.abs(dx) > 44) restart(dx < 0 ? cur + 1 : cur - 1);
    }, {passive:true});

    slides[0].classList.add('active');
    dots[0].classList.add('active');
    startTimer();
  });
})();
