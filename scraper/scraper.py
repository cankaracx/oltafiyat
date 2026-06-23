from __future__ import annotations

import logging
import os
import re
import sys
import time
import unicodedata
from dataclasses import dataclass
from datetime import UTC, datetime
from difflib import SequenceMatcher, get_close_matches
from typing import Iterable
from urllib.parse import quote_plus, urljoin, urlparse

import requests
from bs4 import BeautifulSoup, Tag
from supabase import Client, create_client


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(message)s",
)
LOGGER = logging.getLogger("oltafiyat-scraper")


SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

REQUEST_TIMEOUT_SECONDS = 25
MATCH_CONFIDENCE = 0.85
MAX_SEARCH_URLS_PER_STORE = int(os.getenv("MAX_SEARCH_URLS_PER_STORE", "140"))
MAX_PAGES_PER_QUERY = int(os.getenv("MAX_PAGES_PER_QUERY", "3"))
MAX_SITEMAP_URLS_PER_STORE = int(os.getenv("MAX_SITEMAP_URLS_PER_STORE", "250"))
MAX_DETAIL_URLS_PER_STORE = int(os.getenv("MAX_DETAIL_URLS_PER_STORE", "300"))
REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "0.4"))
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 OltaFiyatBot/1.0"
)


@dataclass(frozen=True)
class StoreTarget:
    name: str
    base_url: str
    urls: tuple[str, ...]


@dataclass(frozen=True)
class ParsedListing:
    store_name: str
    raw_title: str
    brand: str | None
    price: float
    product_url: str
    image_url: str | None
    category_slug: str


STORE_TARGETS: tuple[StoreTarget, ...] = (
    StoreTarget("Olta Mühendisi", "https://www.oltamuhendisi.com", ("https://www.oltamuhendisi.com/arama?q=lrf", "https://www.oltamuhendisi.com/arama?q=spin")),
    StoreTarget("Sihirli Olta", "https://www.sihirliolta.com", ("https://www.sihirliolta.com/arama?q=lrf", "https://www.sihirliolta.com/arama?q=rapala")),
    StoreTarget("Alba Shop", "https://www.albashop.com.tr", ("https://www.albashop.com.tr/arama?q=maket+balik", "https://www.albashop.com.tr/arama?q=jig")),
    StoreTarget("Oltaya Gel", "https://www.oltayagel.com", ("https://www.oltayagel.com/arama?q=lrf", "https://www.oltayagel.com/arama?q=spin")),
    StoreTarget("Avmar", "https://www.avmar.com.tr", ("https://www.avmar.com.tr/arama?q=rapala", "https://www.avmar.com.tr/arama?q=ip+misina")),
    StoreTarget("Spot Balık", "https://www.spotbalik.com.tr", ("https://www.spotbalik.com.tr/arama?q=lrf", "https://www.spotbalik.com.tr/arama?q=kamış")),
    StoreTarget("İnce Çizgi", "https://www.incecizgi.com", ("https://www.incecizgi.com/arama?q=sahte", "https://www.incecizgi.com/arama?q=jighead")),
    StoreTarget("Ergin Balıkçılık", "https://www.erginbalikcilik.com", ("https://www.erginbalikcilik.com/arama?q=lrf", "https://www.erginbalikcilik.com/arama?q=çanta")),
    StoreTarget("Balık Av Marketim", "https://www.balikavmarketim.com", ("https://www.balikavmarketim.com/arama?q=spin", "https://www.balikavmarketim.com/arama?q=surf")),
    StoreTarget("Avfoni", "https://www.avfoni.com", ("https://www.avfoni.com/arama?q=olta", "https://www.avfoni.com/arama?q=rapala")),
    StoreTarget("Av Sepeti", "https://www.avsepeti.com", ("https://www.avsepeti.com/arama?q=kamış", "https://www.avsepeti.com/arama?q=makine")),
    StoreTarget("Kamp Av", "https://www.kampav.com", ("https://www.kampav.com/arama?q=balık", "https://www.kampav.com/arama?q=olta")),
    StoreTarget("Av Marketi", "https://www.avmarketi.com", ("https://www.avmarketi.com/arama?q=olta", "https://www.avmarketi.com/arama?q=misina")),
    StoreTarget("Rastgele Av", "https://www.rastgeleav.com", ("https://www.rastgeleav.com/arama?q=spin", "https://www.rastgeleav.com/arama?q=lrf")),
    StoreTarget("Balık Marketim", "https://www.balikmarketim.com", ("https://www.balikmarketim.com/arama?q=rapala", "https://www.balikmarketim.com/arama?q=jig")),
    StoreTarget("Av Deposu", "https://www.avdeposu.com", ("https://www.avdeposu.com/arama?q=olta", "https://www.avdeposu.com/arama?q=kamış")),
)


