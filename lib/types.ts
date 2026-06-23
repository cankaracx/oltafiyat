export type StockStatus = "in_stock" | "out_of_stock" | "pre_order";

export type SiteSettings = {
  siteName: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  hours: string;
  closedText: string;
};

export type NavigationItem = {
  label: string;
  href: string;
};

export type TextPage = {
  title: string;
  eyebrow?: string;
  description: string;
  body?: string;
};

export type ServiceItem = {
  title: string;
  description: string;
};

export type Brand = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  order: number;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  images: string[];
  stockStatus: StockStatus;
  featured: boolean;
};

export type SiteData = {
  settings: SiteSettings;
  navigation: NavigationItem[];
  footer: {
    tagline: string;
    copyright: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroDescription: string;
    primaryCta: string;
    secondaryCta: string;
    servicesTitle: string;
    servicesDescription: string;
    featuredTitle: string;
    featuredDescription: string;
    categoriesTitle: string;
    categoriesDescription: string;
    brandsTitle: string;
    brandsDescription: string;
    contactTitle: string;
    contactDescription: string;
  };
  pages: {
    about: TextPage;
    services: TextPage & { items: ServiceItem[] };
    contact: TextPage;
    shop: TextPage;
    shimano: TextPage;
  };
  brands: Brand[];
  categories: Category[];
  products: Product[];
};