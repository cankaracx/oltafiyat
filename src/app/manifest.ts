import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OltaFiyat",
    short_name: "OltaFiyat",
    description: "Türkiye balık avı ürünlerinde fiyat karşılaştırma",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8fa",
    theme_color: "#24292f",
    orientation: "portrait",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
