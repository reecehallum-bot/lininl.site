# liminl.site — CLAUDE.md

## Purpose of this session
This Claude Code session is configured purely for **adding new blog articles** to liminl.site. Every article added must be complete: correct metadata, schema markup, internal links, feed.json entry, journal index entry, and sitemap — nothing half-done.

## Stack
Static HTML site. No build framework. Deployed via Netlify. Python script (`update-preview.py`) handles sitemap, homepage preview, and links page updates.

## Development branch
All changes go to: `claude/blog-article-setup-px3V5`

---

## Adding a new article — complete checklist

1. **Create** `/journal/{slug}/index.html` using the template below
2. **Update** `journal/index.html` — prepend new `<div class="post-item">` block at the TOP of `.post-list`, and add a new `ListItem` to the JSON-LD `ItemList` (update all existing positions by +1)
3. **Update** `journal/feed.json` — prepend new entry at the TOP of the array
4. **Run** `python3 update-preview.py` — updates homepage preview, links page, and sitemap automatically
5. **Commit** all changed files, **push** to branch

### Slug conventions
- Lowercase, hyphen-separated, no trailing slash in directory name
- URL will be: `https://liminl.music/journal/{slug}/`

### Date format
- `article:published_time` / `datePublished`: ISO format `YYYY-MM-DD` (e.g. `2026-04-17`)
- `post-meta` / feed.json `date`: Human format `Month YYYY` (e.g. `April 2026`)

---

## Article HTML template

Copy this exactly. Replace every `{PLACEHOLDER}` before saving.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{SEO_TITLE} — Songwriting | liminl.</title>
<meta name="description" content="{META_DESCRIPTION}">
<link rel="canonical" href="https://liminl.music/journal/{SLUG}/">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="https://liminl.music/journal/{SLUG}/">
<meta property="og:title" content="{SEO_TITLE} — liminl.">
<meta property="og:description" content="{META_DESCRIPTION}">
<meta property="og:image" content="https://liminl.music/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_NZ">
<meta property="og:site_name" content="liminl.">
<meta property="article:published_time" content="{YYYY-MM-DD}">
<meta property="article:author" content="Reece Hallum">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{SEO_TITLE} — liminl.">
<meta name="twitter:description" content="{META_DESCRIPTION}">
<meta name="twitter:image" content="https://liminl.music/og-image.jpg">
<meta name="twitter:creator" content="@liminl.music">

<link rel="stylesheet" href="/shared.css">
<link rel="stylesheet" href="/journal/journal.css">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{H1_TITLE}",
  "description": "{META_DESCRIPTION}",
  "author": {
    "@type": "Person",
    "name": "Reece Hallum",
    "url": "https://liminl.music"
  },
  "publisher": {
    "@type": "Person",
    "name": "liminl.",
    "url": "https://liminl.music"
  },
  "datePublished": "{YYYY-MM-DD}",
  "dateModified": "{YYYY-MM-DD}",
  "url": "https://liminl.music/journal/{SLUG}/",
  "image": "https://liminl.music/og-image.jpg",
  "mainEntityOfPage": "https://liminl.music/journal/{SLUG}/",
  "keywords": ["{keyword 1}", "{keyword 2}", "{keyword 3}", "{keyword 4}"],
  "articleSection": "Songwriting Craft",
  "wordCount": {WORD_COUNT}
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://liminl.music" },
    { "@type": "ListItem", "position": 2, "name": "Journal", "item": "https://liminl.music/journal/" },
    { "@type": "ListItem", "position": 3, "name": "{H1_TITLE}", "item": "https://liminl.music/journal/{SLUG}/" }
  ]
}
</script>
</head>
<body>
<div class="veil"></div>
<div class="grain"></div>
<div class="vignette"></div>
<div class="wrap">
  <nav>
    <a href="/" class="logo">liminl<span class="logo-dot">.</span></a>
    <div class="nav-links">
      <a href="/journal/" class="nav-email nav-active">Journal</a>
      <a href="mailto:hello&#64;liminl.music" class="nav-icon" aria-label="Email">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="3" width="13" height="9" rx="1" stroke="currentColor" stroke-width="1.1"/>
          <path d="M1 4.5L7.5 9L14 4.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
        </svg>
      </a>
    </div>
  </nav>

  <main>
  <div class="post-wrap">
    <a href="/journal/" class="back-link">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 2L4 7L9 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      All posts
    </a>

    <div class="post-meta">{Month YYYY}</div>
    <h1 class="post-title">{H1_TITLE}</h1>

    <div class="post-body">

      <!-- ARTICLE CONTENT HERE -->
      <!-- Use <p>, <h2>, <em>, <a href="..."> only -->
      <!-- Smart quotes: &rsquo; &lsquo; &rdquo; &ldquo; -->
      <!-- Em dash: &mdash; -->
      <!-- End with email CTA inline link: <a href="mailto:hello&#64;liminl.music">that&rsquo;s worth a conversation</a> -->
      <!-- Then optionally add FAQ accordion (see below) -->

    </div>

  </div>

  </main>
  <section class="article-cta">
    <p class="article-cta-note">Working on something? Reach out.</p>
    <a href="mailto:hello&#64;liminl.music?subject=Inquiry%3A%20%5BProject%20Name%5D%20x%20Liminl" class="article-cta-link">hello@<span class="cta-name">liminl</span><span class="cta-dot">.</span>music</a>
    <div class="article-cta-social">
      <a href="https://www.instagram.com/liminl.music" target="_blank" rel="noopener noreferrer">@liminl.music</a>
    </div>
  </section>
  <footer>
    <p class="footer-text">liminl. &mdash; &copy; 2026</p>
  </footer>
