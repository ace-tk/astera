#!/usr/bin/env python3
"""Crawl and extract AtooPV's "Ressources" section into markdown under
content/resources/.

Unlike the flat, hand-picked URL lists used by the other extract_*.py
scripts, the Ressources section is a small hub-and-spoke graph rather than a
fixed set of pages: the nav dropdown points at a handful of hub pages
(guides, modeles-pv, cas-pratiques, actualite-sociale, the veille-juridique
category archive, ...), and those hub pages each link out to individual
article/guide pages that aren't listed in the nav themselves. So this script
does a small breadth-first crawl instead of iterating a fixed URL list:

1. Start from SEED_URLS (the confirmed "Ressources" nav-dropdown pages).
2. Fetch each page, extract + save its main content as markdown.
3. Collect same-domain links found inside that page's own content area.
4. Queue any link that isn't already visited/queued and isn't in
   EXCLUDE_SLUGS (every URL that belongs to a *different* nav section --
   Services, By City, Formations, Communication, Tarifs, A propos,
   Contact, Autodiagnostic, Simulateur, the site root -- confirmed by
   inspecting the live nav menu before writing this script).
5. Category archive pages (e.g. /category/veille-juridique-cse/) are
   paginated; their "page/N" links are followed the same way as any other
   in-scope link, but the page itself is not saved as markdown (an
   auto-generated post listing isn't "page content").

This keeps the crawl scoped to the Ressources subtree without needing a
`/resources/`-style URL prefix to key off (AtooPV's permalinks are flat).
"""

import json
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
    "https://atoopv.com/guides-livres-blancs-cse/",
    "https://atoopv.com/modeles-pv/",
    "https://atoopv.com/modele-pv-cse-premium-integral/",
    "https://atoopv.com/mentions-obligatoires-pv/",
    "https://atoopv.com/cas-pratiques/",
    "https://atoopv.com/actualite-sociale/",
    "https://atoopv.com/jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse/",
    "https://atoopv.com/category/veille-juridique-cse/",
    "https://atoopv.com/comment-lire-arret-cour-de-cassation/",
    "https://atoopv.com/la-minute-cse/",
]

# Every slug that belongs to a nav section other than "Ressources" --
# confirmed against the live main menu on 2026-07 before writing this
# script. Anything reachable from a Ressources page that lands on one of
# these is a cross-link to another part of the site, not part of this
# section, and is left as a plain link in the markdown rather than crawled.
EXCLUDE_SLUGS = {
    "",  # home
    "services", "nos-services-pv", "redaction-pv-cse-a-lacte", "redaction-pv-cssct",
    "redaction-pv-cse", "externaliser-pv-cse", "redaction-pv-irp", "redaction-pv-csec",
    "redaction-du-pv", "externaliser-redaction-pv-cse", "audiotypie-pv-cse",
    "redaction-pv-cse-grenoble", "redaction-pv-cse-marseille", "redaction-pv-cse-toulouse",
    "redaction-pv-cse-bordeaux", "redaction-pv-cse-nantes", "redaction-pv-cse-lille",
    "redaction-pv-cse-saint-etienne", "redaction-pv-cse-clermont-ferrand",
    "redaction-pv-cse-annecy", "redaction-pv-cse-lyon", "redaction-pv-cse-paris",
    "pv-cse-code-travail", "delai-redaction-pv-cse", "tarif-redaction-pv-cse",
    "redacteur-pv-cse", "tarification", "simulateur-de-prix",
    "qui-redige-pv-cse", "approbation-pv-cse", "pv-cse-contenu-obligatoire",
    "pv-cse-moins-50-salaries", "modele-pv-cse-gratuit", "proces-verbal-cse",
    "delai-pv-cse", "contenu-pv-cse", "pv-cse-delit-entrave", "bdese-pv-cse",
    "information-consultation-cse", "reunion-extraordinaire-cse",
    "pv-cse-synthetique-ou-integral",
    "communication-cse", "newsletter-actucse", "communication-asc", "guide-du-comite",
    "formations-elus-cse-agree", "formation-economique-elus-cse", "formation-cse-tresorier",
    "formation-cssct-roles-missions", "formation-pro-communication",
    "formation-droit-social-contrat-travail",
    "a-propos", "faq", "contact", "autodiagnostic", "atoosavoir",
    # Discovered via redirects while crawling: /formations/ 301s to the
    # Formations (Services) landing page under a slightly different slug.
    "formations", "formations-elus-cse-agr",
}

CATEGORY_SLUGS = {"category/veille-juridique-cse"}  # listing pages: crawled for links, not saved

CATEGORY = "resources"
BREADCRUMB = "Ressources"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "content" / "resources"
USER_AGENT = "Mozilla/5.0 (compatible; AsteraContentBot/1.0)"
REQUEST_DELAY_SECONDS = 1.0


