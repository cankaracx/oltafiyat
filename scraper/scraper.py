from __future__ import annotations

import json
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
MATCH_CONFIDENCE = 0.88
MAX_SEARCH_URLS_PER_STORE = int(os.getenv("MAX_SEARCH_URLS_PER_STORE", "200"))
MAX_PAGES_PER_QUERY = int(os.getenv("MAX_PAGES_PER_QUERY", "4"))
MAX_SITEMAP_URLS_PER_STORE = int(os.getenv("MAX_SITEMAP_URLS_PER_STORE", "400"))
MAX_DETAIL_URLS_PER_STORE = int(os.getenv("MAX_DETAIL_URLS_PER_STORE", "500"))
REQUEST_DELAY_SECONDS = float(os.getenv("REQUEST_DELAY_SECONDS", "0.5"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
RETRY_BACKOFF = float(os.getenv("RETRY_BACKOFF", "2.0"))

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 OltaFiyatBot/1.0"
)

HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}


@dataclass(frozen=True)
class StoreTarget:
    name: str
    base_url: str
    urls: tuple[str, ...]
    search_path: str = "/arama"
    search_param: str = "q"


@dataclass(frozen=True)
class ParsedListing:
    store_name: str
    raw_title: str
    brand: str | None
    price: float
    product_url: str
    image_url: str | None
    category_slug: str


# ─── STORES ──────────────────────────────────────────────────────────────────
# Seed URLs per store: category pages + curated search queries.
# Scraper also auto-generates search URLs for all SEARCH_KEYWORDS.

