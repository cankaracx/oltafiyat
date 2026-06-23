export function SectionHeading({ eyebrow, title, description, dark = false }: { eyebrow?: string; title: string; description?: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-gold-700">{eyebrow}</p> : null}
      <h2 className={`text-3xl font-black tracking-tight sm:text-5xl ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
      {description ? <p className={`mt-4 text-base leading-7 ${dark ? "text-white/70" : "text-neutral-600"}`}>{description}</p> : null}
    </div>
  );
}