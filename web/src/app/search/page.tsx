"use client";

/**
 * Screen 6 — Search.
 *
 * One query across works, authors, notes, concepts and tags. Results are grouped
 * by kind rather than interleaved by relevance score: with a personal library the
 * user usually knows *what sort of thing* they are looking for, and a mixed list
 * sorted by a score they cannot see is harder to scan than five short labelled
 * lists. Read-only — the one screen that touches every entity and writes none.
 */

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/data/store";
import { search, type SearchHit, type SearchHitKind } from "@/data/selectors";
import { Panel } from "@/components/primitives";
import { routes } from "@/lib/routes";

const KIND_LABEL: Record<SearchHitKind, string> = {
  work: "Books & works",
  concept: "Concepts",
  note: "Notes",
  author: "Authors",
  tag: "Tags",
};

const KIND_COLOUR: Record<SearchHitKind, string> = {
  work: "var(--color-cites)",
  concept: "var(--color-concept)",
  note: "var(--color-mentions)",
  author: "var(--color-attrib)",
  tag: "var(--color-dim)",
};

const SUGGESTIONS = ["Kahneman", "System 1", "noise", "outside view", "Tversky", "bibliography"];

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-sm text-dim">Loading…</p>}>
      <SearchScreen />
    </Suspense>
  );
}

function SearchScreen() {
  const params = useSearchParams();
  const { data } = useStore();
  const [query, setQuery] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const hits = useMemo(() => search(data, query), [data, query]);

  const grouped = useMemo(() => {
    const out = new Map<SearchHitKind, SearchHit[]>();
    for (const hit of hits) {
      const list = out.get(hit.kind) ?? [];
      list.push(hit);
      out.set(hit.kind, list);
    }
    return out;
  }, [hits]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="border-b border-line pb-5">
        <p className="eyebrow">Search</p>
        <h1 className="display mt-1 text-3xl font-bold">
          Notes, books, concepts, authors
        </h1>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything…"
          className="display mt-4 w-full rounded-lg border border-line bg-void/50 px-4 py-3 text-xl outline-none focus:border-cites"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="eyebrow">Try</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="chip-tag cursor-pointer hover:!border-cites hover:!text-paper"
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {query.trim().length < 2 ? (
        <p className="py-12 text-center text-sm text-dim italic">
          Two characters is enough to start.
        </p>
      ) : hits.length === 0 ? (
        <p className="py-12 text-center text-sm text-dim italic">
          Nothing matches “{query}”.
        </p>
      ) : (
        <>
          <p className="font-mono text-[0.6875rem] text-dim">
            {hits.length} result{hits.length === 1 ? "" : "s"} across{" "}
            {grouped.size} kind{grouped.size === 1 ? "" : "s"}
          </p>

          {(["work", "concept", "note", "author", "tag"] as SearchHitKind[]).map((kind) => {
            const list = grouped.get(kind);
            if (!list || list.length === 0) return null;
            return (
              <Panel
                key={kind}
                eyebrow={KIND_LABEL[kind]}
                aside={
                  <span className="font-mono text-[0.625rem] text-dim">{list.length}</span>
                }
              >
                <div className="divide-y divide-line">
                  {list.map((hit) => (
                    <Link
                      key={`${hit.kind}-${hit.id}`}
                      href={hit.href}
                      className="group block py-2.5"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span
                          className="display text-[0.975rem] font-semibold group-hover:underline"
                          style={{ color: KIND_COLOUR[hit.kind] }}
                        >
                          {hit.title}
                        </span>
                        <span className="font-mono text-[0.625rem] text-dim">
                          {hit.context}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[0.8125rem] text-muted">
                        <Highlighted text={hit.snippet} needle={query} />
                      </p>
                    </Link>
                  ))}
                </div>
              </Panel>
            );
          })}
        </>
      )}

      <p className="text-center text-[0.6875rem] text-dim">
        Search is read-only. To change something, open it —{" "}
        <Link href={routes.library} className="underline hover:text-paper">
          library
        </Link>
        .
      </p>
    </div>
  );
}

/** Marks the matched substring so the reason a result matched is visible. */
function Highlighted({ text, needle }: { text: string; needle: string }) {
  const q = needle.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark
        className="rounded-sm px-0.5"
        style={{ background: "rgb(233 180 76 / 22%)", color: "var(--color-paper)" }}
      >
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}
