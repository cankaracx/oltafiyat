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
from urllib.parse import urljoin, urlparse

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
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 OltaFiyatBot/1.0"
)


@dataclass(frozen=True)
class StoreTarget:
    name: str
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
    StoreTarget("Olta Mühendisi", ("https://www.oltamuhendisi.com/arama?q=lrf", "https://www.oltamuhendisi.com/arama?q=spin")),
    StoreTarget("Sihirli Olta", ("https://www.sihirliolta.com/arama?q=lrf", "https://www.sihirliolta.com/arama?q=rapala")),
    StoreTarget("Alba Shop", ("https://www.albashop.com.tr/arama?q=maket+balik", "https://www.albashop.com.tr/arama?q=jig")),
    StoreTarget("Oltaya Gel", ("https://www.oltayagel.com/arama?q=lrf", "https://www.oltayagel.com/arama?q=spin")),
    StoreTarget("Avmar", ("https://www.avmar.com.tr/arama?q=rapala", "https://www.avmar.com.tr/arama?q=ip+misina")),
    StoreTarget("Spot Balık", ("https://www.spotbalik.com.tr/arama?q=lrf", "https://www.spotbalik.com.tr/arama?q=kamış")),
    StoreTarget("İnce Çizgi", ("https://www.incecizgi.com/arama?q=sahte", "https://www.incecizgi.com/arama?q=jighead")),
    StoreTarget("Ergin Balıkçılık", ("https://www.erginbalikcilik.com/arama?q=lrf", "https://www.erginbalikcilik.com/arama?q=çanta")),
)


CATEGORY_KEYWORDS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("lrf-sahteleri", ("silikon", "lrf", "micro", "mikro", "worm", "karides", "soft lure", "soft bait")),
    ("maket-baliklar-sahte-yemler", ("maket", "sahte", "rapala", "minnow", "jerk", "pencil", "popper", "wobbler")),
    ("shore-jigging-kasiklari", ("shore", "jig", "jigging", "kaşık", "kasik", "metal jig", "casting jig")),
    ("lrf-takimlari", ("lrf takım", "lrf takim", "set", "kombin", "takım", "takim")),
    ("spin-kamislari", ("spin kamış", "spin kamis", "spinning", "kamış", "kamis", "rod")),
    ("ip-misinalar", ("ip misina", "örgü", "orgu", "braid", "pe ", "8x", "4x", "misina")),
    ("kursun-arkasi-sahteleri", ("kurşun arkası", "kursun arkasi", "raglou", "ragot", "raglou")),
    ("gece-avi-sahteleri", ("gece", "glow", "fosfor", "uv", "luminous", "ışıklı", "isikli")),
    ("kamis-ayaklari", ("kamış ayağı", "kamis ayagi", "tripod", "rod holder", "sehpa", "ayak")),
    ("balikci-cantalari", ("çanta", "canta", "bag", "bel çantası", "sırt çantası", "takım çantası")),
    ("jig-kafalari-jighead", ("jighead", "jig head", "jig kafa", "jig kafası", "jig kafasi")),
    ("rapala-klipsleri", ("klips", "snap", "fırdöndü", "firdondu", "rapala klips")),
)


BRAND_HINTS = (
    "Daiwa", "Shimano", "Savage Gear", "Major Craft", "Rapala", "Duel", "Yo-Zuri",
    "Owner", "Decoy", "Mustad", "Fujin", "Kendo", "Remixon", "Okuma", "Lineaeffe",
    "Lunker City", "Berkley", "Fishus", "Maria", "Duo", "Blue Blue", "Tubertini",
    "AlbaStar", "Captain", "Powerex", "Strike Pro", "River2Sea", "Hayabusa",
)


PRODUCT_CARD_SELECTORS = (
    ".productItem", ".product-item", ".product-list-item", ".showcase", ".showcase-container",
    ".catalogWrapper .item", ".prd", ".urun", ".urunItem", ".product",
    "li[class*='product']", "div[class*='Product']",
)

TITLE_SELECTORS = (
    ".productName", ".product-name", ".showcase-title", ".prd-title", ".urunAdi",
    "[class*='name']", "[class*='title']", "h2", "h3", "a[title]",
)

PRICE_SELECTORS = (
    ".productPrice", ".product-price", ".showcase-price", ".price", ".current-price",
    ".discountedPrice", ".salePrice", ".urunFiyat", "[class*='price']", "[class*='Price']",
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
        if "text/html" not in response.headers.get("Content-Type", ""):
            LOGGER.warning("Skipping non-HTML response from %s", url)
            return None
        return response.text
    except requests.RequestException as exc:
        LOGGER.warning("Could not fetch %s: %s", url, exc)
        return None


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


def scrape_all() -> None:
    client = require_supabase()
    categories = load_categories(client)
    products = load_products(client)
    total_saved = 0
    for target in STORE_TARGETS:
        for url in target.urls:
            html = fetch_html(url)
            if not html:
                continue
            for listing in parse_store_page(target.name, url, html):
                try:
                    save_listing(client, listing, categories, products)
                    total_saved += 1
                except Exception as exc:
                    LOGGER.exception("Could not save listing %s: %s", listing.product_url, exc)
            time.sleep(1.5)
    LOGGER.info("Scraping complete. Saved or updated %s listings.", total_saved)


if __name__ == "__main__":
    try:
        scrape_all()
    except Exception as error:
        LOGGER.exception("Scraper failed: %s", error)
        sys.exit(1)