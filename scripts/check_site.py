#!/usr/bin/env python3
"""Check generated routes, assets, fragments, metadata, and media attributes. Stdlib only."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.duplicates, self.links, self.errors = set(), [], [], []
        self.h1, self.descriptions, self.canonicals = 0, 0, 0
        self.title = False
        self.feed(text)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if 'id' in attrs:
            value = attrs['id']
            if value in self.ids:
                self.duplicates.append(value)
            self.ids.add(value)
        self.h1 += tag == 'h1'
        self.title |= tag == 'title'
        self.descriptions += tag == 'meta' and attrs.get('name') == 'description' and bool(attrs.get('content'))
        self.canonicals += tag == 'link' and attrs.get('rel') == 'canonical'
        if tag == 'html' and not attrs.get('lang'):
            self.errors.append('missing document language')
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('image without alt text')
        if tag == 'video':
            if attrs.get('preload') != 'none':
                self.errors.append('video must use preload="none"')
            if 'autoplay' in attrs:
                self.errors.append('autoplay must be controlled by viewport/motion preferences')
            if attrs.get('data-video-type') == 'autoplay':
                for key in ('muted', 'loop', 'playsinline', 'controls', 'poster'):
                    if key not in attrs:
                        self.errors.append('autoplay video missing ' + key)
        for key in ('href', 'src', 'poster', 'data-src'):
            if key in attrs:
                self.links.append(attrs[key])
        for key in ('aria-controls', 'aria-describedby'):
            for target in (attrs.get(key) or '').split():
                self.links.append('#' + target)


def main():
    args = argparse.ArgumentParser()
    args.add_argument('site', nargs='?', default='_site')
    args.add_argument('--baseurl', default='')
    options = args.parse_args()
    root = Path(options.site).resolve()
    if not (root / 'index.html').is_file():
        raise SystemExit('Build the Jekyll site before running this check.')
    pages, errors = {}, []
    for file in root.rglob('*.html'):
        text = file.read_text()
        page = pages[file] = Page(text)
        page.errors.extend('duplicate ID: ' + value for value in page.duplicates)
        if not page.title or page.h1 != 1 or page.descriptions != 1 or page.canonicals != 1:
            page.errors.append('expected a title, one h1, one description, and one canonical link')
        if re.search(r'\{[%{]', text):
            page.errors.append('unrendered Liquid syntax')
        errors.extend(f'{file.relative_to(root)}: {error}' for error in page.errors)
    checked_links = 0
    for source, page in pages.items():
        for value in page.links:
            parts = urlsplit(value)
            if parts.scheme or parts.netloc:
                if parts.scheme not in ('https', 'http', 'mailto', 'tel'):
                    errors.append(f'{source.relative_to(root)}: unsupported URL {value}')
                continue
            path = unquote(parts.path)
            if options.baseurl and path.startswith('/'):
                if not path.startswith(options.baseurl + '/'):
                    errors.append(f'{source.relative_to(root)}: path misses baseurl: {value}')
                    continue
                path = path[len(options.baseurl):]
            target = (root / path.lstrip('/')) if path.startswith('/') else (source.parent / path if path else source)
            target = target.resolve()
            if target.is_dir():
                target /= 'index.html'
            if not target.is_relative_to(root) or not target.is_file():
                errors.append(f'{source.relative_to(root)}: missing target {value}')
            elif parts.fragment and target.suffix == '.html':
                target_page = pages.get(target)
                if target_page and unquote(parts.fragment) not in target_page.ids:
                    errors.append(f'{source.relative_to(root)}: missing fragment {value}')
            checked_links += 1
    for route in ('research', 'publications', 'projects', 'life', 'cv'):
        if not (root / route / 'index.html').is_file():
            errors.append('missing required route /' + route + '/')
    for name in ('_private', '_data', '_includes', '_layouts', 'scripts', 'tests', 'docs', 'README.md', 'Gemfile'):
        if (root / name).exists():
            errors.append('source/private file unexpectedly published: ' + name)
    for file in (root / 'assets').rglob('*'):
        if file.is_file() and file.stat().st_size > 12 * 1024 * 1024:
            errors.append('asset exceeds 12 MiB; compress or externally host: ' + str(file.relative_to(root)))
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Site OK: {len(pages)} HTML pages; {checked_links} local references; all required routes and assets present.')


if __name__ == '__main__':
    main()
