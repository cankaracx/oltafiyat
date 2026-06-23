export function formatTRY(value: number | string | null | undefined): string {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (numericValue === null || numericValue === undefined || Number.isNaN(numericValue)) {
    return "Fiyat yok";
  }
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2
  }).format(numericValue);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return "Yeni veri bekleniyor";
  }
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}