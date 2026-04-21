(function(){
  document.querySelectorAll('.testi-slider').forEach(function(slider){
    var slides = slider.querySelectorAll('.testi-slide');
    var dots   = slider.querySelectorAll('.testi-dot');
    var cur = 0, timer;
    function show(n){
      slides[cur].classList.remove('active');
      dots[cur].classList.remove('active');
      cur = (n + slides.length) % slides.length;
      slides[cur].classList.add('active');
      dots[cur].classList.add('active');
    }
    dots.forEach(function(d,i){
      d.addEventListener('click',function(){
        clearInterval(timer);
        show(i);
        timer = setInterval(tick, 5500);
      });
    });
    function tick(){ show(cur + 1); }
    show(0);
    timer = setInterval(tick, 5500);
  });
})();
