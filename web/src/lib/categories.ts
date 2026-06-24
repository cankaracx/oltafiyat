import { Anchor, Backpack, Fish, Moon, Paperclip, Sailboat, Search, Sparkles, Waves } from "lucide-react";

export type CategoryInfo = {
  name: string;
  slug: string;
  description: string;
  iconName: "Fish" | "Sparkles" | "Waves" | "Anchor" | "Sailboat" | "Moon" | "Backpack" | "Paperclip" | "Search";
  parentSlug?: string;
};

export type MainCategoryInfo = {
  name: string;
  slug: string;
  description: string;
  iconName: "Fish" | "Sparkles" | "Waves" | "Anchor" | "Sailboat" | "Moon" | "Backpack" | "Paperclip" | "Search";
};

export const mainCategories: MainCategoryInfo[] = [
  {
    name: "LRF",
    slug: "lrf",
    description: "Hafif takımlarla kaya balıkçılığı (Light Rock Fishing) kamışları, makineleri ve hassas mikro yemler.",
    iconName: "Fish"
  },
  {
    name: "Spin",
    slug: "spin",
    description: "At-çek yırtıcı balık avcılığı için kamışlar, at-çek makineleri ve aksesuarları.",
    iconName: "Waves"
  },
  {
    name: "Surf Casting",
    slug: "surf",
    description: "Kıyıdan uzak mesafelere atış yapmaya uygun uzun kamışlar ve yüksek kalibre makineler.",
    iconName: "Sailboat"
  },
  {
    name: "Tekne & Trolling",
    slug: "tekne-trolling",
    description: "Tekneden dip avı kamışları, güçlü tekne makineleri, trolling sırtı avı ve çıkrıklar.",
    iconName: "Anchor"
  },
  {
    name: "Jigging",
    slug: "jigging",
    description: "Dikey jigging ve kıyıdan shore jigging kamış, makine ve ağır metal jig yemleri.",
    iconName: "Waves"
  },
  {
    name: "Suni Yemler & Sahteler",
    slug: "suni-yemler",
    description: "Rapalalar, silikon yemler, kaşıklar, spinnerlar ve kurşun arkası sahte balıklar.",
    iconName: "Sparkles"
  },
  {
    name: "Misinalar & Liderler",
    slug: "misinalar",
    description: "8 kat ve 4 kat ip misinalar (PE), fluorocarbon görünmez liderler ve monofilament misinalar.",
    iconName: "Anchor"
  },
  {
    name: "Malzeme, Aksesuar & Giyim",
    slug: "aksesuarlar",
    description: "İğneler, fırdöndüler, klipsler, kurşunlar, çantalar, kutular, kepçeler, kıyafetler ve tulumlar.",
    iconName: "Backpack"
  }
];

