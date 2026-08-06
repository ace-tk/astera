#!/usr/bin/env python3
"""Crawl and extract AtooPV's "Services" section into markdown under
content/{drafting,by-city,tarifs-infos,guides,communication,training}/.

Same BFS approach as extract_resources.py: the Services nav dropdown is a
hub-and-spoke graph (six sub-menus, each anchored on a hub page that links
out to its own children), not a flat list, so this crawls outward from a
confirmed set of nav URLs rather than iterating a fixed list:

1. Start from SEED_URLS (every URL found in the live "Services" nav dropdown
   on 2026-08 — confirmed by walking the rendered <nav> HTML, not guessed).
   Each seed is pre-assigned to the category folder its nav group maps to.
2. Fetch each page, extract + save its main content as markdown into that
   category's folder.
3. Collect same-domain links found inside that page's own content area.
4. Queue any in-scope link that isn't already visited/queued. A
   BFS-discovered link not already in CATEGORY_OF inherits its *parent*
   page's category (a page's own further links almost always stay within
   its own section).
5. EXCLUDE_SLUGS is every slug confirmed to belong to a different top-nav
   section (Ressources, Autodiagnostic, AtooSavoir, Contact, Tarification,
   the site root, ...) so the crawl doesn't wander out of Services.

Two legacy quirks discovered while writing this:
- The old /services/<slug>/ URLs (used by an earlier, now-stale extraction)
  301-redirect to flat, un-prefixed URLs (e.g. /services/redaction-pv-cse/
  -> /redaction-pv-cse/). SEED_URLS uses the current flat URLs directly.
- /services/ itself (the "Tous nos services" hub) is saved as
  content/drafting/services.md, its historical location — Services.jsx
  reads it directly by slug, the same way RessourceArticle's index route
  reads "guides-livres-blancs-cse" directly for Ressources.
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
BREADCRUMB = "Services"
OUTPUT_ROOT = Path(__file__).resolve().parent.parent / "content"
USER_AGENT = "Mozilla/5.0 (compatible; AsteraContentBot/1.0)"
REQUEST_DELAY_SECONDS = 1.0

# slug -> category folder, for every URL confirmed in the live Services nav.
CATEGORY_OF = {
    "services": "drafting",
    "nos-services-pv": "drafting",
    "redaction-pv-cse": "drafting",
    "redaction-pv-cse-a-lacte": "drafting",
    "redaction-pv-cssct": "drafting",
    "externaliser-pv-cse": "drafting",
    "redaction-pv-irp": "drafting",
    "redaction-pv-csec": "drafting",
    "redaction-pv-cse-grenoble": "by-city",
    "redaction-pv-cse-marseille": "by-city",
    "redaction-pv-cse-toulouse": "by-city",
    "redaction-pv-cse-bordeaux": "by-city",
    "redaction-pv-cse-nantes": "by-city",
    "redaction-pv-cse-lille": "by-city",
    "redaction-pv-cse-saint-etienne": "by-city",
    "redaction-pv-cse-clermont-ferrand": "by-city",
    "redaction-pv-cse-annecy": "by-city",
    "redaction-pv-cse-lyon": "by-city",
    "redaction-pv-cse-paris": "by-city",
    "tarif-redaction-pv-cse": "tarifs-infos",
    "pv-cse-code-travail": "tarifs-infos",
    "delai-redaction-pv-cse": "tarifs-infos",
    "redacteur-pv-cse": "tarifs-infos",
    "qui-redige-pv-cse": "guides",
    "approbation-pv-cse": "guides",
    "pv-cse-contenu-obligatoire": "guides",
    "pv-cse-moins-50-salaries": "guides",
    "modele-pv-cse-gratuit": "guides",
    "proces-verbal-cse": "guides",
    "delai-pv-cse": "guides",
    "contenu-pv-cse": "guides",
    "pv-cse-delit-entrave": "guides",
    "bdese-pv-cse": "guides",
    "information-consultation-cse": "guides",
    "reunion-extraordinaire-cse": "guides",
    "pv-cse-synthetique-ou-integral": "guides",
    "communication-cse": "communication",
    "newsletter-actucse": "communication",
    "communication-asc": "communication",
    "guide-du-comite": "communication",
    "formations-elus-cse-agree": "training",
    "formation-economique-elus-cse": "training",
    "formation-cse-tresorier": "training",
    "formation-cssct-roles-missions": "training",
    "formation-pro-communication": "training",
    "formation-droit-social-contrat-travail": "training",
}
SEED_URLS = [f"https://atoopv.com/{slug}/" for slug in CATEGORY_OF]

# Every slug confirmed to belong to a *different* top-nav section (Ressources
# article slugs, Autodiagnostic, AtooSavoir, About, Contact, Tarification,
# the home page, category-archive aliases) -- reachable from a Services page
# but out of scope for this crawl.
EXCLUDE_SLUGS = {
    "",
    "a-propos", "faq", "contact", "autodiagnostic", "autodiagnostic-cse",
    "atoosavoir", "atoosavoir/exemple", "atoosavoir/cgv",
    "tarification", "simulateur-de-prix",
    "category/veille-juridique-cse", "livres-blancs",
    "tickets-restaurant-teletravail-droit-teletravailleur",
    # Site-wide pages, not Services content: an auto-generated post-listing
    # archive (empty entry-content decoy, same issue as the Ressources
    # category archives -- see extract_resources.py's docstring) and a
    # whole-site HTML sitemap.
    "actualites", "plan-du-site",
    "actualite-sociale", "arret-maladie-duree-legale-lfss-2026-droits-salarie",
    "canicule-travail-decret-2025-482-obligations-employeur-cse", "cas-pratiques",
    "comment-lire-arret-cour-de-cassation", "commissaire-de-justice-cse-constat-entrave",
    "competences-elu-cse-mandat", "compteur-cp-arret-maladie-verifications-avant-solder",
    "conge-paye-vendredi-37h-decompte-jours-ouvrables",
    "conges-payes-heures-supplementaires-calcul-bulletins-paie",
    "demission-mandat-cse-elu-protection",
    "droit-image-salarie-depart-jurisprudence-cour-cassation",
    "droits-elus-cse-guide-juridique",
    "grossesse-licenciement-nul-protection-salariee-cour-cassation-2026",
    "guides-livres-blancs-cse", "harcelement-moral-methodes-gestion-cse",
    "heures-supplementaires-annualisation-arret-maladie-calcul-cour-cassation",
    "heures-supplementaires-conges-payes-calcul",
    "histoire-cse-comite-entreprise-cnr-1943",
    "jurisprudence-sociale-les-arrets-qui-comptent-pour-le-cse", "la-minute-cse",
    "mentions-obligatoires-pv", "mise-a-pied-conservatoire-elu-cse",
    "modele-pv-cse-premium-integral", "modeles-pv", "proces-verbal",
    "reglement-interieur-fin-depot-greffe-mai-2026-loi-simplification",
    "reorganisation-silencieuse-cse-demissions",
    "signature-du-proces-verbal-de-reunion-du-cse", "solde-de-tout-compte-signature",
    "surveillance-salaries-cnil-cse", "teletravail-impose-cse-droits-employeur",
    "tickets-restaurant-teletravail-droit-teletravailleurs",
    "veille-juridique-cse-8-25-juillet-2026", "veille-sociale-cse-juin-2026",
}


def slug_of(url: str) -> str:
    return urlparse(url).path.strip("/")


def is_in_scope(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.netloc and DOMAIN not in parsed.netloc:
        return False
    if parsed.scheme not in ("http", "https", ""):
        return False
    path = slug_of(url)
    if path.startswith("services/"):
        path = path[len("services/"):]  # legacy /services/<slug>/ alias
    if path in EXCLUDE_SLUGS:
        return False
    if any(seg in path for seg in ("wp-content", "wp-json", "wp-login", "feed", "/tag/", "/author/", "/page/")):
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
        or soup.select_one("article")
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


def build_markdown(url: str, title: str, category: str, body_md: str) -> str:
    return (
        f"# {title}\n\n"
        f"- Source URL: {url}\n"
        f"- Category: {category}\n"
        f"- Breadcrumb: {BREADCRUMB}\n\n"
        f"{body_md}\n"
    )


def process(url: str, category: str) -> tuple[Path | None, list[str], str]:
    html, final_url = fetch(url)
    soup = BeautifulSoup(html, "html.parser")

    if final_url != url and not is_in_scope(final_url):
        return None, [], final_url

    slug = slug_of(final_url).replace("/", "-") or "index"
    if slug.startswith("services-") and slug != "services":
        slug = slug[len("services-"):]  # legacy /services/<slug>/ alias resolved
    # A redirect or an alias slug (e.g. .../formations-elus-cse-agree-esss/
    # -> .../formations-elus-cse-agree/) can resolve to a page that already
    # has an authoritative category in CATEGORY_OF -- that always wins over
    # whatever category the *discovering* page passed in, so the same page
    # never gets saved twice under two different category folders.
    category = CATEGORY_OF.get(slug, category)

    content = extract_body(soup)
    links = content_links(content, final_url)
    title = extract_title(soup)
    body_md = to_markdown(content)
    output = build_markdown(final_url, title, category, body_md)

    out_dir = OUTPUT_ROOT / category
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.md"
    out_path.write_text(output, encoding="utf-8")
    return out_path, links, final_url


def main() -> None:
    visited: set[str] = set()
    frontier: list[tuple[str, str]] = [(url, CATEGORY_OF[slug_of(url)]) for url in SEED_URLS]
    extracted: list[tuple[str, Path]] = []
    failed: list[tuple[str, str]] = []

    while frontier:
        url, category = frontier.pop(0)
        if url in visited:
            continue
        visited.add(url)

        try:
            out_path, links, final_url = process(url, category)
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
            print(f"[ok] {url} -> {out_path.relative_to(OUTPUT_ROOT.parent)}")

        for link in links:
            if link in visited or any(link == f for f, _ in frontier):
                continue
            if not is_in_scope(link):
                continue
            link_slug = slug_of(link)
            if link_slug.startswith("services/"):
                link_slug = link_slug[len("services/"):]
            link_category = CATEGORY_OF.get(link_slug, category)
            frontier.append((link, link_category))

        time.sleep(REQUEST_DELAY_SECONDS)

    unique_by_path = {}
    for url, path in extracted:
        unique_by_path.setdefault(path, url)

    print("\n--- summary ---")
    print(f"Extracted {len(unique_by_path)} unique pages ({len(extracted)} URLs crawled, including redirect aliases):")
    for path, url in sorted(unique_by_path.items()):
        print(f"  {url} -> {path.relative_to(OUTPUT_ROOT.parent)}")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for url, err in failed:
            print(f"  {url} -> {err}")
        sys.exit(1)


if __name__ == "__main__":
    main()
