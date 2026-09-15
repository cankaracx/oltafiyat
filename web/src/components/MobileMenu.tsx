"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { mainCategories } from "@/lib/categories";

const quickLinks = [
  { href: "/search?q=lrf", label: "LRF" },
  { href: "/search?q=spin", label: "Spin" },
  { href: "/search?q=surf", label: "Surf" }
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = "mobile-nav-panel";
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative lg:hidden shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Menüyü kapat" : "Kategori menüsünü aç"}
        className="grid h-9 w-9 place-items-center rounded-md text-[#8b949e] hover:bg-white/10 hover:text-white transition-colors"
      >
        {open ? <X size={19} /> : <Menu size={19} />}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-md border border-[#30363d] bg-[#161b22] shadow-lg py-2 z-50"
        >
          <Link
            href="/categories"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Tüm Kategoriler
          </Link>

          <div className="my-1 border-t border-[#30363d]" />

          <div className="max-h-[50vh] overflow-y-auto">
            {mainCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-[#c9d1d9] hover:bg-white/10 hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="my-1 border-t border-[#30363d]" />

          <div className="flex flex-wrap gap-1.5 px-4 py-2.5">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-1 text-xs font-medium text-[#8b949e] border border-[#30363d] hover:text-white hover:border-[#8b949e] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
