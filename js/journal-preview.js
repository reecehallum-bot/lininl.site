// journal-preview.js — auto-populates journal preview sections from feed.json

(function () {
  var containers = document.querySelectorAll('[data-journal-preview]');
  if (!containers.length) return;

  fetch('/journal/feed.json')
    .then(function (r) { return r.json(); })
    .then(function (articles) {
      containers.forEach(function (container) {
        var format = container.dataset.journalPreview;
        var count = parseInt(container.dataset.count || '2', 10);
        var items = articles.slice(0, count);
        var html = '';

        items.forEach(function (a) {
          if (format === 'home') {
            html +=
              '<div class="journal-preview-item">' +
                '<a href="' + a.slug + '" class="journal-preview-link">' +
                  '<div class="journal-preview-title">' + a.title + '</div>' +
                  '<p class="journal-preview-excerpt">' + a.excerpt + '</p>' +
                  '<span class="journal-preview-read">Read \u2192</span>' +
                '</a>' +
              '</div>';
          } else if (format === 'links') {
            html +=
              '<a href="' + a.slug + '" class="post-card">' +
                '<div class="post-body">' +
                  '<div class="post-date">' + a.date + '</div>' +
                  '<div class="post-title">' + a.title + '</div>' +
                  '<div class="post-excerpt">' + a.excerpt + '</div>' +
                '</div>' +
                '<svg class="link-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-top:2px;flex-shrink:0;">' +
                  '<path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>' +
              '</a>';
          }
        });

        container.innerHTML = html;
      });
    })
    .catch(function () {
      // silently fail — hardcoded fallback content remains if present
    });
}());
