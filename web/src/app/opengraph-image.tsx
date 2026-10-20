import { ImageResponse } from "next/og";
import { DefaultOgContent, OG_SIZE } from "@/lib/og-assets";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "OltaFiyat — Türkiye balıkçılık fiyat karşılaştırma";

export default function Image() {
  return new ImageResponse(<DefaultOgContent />, { ...size });
}
