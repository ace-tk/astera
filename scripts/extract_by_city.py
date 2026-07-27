#!/usr/bin/env python3
"""Extract AtooPV "by city" service pages into markdown under content/by-city/.

Same approach used for the other service categories: fetch each URL, pull the
article body out of the WordPress page, convert it to markdown, and write one
file per page with a small metadata header (source URL, category, breadcrumb).
"""

import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

URLS = [
    "https://atoopv.com/redaction-pv-cse-grenoble/",
    "https://atoopv.com/redaction-pv-cse-marseille/",
    "https://atoopv.com/redaction-pv-cse-toulouse/",
    "https://atoopv.com/redaction-pv-cse-bordeaux/",
    "https://atoopv.com/redaction-pv-cse-nantes/",
    "https://atoopv.com/redaction-pv-cse-lille/",
    "https://atoopv.com/redaction-pv-cse-saint-etienne/",
    "https://atoopv.com/redaction-pv-cse-clermont-ferrand/",
    "https://atoopv.com/redaction-pv-cse-annecy/",
    "https://atoopv.com/redaction-pv-cse-lyon/",
    "https://atoopv.com/redaction-pv-cse-paris/",
]

CATEGORY = "by-city"
DEFAULT_BREADCRUMB = "Services"
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "content" / "by-city"
USER_AGENT = "Mozilla/5.0 (compatible; AsteraContentBot/1.0)"
REQUEST_DELAY_SECONDS = 1.0


def fetch_html(url: str) -> str:
    response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
    response.raise_for_status()
    return response.text


def extract_title(soup: BeautifulSoup) -> str:
    h1 = soup.select_one("article h1.entry-title") or soup.select_one("h1")
    if h1:
        return h1.get_text(strip=True)
    if soup.title:
        return soup.title.get_text(strip=True)
    return "Untitled"


def extract_breadcrumb(soup: BeautifulSoup) -> str:
    """Read the page's own BreadcrumbList JSON-LD, dropping "Accueil" and the
    current page. Falls back to DEFAULT_BREADCRUMB when the trail is empty
    (the by-city pages sit directly under the site root)."""
    for script in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(script.string or "")
        except (TypeError, ValueError):
            continue
        graph = data.get("@graph", [data]) if isinstance(data, dict) else data
        for node in graph:
            if isinstance(node, dict) and node.get("@type") == "BreadcrumbList":
                items = node.get("itemListElement", [])
                names = [item.get("name") for item in items if isinstance(item, dict)]
                names = [n for n in names if n and n != "Accueil"]
                if names:
                    names = names[:-1]  # drop the current page, keep parent trail
                if names:
                    return " > ".join(names)
    return DEFAULT_BREADCRUMB


def extract_body(soup: BeautifulSoup) -> BeautifulSoup:
    content = (
        soup.select_one("article .entry-content")
        or soup.select_one(".entry-content")
        or soup.select_one("article")
        or soup.select_one("main")
    )
    if content is None:
        raise ValueError("could not locate the main content container")
    for unwanted in content.select("script, style, form, noscript, iframe"):
        unwanted.decompose()
    return content


def to_markdown(content: BeautifulSoup) -> str:
    text = md(str(content), heading_style="ATX", bullets="*")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def slug_from_url(url: str) -> str:
    path = urlparse(url).path.strip("/")
    return path.split("/")[-1] or "index"


def build_markdown(url: str, title: str, breadcrumb: str, body_md: str) -> str:
    return (
        f"# {title}\n\n"
        f"- Source URL: {url}\n"
        f"- Category: {CATEGORY}\n"
        f"- Breadcrumb: {breadcrumb}\n\n"
        f"{body_md}\n"
    )


def process(url: str) -> Path:
    html = fetch_html(url)
    soup = BeautifulSoup(html, "html.parser")

    title = extract_title(soup)
    breadcrumb = extract_breadcrumb(soup)
    body_md = to_markdown(extract_body(soup))
    output = build_markdown(url, title, breadcrumb, body_md)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / f"{slug_from_url(url)}.md"
    out_path.write_text(output, encoding="utf-8")
    return out_path


def main() -> None:
    failures = []
    for i, url in enumerate(URLS):
        try:
            out_path = process(url)
            print(f"[ok]   {url} -> {out_path.relative_to(OUTPUT_DIR.parent.parent)}")
        except Exception as exc:
            failures.append((url, exc))
            print(f"[fail] {url} -> {exc}", file=sys.stderr)
        if i < len(URLS) - 1:
            time.sleep(REQUEST_DELAY_SECONDS)

    if failures:
        print(f"\n{len(failures)} of {len(URLS)} pages failed to extract.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
