#!/usr/bin/env python3
"""Crawl and extract AtooPV's "atoosavoir" section into markdown under
content/atoosavoir/.

atoosavoir is a single top-level nav item (no dropdown) that links straight
to https://atoopv.com/atoosavoir/. That landing page itself links out to a
couple of sub-pages that live under the same /atoosavoir/... URL prefix
(an example fiche, the section's own CGV) plus several cross-links to other
site sections (services, formations, politique-de-confidentialite) that
belong to different nav items and must NOT be crawled here.

Rather than hand-list the sub-pages, this does a tiny breadth-first crawl
scoped by URL prefix: only links whose path starts with "atoosavoir" (the
section's own subtree) are followed. Everything else is left as a plain
link in the markdown.
"""

import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

DOMAIN = "atoopv.com"
SEED_URLS = [
    "https://atoopv.com/atoosavoir/",
]

CATEGORY = "atoosavoir"
BREADCRUMB = "atoosavoir"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "content" / "atoosavoir"
USER_AGENT = "Mozilla/5.0 (compatible; AsteraContentBot/1.0)"
REQUEST_DELAY_SECONDS = 1.0


def slug_of(url: str) -> str:
    return urlparse(url).path.strip("/")


def is_in_scope(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.netloc and DOMAIN not in parsed.netloc:
        return False
    if parsed.scheme not in ("http", "https", ""):
        return False
    path = parsed.path.strip("/")
    if path != "atoosavoir" and not path.startswith("atoosavoir/"):
        return False
    if any(seg in path for seg in ("wp-content", "wp-json", "wp-login", "feed", "/tag/", "/author/")):
        return False
    return True


def fetch(url: str) -> tuple[str, str]:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
    response.raise_for_status()
    return response.text, response.url


def extract_title(soup: BeautifulSoup) -> str:
    h1 = soup.select_one("article h1.entry-title") or soup.select_one("h1")
    if h1:
        text = h1.get_text(" ", strip=True)
        return re.sub(r"\s+", " ", text)
    if soup.title:
        return soup.title.get_text(strip=True)
    return "Untitled"


def normalize_lazy_images(content) -> None:
    for img in content.find_all("img"):
        real_src = img.get("data-src") or img.get("data-lazy-src")
        if real_src:
            img["src"] = real_src.split("?")[0]
        real_srcset = img.get("data-srcset") or img.get("data-lazy-srcset")
        if real_srcset:
            img["srcset"] = real_srcset


def extract_body(soup: BeautifulSoup):
    content = (
        soup.select_one("article .entry-content")
        or soup.select_one(".entry-content")
        or soup.select_one("main")
    )
    if content is None:
        raise ValueError("could not locate the main content container")
    for unwanted in content.select("script, style, form, noscript, iframe"):
        unwanted.decompose()
    normalize_lazy_images(content)
    return content


def content_links(content, base_url: str) -> list[str]:
    links = []
    for a in content.find_all("a", href=True):
        href = a["href"]
        if href.startswith(("mailto:", "tel:", "javascript:", "#")):
            continue
        absolute = urljoin(base_url, href)
        if DOMAIN in urlparse(absolute).netloc:
            links.append(absolute.split("#")[0])
    return links


def to_markdown(content) -> str:
    text = md(str(content), heading_style="ATX", bullets="*", table_infer_header=True)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def build_markdown(url: str, title: str, body_md: str) -> str:
    return (
        f"# {title}\n\n"
        f"- Source URL: {url}\n"
        f"- Category: {CATEGORY}\n"
        f"- Breadcrumb: {BREADCRUMB}\n\n"
        f"{body_md}\n"
    )


def process(url: str) -> tuple[Path | None, list[str], str]:
    html, final_url = fetch(url)
    soup = BeautifulSoup(html, "html.parser")

    if final_url != url and not is_in_scope(final_url):
        return None, [], final_url

    content = extract_body(soup)
    links = content_links(content, final_url)
    title = extract_title(soup)
    body_md = to_markdown(content)
    output = build_markdown(final_url, title, body_md)

    slug = slug_of(final_url).replace("/", "-") or "index"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{slug}.md"
    out_path.write_text(output, encoding="utf-8")
    return out_path, links, final_url


def main() -> None:
    visited: set[str] = set()
    frontier: list[str] = list(SEED_URLS)
    extracted: list[tuple[str, Path]] = []
    failed: list[tuple[str, str]] = []

    while frontier:
        url = frontier.pop(0)
        if url in visited:
            continue
        visited.add(url)

        try:
            out_path, links, final_url = process(url)
        except Exception as exc:
            failed.append((url, str(exc)))
            print(f"[fail] {url} -> {exc}", file=sys.stderr)
            time.sleep(REQUEST_DELAY_SECONDS)
            continue

        if final_url != url:
            visited.add(final_url)

        if out_path is None:
            print(f"[skip] {url} -> redirected to {final_url}, out of scope")
        else:
            extracted.append((final_url, out_path))
            print(f"[ok] {url} -> {out_path.relative_to(OUTPUT_DIR.parent.parent)}")

        for link in links:
            if link not in visited and link not in frontier and is_in_scope(link):
                frontier.append(link)

        time.sleep(REQUEST_DELAY_SECONDS)

    unique_by_path = {}
    for url, path in extracted:
        unique_by_path.setdefault(path, url)

    print("\n--- summary ---")
    print(f"Extracted {len(unique_by_path)} unique pages ({len(extracted)} URLs crawled):")
    for path, url in sorted(unique_by_path.items()):
        print(f"  {url} -> {path.relative_to(OUTPUT_DIR.parent.parent)}")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for url, err in failed:
            print(f"  {url} -> {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
