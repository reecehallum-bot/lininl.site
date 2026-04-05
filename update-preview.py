#!/usr/bin/env python3
"""
update-preview.py — liminl.site

Run from the site root after adding a new article to journal/index.html:
    python3 update-preview.py

Updates:
  - index.html          "From the Journal" preview (top 2 articles)
  - sitemap.xml         article entries with <lastmod> dates (all articles)
"""

import re
import sys
from pathlib import Path
from html.parser import HTMLParser


class PostListParser(HTMLParser):
    """Extract ordered post items from the journal index post-list."""

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.posts = []
        self._in_list = False
        self._current = None
        self._capture = None  # 'title' | 'excerpt'

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get('class', '').split()

        if 'post-list' in classes:
            self._in_list = True

        if not self._in_list:
            return

        if 'post-link' in classes:
            self._current = {'href': dict(attrs).get('href', ''), 'title': '', 'excerpt': ''}

        if self._current is not None:
            if 'post-item-title' in classes:
                self._capture = 'title'
            elif 'post-excerpt' in classes:
                self._capture = 'excerpt'

    def handle_endtag(self, tag):
        if not self._in_list:
            return
        if tag == 'div' and self._capture:
            self._capture = None
        if tag == 'a' and self._current and self._current['title']:
            self.posts.append(self._current)
            self._current = None

    def handle_data(self, data):
        if self._capture and self._current is not None:
            self._current[self._capture] += data

    def handle_entityref(self, name):
        # Preserve named HTML entities (e.g. &rsquo; &mdash;) as-is
        if self._capture and self._current is not None:
            self._current[self._capture] += f'&{name};'

    def handle_charref(self, name):
        # Preserve numeric HTML entities (e.g. &#8212;) as-is
        if self._capture and self._current is not None:
            self._current[self._capture] += f'&#{name};'


# ---------------------------------------------------------------------------
# Home page preview
# ---------------------------------------------------------------------------

def build_preview_items(posts):
    items = []
    for post in posts[:2]:
        href = post['href']
        title = post['title'].strip()
        excerpt = post['excerpt'].strip()
        items.append(
            f'      <div class="journal-preview-item">\n'
            f'        <a href="{href}" class="journal-preview-link">\n'
            f'          <div class="journal-preview-title">{title}</div>\n'
            f'          <p class="journal-preview-excerpt">{excerpt}</p>\n'
            f'          <span class="journal-preview-read">Read \u2192</span>\n'
            f'        </a>\n'
            f'      </div>'
        )
    return '\n'.join(items)


def update_home(home_path, new_items_html):
    content = home_path.read_text(encoding='utf-8')

    # Match the journal-preview-list div and replace its contents.
    # The closing </div> is uniquely identified by the <a href="/journal/"> that follows.
    pattern = re.compile(
        r'(<div class="journal-preview-list">).*?(</div>\s*\n\s*<a href="/journal/")',
        re.DOTALL,
    )

    def replacement(m):
        return f'{m.group(1)}\n{new_items_html}\n    {m.group(2)}'

    new_content, count = re.subn(pattern, replacement, content, count=1)

    if count == 0:
        sys.exit('ERROR: Could not locate journal-preview-list in index.html — has the markup changed?')

    home_path.write_text(new_content, encoding='utf-8')


# ---------------------------------------------------------------------------
# Sitemap
# ---------------------------------------------------------------------------

def extract_published_date(article_path):
    """Read article:published_time from an article HTML file."""
    try:
        html = article_path.read_text(encoding='utf-8')
        m = re.search(r'<meta property="article:published_time" content="([^"]+)"', html)
        return m.group(1) if m else None
    except OSError:
        return None


def build_sitemap_articles(posts, root):
    """Build XML <url> blocks for all journal articles."""
    entries = []
    for post in posts:
        # Convert href like /journal/co-writing/ to a file path
        slug_path = post['href'].strip('/')          # e.g. journal/co-writing
        article_file = root / slug_path / 'index.html'
        date = extract_published_date(article_file)

        loc = f'https://liminl.music{post["href"]}'
        entry = f'  <url>\n    <loc>{loc}</loc>\n'
        if date:
            entry += f'    <lastmod>{date}</lastmod>\n'
        entry += '    <changefreq>never</changefreq>\n    <priority>0.6</priority>\n  </url>'
        entries.append(entry)
    return '\n'.join(entries)


def update_sitemap(sitemap_path, posts, root):
    content = sitemap_path.read_text(encoding='utf-8')

    new_articles = build_sitemap_articles(posts, root)

    # Replace everything between the end of the /journal/ entry
    # and the start of the /links/ entry with freshly generated article blocks.
    pattern = re.compile(
        r'(  <url>\s*\n\s*<loc>https://liminl\.music/journal/</loc>.*?</url>)\s*\n'
        r'(.*?)'
        r'(\s*<url>\s*\n\s*<loc>https://liminl\.music/links/)',
        re.DOTALL,
    )

    def replacement(m):
        return f'{m.group(1)}\n{new_articles}\n{m.group(3)}'

    new_content, count = re.subn(pattern, replacement, content, count=1)

    if count == 0:
        sys.exit('ERROR: Could not locate article section in sitemap.xml — has the structure changed?')

    sitemap_path.write_text(new_content, encoding='utf-8')


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    root = Path(__file__).parent
    journal_index = root / 'journal' / 'index.html'
    home_index = root / 'index.html'
    sitemap = root / 'sitemap.xml'

    for path in (journal_index, home_index, sitemap):
        if not path.exists():
            sys.exit(f'ERROR: {path} not found')

    parser = PostListParser()
    parser.feed(journal_index.read_text(encoding='utf-8'))

    if not parser.posts:
        sys.exit('ERROR: No posts found in journal/index.html post-list')

    # Home preview (top 2)
    top2 = parser.posts[:2]
    print('Home preview → top 2 articles:')
    for i, post in enumerate(top2, 1):
        print(f'  {i}. {post["title"].strip()} ({post["href"]})')
    update_home(home_index, build_preview_items(top2))
    print('✓ index.html updated')

    # Sitemap (all articles)
    print(f'\nSitemap → {len(parser.posts)} articles:')
    for post in parser.posts:
        slug_path = post['href'].strip('/')
        date = extract_published_date(root / slug_path / 'index.html')
        print(f'  {post["href"]}  {date or "(no date found)"}')
    update_sitemap(sitemap, parser.posts, root)
    print('✓ sitemap.xml updated')


if __name__ == '__main__':
    main()