def slug_of(url: str) -> str:
    path = urlparse(url).path.strip("/")
    return path


def is_in_scope(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.netloc and DOMAIN not in parsed.netloc:
        return False
    if parsed.scheme not in ("http", "https", ""):
        return False
    path = parsed.path.strip("/")
    base_slug = re.sub(r"/page/\d+$", "", path)  # pagination doesn't change scope
    if base_slug in EXCLUDE_SLUGS:
        return False
    if any(seg in path for seg in ("wp-content", "wp-json", "wp-login", "feed", "/tag/", "/author/")):
        return False
    return True


def fetch(url: str) -> tuple[str, str]:
    """Returns (html, final_url) -- final_url differs from url when the
    server 301s (requests follows redirects transparently by default), and
    the *resolved* slug is what actually matters for scope decisions."""
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
    response.raise_for_status()
    return response.text, response.url


def extract_title(soup: BeautifulSoup) -> str:
    h1 = soup.select_one("article h1.entry-title") or soup.select_one("h1")
    if h1:
        # Some hero headings split their text across <br> line breaks with
        # no whitespace in between ("CSE<br>Ce que..."); a plain get_text()
        # would glue those lines together into one mashed-up word.
        text = h1.get_text(" ", strip=True)
        return re.sub(r"\s+", " ", text)
    if soup.title:
        return soup.title.get_text(strip=True)
    return "Untitled"


def normalize_lazy_images(content) -> None:
    """This theme's lazy-load plugin (EWWW) ships every <img src> as a tiny
    base64 placeholder blob and puts the real URL in data-src/data-srcset --
    swapped in by JS on scroll, which never runs for a plain requests GET.
    Left alone, markdownify would emit a multi-KB base64 data: URI per
    image instead of a real link."""
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


def extract_listing_links(soup: BeautifulSoup, base_url: str) -> list[str]:
    """Category/archive pages carry an empty `.entry-content` decoy (an
    unset "category description" box in this theme) -- the real post grid
    lives elsewhere in <main>, so listing pages skip extract_body entirely."""
    main = soup.select_one("main") or soup.select_one("#primary")
    if main is None:
        raise ValueError("could not locate the main container on a listing page")
    return content_links(main, base_url)


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


def process(url: str, is_listing: bool) -> tuple[Path | None, list[str], str]:
    html, final_url = fetch(url)
    soup = BeautifulSoup(html, "html.parser")

    if is_listing:
        return None, extract_listing_links(soup, final_url), final_url

    # A redirect can land on a page outside Ressources (e.g. /formations/
    # 301s to the Formations/Services landing page) -- re-check scope
    # against the *resolved* URL before saving anything under it.
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
    skipped_listing: list[str] = []
    failed: list[tuple[str, str]] = []

    while frontier:
        url = frontier.pop(0)
        if url in visited:
            continue
        visited.add(url)

        slug = slug_of(url)
        base_slug = re.sub(r"/page/\d+$", "", slug)
        is_listing = base_slug in CATEGORY_SLUGS

        try:
            out_path, links, final_url = process(url, is_listing)
        except Exception as exc:
            failed.append((url, str(exc)))
            print(f"[fail] {url} -> {exc}", file=sys.stderr)
            time.sleep(REQUEST_DELAY_SECONDS)
            continue

        if final_url != url:
            visited.add(final_url)

        if is_listing:
            skipped_listing.append(url)
            print(f"[listing] {url} -> {len(links)} links found, not saved")
        elif out_path is None:
            print(f"[skip] {url} -> redirected to {final_url}, out of scope")
        else:
            extracted.append((final_url, out_path))
            print(f"[ok] {url} -> {out_path.relative_to(OUTPUT_DIR.parent.parent)}")

        for link in links:
            if link not in visited and link not in frontier and is_in_scope(link):
                frontier.append(link)

        time.sleep(REQUEST_DELAY_SECONDS)

    # A page can be reached by more than one URL (e.g. a 301 alias like
    # /livres-blancs/ -> /guides-livres-blancs-cse/), which writes the same
    # file twice under different source URLs -- dedupe by output path so
    # the summary reports actual unique files, not crawl visits.
    unique_by_path = {}
    for url, path in extracted:
        unique_by_path.setdefault(path, url)

    print("\n--- summary ---")
    print(f"Extracted {len(unique_by_path)} unique pages ({len(extracted)} URLs crawled, including redirect aliases):")
    for path, url in sorted(unique_by_path.items()):
        print(f"  {url} -> {path.relative_to(OUTPUT_DIR.parent.parent)}")
    if skipped_listing:
        print(f"\nListing/archive pages crawled for links but not saved ({len(skipped_listing)}):")
        for url in skipped_listing:
            print(f"  {url}")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for url, err in failed:
            print(f"  {url} -> {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