STORE_TARGETS: tuple[StoreTarget, ...] = (
    StoreTarget(
        "Olta Mühendisi", "https://www.oltamuhendisi.com",
        (
            "https://www.oltamuhendisi.com/lrf-kamislar",
            "https://www.oltamuhendisi.com/lrf-makineler",
            "https://www.oltamuhendisi.com/spin-kamislar",
            "https://www.oltamuhendisi.com/spin-makineleri",
            "https://www.oltamuhendisi.com/surf-kamislar",
            "https://www.oltamuhendisi.com/suni-yemler",
            "https://www.oltamuhendisi.com/misina",
            "https://www.oltamuhendisi.com/aksesuar",
            "https://www.oltamuhendisi.com/arama?q=lrf",
            "https://www.oltamuhendisi.com/arama?q=spin",
            "https://www.oltamuhendisi.com/arama?q=surf",
            "https://www.oltamuhendisi.com/arama?q=jigging",
        ),
    ),
    StoreTarget(
        "Sihirli Olta", "https://www.sihirliolta.com",
        (
            "https://www.sihirliolta.com/lrf-kamislar",
            "https://www.sihirliolta.com/lrf-makineler",
            "https://www.sihirliolta.com/spin-kamislar",
            "https://www.sihirliolta.com/spin-makineleri",
            "https://www.sihirliolta.com/surf-kamislar",
            "https://www.sihirliolta.com/suni-yemler",
            "https://www.sihirliolta.com/jigging",
            "https://www.sihirliolta.com/misina",
            "https://www.sihirliolta.com/arama?q=lrf",
            "https://www.sihirliolta.com/arama?q=rapala",
            "https://www.sihirliolta.com/arama?q=silikon",
        ),
    ),
    StoreTarget(
        "Alba Shop", "https://www.albashop.com.tr",
        (
            "https://www.albashop.com.tr/lrf-kamislar",
            "https://www.albashop.com.tr/lrf-makineler",
            "https://www.albashop.com.tr/spin",
            "https://www.albashop.com.tr/surf",
            "https://www.albashop.com.tr/suni-yemler",
            "https://www.albashop.com.tr/misina",
            "https://www.albashop.com.tr/arama?q=maket+balik",
            "https://www.albashop.com.tr/arama?q=jig",
            "https://www.albashop.com.tr/arama?q=silikon",
            "https://www.albashop.com.tr/arama?q=kamis",
        ),
    ),
    StoreTarget(
        "Oltaya Gel", "https://www.oltayagel.com",
        (
            "https://www.oltayagel.com/lrf",
            "https://www.oltayagel.com/spin",
            "https://www.oltayagel.com/surf",
            "https://www.oltayagel.com/jigging",
            "https://www.oltayagel.com/suni-yemler",
            "https://www.oltayagel.com/misina",
            "https://www.oltayagel.com/aksesuar",
            "https://www.oltayagel.com/arama?q=lrf",
            "https://www.oltayagel.com/arama?q=spin",
            "https://www.oltayagel.com/arama?q=rapala",
        ),
    ),
    StoreTarget(
        "Avmar", "https://www.avmar.com.tr",
        (
            "https://www.avmar.com.tr/olta-kamislar",
            "https://www.avmar.com.tr/olta-makineleri",
            "https://www.avmar.com.tr/suni-yemler",
            "https://www.avmar.com.tr/misina",
            "https://www.avmar.com.tr/aksesuar",
            "https://www.avmar.com.tr/arama?q=rapala",
            "https://www.avmar.com.tr/arama?q=ip+misina",
            "https://www.avmar.com.tr/arama?q=lrf",
            "https://www.avmar.com.tr/arama?q=shimano",
            "https://www.avmar.com.tr/arama?q=daiwa",
        ),
    ),
    StoreTarget(
        "Spot Balık", "https://www.spotbalik.com.tr",
        (
            "https://www.spotbalik.com.tr/lrf",
            "https://www.spotbalik.com.tr/spin",
            "https://www.spotbalik.com.tr/surf",
            "https://www.spotbalik.com.tr/jigging",
            "https://www.spotbalik.com.tr/suni-yemler",
            "https://www.spotbalik.com.tr/misina",
            "https://www.spotbalik.com.tr/arama?q=lrf",
            "https://www.spotbalik.com.tr/arama?q=kamis",
            "https://www.spotbalik.com.tr/arama?q=silikon",
        ),
    ),
    StoreTarget(
        "İnce Çizgi", "https://www.incecizgi.com",
        (
            "https://www.incecizgi.com/lrf-kamislar",
            "https://www.incecizgi.com/lrf-makineler",
            "https://www.incecizgi.com/spin",
            "https://www.incecizgi.com/suni-yemler",
            "https://www.incecizgi.com/misina",
            "https://www.incecizgi.com/aksesuar",
            "https://www.incecizgi.com/arama?q=sahte",
            "https://www.incecizgi.com/arama?q=jighead",
            "https://www.incecizgi.com/arama?q=lrf",
        ),
    ),
    StoreTarget(
        "Ergin Balıkçılık", "https://www.erginbalikcilik.com",
        (
            "https://www.erginbalikcilik.com/kamislar",
            "https://www.erginbalikcilik.com/makineler",
            "https://www.erginbalikcilik.com/yemler",
            "https://www.erginbalikcilik.com/misina",
            "https://www.erginbalikcilik.com/arama?q=lrf",
            "https://www.erginbalikcilik.com/arama?q=canta",
        ),
    ),
    StoreTarget(
        "Balık Av Marketim", "https://www.balikavmarketim.com",
        (
            "https://www.balikavmarketim.com/kamislar",
            "https://www.balikavmarketim.com/makineler",
            "https://www.balikavmarketim.com/yemler",
            "https://www.balikavmarketim.com/misina",
            "https://www.balikavmarketim.com/arama?q=spin",
            "https://www.balikavmarketim.com/arama?q=surf",
        ),
    ),
    StoreTarget(
        "Avfoni", "https://www.avfoni.com",
        (
            "https://www.avfoni.com/olta-kamislar",
            "https://www.avfoni.com/olta-makineleri",
            "https://www.avfoni.com/suni-yemler",
            "https://www.avfoni.com/misina",
            "https://www.avfoni.com/arama?q=olta",
            "https://www.avfoni.com/arama?q=rapala",
        ),
    ),
    StoreTarget(
        "Av Sepeti", "https://www.avsepeti.com",
        (
            "https://www.avsepeti.com/olta-kamislar",
            "https://www.avsepeti.com/olta-makineleri",
            "https://www.avsepeti.com/suni-yemler",
            "https://www.avsepeti.com/arama?q=kamis",
            "https://www.avsepeti.com/arama?q=makine",
        ),
    ),
    StoreTarget(
        "Kamp Av", "https://www.kampav.com",
        (
            "https://www.kampav.com/balik-avi",
            "https://www.kampav.com/olta-kamislar",
            "https://www.kampav.com/olta-makineleri",
            "https://www.kampav.com/arama?q=balik",
            "https://www.kampav.com/arama?q=olta",
        ),
    ),
    StoreTarget(
        "Av Marketi", "https://www.avmarketi.com",
        (
            "https://www.avmarketi.com/olta-kamislar",
            "https://www.avmarketi.com/olta-makineleri",
            "https://www.avmarketi.com/suni-yemler",
            "https://www.avmarketi.com/arama?q=olta",
            "https://www.avmarketi.com/arama?q=misina",
        ),
    ),
    StoreTarget(
        "Rastgele Av", "https://www.rastgeleav.com",
        (
            "https://www.rastgeleav.com/olta-kamislar",
            "https://www.rastgeleav.com/olta-makineleri",
            "https://www.rastgeleav.com/suni-yemler",
            "https://www.rastgeleav.com/misina",
            "https://www.rastgeleav.com/arama?q=spin",
            "https://www.rastgeleav.com/arama?q=lrf",
            "https://www.rastgeleav.com/arama?q=jigging",
        ),
    ),
    StoreTarget(
        "Balık Marketim", "https://www.balikmarketim.com",
        (
            "https://www.balikmarketim.com/kamislar",
            "https://www.balikmarketim.com/makineler",
            "https://www.balikmarketim.com/yemler",
            "https://www.balikmarketim.com/arama?q=rapala",
            "https://www.balikmarketim.com/arama?q=jig",
        ),
    ),
    StoreTarget(
        "Av Deposu", "https://www.avdeposu.com",
        (
            "https://www.avdeposu.com/olta-kamislar",
            "https://www.avdeposu.com/olta-makineleri",
            "https://www.avdeposu.com/suni-yemler",
            "https://www.avdeposu.com/arama?q=olta",
            "https://www.avdeposu.com/arama?q=kamis",
        ),
    ),
    # ── Additional stores ─────────────────────────────────────────────────────
    StoreTarget(
        "Mega Fisher", "https://www.megafisher.com.tr",
        (
            "https://www.megafisher.com.tr/kamislar",
            "https://www.megafisher.com.tr/makineler",
            "https://www.megafisher.com.tr/yemler",
            "https://www.megafisher.com.tr/misina",
            "https://www.megafisher.com.tr/arama?q=lrf",
            "https://www.megafisher.com.tr/arama?q=spin",
        ),
    ),
    StoreTarget(
        "Joy Fish", "https://www.joyfish.com.tr",
        (
            "https://www.joyfish.com.tr/kamislar",
            "https://www.joyfish.com.tr/makineler",
            "https://www.joyfish.com.tr/yemler",
            "https://www.joyfish.com.tr/arama?q=lrf",
            "https://www.joyfish.com.tr/arama?q=rapala",
        ),
    ),
    StoreTarget(
        "Oltacı", "https://www.oltaci.com",
        (
            "https://www.oltaci.com/kamislar",
            "https://www.oltaci.com/makineler",
            "https://www.oltaci.com/yemler",
            "https://www.oltaci.com/misina",
            "https://www.oltaci.com/arama?q=olta",
            "https://www.oltaci.com/arama?q=shimano",
        ),
    ),
    StoreTarget(
        "Balık Av Market", "https://www.balikavmarket.com",
        (
            "https://www.balikavmarket.com/kamislar",
            "https://www.balikavmarket.com/makineler",
            "https://www.balikavmarket.com/yemler",
            "https://www.balikavmarket.com/arama?q=lrf",
            "https://www.balikavmarket.com/arama?q=spin",
        ),
    ),
    StoreTarget(
        "Olta Store", "https://www.oltastore.com",
        (
            "https://www.oltastore.com/kamislar",
            "https://www.oltastore.com/makineler",
            "https://www.oltastore.com/yemler",
            "https://www.oltastore.com/arama?q=olta",
            "https://www.oltastore.com/arama?q=lrf",
        ),
    ),
    StoreTarget(
        "Balıkçılık Dünyası", "https://www.balikcilikdunyasi.com",
        (
            "https://www.balikcilikdunyasi.com/kamislar",
            "https://www.balikcilikdunyasi.com/makineler",
            "https://www.balikcilikdunyasi.com/yemler",
            "https://www.balikcilikdunyasi.com/arama?q=lrf",
            "https://www.balikcilikdunyasi.com/arama?q=surf",
        ),
    ),
    StoreTarget(
        "Net Tackle", "https://www.nettackle.com.tr",
        (
            "https://www.nettackle.com.tr/kamislar",
            "https://www.nettackle.com.tr/makineler",
            "https://www.nettackle.com.tr/yemler",
            "https://www.nettackle.com.tr/arama?q=lrf",
            "https://www.nettackle.com.tr/arama?q=rapala",
        ),
    ),
)