</div>
<script src="/js/bg.js"></script>
<!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "b4095234e95b45ee91b00a4fd16a1f0b"}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
```

---

## journal/index.html — post-item block to prepend

Add at the **top** of `<div class="post-list">`:

```html
    <div class="post-item">
      <a href="/journal/{SLUG}/" class="post-link">
        <div class="post-date">{Month YYYY}</div>
        <div class="post-item-title">{DISPLAY_TITLE}</div>
        <div class="post-excerpt">{EXCERPT_HTML}</div>
      </a>
    </div>
```

Also update the JSON-LD `ItemList` in `journal/index.html`:
- Increment all existing `"position"` values by 1
- Insert new entry at position 1:
```json
    { "@type": "ListItem", "position": 1, "url": "https://liminl.music/journal/{SLUG}/", "name": "{DISPLAY_TITLE}" },
```

---

## feed.json — entry to prepend

Add at the **top** of the array:

```json
  {
    "title": "{DISPLAY_TITLE}",
    "slug": "/journal/{SLUG}/",
    "date": "{Month YYYY}",
    "excerpt": "{PLAIN_TEXT_EXCERPT}"
  },
```

Note: `excerpt` in feed.json uses plain text (no HTML entities). The journal/index.html post-list uses HTML entities (`&rsquo;` etc.).

---

## Internal linking — existing articles

Always link new articles to relevant existing ones, and consider whether any existing article should link back. Link text should be natural, in-sentence anchor text — never "click here".

| Slug | Title | Topic |
|------|-------|-------|
| `/journal/promote-your-music/` | How to Promote Your Music as an Indie Artist | Indie promotion, step-by-step |
| `/journal/music-marketing/` | Music Marketing for Indie Artists — The 2026 Guide | Full marketing guide, fanbases, playlists, sync |
| `/journal/bridge/` | What a Bridge Is Actually For | Song structure, bridge writing |
| `/journal/verse/` | What the Verse Is Actually For | Verse writing, building stakes |
| `/journal/co-writing/` | How to Co-Write a Song | Collaboration, co-writing sessions |
| `/journal/pre-chorus/` | What Is a Pre-Chorus? | Pre-chorus function and writing |
| `/journal/what-makes-a-hook/` | What Makes a Hook Land | Hook writing, compression |
| `/journal/generic-lyrics/` | Why Your Lyrics Sound Generic | Specificity, ownership in lyrics |
| `/journal/song-moments/` | What Makes a Song Feel Like a Moment | Song arc, movement vs. loop |
| `/journal/scene-test/` | Why Most Songs Fail the "Scene Test" | Visual specificity, scene-building |

### Linking guidelines
- Aim for 2–4 internal links per article
- Links should appear mid-paragraph where contextually natural
- Anchor text previews the destination concept, not the URL
- Always end body content with an email CTA link: `<a href="mailto:hello&#64;liminl.music">that&rsquo;s worth a conversation</a>`

---

## Writing style guide

- Tone: direct, practitioner-level, no filler
- No "In this article we'll cover…" openers
- Avoid adjectives that describe feeling without showing situation
- Smart typography: `&rsquo;` `&lsquo;` `&rdquo;` `&ldquo;` `&mdash;` (no straight quotes or double-hyphen dashes in HTML)
- Length: 500–900 words, structured with `<h2>` sections
- SEO title (`<title>` / og:title): keyword-forward, under 60 chars
- Meta description: 140–155 chars, states the specific insight
- `wordCount` in JSON-LD: count body text words (approximate is fine)

---

## Metadata field reference

| Field | Where used | Notes |
|-------|-----------|-------|
| `{SLUG}` | Directory name, canonical URL, all hrefs | Lowercase, hyphenated |
| `{SEO_TITLE}` | `<title>`, og:title, twitter:title | Keyword-first, ≤60 chars |
| `{H1_TITLE}` | `<h1>`, JSON-LD headline, breadcrumb | Can differ from SEO title |
| `{META_DESCRIPTION}` | meta description, og:description, twitter:description, JSON-LD description | 140–155 chars |
| `{YYYY-MM-DD}` | article:published_time, datePublished | ISO date, drives sitemap lastmod |
| `{Month YYYY}` | post-meta div, feed.json date | Human-readable |
| `{WORD_COUNT}` | JSON-LD wordCount | Approximate body word count |
| `{keywords}` | JSON-LD keywords array | 4–6 specific search terms |

---

## FAQ accordion (optional but recommended for SEO)

When adding a FAQ, place it inside `.post-body` after the email CTA paragraph, and load `article.js`. CSS lives in `journal/journal.css` (shared). FAQPage JSON-LD goes in `<head>`.

```html
      <div class="faq-section">
        <div class="faq-section-label">Common questions</div>
        <div class="faq-list">
          <div class="faq-item">
            <button class="faq-toggle" aria-expanded="false">
              <span class="faq-q">Question text?</span>
              <svg class="faq-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 5l4.5 4.5 4.5-4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="faq-body" role="region">
              <p>Answer text.</p>
            </div>
          </div>
        </div>
      </div>
```

Add before `</body>`:
```html
<script src="/js/article.js"></script>
```

---

## After writing — run the update script

```bash
python3 update-preview.py
```

This updates:
- `index.html` — "From the Journal" preview (top 2 articles from journal/index.html)
- `links/index.html` — Journal section (top 2 articles)
- `sitemap.xml` — all article `<lastmod>` dates (reads from `article:published_time` meta tag)

The script reads order from `journal/index.html` post-list — the first item in the list is treated as the newest.

---

## Git workflow

```bash
git add journal/{slug}/index.html journal/index.html journal/feed.json index.html links/index.html sitemap.xml
git commit -m "add: {article title}"
git push -u origin claude/blog-article-setup-px3V5
```
