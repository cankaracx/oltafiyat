// Mirrors the store list the scraper actually crawls (scraper/scraper.py
// STORE_TARGETS names + base URLs). Kept here as presentation data for the
// /magazalar directory — same manual-sync pattern already used for
// categories.ts between the Python scraper and this frontend.
export type TrackedStore = {
  name: string;
  url: string;
};

export const trackedStores: TrackedStore[] = [
  { name: "Olta Mühendisi", url: "https://www.oltamuhendisi.com" },
  { name: "Sihirli Olta", url: "https://www.sihirliolta.com" },
  { name: "Alba Shop", url: "https://www.albashop.com.tr" },
  { name: "Oltaya Gel", url: "https://www.oltayagel.com" },
  { name: "Avmar", url: "https://www.avmar.com.tr" },
  { name: "Spot Balık", url: "https://www.spotbalik.com.tr" },
  { name: "İnce Çizgi", url: "https://www.incecizgi.com" },
  { name: "Ergin Balıkçılık", url: "https://www.erginbalikcilik.com" },
  { name: "Balık Av Marketim", url: "https://www.balikavmarketim.com" },
  { name: "Avfoni", url: "https://www.avfoni.com" },
  { name: "Av Sepeti", url: "https://www.avsepeti.com" },
  { name: "Kamp Av", url: "https://www.kampav.com" },
  { name: "Av Marketi", url: "https://www.avmarketi.com" },
  { name: "Rastgele Av", url: "https://www.rastgeleav.com" },
  { name: "Balık Marketim", url: "https://www.balikmarketim.com" },
  { name: "Av Deposu", url: "https://www.avdeposu.com" },
  { name: "Mega Fisher", url: "https://www.megafisher.com.tr" },
  { name: "Joy Fish", url: "https://www.joyfish.com.tr" },
  { name: "Oltacı", url: "https://www.oltaci.com" },
  { name: "Balık Av Market", url: "https://www.balikavmarket.com" },
  { name: "Olta Store", url: "https://www.oltastore.com" },
  { name: "Balıkçılık Dünyası", url: "https://www.balikcilikdunyasi.com" },
  { name: "Net Tackle", url: "https://www.nettackle.com.tr" }
];

export function storeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