# ─── SEARCH KEYWORDS ─────────────────────────────────────────────────────────

SEARCH_KEYWORDS = (
    # Fishing styles
    "lrf", "light rock fishing", "ajing", "rock fishing", "ultra light",
    "spin", "spinning", "surf casting", "surf", "long cast",
    "jigging", "slow jigging", "vertical jigging", "shore jigging",
    "trolling", "tekne avi", "dip avi",
    # Rods
    "olta kamisi", "spin kamisi", "lrf kamisi", "surf kamisi", "jigging kamisi",
    "tekne kamisi", "feeder kamisi",
    # Reels
    "olta makinesi", "spin makinesi", "lrf makinesi", "surf makinesi",
    "jigging makinesi", "baitrunner", "cikrik",
    # Lures & soft baits
    "rapala", "minnow", "sahte balik", "maket balik", "jerkbait", "pencil",
    "popper", "wobbler", "crankbait", "silikon yem", "soft lure",
    "karides silikon", "worm", "shad", "grub",
    "metal jig", "casting jig", "slow jig", "micro jig",
    "shore jig", "jig yem", "kasik", "spoon",
    "spinner", "mepps", "doner yem",
    "raglou", "kursun arkasi",
    "gece sahte", "glow sahte", "uv sahte",
    "jighead", "jig kafa",
    # Lines
    "ip misina", "orgu misina", "braid", "pe misina",
    "fluorocarbon", "florokarbon", "fc leader",
    "monofilament", "naylon misina", "shock leader",
    # Terminal tackle
    "igne", "hook", "treble", "uclu igne", "offset hook", "assist hook", "capari",
    "klips", "snap", "firdondu", "split ring", "solid ring",
    "kursun", "surf kursun", "samandira",
    "rapala klips", "lure snap",
    # Brands
    "shimano", "daiwa", "rapala", "owner", "decoy", "mustad",
    "savage gear", "major craft", "duel", "yo-zuri",
    "fujin", "kendo", "remixon", "okuma",
    "berkley", "lunker city", "fishus", "maria",
    "blue blue", "duo", "strike pro", "river2sea", "hayabusa",
    # Accessories
    "canta", "balikci cantasi", "lure bag", "takim cantasi",
    "takim kutusu", "lure box", "jig box",
    "kepce", "landing net", "lip grip", "boga grip",
    "kamis ayagi", "tripod", "rod pod",
    "balik bulucu", "fish finder", "kafa lambasi",
    "pense", "makas", "balik tartisi",
    "makine yagi", "yedek makara",
    # Clothing
    "wader", "balikci cizmesi", "yagmurluk",
    # Sets / combos
    "olta seti", "olta takim", "hazir takim", "kombin",
)


