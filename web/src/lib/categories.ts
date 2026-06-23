import { Anchor, Backpack, Fish, Moon, Paperclip, Sailboat, Search, Sparkles, Waves } from "lucide-react";

export type CategoryInfo = {
  name: string;
  slug: string;
  description: string;
  iconName: "Fish" | "Sparkles" | "Waves" | "Anchor" | "Sailboat" | "Moon" | "Backpack" | "Paperclip" | "Search";
};

export const categories: CategoryInfo[] = [
  { name: "LRF Sahteleri", slug: "lrf-sahteleri", description: "LRF silikon, mikro sahte, karides, worm ve küçük yemleri karşılaştırın.", iconName: "Fish" },
  { name: "LRF Kamışları", slug: "lrf-kamislari", description: "0.5-10 gr arası hassas LRF ve light game kamışlarını bulun.", iconName: "Waves" },
  { name: "LRF Makineleri", slug: "lrf-makineleri", description: "1000-2500 kafa LRF makinelerinde mağaza fiyatlarını kıyaslayın.", iconName: "Anchor" },
  { name: "Ultra Light / Ajing Ekipmanları", slug: "ultra-light-ajing-ekipmanlari", description: "Ajing, rock fishing ve ultra light av için özel ürünler.", iconName: "Sparkles" },
  { name: "Spin Kamışları", slug: "spin-kamislari", description: "Levrek, turna ve kıyı spin avına uygun kamışlar.", iconName: "Waves" },
  { name: "Spin Makineleri", slug: "spin-makineleri", description: "2500-5000 kafa spin makinelerinde güncel fiyatlar.", iconName: "Anchor" },
  { name: "Surf Kamışları", slug: "surf-kamislari", description: "Sahil, plaj ve uzak atış surf kamışlarını karşılaştırın.", iconName: "Sailboat" },
  { name: "Surf Makineleri", slug: "surf-makineleri", description: "Long cast ve surf makinelerinde en uygun mağazayı bulun.", iconName: "Anchor" },
  { name: "Tekne Kamışları", slug: "tekne-kamislari", description: "Tekne avı, bot avı ve dip avı kamışları.", iconName: "Sailboat" },
  { name: "Tekne Makineleri", slug: "tekne-makineleri", description: "Tekne avına uygun güçlü olta makineleri.", iconName: "Anchor" },
  { name: "Jigging Kamışları", slug: "jigging-kamislari", description: "Slow jig, vertical jig ve shore jig kamışları.", iconName: "Waves" },
  { name: "Jigging Makineleri", slug: "jigging-makineleri", description: "Jigging avına uygun yüksek drag makineler.", iconName: "Anchor" },
  { name: "Trolling Ekipmanları", slug: "trolling-ekipmanlari", description: "Sırtı avı, trolling takımları ve aksesuarları.", iconName: "Sailboat" },
  { name: "Olta Makineleri Genel", slug: "olta-makineleri-genel", description: "Spin, surf, baitrunner, çıkrık ve genel makine seçenekleri.", iconName: "Search" },
  { name: "Maket Balıklar / Sahte Yemler", slug: "maket-baliklar-sahte-yemler", description: "Rapala, minnow, jerkbait, pencil, popper ve sert sahteler.", iconName: "Sparkles" },
  { name: "Silikon Yemler", slug: "silikon-yemler", description: "Silikon balık, kurt, karides, creature ve soft lure ürünleri.", iconName: "Fish" },
  { name: "Jig Yemler / Metal Jigler", slug: "jig-yemler-metal-jigler", description: "Metal jig, casting jig, slow jig ve micro jig ürünleri.", iconName: "Waves" },
  { name: "Shore Jigging Kaşıkları", slug: "shore-jigging-kasiklari", description: "Kıyıdan jig ve uzak atış metal kaşık fırsatları.", iconName: "Waves" },
  { name: "Kaşıklar", slug: "kasiklar", description: "Tatlı su ve deniz avı için dövme, klasik ve hologram kaşıklar.", iconName: "Sparkles" },
  { name: "Spinner Yemler", slug: "spinner-yemler", description: "Turna, alabalık ve tatlı su spinner yemleri.", iconName: "Sparkles" },
  { name: "LRF Takımları", slug: "lrf-takimlari", description: "Hazır LRF setleri ve başlangıç kombinleri.", iconName: "Fish" },
  { name: "Hazır Olta Takımları", slug: "hazir-olta-takimlari", description: "Set kamış-makine kombinleri ve hazır av takımları.", iconName: "Search" },
  { name: "Monofilament Misinalar", slug: "monofilament-misinalar", description: "Naylon misina, şok lider ve klasik mono misinalar.", iconName: "Anchor" },
  { name: "Fluorocarbon Misinalar", slug: "fluorocarbon-misinalar", description: "FC leader, görünmez misina ve lider seçenekleri.", iconName: "Anchor" },
  { name: "İp Misinalar", slug: "ip-misinalar", description: "PE braid, örgü misina, 4x ve 8x ip misinalar.", iconName: "Anchor" },
  { name: "Kurşun Arkası Sahteleri", slug: "kursun-arkasi-sahteleri", description: "Raglou ve kurşun arkası avı için popüler sahteler.", iconName: "Sailboat" },
  { name: "Gece Avı Sahteleri", slug: "gece-avi-sahteleri", description: "Glow, UV ve fosforlu gece avı yemleri.", iconName: "Moon" },
  { name: "İğneler", slug: "igneler", description: "Tekli, üçlü, offset, assist, çapari ve yemli av iğneleri.", iconName: "Paperclip" },
  { name: "Klipsler ve Fırdöndüler", slug: "klipsler-ve-firdonduler", description: "Snap, klips, fırdöndü, halka ve bağlantı aksesuarları.", iconName: "Paperclip" },
  { name: "Kurşunlar ve Şamandıralar", slug: "kursunlar-ve-samandiralar", description: "Surf kurşunu, gezer kurşun, jig ağırlığı ve şamandıralar.", iconName: "Anchor" },
  { name: "Kamış Ayakları", slug: "kamis-ayaklari", description: "Tripod, rod pod, kamış dayama ve sahil ayakları.", iconName: "Anchor" },
  { name: "Balıkçı Çantaları", slug: "balikci-cantalari", description: "Bel çantası, sırt çantası, lure bag ve takım çantaları.", iconName: "Backpack" },
  { name: "Takım Kutuları", slug: "takim-kutulari", description: "Sahte yem kutusu, organizer, jig kutusu ve aksesuar kutuları.", iconName: "Backpack" },
  { name: "Jig Kafaları (Jighead)", slug: "jig-kafalari-jighead", description: "Silikon yem uyumlu jighead seçenekleri.", iconName: "Search" },
  { name: "Rapala Klipsleri", slug: "rapala-klipsleri", description: "Sahte yem değişimi için rapala klips ve snap çeşitleri.", iconName: "Paperclip" },
  { name: "Kepçeler ve Balık Tutucular", slug: "kepceler-ve-balik-tutucular", description: "Landing net, kepçe, lip grip, balık tutucu ve boga grip ürünleri.", iconName: "Fish" },
  { name: "Balıkçı Giyim", slug: "balikci-giyim", description: "Yağmurluk, çizme, wader, eldiven, şapka ve polar ürünleri.", iconName: "Backpack" },
  { name: "Elektronik ve Aksesuarlar", slug: "elektronik-ve-aksesuarlar", description: "Balık bulucu, kafa lambası, tartı, pense ve yardımcı ekipmanlar.", iconName: "Search" },
  { name: "Bakım ve Yedek Parçalar", slug: "bakim-ve-yedek-parcalar", description: "Makine yağı, bakım ürünleri, yedek makara ve parça seçenekleri.", iconName: "Anchor" }
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