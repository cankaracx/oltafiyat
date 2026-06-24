export type CategoryInfo = {
  name: string;
  slug: string;
  description: string;
  parentSlug?: string;
};

export type MainCategoryInfo = {
  name: string;
  slug: string;
  description: string;
};

export const mainCategories: MainCategoryInfo[] = [
  {
    name: "LRF",
    slug: "lrf",
    description: "Hafif takımlarla kaya balıkçılığı (Light Rock Fishing) kamışları, makineleri ve hassas mikro yemler."
  },
  {
    name: "Spin",
    slug: "spin",
    description: "At-çek yırtıcı balık avcılığı için kamışlar, at-çek makineleri ve aksesuarları."
  },
  {
    name: "Surf Casting",
    slug: "surf",
    description: "Kıyıdan uzak mesafelere atış yapmaya uygun uzun kamışlar ve yüksek kalibre makineler."
  },
  {
    name: "Tekne & Trolling",
    slug: "tekne-trolling",
    description: "Tekneden dip avı kamışları, güçlü tekne makineleri, trolling sırtı avı ve çıkrıklar."
  },
  {
    name: "Jigging",
    slug: "jigging",
    description: "Dikey jigging ve kıyıdan shore jigging kamış, makine ve ağır metal jig yemleri."
  },
  {
    name: "Suni Yemler & Sahteler",
    slug: "suni-yemler",
    description: "Rapalalar, silikon yemler, kaşıklar, spinnerlar ve kurşun arkası sahte balıklar."
  },
  {
    name: "Misinalar & Liderler",
    slug: "misinalar",
    description: "8 kat ve 4 kat ip misinalar (PE), fluorocarbon görünmez liderler ve monofilament misinalar."
  },
  {
    name: "Malzeme, Aksesuar & Giyim",
    slug: "aksesuarlar",
    description: "İğneler, fırdöndüler, klipsler, kurşunlar, çantalar, kutular, kepçeler, kıyafetler ve tulumlar."
  }
];