SEARCH_PATTERNS = (
    "/arama?q={query}",
    "/arama?kelime={query}",
    "/arama?search={query}",
    "/arama-sonuc?search={query}",
    "/index.php?route=product/search&search={query}",
    "/search?q={query}",
    "/search?keyword={query}",
    "/?s={query}&post_type=product",
    "/urunler?search={query}",
    "/products?q={query}",
)


# ─── CATEGORY MAPPING ────────────────────────────────────────────────────────

CATEGORY_KEYWORDS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("lrf-kamislari", ("lrf kamis", "lrf kamisi", "light game rod", "ajing rod", "rock fishing kamis", "0 5 7 gr", "1 8 gr", "lrf rod")),
    ("lrf-makineleri", ("lrf makine", "lrf makina", "1000 kafa", "2000 kafa", "2500 kafa", "light game reel", "ajing reel", "lrf reel")),
    ("ultra-light-ajing-ekipmanlari", ("ajing", "ultra light", "ultralight", "rock fishing", "light game", "mebaru")),
    ("spin-kamislari", ("spin kamis", "spin kamisi", "spinning kamis", "spin rod", "atarli kamis")),
    ("spin-makineleri", ("spin makine", "spin makina", "spinning reel", "3000 kafa", "4000 kafa", "5000 kafa")),
    ("surf-kamislari", ("surf kamis", "surf kamisi", "surf casting kamis", "long cast kamis", "beach ledgering", "uzak atis kamis")),
    ("surf-makineleri", ("surf makine", "surf makina", "long cast makine", "long cast makina", "baitrunner", "big pit")),
    ("tekne-kamislari", ("tekne kamis", "tekne kamisi", "boat rod", "bot kamis", "dip kamis")),
    ("tekne-makineleri", ("tekne makine", "tekne makina", "boat reel", "cikrik", "electric reel")),
    ("jigging-kamislari", ("jigging kamis", "jigging kamisi", "slow jig kamis", "vertical jig kamis", "jig rod")),
    ("jigging-makineleri", ("jigging makine", "jigging makina", "slow jig makine", "high drag", "jigging reel")),
    ("trolling-ekipmanlari", ("trolling", "sirti", "trolling kamis", "trolling makine", "downrigger")),
    ("jig-kafalari-jighead", ("jighead", "jig head", "jig kafa", "jig kafasi")),
    ("jig-yemler-metal-jigler", ("metal jig", "slow jig", "casting jig", "micro jig", "jig yem", "jig lure")),
    ("shore-jigging-kasiklari", ("shore jig", "shore jigging kasik")),
    ("kasiklar", ("kasik", "kasigi", "spoon", "doner kasik")),
    ("spinner-yemler", ("spinner", "mepps", "doner yem")),
    ("kursun-arkasi-sahteleri", ("kursun arkasi", "raglou", "ragot")),
    ("gece-avi-sahteleri", ("gece", "glow", "fosfor", "uv sahte", "luminous", "isikli")),
    ("silikon-yemler", ("silikon", "soft lure", "soft bait", "worm", "karides", "shad", "grub", "creature", "slug")),
    ("lrf-sahteleri", ("lrf sahte", "lrf yem", "micro", "mikro", "mini jig", "lrf silikon")),
    ("maket-baliklar-sahte-yemler", ("maket", "sahte", "rapala", "minnow", "jerk", "jerkbait", "pencil", "popper", "wobbler", "crankbait", "floating", "sinking")),
    ("lrf-takimlari", ("lrf takim", "lrf set", "lrf kombin")),
    ("hazir-olta-takimlari", ("hazir takim", "olta set", "set olta", "kombin", "baslangic set")),
    ("fluorocarbon-misinalar", ("fluorocarbon", "florokarbon", "fc leader", "leader misina")),
    ("ip-misinalar", ("ip misina", "orgu", "braid", "braided", "pe ", "8x", "4x", "x8", "x4")),
    ("monofilament-misinalar", ("monofilament", "mono misina", "naylon misina", "shock leader", "sok lider", "misina")),
    ("igneler", ("igne", "hook", "assist hook", "offset", "uclu", "treble", "capari", "calis")),
    ("rapala-klipsleri", ("rapala klips", "sahte klips", "lure snap")),
    ("klipsler-ve-firdonduler", ("klips", "snap", "firdondu", "split ring", "solid ring", "halka")),
    ("kursunlar-ve-samandiralar", ("kursun", "samandira", "float", "lead", "gezer kursun", "surf kursun")),
    ("kamis-ayaklari", ("kamis ayagi", "tripod", "rod holder", "rod pod", "sehpa", "dayama")),
    ("balikci-cantalari", ("canta", "bag", "lure bag", "bel cantasi", "sirt cantasi", "takim cantasi")),
    ("takim-kutulari", ("takim kutusu", "lure box", "jig box", "organizer", "kutu")),
    ("kepceler-ve-balik-tutucular", ("kepce", "landing net", "lip grip", "boga grip", "balik tutucu")),
    ("balikci-giyim", ("wader", "cizme", "yagmurluk", "eldiven", "sapka", "polar", "giyim")),
    ("elektronik-ve-aksesuarlar", ("balik bulucu", "fish finder", "kafa lambasi", "tarti", "pense", "makas")),
    ("bakim-ve-yedek-parcalar", ("makine yagi", "bakim", "yedek makara", "spare spool", "yedek parca")),
    ("olta-makineleri-genel", ("olta makinesi", "olta makinasi", "reel", "makine", "makina")),
)


