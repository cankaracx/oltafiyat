import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSiteData } from "@/lib/data";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Ahşap Bisiklet | Antalya Bisiklet Mağazası",
  description: "Antalya Konyaaltı’nda yüksek segment bisiklet satışı, bakım, tamir, parça ve aksesuar hizmetleri. Shimano yetkili satıcı."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = await getSiteData();

  return (
    <html lang="tr">
      <body className={inter.className}>
        <Header data={data} />
        <main>{children}</main>
        <Footer data={data} />
      </body>
    </html>
  );
}