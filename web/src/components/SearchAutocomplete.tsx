"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2 } from "lucide-react";
import { formatTRY } from "@/lib/format";
import type { SuggestItem } from "@/app/api/suggest/route";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

type SearchAutocompleteProps = {
  name?: string;
  inputId: string;
  placeholder: string;
  defaultValue?: string;
  containerClassName?: string;
  formClassName: string;
  inputClassName: string;
  buttonClassName: string;
  buttonLabel: string;
  showIcon?: boolean;
  iconClassName?: string;
  extraFields?: ReactNode;
};

export default function SearchAutocomplete({
  name = "q",
  inputId,
  placeholder,
  defaultValue = "",
  containerClassName = "relative",
  formClassName,
  inputClassName,
  buttonClassName,
  buttonLabel,
  showIcon = false,
  iconClassName = "",
  extraFields
}: SearchAutocompleteProps) {
  const router = useRouter();
  const listboxId = useId();

  const [query, setQuery] = useState(defaultValue);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const latestQueryRef = useRef("");

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function scheduleFetch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      latestQueryRef.current = "";
      setItems([]);
      setLoading(false);
      setSearched(false);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      latestQueryRef.current = trimmed;
      setLoading(true);
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`suggest request failed with ${res.status}`);
        const data = (await res.json()) as { items: SuggestItem[] };
        if (latestQueryRef.current !== trimmed) return;
        setItems(data.items);
        setSearched(true);
        setOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Autocomplete suggestion fetch failed", err);
        }
      } finally {
        if (latestQueryRef.current === trimmed) setLoading(false);
      }
    }, DEBOUNCE_MS);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setQuery(value);
    scheduleFetch(value);
  }

  function goToProduct(id: number) {
    setOpen(false);
    setActiveIndex(-1);
    router.push(`/product/${id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || items.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        event.preventDefault();
        goToProduct(items[activeIndex].id);
      }
      // No suggestion highlighted: let the form submit normally to /search.
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const trimmedQuery = query.trim();
  const showDropdown = open && trimmedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className={containerClassName}>
      <form action="/search" role="search" className={formClassName}>
        {showIcon && <Search size={14} className={iconClassName} aria-hidden="true" />}
        <label htmlFor={inputId} className="sr-only">Ürün ara</label>
        <input
          id={inputId}
          name={name}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
          className={inputClassName}
        />
        {extraFields}
        <button type="submit" className={buttonClassName}>
          {buttonLabel}
        </button>
      </form>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Arama önerileri"
          className="panel absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden"
        >
          {loading && items.length === 0 && (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-[#57606a]">
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              Aranıyor…
            </p>
          )}

          {!loading && searched && items.length === 0 && (
            <p className="px-4 py-3 text-sm text-[#57606a]">
              &ldquo;{trimmedQuery}&rdquo; için öneri yok &mdash; Enter&rsquo;a basarak tüm sonuçlarda ara.
            </p>
          )}

          {items.length > 0 && (
            <ul className="max-h-[70vh] divide-y divide-[#e8ecf0] overflow-y-auto">
              {items.map((item, index) => (
                <li key={item.id} role="presentation">
                  <Link
                    id={`${listboxId}-opt-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    href={`/product/${item.id}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      setOpen(false);
                      setActiveIndex(-1);
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 transition-colors ${
                      activeIndex === index ? "bg-[#f6f8fa]" : "bg-white hover:bg-[#f6f8fa]"
                    }`}
                  >
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-[#e8ecf0] bg-[#f6f8fa]">
                      {item.image_url ? (
                        <Image src={item.image_url} alt="" fill sizes="40px" className="object-contain p-1" />
                      ) : (
                        <span className="text-base opacity-25">🎣</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#1c2128]">{item.title}</span>
                      {item.listingCount > 0 && (
                        <span className="mt-0.5 block text-xs text-[#57606a]">{item.listingCount} mağaza</span>
                      )}
                    </span>
                    {item.lowestPrice !== null && (
                      <span className="shrink-0 text-sm font-bold text-[#1a7f37]">{formatTRY(item.lowestPrice)}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {items.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
              onClick={() => setOpen(false)}
              className="block border-t border-[#e8ecf0] bg-[#f6f8fa] px-3.5 py-2.5 text-center text-xs font-semibold text-[#0969da] hover:bg-[#eceff2]"
            >
              &ldquo;{trimmedQuery}&rdquo; için tüm sonuçları gör
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