export const categories: CategoryInfo[] = [
  // LRF subcategories
  { name: "LRF Sahteleri", slug: "lrf-sahteleri", description: "LRF silikon, mikro sahte, karides, worm ve küçük yemleri karşılaştırın.", iconName: "Fish", parentSlug: "lrf" },
  { name: "LRF Kamışları", slug: "lrf-kamislari", description: "0.5-10 gr arası hassas LRF ve light game kamışlarını bulun.", iconName: "Waves", parentSlug: "lrf" },
  { name: "LRF Makineleri", slug: "lrf-makineleri", description: "1000-2500 kafa LRF makinelerinde mağaza fiyatlarını kıyaslayın.", iconName: "Anchor", parentSlug: "lrf" },
  { name: "Ultra Light / Ajing Ekipmanları", slug: "ultra-light-ajing-ekipmanlari", description: "Ajing, rock fishing ve ultra light av için özel ürünler.", iconName: "Sparkles", parentSlug: "lrf" },
  { name: "LRF Takımları", slug: "lrf-takimlari", description: "Hazır LRF setleri ve başlangıç kombinleri.", iconName: "Fish", parentSlug: "lrf" },

  // Spin subcategories
  { name: "Spin Kamışları", slug: "spin-kamislari", description: "Levrek, turna ve kıyı spin avına uygun kamışlar.", iconName: "Waves", parentSlug: "spin" },
  { name: "Spin Makineleri", slug: "spin-makineleri", description: "2500-5000 kafa spin makinelerinde güncel fiyatlar.", iconName: "Anchor", parentSlug: "spin" },

  // Surf subcategories
  { name: "Surf Kamışları", slug: "surf-kamislari", description: "Sahil, plaj ve uzak atış surf kamışlarını karşılaştırın.", iconName: "Sailboat", parentSlug: "surf" },
  { name: "Surf Makineleri", slug: "surf-makineleri", description: "Long cast ve surf makinelerinde en uygun mağazayı bulun.", iconName: "Anchor", parentSlug: "surf" },

  // Tekne subcategories
  { name: "Tekne Kamışları", slug: "tekne-kamislari", description: "Tekne avı, bot avı ve dip avı kamışları.", iconName: "Sailboat", parentSlug: "tekne-trolling" },
  { name: "Tekne Makineleri", slug: "tekne-makineleri", description: "Tekne avına uygun güçlü olta makineleri.", iconName: "Anchor", parentSlug: "tekne-trolling" },
  { name: "Trolling Ekipmanları", slug: "trolling-ekipmanlari", description: "Sırtı avı, trolling takımları ve aksesuarları.", iconName: "Sailboat", parentSlug: "tekne-trolling" },

  // Jigging subcategories
  { name: "Jigging Kamışları", slug: "jigging-kamislari", description: "Slow jig, vertical jig ve shore jig kamışları.", iconName: "Waves", parentSlug: "jigging" },
  { name: "Jigging Makineleri", slug: "jigging-makineleri", description: "Jigging avına uygun yüksek drag makineler.", iconName: "Anchor", parentSlug: "jigging" },
  { name: "Jig Yemler / Metal Jigler", slug: "jig-yemler-metal-jigler", description: "Metal jig, casting jig, slow jig ve micro jig ürünleri.", iconName: "Waves", parentSlug: "jigging" },
  { name: "Shore Jigging Kaşıkları", slug: "shore-jigging-kasiklari", description: "Kıyıdan jig ve uzak atış metal kaşık fırsatları.", iconName: "Waves", parentSlug: "jigging" },

  // Suni Yemler subcategories
  { name: "Maket Balıklar / Sahte Yemler", slug: "maket-baliklar-sahte-yemler", description: "Rapala, minnow, jerkbait, pencil, popper ve sert sahteler.", iconName: "Sparkles", parentSlug: "suni-yemler" },
  { name: "Silikon Yemler", slug: "silikon-yemler", description: "Silikon balık, kurt, karides, creature ve soft lure ürünleri.", iconName: "Fish", parentSlug: "suni-yemler" },
  { name: "Kaşıklar", slug: "kasiklar", description: "Tatlı su ve deniz avı için dövme, klasik ve hologram kaşıklar.", iconName: "Sparkles", parentSlug: "suni-yemler" },
  { name: "Spinner Yemler", slug: "spinner-yemler", description: "Turna, alabalık ve tatlı su spinner yemleri.", iconName: "Sparkles", parentSlug: "suni-yemler" },
  { name: "Kurşun Arkası Sahteleri", slug: "kursun-arkasi-sahteleri", description: "Raglou ve kurşun arkası avı için popüler sahteler.", iconName: "Sailboat", parentSlug: "suni-yemler" },
  { name: "Gece Avı Sahteleri", slug: "gece-avi-sahteleri", description: "Glow, UV ve fosforlu gece avı yemleri.", iconName: "Moon", parentSlug: "suni-yemler" },
  { name: "Jig Kafaları (Jighead)", slug: "jig-kafalari-jighead", description: "Silikon yem uyumlu jighead seçenekleri.", iconName: "Search", parentSlug: "suni-yemler" },

  // Misinalar subcategories
  { name: "Monofilament Misinalar", slug: "monofilament-misinalar", description: "Naylon misina, şok lider ve klasik mono misinalar.", iconName: "Anchor", parentSlug: "misinalar" },
  { name: "Fluorocarbon Misinalar", slug: "fluorocarbon-misinalar", description: "FC leader, görünmez misina ve lider seçenekleri.", iconName: "Anchor", parentSlug: "misinalar" },
  { name: "İp Misinalar", slug: "ip-misinalar", description: "PE braid, örgü misina, 4x ve 8x ip misinalar.", iconName: "Anchor", parentSlug: "misinalar" },

  // Aksesuar subcategories
  { name: "İğneler", slug: "igneler", description: "Tekli, üçlü, offset, assist, çapari ve yemli av iğneleri.", iconName: "Paperclip", parentSlug: "aksesuarlar" },
  { name: "Klipsler ve Fırdöndüler", slug: "klipsler-ve-firdonduler", description: "Snap, klips, fırdöndü, halka ve bağlantı aksesuarları.", iconName: "Paperclip", parentSlug: "aksesuarlar" },
  { name: "Kurşunlar ve Şamandıralar", slug: "kursunlar-ve-samandiralar", description: "Surf kurşunu, gezer kurşun, jig ağırlığı ve şamandıralar.", iconName: "Anchor", parentSlug: "aksesuarlar" },
  { name: "Kamış Ayakları", slug: "kamis-ayaklari", description: "Tripod, rod pod, kamış dayama ve sahil ayakları.", iconName: "Anchor", parentSlug: "aksesuarlar" },
  { name: "Balıkçı Çantaları", slug: "balikci-cantalari", description: "Bel çantası, sırt çantası, lure bag ve takım çantaları.", iconName: "Backpack", parentSlug: "aksesuarlar" },
  { name: "Takım Kutuları", slug: "takim-kutulari", description: "Sahte yem kutusu, organizer, jig kutusu ve aksesuar kutuları.", iconName: "Backpack", parentSlug: "aksesuarlar" },
  { name: "Rapala Klipsleri", slug: "rapala-klipsleri", description: "Sahte yem değişimi için rapala klips ve snap çeşitleri.", iconName: "Paperclip", parentSlug: "aksesuarlar" },
  { name: "Kepçeler ve Balık Tutucular", slug: "kepceler-ve-balik-tutucular", description: "Landing net, kepçe, lip grip, balık tutucu ve boga grip ürünleri.", iconName: "Fish", parentSlug: "aksesuarlar" },
  { name: "Balıkçı Giyim", slug: "balikci-giyim", description: "Yağmurluk, çizme, wader, eldiven, şapka ve polar ürünleri.", iconName: "Backpack", parentSlug: "aksesuarlar" },
  { name: "Elektronik ve Aksesuarlar", slug: "elektronik-ve-aksesuarlar", description: "Balık bulucu, kafa lambası, tartı, pense ve yardımcı ekipmanlar.", iconName: "Search", parentSlug: "aksesuarlar" },
  { name: "Bakım ve Yedek Parçalar", slug: "bakim-ve-yedek-parcalar", description: "Makine yağı, bakım ürünleri, yedek makara ve parça seçenekleri.", iconName: "Anchor", parentSlug: "aksesuarlar" },
  { name: "Hazır Olta Takımları", slug: "hazir-olta-takimlari", description: "Set kamış-makine kombinleri ve hazır av takımları.", iconName: "Search", parentSlug: "aksesuarlar" },
  { name: "Olta Makineleri Genel", slug: "olta-makineleri-genel", description: "Spin, surf, baitrunner, çıkrık ve genel makine seçenekleri.", iconName: "Search", parentSlug: "aksesuarlar" }
];

export const categoryIconMap = {
  Anchor,
  Backpack,
  Fish,
  Moon,
  Paperclip,
  Sailboat,
  Search,
  Sparkles,
  Waves
};