BRAND_HINTS = (
    "Daiwa", "Shimano", "Savage Gear", "Major Craft", "Rapala", "Duel", "Yo-Zuri",
    "Owner", "Decoy", "Mustad", "Fujin", "Kendo", "Remixon", "Okuma", "Lineaeffe",
    "Lunker City", "Berkley", "Fishus", "Maria", "Duo", "Blue Blue", "Tubertini",
    "AlbaStar", "Captain", "Powerex", "Strike Pro", "River2Sea", "Hayabusa",
    "Cormoran", "Illex", "Megabass", "Lucky Craft", "IMA", "Jackson", "Zenaq",
    "Xesta", "Timon", "Varivas", "Toray", "Smith", "Jumprize", "CB One",
)

# Reel size set for variant token extraction
_REEL_SIZES = frozenset(range(500, 30001, 500))
_SIZE_RE = re.compile(r"\b(\d{3,5})\b")
_TYPE_TOKENS = frozenset((
    "lrf", "spin", "surf", "jigging", "jig", "trolling", "tekne",
    "baitrunner", "feeder", "carp", "shore", "slow", "ultralight",
))

PRODUCT_CARD_SELECTORS = (
    ".productItem", ".product-item", ".product-list-item", ".showcase", ".showcase-container",
    ".catalogWrapper .item", ".prd", ".urun", ".urunItem", ".product", ".productBox",
    ".product-card", ".item-product", ".product-layout", ".product-grid", ".product-list",
    "li[class*='product']", "div[class*='Product']", "div[class*='urun']",
    "article[class*='product']", ".catalog-item", ".grid-item",
)