SEARCH_KEYWORDS = (
    "lrf", "silikon", "sahte", "rapala", "maket balık", "minnow", "jig", "jighead",
    "jig kafa", "shore jig", "spin kamış", "spin", "kamış", "ip misina", "örgü misina",
    "pe misina", "klips", "snap", "fırdöndü", "kurşun arkası", "raglou", "gece avı",
    "uv sahte", "glow", "çanta", "balıkçı çantası", "kamış ayağı", "tripod", "olta",
    "makine", "olta makinesi", "iğne", "owner", "decoy", "daiwa", "shimano", "okuma",
    "rapala klips", "kaşık", "metal jig", "karides", "worm", "duel", "yo-zuri",
    "surf kamış", "surf makine", "long cast", "baitrunner", "tekne kamış", "tekne makine",
    "jigging kamış", "jigging makine", "slow jig", "trolling", "çıkrık", "cikrik",
    "monofilament", "fluorocarbon", "leader", "shock leader", "şamandıra", "samandira",
    "kurşun", "kursun", "assist hook", "offset", "üçlü iğne", "uclu igne", "treble",
    "kepçe", "kepce", "lip grip", "boga grip", "balık tutucu", "takım kutusu", "lure box",
    "wader", "çizme", "cizme", "yağmurluk", "yagmurluk", "eldiven", "balık bulucu",
    "kafa lambası", "pense", "makine yağı", "yedek makara", "alba", "remixon", "kendo",
)


SEARCH_PATTERNS = (
    "/arama?q={query}",
    "/arama?kelime={query}",
    "/arama?search={query}",
    "/arama-sonuc?search={query}",
    "/index.php?route=product/search&search={query}",
)


