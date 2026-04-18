(function(){
  var tabs   = document.querySelectorAll('.tab[data-tab]');
  var panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length) return;

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      var target = this.dataset.tab;
      tabs.forEach(function(t){ t.classList.remove('active'); });
      panels.forEach(function(p){ p.classList.remove('active'); });
      this.classList.add('active');
      var panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });
}());