TITLE_SELECTORS = (
    ".productName", ".product-name", ".showcase-title", ".prd-title", ".urunAdi",
    ".product-title", ".productDetailName", ".ProductName", ".name", ".title",
    "[itemprop='name']", "[class*='name']", "[class*='title']", "h1", "h2", "h3",
    "a[title]", ".item-name",
)

PRICE_SELECTORS = (
    ".productPrice", ".product-price", ".showcase-price", ".price", ".current-price",
    ".discountedPrice", ".salePrice", ".urunFiyat", ".productDetailPrice", ".Price",
    "[itemprop='price']", "[class*='price']", "[class*='Price']",
    "meta[property='product:price:amount']", ".new-price", ".final-price",
)


# ─── VARIANT TOKEN EXTRACTION ─────────────────────────────────────────────────

def extract_variant_tokens(title: str) -> frozenset[str]:
    """Return size/type tokens that distinguish product variants (1000 vs 4000, LRF vs Spin)."""
    norm = normalize_text(title)
    tokens: set[str] = set()
    for m in _SIZE_RE.finditer(norm):
        val = int(m.group(1))
        if val in _REEL_SIZES:
            tokens.add(f"sz{val}")
    words = set(norm.split())
    for kw in _TYPE_TOKENS:
        if kw in words:
            tokens.add(kw)
    return frozenset(tokens)


# ─── UTILITY ─────────────────────────────────────────────────────────────────

def require_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_KEY environment variables are required. "
            "Set the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY secrets in the "
            "GitHub repository (Settings > Secrets and variables > Actions)."
        )

    parsed = urlparse(SUPABASE_URL)
    if parsed.scheme != "https" or not parsed.netloc:
        raise RuntimeError(
            f"SUPABASE_URL is not a valid URL: {SUPABASE_URL!r}. Expected something like "
            "'https://<project-ref>.supabase.co'. Check the SUPABASE_URL secret value in "
            "the GitHub repository (Settings > Secrets and variables > Actions)."
        )

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    try:
        client.table("categories").select("id").limit(1).execute()
    except Exception as exc:
        raise RuntimeError(
            f"Could not reach Supabase at {SUPABASE_URL!r}: {exc}. This usually means the "
            "SUPABASE_URL secret is stale or wrong, or SUPABASE_SERVICE_ROLE_KEY doesn't "
            "match that project. Check Settings > Secrets and variables > Actions in the "
            "GitHub repository."
        ) from exc
    return client


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
        price = round(float(number), 2)
        return price if price > 0 else None
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
    value = re.sub(
        r"\b(stokta|sepete ekle|incele|favorilere ekle|hemen al|satin al|urun kodu|ürün kodu)\b",
        "", value, flags=re.IGNORECASE,
    )
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
    preferred = card.select_one(
        "a[href*='urun'], a[href*='product'], a[href*='p-'], "
        "a[href*='shop'], a[href*='item'], a[href]"
    )
    if preferred and preferred.get("href"):
        return absolute_url(base_url, str(preferred.get("href")))
    return None


def select_image_url(base_url: str, card: Tag) -> str | None:
    image = card.select_one("img")
    if not image:
        return None
    for attr in ("data-src", "data-original", "data-lazy", "data-zoom-image", "src"):
        val = image.get(attr)
        if val and not str(val).startswith("data:"):
            url = absolute_url(base_url, str(val))
            if url:
                return url
    return None


# ─── JSON-LD & OPEN GRAPH EXTRACTION ─────────────────────────────────────────

