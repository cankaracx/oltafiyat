"use client";

import { useMemo, useState } from "react";
import type { Brand, Category, Product, SiteData, StockStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none ring-gold-300 transition focus:ring-2";
const labelClass = "text-xs font-black uppercase tracking-[0.18em] text-neutral-500";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function Field({ label, value, onChange, textarea = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean }) {
  return (
    <label className="grid gap-2">
      <span className={labelClass}>{label}</span>
      {textarea ? <textarea className={`${inputClass} min-h-24`} value={value || ""} onChange={(event) => onChange(event.target.value)} /> : <input className={inputClass} value={value || ""} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error("Yükleme başarısız");
  const result = (await response.json()) as { url: string };
  return result.url;
}

export function AdminEditor({ initialData }: { initialData: SiteData }) {
  const [data, setData] = useState<SiteData>(initialData);
  const [status, setStatus] = useState("");

  const productsByCategory = useMemo(() => {
    return data.categories.map((category) => ({ category, products: data.products.filter((product) => product.categoryId === category.id) }));
  }, [data.categories, data.products]);

  async function save() {
    setStatus("Kaydediliyor...");
    const response = await fetch("/api/admin/data", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setStatus(response.ok ? "Kaydedildi." : "Kaydetme hatası.");
  }

  function patch<K extends keyof SiteData>(key: K, value: SiteData[K]) {
    setData((current) => ({ ...current, [key]: value }));
  }

  function addBrand() {
    patch("brands", [...data.brands, { id: uid("brand"), name: "Yeni Marka", description: "Açıklama", logoUrl: "" }]);
  }

  function addCategory() {
    const name = "Yeni Kategori";
    patch("categories", [...data.categories, { id: uid("cat"), name, slug: slugify(name), description: "Kategori açıklaması", imageUrl: "", order: data.categories.length + 1 }]);
  }

  function addProduct(categoryId = data.categories[0]?.id || "") {
    const name = "Yeni Ürün";
    patch("products", [...data.products, { id: uid("prod"), categoryId, name, slug: slugify(name), shortDescription: "Kısa açıklama", description: "Ürün açıklaması", price: "₺0", images: [], stockStatus: "in_stock", featured: false }]);
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-white/90 px-4 py-4 backdrop-blur">
        <div className="container-padded flex items-center justify-between px-0">
          <div>
            <h1 className="text-2xl font-black">Ahşap Bisiklet Yönetim Paneli</h1>
            <p className="text-sm text-neutral-600">Tüm site metinleri, iletişim, markalar, kategoriler ve ürünler buradan düzenlenir.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gold-700">{status}</span>
            <button onClick={save} className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white">Kaydet</button>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Genel ayarlar ve logo</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Site adı" value={data.settings.siteName} onChange={(value) => patch("settings", { ...data.settings, siteName: value })} />
          <Field label="Telefon" value={data.settings.phone} onChange={(value) => patch("settings", { ...data.settings, phone: value })} />
          <Field label="WhatsApp" value={data.settings.whatsapp} onChange={(value) => patch("settings", { ...data.settings, whatsapp: value })} />
          <Field label="E-posta" value={data.settings.email} onChange={(value) => patch("settings", { ...data.settings, email: value })} />
          <Field label="Çalışma saatleri" value={data.settings.hours} onChange={(value) => patch("settings", { ...data.settings, hours: value })} />
          <Field label="Kapalı gün metni" value={data.settings.closedText} onChange={(value) => patch("settings", { ...data.settings, closedText: value })} />
          <Field label="Logo URL" value={data.settings.logoUrl} onChange={(value) => patch("settings", { ...data.settings, logoUrl: value })} />
          <label className="grid gap-2"><span className={labelClass}>Logo yükle</span><input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) patch("settings", { ...data.settings, logoUrl: await uploadFile(file) }); }} /></label>
          <div className="md:col-span-2"><Field textarea label="Adres" value={data.settings.address} onChange={(value) => patch("settings", { ...data.settings, address: value })} /></div>
          <div className="md:col-span-2"><Field label="Harita embed URL" value={data.settings.mapEmbedUrl} onChange={(value) => patch("settings", { ...data.settings, mapEmbedUrl: value })} /></div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Menü ve footer</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field textarea label="Footer slogan" value={data.footer.tagline} onChange={(value) => patch("footer", { ...data.footer, tagline: value })} />
          <Field label="Copyright" value={data.footer.copyright} onChange={(value) => patch("footer", { ...data.footer, copyright: value })} />
        </div>
        <div className="mt-5 space-y-3">
          {data.navigation.map((item, index) => (
            <div key={`${item.href}-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input className={inputClass} value={item.label} onChange={(event) => patch("navigation", data.navigation.map((nav, i) => (i === index ? { ...nav, label: event.target.value } : nav)))} />
              <input className={inputClass} value={item.href} onChange={(event) => patch("navigation", data.navigation.map((nav, i) => (i === index ? { ...nav, href: event.target.value } : nav)))} />
              <button className="rounded-xl border px-3 text-sm font-bold" onClick={() => patch("navigation", data.navigation.filter((_, i) => i !== index))}>Sil</button>
            </div>
          ))}
          <button className="rounded-full border px-4 py-2 text-sm font-black" onClick={() => patch("navigation", [...data.navigation, { label: "Yeni", href: "/" }])}>Menü ekle</button>
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Ana sayfa metinleri</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {Object.entries(data.home).map(([key, value]) => (
            <Field key={key} textarea={key.toLowerCase().includes("description") || key.toLowerCase().includes("title")} label={key} value={value} onChange={(next) => patch("home", { ...data.home, [key]: next })} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">Alt sayfalar ve Shimano metinleri</h2>
        <div className="mt-5 grid gap-4">
          {Object.entries(data.pages).map(([pageKey, page]) => (
            <div key={pageKey} className="rounded-2xl bg-neutral-50 p-4">
              <h3 className="mb-4 font-black uppercase text-gold-700">{pageKey}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Eyebrow" value={page.eyebrow || ""} onChange={(value) => patch("pages", { ...data.pages, [pageKey]: { ...page, eyebrow: value } })} />
                <Field label="Başlık" value={page.title} onChange={(value) => patch("pages", { ...data.pages, [pageKey]: { ...page, title: value } })} />
                <Field textarea label="Açıklama" value={page.description} onChange={(value) => patch("pages", { ...data.pages, [pageKey]: { ...page, description: value } })} />
                <Field textarea label="Gövde" value={page.body || ""} onChange={(value) => patch("pages", { ...data.pages, [pageKey]: { ...page, body: value } })} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex justify-between gap-4"><h2 className="text-xl font-black">Hizmet kartları</h2><button onClick={() => patch("pages", { ...data.pages, services: { ...data.pages.services, items: [...data.pages.services.items, { title: "Yeni hizmet", description: "Hizmet açıklaması" }] } })} className="rounded-full border px-4 py-2 text-sm font-black">Hizmet ekle</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.pages.services.items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="rounded-2xl bg-neutral-50 p-4 space-y-3">
              <Field label="Başlık" value={item.title} onChange={(value) => patch("pages", { ...data.pages, services: { ...data.pages.services, items: data.pages.services.items.map((service, i) => i === index ? { ...service, title: value } : service) } })} />
              <Field textarea label="Açıklama" value={item.description} onChange={(value) => patch("pages", { ...data.pages, services: { ...data.pages.services, items: data.pages.services.items.map((service, i) => i === index ? { ...service, description: value } : service) } })} />
              <button className="text-sm font-black text-red-600" onClick={() => patch("pages", { ...data.pages, services: { ...data.pages.services, items: data.pages.services.items.filter((_, i) => i !== index) } })}>Sil</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex justify-between gap-4"><h2 className="text-xl font-black">Markalar</h2><button onClick={addBrand} className="rounded-full border px-4 py-2 text-sm font-black">Marka ekle</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.brands.map((brand, index) => (
            <div key={brand.id} className="rounded-2xl bg-neutral-50 p-4 space-y-3">
              <Field label="Marka adı" value={brand.name} onChange={(value) => patch("brands", data.brands.map((b, i) => i === index ? { ...b, name: value } : b))} />
              <Field label="Açıklama" value={brand.description} onChange={(value) => patch("brands", data.brands.map((b, i) => i === index ? { ...b, description: value } : b))} />
              <Field label="Logo URL" value={brand.logoUrl} onChange={(value) => patch("brands", data.brands.map((b, i) => i === index ? { ...b, logoUrl: value } : b))} />
              <input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) { const url = await uploadFile(file); patch("brands", data.brands.map((b, i) => i === index ? { ...b, logoUrl: url } : b)); } }} />
              <button className="text-sm font-black text-red-600" onClick={() => patch("brands", data.brands.filter((_, i) => i !== index))}>Sil</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex justify-between gap-4"><h2 className="text-xl font-black">Kategoriler</h2><button onClick={addCategory} className="rounded-full border px-4 py-2 text-sm font-black">Kategori ekle</button></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {data.categories.map((category, index) => (
            <div key={category.id} className="rounded-2xl bg-neutral-50 p-4 space-y-3">
              <Field label="Kategori adı" value={category.name} onChange={(value) => patch("categories", data.categories.map((c, i) => i === index ? { ...c, name: value, slug: slugify(value) } : c))} />
              <Field label="Slug" value={category.slug} onChange={(value) => patch("categories", data.categories.map((c, i) => i === index ? { ...c, slug: slugify(value) } : c))} />
              <Field textarea label="Açıklama" value={category.description} onChange={(value) => patch("categories", data.categories.map((c, i) => i === index ? { ...c, description: value } : c))} />
              <Field label="Görsel URL" value={category.imageUrl} onChange={(value) => patch("categories", data.categories.map((c, i) => i === index ? { ...c, imageUrl: value } : c))} />
              <input type="file" accept="image/*" onChange={async (event) => { const file = event.target.files?.[0]; if (file) { const url = await uploadFile(file); patch("categories", data.categories.map((c, i) => i === index ? { ...c, imageUrl: url } : c)); } }} />
              <button className="text-sm font-black text-red-600" onClick={() => { patch("products", data.products.filter((p) => p.categoryId !== category.id)); patch("categories", data.categories.filter((_, i) => i !== index)); }}>Sil</button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex justify-between gap-4"><h2 className="text-xl font-black">Ürünler</h2><button onClick={() => addProduct()} className="rounded-full border px-4 py-2 text-sm font-black">Ürün ekle</button></div>
        <div className="mt-5 space-y-6">
          {productsByCategory.map(({ category, products }) => (
            <div key={category.id}>
              <h3 className="mb-3 font-black text-gold-700">{category.name}</h3>
              <div className="grid gap-4 lg:grid-cols-2">
                {products.map((product) => {
                  const index = data.products.findIndex((item) => item.id === product.id);
                  const update = (next: Product) => patch("products", data.products.map((p, i) => i === index ? next : p));
                  return (
                    <div key={product.id} className="rounded-2xl bg-neutral-50 p-4 space-y-3">
                      <Field label="Ürün adı" value={product.name} onChange={(value) => update({ ...product, name: value, slug: slugify(value) })} />
                      <Field label="Slug" value={product.slug} onChange={(value) => update({ ...product, slug: slugify(value) })} />
                      <label className="grid gap-2"><span className={labelClass}>Kategori</span><select className={inputClass} value={product.categoryId} onChange={(event) => update({ ...product, categoryId: event.target.value })}>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
                      <Field label="Fiyat" value={product.price} onChange={(value) => update({ ...product, price: value })} />
                      <Field textarea label="Kısa açıklama" value={product.shortDescription} onChange={(value) => update({ ...product, shortDescription: value })} />
                      <Field textarea label="Detay açıklama" value={product.description} onChange={(value) => update({ ...product, description: value })} />
                      <label className="grid gap-2"><span className={labelClass}>Stok</span><select className={inputClass} value={product.stockStatus} onChange={(event) => update({ ...product, stockStatus: event.target.value as StockStatus })}><option value="in_stock">Stokta</option><option value="out_of_stock">Tükendi</option><option value="pre_order">Siparişle</option></select></label>
                      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={product.featured} onChange={(event) => update({ ...product, featured: event.target.checked })} /> Öne çıkan</label>
                      <Field textarea label="Görseller (her satıra 1 URL)" value={product.images.join("\n")} onChange={(value) => update({ ...product, images: value.split("\n").filter(Boolean) })} />
                      <input type="file" accept="image/*" multiple onChange={async (event) => { const files = Array.from(event.target.files || []); const urls = await Promise.all(files.map(uploadFile)); update({ ...product, images: [...product.images, ...urls] }); }} />
                      <button className="text-sm font-black text-red-600" onClick={() => patch("products", data.products.filter((_, i) => i !== index))}>Sil</button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}