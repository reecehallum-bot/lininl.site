// ── article.js — interactive components for long-form journal articles ──

document.addEventListener('DOMContentLoaded', function () {

  // ── Platform priority tabs ─────────────────────────────────────────────
  document.querySelectorAll('.tab-row .tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tab = this.dataset.tab;
      document.querySelectorAll('.tab-row .tab').forEach(function (t) {
        t.classList.remove('active');
      });
      document.querySelectorAll('.platform-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      this.classList.add('active');
      var panel = document.getElementById('platform-' + tab);
      if (panel) { panel.classList.add('active'); }
    });
  });

  // ── FAQ accordion ──────────────────────────────────────────────────────
  document.querySelectorAll('.faq-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var body = this.nextElementSibling;
      var isOpen = this.classList.contains('open');
      document.querySelectorAll('.faq-toggle.open').forEach(function (b) {
        b.classList.remove('open');
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.style.maxHeight = '';
      });
      if (!isOpen) {
        this.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

});