def extract_json_ld_product(soup: BeautifulSoup) -> dict | None:
    """Extract product data from schema.org JSON-LD — the most reliable source."""
    for script in soup.find_all("script", {"type": "application/ld+json"}):
        try:
            data = json.loads(script.string or "")
        except (json.JSONDecodeError, TypeError):
            continue
        items: list[dict] = []
        if isinstance(data, dict):
            if data.get("@type") == "Product":
                items = [data]
            elif "@graph" in data:
                items = [x for x in data["@graph"] if isinstance(x, dict) and x.get("@type") == "Product"]
        elif isinstance(data, list):
            items = [x for x in data if isinstance(x, dict) and x.get("@type") == "Product"]

        for item in items:
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            price_val: float | None = None
            offers = item.get("offers") or {}
            if isinstance(offers, list):
                offers = offers[0] if offers else {}
            price_raw = offers.get("price") or offers.get("lowPrice") or ""
            if price_raw:
                price_val = parse_price(str(price_raw))
            if price_val is None:
                continue
            # Image
            image_raw = item.get("image")
            image_url: str | None = None
            if isinstance(image_raw, str):
                image_url = image_raw
            elif isinstance(image_raw, list) and image_raw:
                image_url = str(image_raw[0])
            elif isinstance(image_raw, dict):
                image_url = str(image_raw.get("url") or "")
            # Brand
            brand_raw = item.get("brand")
            brand: str | None = None
            if isinstance(brand_raw, dict):
                brand = str(brand_raw.get("name") or "")
            elif isinstance(brand_raw, str):
                brand = brand_raw
            return {
                "name": clean_title(name),
                "price": price_val,
                "image_url": image_url or None,
                "brand": brand or None,
            }
    return None


def extract_open_graph(soup: BeautifulSoup) -> dict | None:
    """Fallback: extract product info from Open Graph / product meta tags."""
    title_tag = soup.select_one("meta[property='og:title']") or soup.select_one("meta[name='title']")
    price_tag = (
        soup.select_one("meta[property='product:price:amount']")
        or soup.select_one("meta[property='og:price:amount']")
    )
    image_tag = soup.select_one("meta[property='og:image']")

    name = str(title_tag.get("content") or "").strip() if title_tag else ""
    price_val = parse_price(str(price_tag.get("content") or "")) if price_tag else None
    image_url = str(image_tag.get("content") or "") if image_tag else None

    if name and price_val is not None:
        return {
            "name": clean_title(name),
            "price": price_val,
            "image_url": image_url or None,
            "brand": None,
        }
    return None


# ─── NETWORKING ──────────────────────────────────────────────────────────────

def fetch_html(url: str) -> str | None:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.get(
                url, headers=HEADERS, timeout=REQUEST_TIMEOUT_SECONDS, allow_redirects=True,
            )
            response.raise_for_status()
            ct = response.headers.get("Content-Type", "")
            if "text/html" not in ct and "xml" not in ct and "text/plain" not in ct:
                return None
            return response.text
        except requests.exceptions.HTTPError as exc:
            status = exc.response.status_code if exc.response is not None else 0
            if status in (404, 410, 403, 401):
                return None
            LOGGER.warning("HTTP %s from %s (attempt %d/%d)", status, url, attempt, MAX_RETRIES)
        except requests.RequestException as exc:
            LOGGER.warning("Request failed %s: %s (attempt %d/%d)", url, exc, attempt, MAX_RETRIES)
        if attempt < MAX_RETRIES:
            time.sleep(RETRY_BACKOFF ** attempt)
    return None


def same_domain(base_url: str, candidate_url: str) -> bool:
    base_host = urlparse(base_url).netloc.replace("www.", "")
    candidate_host = urlparse(candidate_url).netloc.replace("www.", "")
    return bool(candidate_host) and candidate_host == base_host


def is_likely_product_url(url: str) -> bool:
    path = urlparse(url).path
    segments = [s for s in path.split("/") if s and len(s) > 2]
    if not segments:
        return False
    normalized = normalize_text(path.replace("-", " ").replace("/", " "))
    product_terms = (
        "urun", "product", "olta", "rapala", "sahte", "jig", "kam",
        "misina", "makine", "klips", "canta", "lrf", "spin", "igne",
        "kasik", "silikon", "kursun", "shimano", "daiwa",
    )
    blocked_terms = (
        "sepet", "cart", "hesap", "account", "login", "uye", "iletisim",
        "blog", "haber", "hakkimizda", "about", "contact", "tag", "etiket",
    )
    return (
        any(term in normalized for term in product_terms)
        and not any(term in normalized for term in blocked_terms)
    )


def paginated_variants(url: str) -> list[str]:
    urls = [url]
    separator = "&" if "?" in url else "?"
    for page in range(2, MAX_PAGES_PER_QUERY + 1):
        urls.extend([
            f"{url}{separator}page={page}",
            f"{url}{separator}sayfa={page}",
            f"{url}{separator}p={page}",
        ])
    return urls


def build_search_urls(target: StoreTarget) -> list[str]:
    urls: list[str] = []
    for seed_url in target.urls:
        urls.extend(paginated_variants(seed_url))
    for keyword in SEARCH_KEYWORDS:
        encoded = quote_plus(keyword)
        for pattern in SEARCH_PATTERNS:
            search_url = urljoin(target.base_url, pattern.format(query=encoded))
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
        urljoin(target.base_url, "/sitemap-1.xml"),
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
        LOGGER.info("Discovered %s product URLs from sitemap for %s", len(deduped), target.name)
    return deduped