CATEGORY_KEYWORDS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("lrf-kamislari", ("lrf kamış", "lrf kamis", "light game rod", "ajing rod", "rock fishing kamış", "0 5 7 gr", "1 8 gr")),
    ("lrf-makineleri", ("lrf makine", "lrf makina", "1000 kafa", "2000 kafa", "2500 kafa", "light game reel", "ajing reel")),
    ("ultra-light-ajing-ekipmanlari", ("ajing", "ultra light", "ultralight", "rock fishing", "light game", "mebaru")),
    ("spin-kamislari", ("spin kamış", "spin kamis", "spinning kamış", "spinning kamis", "spin rod", "atarlı kamış", "atarli kamis")),
    ("spin-makineleri", ("spin makine", "spin makina", "spinning reel", "3000 kafa", "4000 kafa", "5000 kafa")),
    ("surf-kamislari", ("surf kamış", "surf kamis", "surf casting kamış", "long cast kamış", "beach ledgering", "uzak atış kamış")),
    ("surf-makineleri", ("surf makine", "surf makina", "long cast makine", "long cast makina", "baitrunner", "big pit")),
    ("tekne-kamislari", ("tekne kamış", "tekne kamis", "boat rod", "bot kamış", "dip kamış")),
    ("tekne-makineleri", ("tekne makine", "tekne makina", "boat reel", "çıkrık", "cikrik", "electric reel")),
    ("jigging-kamislari", ("jigging kamış", "jigging kamis", "slow jig kamış", "vertical jig kamış", "jig rod")),
    ("jigging-makineleri", ("jigging makine", "jigging makina", "slow jig makine", "high drag", "jigging reel")),
    ("trolling-ekipmanlari", ("trolling", "sırtı", "sirti", "trolling kamış", "trolling makine", "downrigger")),
    ("jig-kafalari-jighead", ("jighead", "jig head", "jig kafa", "jig kafası", "jig kafasi")),
    ("jig-yemler-metal-jigler", ("metal jig", "slow jig", "casting jig", "micro jig", "jig yem", "jig lure")),
    ("shore-jigging-kasiklari", ("shore jig", "shore jigging", "shore jigging kaşık", "shore jigging kasik")),
    ("kasiklar", ("kaşık", "kasik", "spoon", "döner kaşık", "doner kasik")),
    ("spinner-yemler", ("spinner", "mepps", "döner yem", "doner yem")),
    ("kursun-arkasi-sahteleri", ("kurşun arkası", "kursun arkasi", "raglou", "ragot")),
    ("gece-avi-sahteleri", ("gece", "glow", "fosfor", "uv", "luminous", "ışıklı", "isikli")),
    ("silikon-yemler", ("silikon", "soft lure", "soft bait", "worm", "karides", "shad", "grub", "creature")),
    ("lrf-sahteleri", ("lrf sahte", "lrf yem", "micro", "mikro", "mini jig", "lrf silikon")),
    ("maket-baliklar-sahte-yemler", ("maket", "sahte", "rapala", "minnow", "jerk", "jerkbait", "pencil", "popper", "wobbler", "crankbait")),
    ("lrf-takimlari", ("lrf takım", "lrf takim", "lrf set", "lrf kombin")),
    ("hazir-olta-takimlari", ("hazır takım", "hazir takim", "olta set", "set olta", "kombin", "takım", "takim")),
    ("fluorocarbon-misinalar", ("fluorocarbon", "florokarbon", "fc leader", "leader misina")),
    ("ip-misinalar", ("ip misina", "örgü", "orgu", "braid", "braided", "pe ", "8x", "4x", "x8", "x4")),
    ("monofilament-misinalar", ("monofilament", "mono misina", "naylon misina", "shock leader", "şok lider", "sok lider", "misina")),
    ("igneler", ("iğne", "igne", "hook", "assist hook", "offset", "üçlü", "uclu", "treble", "çapari", "capari")),
    ("rapala-klipsleri", ("rapala klips", "sahte klips", "lure snap")),
    ("klipsler-ve-firdonduler", ("klips", "snap", "fırdöndü", "firdondu", "split ring", "solid ring", "halka")),
    ("kursunlar-ve-samandiralar", ("kurşun", "kursun", "şamandıra", "samandira", "float", "lead", "gezer kurşun", "surf kurşun")),
    ("kamis-ayaklari", ("kamış ayağı", "kamis ayagi", "tripod", "rod holder", "rod pod", "sehpa", "dayama")),
    ("balikci-cantalari", ("çanta", "canta", "bag", "lure bag", "bel çantası", "sırt çantası", "takım çantası")),
    ("takim-kutulari", ("takım kutusu", "takim kutusu", "lure box", "jig box", "organizer", "kutu")),
    ("kepceler-ve-balik-tutucular", ("kepçe", "kepce", "landing net", "lip grip", "boga grip", "balık tutucu", "balik tutucu")),
    ("balikci-giyim", ("wader", "çizme", "cizme", "yağmurluk", "yagmurluk", "eldiven", "şapka", "sapka", "polar", "giyim")),
    ("elektronik-ve-aksesuarlar", ("balık bulucu", "balik bulucu", "fish finder", "kafa lambası", "kafa lambasi", "tartı", "tarti", "pense", "makas")),
    ("bakim-ve-yedek-parcalar", ("makine yağı", "makine yagi", "bakım", "bakim", "yedek makara", "spare spool", "yedek parça", "yedek parca")),
    ("olta-makineleri-genel", ("olta makinesi", "olta makinası", "olta makinasi", "reel", "makine", "makina")),
)


