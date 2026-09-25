"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLibrary } from "@/lib/store";
import { search, type SearchResult } from "@/lib/search";

const KIND_LABEL: Record<SearchResult["kind"], string> = {
  book: "Book",
  note: "Note",
  concept: "Concept",
  author: "Author",
};

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { library } = useLibrary();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const results = useMemo(() => search(library, query), [library, query]);

  function handleChange(value: string) {
    setQuery(value);
    router.replace(value ? `/search?q=${encodeURIComponent(value)}` : "/search", { scroll: false });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-3 text-xl font-semibold text-ink">Search</h1>
        <input
          autoFocus
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search notes, books, concepts, authors…"
          className="w-full rounded-lg border border-line bg-paper-raised px-4 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>

      {query.trim() === "" ? (
        <p className="text-sm text-ink-muted">Start typing to search across your library.</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-ink-muted">No results for &ldquo;{query}&rdquo;.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((r) => (
            <Link
              key={`${r.kind}-${r.id}`}
              href={r.href}
              className="rounded-lg border border-line px-4 py-3 hover:bg-paper-sunken"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                <span className="shrink-0 rounded-full bg-paper-sunken px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {KIND_LABEL[r.kind]}
                </span>
              </div>
              {r.subtitle && <p className="truncate text-xs text-ink-muted">{r.subtitle}</p>}
              {r.kind === "note" && <p className="mt-1 text-xs text-ink-faint">{r.snippet}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
