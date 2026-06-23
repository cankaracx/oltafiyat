import { Anchor, Backpack, Fish, Moon, Paperclip, Sailboat, Search, Sparkles, Waves } from "lucide-react";

export type CategoryInfo = {
  name: string;
  slug: string;
  description: string;
  iconName: "Fish" | "Sparkles" | "Waves" | "Anchor" | "Sailboat" | "Moon" | "Backpack" | "Paperclip" | "Search";
};

export const categories: CategoryInfo[] = [
  {
    name: "LRF Sahteleri",
    slug: "lrf-sahteleri",
    description: "Silikon, mikro yem ve hafif av sahtelerinde güncel fiyatları karşılaştırın.",
    iconName: "Fish"
  },
  {
    name: "Maket Balıklar / Sahte Yemler",
    slug: "maket-baliklar-sahte-yemler",
    description: "Rapala, minnow, popper ve sert sahte yemleri mağaza mağaza inceleyin.",
    iconName: "Sparkles"
  },
  {
    name: "Shore Jigging Kaşıkları",
    slug: "shore-jigging-kasiklari",
    description: "Metal jig, casting jig ve kıyı avı kaşıklarında en düşük fiyatı bulun.",
    iconName: "Waves"
  },
  {
    name: "LRF Takımları",
    slug: "lrf-takimlari",
    description: "Başlangıç ve profesyonel LRF setlerini tek ekranda karşılaştırın.",
    iconName: "Fish"
  },
  {
    name: "Spin Kamışları",
    slug: "spin-kamislari",
    description: "Levrek, turna ve kıyı spin kamışlarında fiyat avantajlarını yakalayın.",
    iconName: "Waves"
  },
  {
    name: "İp Misinalar",
    slug: "ip-misinalar",
    description: "PE örgü misina, 4x ve 8x iplerde metre başına fiyatı keşfedin.",
    iconName: "Anchor"
  },
  {
    name: "Kurşun Arkası Sahteleri",
    slug: "kursun-arkasi-sahteleri",
    description: "Raglou ve kurşun arkası avlarında popüler sahteleri listeleyin.",
    iconName: "Sailboat"
  },
  {
    name: "Gece Avı Sahteleri",
    slug: "gece-avi-sahteleri",
    description: "Glow, UV ve fosforlu sahtelerde gece avı fırsatlarını görün.",
    iconName: "Moon"
  },
  {
    name: "Kamış Ayakları",
    slug: "kamis-ayaklari",
    description: "Tripod, rod holder ve sahil kamış ayaklarını karşılaştırın.",
    iconName: "Anchor"
  },
  {
    name: "Balıkçı Çantaları",
    slug: "balikci-cantalari",
    description: "Bel çantası, sırt çantası ve takım çantalarında en iyi fiyatları bulun.",
    iconName: "Backpack"
  },
  {
    name: "Jig Kafaları (Jighead)",
    slug: "jig-kafalari-jighead",
    description: "Silikon yem uyumlu jighead seçeneklerini gramaj ve fiyatla inceleyin.",
    iconName: "Search"
  },
  {
    name: "Rapala Klipsleri",
    slug: "rapala-klipsleri",
    description: "Snap, klips ve fırdöndü modellerini uygun fiyatla yakalayın.",
    iconName: "Paperclip"
  }
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