export function sanitizeSearchTokens(query: string): string[] {
  return query
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.replace(/[^0-9A-Za-zÀ-ÿĞğİıÖöŞşÜüÇç-]/g, ""))
    .filter((word) => word.length > 0)
    .slice(0, 8);
}

export function toFtsQuery(words: string[]): string {
  return words.map((word) => `'${word.replace(/'/g, "")}'`).join(" & ");
}

export function toOrFilter(words: string[]): string {
  return words
    .map((word) => {
      const safe = word.replace(/[,().]/g, "");
      return `title.ilike.%${safe}%,brand.ilike.%${safe}%`;
    })
    .join(",");
}
