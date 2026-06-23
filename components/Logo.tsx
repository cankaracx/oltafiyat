import Image from "next/image";

export function Logo({ logoUrl, siteName }: { logoUrl: string; siteName: string }) {
  if (logoUrl) {
    return <Image src={logoUrl} alt={siteName} width={180} height={52} className="h-12 w-auto object-contain" />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lg font-black text-gold-300 ring-2 ring-gold-300">AB</div>
      <div className="leading-tight">
        <div className="text-lg font-black tracking-tight text-ink">Ahşap</div>
        <div className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-700">Bisiklet</div>
      </div>
    </div>
  );
}