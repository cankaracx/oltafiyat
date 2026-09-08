const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c", Ç: "c",
  ğ: "g", Ğ: "g",
  ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o",
  ş: "s", Ş: "s",
  ü: "u", Ü: "u"
};

// Store names come from the scraper config as free-form Turkish text (e.g. "İnce Çizgi"),
// so a locale-aware slug needs explicit Turkish character folding before the generic ASCII pass.
export function slugify(input: string): string {
  const folded = input.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TURKISH_CHAR_MAP[ch] ?? ch);
  return folded
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