BRAND_HINTS = (
    "Daiwa", "Shimano", "Savage Gear", "Major Craft", "Rapala", "Duel", "Yo-Zuri",
    "Owner", "Decoy", "Mustad", "Fujin", "Kendo", "Remixon", "Okuma", "Lineaeffe",
    "Lunker City", "Berkley", "Fishus", "Maria", "Duo", "Blue Blue", "Tubertini",
    "AlbaStar", "Captain", "Powerex", "Strike Pro", "River2Sea", "Hayabusa",
)


PRODUCT_CARD_SELECTORS = (
    ".productItem", ".product-item", ".product-list-item", ".showcase", ".showcase-container",
    ".catalogWrapper .item", ".prd", ".urun", ".urunItem", ".product", ".productBox",
    ".product-card", ".item-product", ".product-layout", ".product-grid", ".product-list",
    "li[class*='product']", "div[class*='Product']", "div[class*='urun']",
)

TITLE_SELECTORS = (
    ".productName", ".product-name", ".showcase-title", ".prd-title", ".urunAdi",
    ".product-title", ".productDetailName", ".ProductName", ".name", ".title",
    "[itemprop='name']", "[class*='name']", "[class*='title']", "h1", "h2", "h3", "a[title]",
)

PRICE_SELECTORS = (
    ".productPrice", ".product-price", ".showcase-price", ".price", ".current-price",
    ".discountedPrice", ".salePrice", ".urunFiyat", ".productDetailPrice", ".Price",
    "[itemprop='price']", "[class*='price']", "[class*='Price']", "meta[property='product:price:amount']",
)


