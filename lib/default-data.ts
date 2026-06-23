import type { SiteData } from "./types";

const bikeImage = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80";
const workshopImage = "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80";

export const defaultSiteData: SiteData = {
  settings: {
    siteName: "Ahşap Bisiklet",
    logoUrl: "",
    phone: "+90 541 583 63 30",
    whatsapp: "+90 541 583 63 30",
    email: "info@ahsapbisiklet.com",
    address: "Uluç Mah., Gazi Mustafa Kemal Blv., Güneykent Sitesi F Blok No:109, 07070 Konyaaltı / Antalya",
    mapEmbedUrl: "https://www.google.com/maps?q=Ulu%C3%A7%20Mah.%20Gazi%20Mustafa%20Kemal%20Blv.%20G%C3%BCneykent%20Sitesi%20F%20Blok%20No%3A109%20Konyaalt%C4%B1%20Antalya&output=embed",
    hours: "Pazartesi–Cumartesi 10:00–20:00",
    closedText: "Pazar kapalı"
  },
  navigation: [
    { label: "Ana Sayfa", href: "/" },
    { label: "Mağaza", href: "/magaza" },
    { label: "Hizmetler", href: "/hizmetler" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "İletişim", href: "/iletisim" }
  ],
  footer: {
    tagline: "Antalya Konyaaltı’nda premium bisiklet satışı, bakım ve tamir atölyesi.",
    copyright: "© Ahşap Bisiklet. Tüm hakları saklıdır."
  },
  home: {
    heroEyebrow: "Shimano Yetkili Satıcı • Konyaaltı / Antalya",
    heroTitle: "Yüksek segment bisikletler, uzman servis ve doğru ekipman tek adreste.",
    heroDescription: "Dağ bisikleti, yol bisikleti, gravel, şehir bisikleti, parça ve aksesuar ihtiyaçlarınız için Ahşap Bisiklet mağazasına bekleriz.",
    primaryCta: "Mağazayı İncele",
    secondaryCta: "Bize Ulaşın",
    servicesTitle: "Satıştan servise tam bisiklet deneyimi",
    servicesDescription: "Bisiklet seçimi, bakım planı, parça uyumluluğu ve performans odaklı servis süreçlerinde yanınızdayız.",
    featuredTitle: "Öne çıkan ürünler",
    featuredDescription: "Fiyatları ve stok durumları admin panelinden yönetilen vitrin ürünleri.",
    categoriesTitle: "Kategoriler",
    categoriesDescription: "Shopier tarzı sade katalog: kategori seçin, ürünleri görün, detaydan arayın veya WhatsApp ile sorun.",
    brandsTitle: "Taşıdığımız markalar",
    brandsDescription: "Shimano yetkili satıcılığıyla birlikte seçili premium bisiklet ve ekipman markaları.",
    contactTitle: "Bisikletiniz için doğru çözümü birlikte bulalım",
    contactDescription: "Ürün soruları, servis randevusu ve stok bilgisi için telefon veya WhatsApp üzerinden bize ulaşabilirsiniz."
  },
  pages: {
    about: {
      eyebrow: "Hakkımızda",
      title: "Antalya’da bisiklet kültürünü uzmanlıkla buluşturan mağaza.",
      description: "Ahşap Bisiklet, Konyaaltı’nda bisiklet satışı, bakım, tamir, parça ve aksesuar hizmetleri sunan yerel bir uzman mağazadır.",
      body: "Yüksek segment dağ bisikletleri, yol bisikletleri, gravel modeller ve günlük kullanıma uygun bisikletlerde doğru kadro, doğru ekipman ve doğru servis yaklaşımını önemsiyoruz. Müşterilerimizin kullanım tarzına uygun ürünleri seçmesine yardımcı oluyor, satış sonrası bakım ve teknik destekle bisiklet deneyimini sürdürülebilir hale getiriyoruz."
    },
    services: {
      eyebrow: "Hizmetler",
      title: "Bakım, tamir ve performans odaklı servis.",
      description: "Atölyemizde periyodik bakım, arıza tespiti, aktarma-fren ayarı, parça montajı ve genel bisiklet kontrolü yapılır.",
      body: "Servis süreçleri bisikletinizin kullanım koşullarına göre planlanır. Randevu ve fiyat bilgisi için mağazayla iletişime geçebilirsiniz.",
      items: [
        { title: "Periyodik bakım", description: "Aktarma, fren, rulman, jant ve genel güvenlik kontrolleri." },
        { title: "Tamir ve arıza tespiti", description: "Sorunun kaynağı belirlenir, uygun parça ve işçilik önerilir." },
        { title: "Parça ve aksesuar montajı", description: "Uyumlu komponent seçimi ve profesyonel montaj desteği." },
        { title: "Performans ayarları", description: "Yol, gravel ve MTB kullanımı için hassas sürüş ayarları." }
      ]
    },
    contact: {
      eyebrow: "İletişim",
      title: "Konyaaltı mağazamıza bekleriz.",
      description: "Adres, çalışma saatleri ve hızlı iletişim bilgileri.",
      body: "Telefonla arayabilir, WhatsApp üzerinden yazabilir veya mağazamızı ziyaret edebilirsiniz."
    },
    shop: {
      eyebrow: "Mağaza",
      title: "Kategori seç, ürünleri incele, detaydan bize ulaş.",
      description: "Sepet ve online ödeme yoktur. Ürünler vitrin/katalog amaçlıdır; satın alma ve stok teyidi için mağaza ile iletişime geçin."
    },
    shimano: {
      eyebrow: "Yetkili Satıcı",
      title: "Shimano yetkili satıcı",
      description: "Shimano parça, komponent ve servis ihtiyaçlarınız için yetkili satış ve teknik destek yaklaşımıyla hizmet veriyoruz.",
      body: "Aktarma, fren, pedal, ruble, zincir ve uyumlu komponent seçenekleri için mağazamızdan bilgi alabilirsiniz."
    }
  },
  brands: [
    { id: "shimano", name: "Shimano", description: "Yetkili satıcı", logoUrl: "" },
    { id: "trek", name: "Trek", description: "Premium bisiklet modelleri", logoUrl: "" },
    { id: "specialized", name: "Specialized", description: "Performans odaklı ekipman", logoUrl: "" },
    { id: "sram", name: "SRAM", description: "Aktarma ve fren ekipmanları", logoUrl: "" }
  ],
  categories: [
    { id: "cat-mtb", name: "Dağ Bisikletleri", slug: "dag-bisikletleri", description: "Trail, XC ve enduro odaklı yüksek segment modeller.", imageUrl: bikeImage, order: 1 },
    { id: "cat-road", name: "Yol Bisikletleri", slug: "yol-bisikletleri", description: "Hız, verimlilik ve uzun yol performansı.", imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1400&q=80", order: 2 },
    { id: "cat-gravel", name: "Gravel Bisikletler", slug: "gravel-bisikletler", description: "Asfalt ve stabilize yollar arasında özgür sürüş.", imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1400&q=80", order: 3 },
    { id: "cat-parts", name: "Parça & Aksesuar", slug: "parca-aksesuar", description: "Shimano komponentler, lastik, kask, aydınlatma ve daha fazlası.", imageUrl: workshopImage, order: 4 }
  ],
  products: [
    {
      id: "prod-mtb-elite",
      categoryId: "cat-mtb",
      name: "Elite Carbon MTB",
      slug: "elite-carbon-mtb",
      shortDescription: "Karbon kadro, hassas aktarma ve güçlü fren performansı.",
      description: "Teknik parkurlar ve uzun arazi sürüşleri için hafif karbon kadro, güven veren geometri ve yüksek kaliteli komponentlerle hazırlanmış premium dağ bisikleti.",
      price: "₺149.900",
      images: [bikeImage],
      stockStatus: "in_stock",
      featured: true
    },
    {
      id: "prod-road-aero",
      categoryId: "cat-road",
      name: "Aero Road Pro",
      slug: "aero-road-pro",
      shortDescription: "Yarış geometri, aero boru profili ve verimli sürüş.",
      description: "Performans hedefleyen yol bisikleti kullanıcıları için hızlı, dengeli ve uzun sürüşlerde konforlu bir model.",
      price: "₺189.500",
      images: ["https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1400&q=80"],
      stockStatus: "pre_order",
      featured: true
    },
    {
      id: "prod-gravel-comp",
      categoryId: "cat-gravel",
      name: "Gravel Comp",
      slug: "gravel-comp",
      shortDescription: "Geniş lastik açıklığı ve macera odaklı donanım.",
      description: "Antalya çevresindeki karma zemin rotaları için güvenli, konforlu ve çok yönlü gravel bisiklet.",
      price: "₺96.000",
      images: ["https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1400&q=80"],
      stockStatus: "in_stock",
      featured: true
    },
    {
      id: "prod-shimano-kit",
      categoryId: "cat-parts",
      name: "Shimano Bakım Kiti",
      slug: "shimano-bakim-kiti",
      shortDescription: "Aktarma sistemi bakımı için temel ekipman seti.",
      description: "Zincir, ruble ve aktarma sistemi temizliği için mağazada önerilen bakım ürünleri seti.",
      price: "₺1.850",
      images: [workshopImage],
      stockStatus: "in_stock",
      featured: false
    }
  ]
};