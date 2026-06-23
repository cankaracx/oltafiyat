import type { StockStatus } from "./types";

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function whatsappUrl(phone: string, message = "Merhaba, Ahşap Bisiklet web sitesinden ulaşıyorum.") {
  const normalized = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function telUrl(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function stockLabel(status: StockStatus) {
  const labels: Record<StockStatus, string> = {
    in_stock: "Stokta",
    out_of_stock: "Tükendi",
    pre_order: "Siparişle"
  };
  return labels[status];
}

export function stockClass(status: StockStatus) {
  const classes: Record<StockStatus, string> = {
    in_stock: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    out_of_stock: "bg-red-50 text-red-700 ring-red-200",
    pre_order: "bg-gold-50 text-gold-700 ring-gold-100"
  };
  return classes[status];
}

export function formatWhatsAppVisible(phone: string) {
  return phone.replace(/^\+90\s?/, "+90 ");
}