# ─── PAGE PARSING ────────────────────────────────────────────────────────────

def parse_product_detail_page(store_name: str, url: str, html: str) -> ParsedListing | None:
    soup = BeautifulSoup(html, "html.parser")

    # 1. JSON-LD (most reliable — schema.org Product markup)
    ld = extract_json_ld_product(soup)
    if ld:
        brand = ld["brand"] or infer_brand(ld["name"])
        img = ld["image_url"]
        if not img:
            og_img = soup.select_one("meta[property='og:image']")
            img = str(og_img.get("content")) if og_img and og_img.get("content") else None
        return ParsedListing(
            store_name=store_name,
            raw_title=ld["name"],
            brand=brand,
            price=ld["price"],
            product_url=url,
            image_url=img,
            category_slug=categorize_title(ld["name"]),
        )

    # 2. Open Graph meta
    og = extract_open_graph(soup)
    if og:
        brand = og["brand"] or infer_brand(og["name"])
        return ParsedListing(
            store_name=store_name,
            raw_title=og["name"],
            brand=brand,
            price=og["price"],
            product_url=url,
            image_url=og["image_url"],
            category_slug=categorize_title(og["name"]),
        )

    # 3. CSS selector fallback
    title = clean_title(select_text(soup, TITLE_SELECTORS) or "")
    price = parse_price(select_text(soup, PRICE_SELECTORS) or "")
    image_url: str | None = None
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

    # If og:type=product, treat as single product page
    og_type = soup.select_one("meta[property='og:type']")
    if og_type and str(og_type.get("content") or "").lower() == "product":
        result = parse_product_detail_page(store_name, url, html)
        return [result] if result else []

    # Listing page: parse product cards
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


# ─── PRODUCT MATCHING ────────────────────────────────────────────────────────

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
    target_key = listing_match_key(listing)
    listing_tokens = extract_variant_tokens(listing.raw_title)

    if not target_key or not products:
        return None

    # Pre-filter: only consider products with compatible variant tokens
    compatible: dict[str, dict] = {}
    for product in products:
        prod_tokens = extract_variant_tokens(product.get("title", ""))
        # Reject if both sides have tokens but they differ
        if listing_tokens and prod_tokens and not (listing_tokens & prod_tokens):
            continue
        compatible[product_match_key(product)] = product

    if not compatible:
        return None

    candidate_keys = get_close_matches(target_key, compatible.keys(), n=5, cutoff=MATCH_CONFIDENCE)
    if candidate_keys:
        return compatible[candidate_keys[0]]

    best_product: dict | None = None
    best_score = 0.0
    for key, product in compatible.items():
        score = SequenceMatcher(None, target_key, key).ratio()
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


def save_listing(
    client: Client, listing: ParsedListing, categories: dict[str, int], products: list[dict]
) -> None:
    product = find_matching_product(listing, products)
    if product is None:
        product = create_product(client, listing, categories)
        products.append(product)
    upsert_listing(client, int(product["id"]), listing)


# ─── CRAWL ───────────────────────────────────────────────────────────────────

def crawl_store(
    client: Client, target: StoreTarget, categories: dict[str, int], products: list[dict]
) -> int:
    saved_count = 0
    seen_page_urls: set[str] = set()
    seen_listing_urls: set[str] = set()
    discovered_detail_urls: list[str] = []

    search_urls = build_search_urls(target)
    LOGGER.info("Crawling %s — %s search/category URLs queued", target.name, len(search_urls))

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
    LOGGER.info("Crawling %s — %s discovered detail URLs", target.name, len(detail_urls))

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

    LOGGER.info("Finished %s — saved/updated %s unique listings.", target.name, saved_count)
    return saved_count


def scrape_all() -> None:
    client = require_supabase()
    categories = load_categories(client)
    products = load_products(client)
    LOGGER.info(
        "Starting scrape: %s stores | %s categories | %s products in DB",
        len(STORE_TARGETS), len(categories), len(products),
    )
    total_saved = 0
    for target in STORE_TARGETS:
        try:
            total_saved += crawl_store(client, target, categories, products)
        except Exception as exc:
            LOGGER.exception("Store %s failed: %s", target.name, exc)
    LOGGER.info("Scraping complete — saved/updated %s listings total.", total_saved)


if __name__ == "__main__":
    try:
        scrape_all()
    except Exception as error:
        LOGGER.exception("Scraper failed: %s", error)
        sys.exit(1)