export const categories: CategoryInfo[] = [
  // LRF subcategories
  { name: "LRF Sahteleri", slug: "lrf-sahteleri", description: "LRF silikon, mikro sahte, karides, worm ve küçük yemleri karşılaştırın.", parentSlug: "lrf" },
  { name: "LRF Kamışları", slug: "lrf-kamislari", description: "0.5-10 gr arası hassas LRF ve light game kamışlarını bulun.", parentSlug: "lrf" },
  { name: "LRF Makineleri", slug: "lrf-makineleri", description: "1000-2500 kafa LRF makinelerinde mağaza fiyatlarını kıyaslayın.", parentSlug: "lrf" },
  { name: "Ultra Light / Ajing Ekipmanları", slug: "ultra-light-ajing-ekipmanlari", description: "Ajing, rock fishing ve ultra light av için özel ürünler.", parentSlug: "lrf" },
  { name: "LRF Takımları", slug: "lrf-takimlari", description: "Hazır LRF setleri ve başlangıç kombinleri.", parentSlug: "lrf" },

  // Spin subcategories
  { name: "Spin Kamışları", slug: "spin-kamislari", description: "Levrek, turna ve kıyı spin avına uygun kamışlar.", parentSlug: "spin" },
  { name: "Spin Makineleri", slug: "spin-makineleri", description: "2500-5000 kafa spin makinelerinde güncel fiyatlar.", parentSlug: "spin" },

  // Surf subcategories
  { name: "Surf Kamışları", slug: "surf-kamislari", description: "Sahil, plaj ve uzak atış surf kamışlarını karşılaştırın.", parentSlug: "surf" },
  { name: "Surf Makineleri", slug: "surf-makineleri", description: "Long cast ve surf makinelerinde en uygun mağazayı bulun.", parentSlug: "surf" },

  // Tekne subcategories
  { name: "Tekne Kamışları", slug: "tekne-kamislari", description: "Tekne avı, bot avı ve dip avı kamışları.", parentSlug: "tekne-trolling" },
  { name: "Tekne Makineleri", slug: "tekne-makineleri", description: "Tekne avına uygun güçlü olta makineleri.", parentSlug: "tekne-trolling" },
  { name: "Trolling Ekipmanları", slug: "trolling-ekipmanlari", description: "Sırtı avı, trolling takımları ve aksesuarları.", parentSlug: "tekne-trolling" },

  // Jigging subcategories
  { name: "Jigging Kamışları", slug: "jigging-kamislari", description: "Slow jig, vertical jig ve shore jig kamışları.", parentSlug: "jigging" },
  { name: "Jigging Makineleri", slug: "jigging-makineleri", description: "Jigging avına uygun yüksek drag makineler.", parentSlug: "jigging" },
  { name: "Jig Yemler / Metal Jigler", slug: "jig-yemler-metal-jigler", description: "Metal jig, casting jig, slow jig ve micro jig ürünleri.", parentSlug: "jigging" },
  { name: "Shore Jigging Kaşıkları", slug: "shore-jigging-kasiklari", description: "Kıyıdan jig ve uzak atış metal kaşık fırsatları.", parentSlug: "jigging" },

  // Suni Yemler subcategories
  { name: "Maket Balıklar / Sahte Yemler", slug: "maket-baliklar-sahte-yemler", description: "Rapala, minnow, jerkbait, pencil, popper ve sert sahteler.", parentSlug: "suni-yemler" },
  { name: "Silikon Yemler", slug: "silikon-yemler", description: "Silikon balık, kurt, karides, creature ve soft lure ürünleri.", parentSlug: "suni-yemler" },
  { name: "Kaşıklar", slug: "kasiklar", description: "Tatlı su ve deniz avı için dövme, klasik ve hologram kaşıklar.", parentSlug: "suni-yemler" },
  { name: "Spinner Yemler", slug: "spinner-yemler", description: "Turna, alabalık ve tatlı su spinner yemleri.", parentSlug: "suni-yemler" },
  { name: "Kurşun Arkası Sahteleri", slug: "kursun-arkasi-sahteleri", description: "Raglou ve kurşun arkası avı için popüler sahteler.", parentSlug: "suni-yemler" },
  { name: "Gece Avı Sahteleri", slug: "gece-avi-sahteleri", description: "Glow, UV ve fosforlu gece avı yemleri.", parentSlug: "suni-yemler" },
  { name: "Jig Kafaları (Jighead)", slug: "jig-kafalari-jighead", description: "Silikon yem uyumlu jighead seçenekleri.", parentSlug: "suni-yemler" },

  // Misinalar subcategories
  { name: "Monofilament Misinalar", slug: "monofilament-misinalar", description: "Naylon misina, şok lider ve klasik mono misinalar.", parentSlug: "misinalar" },
  { name: "Fluorocarbon Misinalar", slug: "fluorocarbon-misinalar", description: "FC leader, görünmez misina ve lider seçenekleri.", parentSlug: "misinalar" },
  { name: "İp Misinalar", slug: "ip-misinalar", description: "PE braid, örgü misina, 4x ve 8x ip misinalar.", parentSlug: "misinalar" },

  // Aksesuar subcategories
  { name: "İğneler", slug: "igneler", description: "Tekli, üçlü, offset, assist, çapari ve yemli av iğneleri.", parentSlug: "aksesuarlar" },
  { name: "Klipsler ve Fırdöndüler", slug: "klipsler-ve-firdonduler", description: "Snap, klips, fırdöndü, halka ve bağlantı aksesuarları.", parentSlug: "aksesuarlar" },
  { name: "Kurşunlar ve Şamandıralar", slug: "kursunlar-ve-samandiralar", description: "Surf kurşunu, gezer kurşun, jig ağırlığı ve şamandıralar.", parentSlug: "aksesuarlar" },
  { name: "Kamış Ayakları", slug: "kamis-ayaklari", description: "Tripod, rod pod, kamış dayama ve sahil ayakları.", parentSlug: "aksesuarlar" },
  { name: "Balıkçı Çantaları", slug: "balikci-cantalari", description: "Bel çantası, sırt çantası, lure bag ve takım çantaları.", parentSlug: "aksesuarlar" },
  { name: "Takım Kutuları", slug: "takim-kutulari", description: "Sahte yem kutusu, organizer, jig kutusu ve aksesuar kutuları.", parentSlug: "aksesuarlar" },
  { name: "Rapala Klipsleri", slug: "rapala-klipsleri", description: "Sahte yem değişimi için rapala klips ve snap çeşitleri.", parentSlug: "aksesuarlar" },
  { name: "Kepçeler ve Balık Tutucular", slug: "kepceler-ve-balik-tutucular", description: "Landing net, kepçe, lip grip, balık tutucu ve boga grip ürünleri.", parentSlug: "aksesuarlar" },
  { name: "Balıkçı Giyim", slug: "balikci-giyim", description: "Yağmurluk, çizme, wader, eldiven, şapka ve polar ürünleri.", parentSlug: "aksesuarlar" },
  { name: "Elektronik ve Aksesuarlar", slug: "elektronik-ve-aksesuarlar", description: "Balık bulucu, kafa lambası, tartı, pense ve yardımcı ekipmanlar.", parentSlug: "aksesuarlar" },
  { name: "Bakım ve Yedek Parçalar", slug: "bakim-ve-yedek-parcalar", description: "Makine yağı, bakım ürünleri, yedek makara ve parça seçenekleri.", parentSlug: "aksesuarlar" },
  { name: "Hazır Olta Takımları", slug: "hazir-olta-takimlari", description: "Set kamış-makine kombinleri ve hazır av takımları.", parentSlug: "aksesuarlar" },
  { name: "Olta Makineleri Genel", slug: "olta-makineleri-genel", description: "Spin, surf, baitrunner, çıkrık ve genel makine seçenekleri.", parentSlug: "aksesuarlar" }
];