def require_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY environment variables are required.")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = value.casefold()
    translations = str.maketrans({"ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c"})
    value = value.translate(translations)
    value = re.sub(r"[^a-z0-9\s]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def slugify(value: str) -> str:
    slug = normalize_text(value)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug[:90] or "urun"


def parse_price(raw_price: str) -> float | None:
    if not raw_price:
        return None
    cleaned = unicodedata.normalize("NFKC", raw_price)
    cleaned = cleaned.replace("₺", " TL ").replace("TRY", " TL ").replace("TL", " ")
    cleaned = cleaned.replace("\xa0", " ")
    match = re.search(r"(\d{1,3}(?:[\.\s]\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)", cleaned)
    if not match:
        return None
    number = match.group(1).replace(" ", "")
    if "," in number:
        number = number.replace(".", "").replace(",", ".")
    elif number.count(".") > 1:
        number = number.replace(".", "")
    try:
        return round(float(number), 2)
    except ValueError:
        return None


def absolute_url(base_url: str, value: str | None) -> str | None:
    if not value:
        return None
    if value.startswith("data:"):
        return None
    return urljoin(base_url, value.strip())


def clean_title(value: str) -> str:
    value = re.sub(r"\s+", " ", value or "").strip()
    value = re.sub(r"\b(stokta|sepete ekle|incele|favorilere ekle)\b", "", value, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", value).strip(" -|/")


def infer_brand(title: str) -> str | None:
    normalized_title = normalize_text(title)
    for brand in BRAND_HINTS:
        if normalize_text(brand) in normalized_title:
            return brand
    first_token = title.split(" ", 1)[0].strip("-/| ")
    if 2 <= len(first_token) <= 24 and first_token.isascii():
        return first_token.title()
    return None


def categorize_title(title: str) -> str:
    normalized = normalize_text(title)
    for category_slug, keywords in CATEGORY_KEYWORDS:
        if any(normalize_text(keyword) in normalized for keyword in keywords):
            return category_slug
    return "maket-baliklar-sahte-yemler"


def select_text(card: Tag, selectors: Iterable[str]) -> str | None:
    for selector in selectors:
        node = card.select_one(selector)
        if not node:
            continue
        if selector.endswith("[title]") and node.get("title"):
            return str(node.get("title"))
        if node.name == "meta" and node.get("content"):
            return str(node.get("content"))
        if node.get("content") and "price" in selector.lower():
            return str(node.get("content"))
        text = node.get_text(" ", strip=True)
        if text:
            return text
    return None


def select_product_url(base_url: str, card: Tag) -> str | None:
    preferred = card.select_one("a[href*='urun'], a[href*='product'], a[href*='p-'], a[href]")
    if preferred and preferred.get("href"):
        return absolute_url(base_url, str(preferred.get("href")))
    return None


def select_image_url(base_url: str, card: Tag) -> str | None:
    image = card.select_one("img")
    if not image:
        return None
    for attr in ("data-src", "data-original", "data-lazy", "src"):
        image_url = absolute_url(base_url, str(image.get(attr) or ""))
        if image_url:
            return image_url
    return None


def fetch_html(url: str) -> str | None:
    try:
        response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=REQUEST_TIMEOUT_SECONDS)
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type and "xml" not in content_type and "text/plain" not in content_type:
            LOGGER.warning("Skipping non-HTML response from %s", url)
            return None
        return response.text
    except requests.RequestException as exc:
        LOGGER.warning("Could not fetch %s: %s", url, exc)
        return None


def same_domain(base_url: str, candidate_url: str) -> bool:
    base_host = urlparse(base_url).netloc.replace("www.", "")
    candidate_host = urlparse(candidate_url).netloc.replace("www.", "")
    return bool(candidate_host) and candidate_host == base_host


def is_likely_product_url(url: str) -> bool:
    normalized = normalize_text(urlparse(url).path.replace("-", " ").replace("/", " "))
    product_terms = (
        "urun", "product", "p", "olta", "rapala", "sahte", "jig", "kam", "misina",
        "makine", "klips", "canta", "lrf", "spin", "igne", "kasik"
    )
    blocked_terms = ("sepet", "cart", "hesap", "account", "login", "uye", "iletisim", "blog", "haber")
    return any(term in normalized for term in product_terms) and not any(term in normalized for term in blocked_terms)


def paginated_variants(url: str) -> list[str]:
    urls = [url]
    separator = "&" if "?" in url else "?"
    for page in range(2, MAX_PAGES_PER_QUERY + 1):
        urls.extend(
            [
                f"{url}{separator}page={page}",
                f"{url}{separator}sayfa={page}",
                f"{url}{separator}p={page}",
            ]
        )
    return urls


def build_search_urls(target: StoreTarget) -> list[str]:
    urls: list[str] = []
    for seed_url in target.urls:
        urls.extend(paginated_variants(seed_url))
    for keyword in SEARCH_KEYWORDS:
        encoded_query = quote_plus(keyword)
        for pattern in SEARCH_PATTERNS:
            search_url = urljoin(target.base_url, pattern.format(query=encoded_query))
            urls.extend(paginated_variants(search_url))
    deduped = list(dict.fromkeys(urls))
    return deduped[:MAX_SEARCH_URLS_PER_STORE]


def discover_links_from_listing_page(base_url: str, html: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    discovered: list[str] = []
    for anchor in soup.select("a[href]"):
        absolute = absolute_url(base_url, str(anchor.get("href") or ""))
        if absolute and same_domain(base_url, absolute) and is_likely_product_url(absolute):
            discovered.append(absolute)
    return list(dict.fromkeys(discovered))


def discover_sitemap_product_urls(target: StoreTarget) -> list[str]:
    sitemap_candidates = (
        urljoin(target.base_url, "/sitemap.xml"),
        urljoin(target.base_url, "/sitemap_index.xml"),
        urljoin(target.base_url, "/sitemap-products.xml"),
        urljoin(target.base_url, "/sitemap_product.xml"),
    )
    discovered: list[str] = []
    for sitemap_url in sitemap_candidates:
        html = fetch_html(sitemap_url)
        if not html:
            continue
        soup = BeautifulSoup(html, "html.parser")
        loc_values = [loc.get_text(strip=True) for loc in soup.find_all("loc")]
        for loc in loc_values:
            if not loc:
                continue
            if loc.endswith(".xml") and len(discovered) < MAX_SITEMAP_URLS_PER_STORE:
                nested = fetch_html(loc)
                if not nested:
                    continue
                nested_soup = BeautifulSoup(nested, "html.parser")
                for nested_loc in nested_soup.find_all("loc"):
                    nested_url = nested_loc.get_text(strip=True)
                    if same_domain(target.base_url, nested_url) and is_likely_product_url(nested_url):
                        discovered.append(nested_url)
            elif same_domain(target.base_url, loc) and is_likely_product_url(loc):
                discovered.append(loc)
            if len(discovered) >= MAX_SITEMAP_URLS_PER_STORE:
                break
        if discovered:
            break
    deduped = list(dict.fromkeys(discovered))[:MAX_SITEMAP_URLS_PER_STORE]
    if deduped:
        LOGGER.info("Discovered %s likely product URLs from sitemap for %s", len(deduped), target.name)
    return deduped


def parse_product_detail_page(store_name: str, url: str, html: str) -> ParsedListing | None:
    soup = BeautifulSoup(html, "html.parser")
    title = clean_title(
        select_text(soup, TITLE_SELECTORS)
        or select_text(soup, ("meta[property='og:title']", "meta[name='title']"))
        or ""
    )
    price = parse_price(select_text(soup, PRICE_SELECTORS) or "")
    image_url = None
    image_meta = soup.select_one("meta[property='og:image'], meta[name='twitter:image']")
    if image_meta and image_meta.get("content"):
        image_url = absolute_url(url, str(image_meta.get("content")))
    if not image_url:
        image_url = select_image_url(url, soup)
    if not title or price is None:
        return None
    return ParsedListing(
        store_name=store_name,
        raw_title=title,
        brand=infer_brand(title),
        price=price,
        product_url=url,
        image_url=image_url,
        category_slug=categorize_title(title),
    )


def parse_store_page(store_name: str, url: str, html: str) -> list[ParsedListing]:
    soup = BeautifulSoup(html, "html.parser")
    cards: list[Tag] = []
    for selector in PRODUCT_CARD_SELECTORS:
        cards.extend([node for node in soup.select(selector) if isinstance(node, Tag)])
    unique_cards = list(dict.fromkeys(cards))
    listings: list[ParsedListing] = []
    for card in unique_cards:
        raw_title = clean_title(select_text(card, TITLE_SELECTORS) or "")
        price = parse_price(select_text(card, PRICE_SELECTORS) or "")
        product_url = select_product_url(url, card)
        if not raw_title or price is None or not product_url:
            continue
        listings.append(
            ParsedListing(
                store_name=store_name,
                raw_title=raw_title,
                brand=infer_brand(raw_title),
                price=price,
                product_url=product_url,
                image_url=select_image_url(url, card),
                category_slug=categorize_title(raw_title),
            )
        )
    LOGGER.info("Parsed %s listings from %s", len(listings), urlparse(url).netloc)
    return listings


def load_categories(client: Client) -> dict[str, int]:
    response = client.table("categories").select("id, slug").execute()
    return {row["slug"]: row["id"] for row in response.data or []}


def load_products(client: Client) -> list[dict]:
    response = client.table("products").select("id, title, brand, slug, category_id").execute()
    return response.data or []


def product_match_key(product: dict) -> str:
    return normalize_text(f"{product.get('brand') or ''} {product.get('title') or ''}")


def listing_match_key(listing: ParsedListing) -> str:
    return normalize_text(f"{listing.brand or ''} {listing.raw_title}")


def find_matching_product(listing: ParsedListing, products: list[dict]) -> dict | None:
    target = listing_match_key(listing)
    if not target or not products:
        return None
    key_to_product = {product_match_key(product): product for product in products}
    candidate_keys = get_close_matches(target, key_to_product.keys(), n=5, cutoff=MATCH_CONFIDENCE)
    if candidate_keys:
        return key_to_product[candidate_keys[0]]
    best_product: dict | None = None
    best_score = 0.0
    for product in products:
        score = SequenceMatcher(None, target, product_match_key(product)).ratio()
        if score > best_score:
            best_score = score
            best_product = product
    return best_product if best_score >= MATCH_CONFIDENCE else None


def unique_slug(client: Client, base_slug: str) -> str:
    slug = base_slug
    suffix = 2
    while True:
        response = client.table("products").select("id").eq("slug", slug).limit(1).execute()
        if not response.data:
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def create_product(client: Client, listing: ParsedListing, categories: dict[str, int]) -> dict:
    product_slug = unique_slug(client, slugify(f"{listing.brand or ''} {listing.raw_title}"))
    category_id = categories.get(listing.category_slug) or categories.get("maket-baliklar-sahte-yemler")
    payload = {
        "title": listing.raw_title,
        "brand": listing.brand,
        "category_id": category_id,
        "slug": product_slug,
    }
    response = client.table("products").insert(payload).execute()
    created = response.data[0]
    LOGGER.info("Created product #%s: %s", created["id"], created["title"])
    return created


def upsert_listing(client: Client, product_id: int, listing: ParsedListing) -> None:
    payload = {
        "product_id": product_id,
        "store_name": listing.store_name,
        "raw_title": listing.raw_title,
        "price": listing.price,
        "product_url": listing.product_url,
        "image_url": listing.image_url,
        "updated_at": datetime.now(UTC).isoformat(),
    }
    client.table("store_listings").upsert(payload, on_conflict="store_name,product_url").execute()


def save_listing(client: Client, listing: ParsedListing, categories: dict[str, int], products: list[dict]) -> None:
    product = find_matching_product(listing, products)
    if product is None:
        product = create_product(client, listing, categories)
        products.append(product)
    upsert_listing(client, int(product["id"]), listing)


def crawl_store(client: Client, target: StoreTarget, categories: dict[str, int], products: list[dict]) -> int:
    saved_count = 0
    seen_page_urls: set[str] = set()
    seen_listing_urls: set[str] = set()
    discovered_detail_urls: list[str] = []

    search_urls = build_search_urls(target)
    LOGGER.info("Crawling %s with up to %s search/category URLs", target.name, len(search_urls))

    for page_url in search_urls:
        if page_url in seen_page_urls:
            continue
        seen_page_urls.add(page_url)
        html = fetch_html(page_url)
        if not html:
            continue

        page_listings = parse_store_page(target.name, page_url, html)
        for listing in page_listings:
            if listing.product_url in seen_listing_urls:
                continue
            try:
                save_listing(client, listing, categories, products)
                seen_listing_urls.add(listing.product_url)
                saved_count += 1
            except Exception as exc:
                LOGGER.exception("Could not save listing %s: %s", listing.product_url, exc)

        for discovered_url in discover_links_from_listing_page(target.base_url, html):
            if discovered_url not in seen_listing_urls:
                discovered_detail_urls.append(discovered_url)

        time.sleep(REQUEST_DELAY_SECONDS)

    sitemap_urls = discover_sitemap_product_urls(target)
    detail_urls = list(dict.fromkeys([*discovered_detail_urls, *sitemap_urls]))[:MAX_DETAIL_URLS_PER_STORE]
    LOGGER.info("Crawling %s with up to %s discovered product detail URLs", target.name, len(detail_urls))

    for detail_url in detail_urls:
        if detail_url in seen_listing_urls or detail_url in seen_page_urls:
            continue
        seen_page_urls.add(detail_url)
        html = fetch_html(detail_url)
        if not html:
            continue
        listing = parse_product_detail_page(target.name, detail_url, html)
        if listing is None:
            continue
        try:
            save_listing(client, listing, categories, products)
            seen_listing_urls.add(listing.product_url)
            saved_count += 1
        except Exception as exc:
            LOGGER.exception("Could not save detail listing %s: %s", detail_url, exc)
        time.sleep(REQUEST_DELAY_SECONDS)

    LOGGER.info("Finished %s. Saved or updated %s unique listings.", target.name, saved_count)
    return saved_count


def scrape_all() -> None:
    client = require_supabase()
    categories = load_categories(client)
    products = load_products(client)
    total_saved = 0
    for target in STORE_TARGETS:
        total_saved += crawl_store(client, target, categories, products)
    LOGGER.info("Scraping complete. Saved or updated %s listings.", total_saved)


if __name__ == "__main__":
    try:
        scrape_all()
    except Exception as error:
        LOGGER.exception("Scraper failed: %s", error)
        sys.exit(1)