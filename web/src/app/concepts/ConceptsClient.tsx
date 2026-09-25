"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLibrary } from "@/lib/store";
import { getAuthorNames, getWork, tagUsageCount, worksTouchingConcept } from "@/lib/selectors";
import { TagChip } from "@/components/TagChip";

type Tab = "concepts" | "tags";

export function ConceptsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { library } = useLibrary();
  const [tab, setTab] = useState<Tab>("concepts");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const selectedConceptId = searchParams.get("id") ?? library.concepts[0]?.id ?? null;
  const selectedConcept = library.concepts.find((c) => c.id === selectedConceptId);

  const touching = useMemo(
    () => (selectedConcept ? worksTouchingConcept(library, selectedConcept.id) : []),
    [library, selectedConcept],
  );
  const originWork = selectedConcept ? getWork(library, selectedConcept.originWorkId) : undefined;

  const selectedTag = library.tags.find((t) => t.id === selectedTagId);
  const tagCopies = selectedTag ? library.copies.filter((c) => c.tagIds.includes(selectedTag.id)) : [];
  const tagNotes = selectedTag ? library.notes.filter((n) => n.tagIds.includes(selectedTag.id)) : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Concepts & tags</h1>
        <div className="mt-3 inline-flex rounded-full border border-line p-0.5">
          {(["concepts", "tags"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
                tab === t ? "bg-accent-soft text-accent-ink" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "concepts" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="flex flex-col gap-2">
            {library.concepts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.replace(`/concepts?id=${c.id}`, { scroll: false })}
                className={`rounded-lg border px-4 py-2.5 text-left transition-colors ${
                  c.id === selectedConceptId
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:bg-paper-sunken"
                }`}
              >
                <p className="text-sm font-medium text-ink">{c.label}</p>
                <p className="line-clamp-1 text-xs text-ink-muted">{c.summary}</p>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-line px-6 py-5">
            {selectedConcept ? (
              <>
                <h2 className="text-lg font-semibold text-ink">{selectedConcept.label}</h2>
                <p className="mt-1 text-sm text-ink-muted">{selectedConcept.summary}</p>

                <div className="mt-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
                    Originated in
                  </p>
                  {originWork ? (
                    <Link
                      href={`/books?id=${originWork.id}`}
                      className="text-sm font-medium text-accent-ink hover:underline"
                    >
                      {originWork.title}
                      {!originWork.copyId && (
                        <span className="ml-2 rounded-full bg-paper-sunken px-1.5 py-0.5 text-[11px] font-normal text-ink-faint">
                          not in your library
                        </span>
                      )}
                    </Link>
                  ) : (
                    <p className="text-sm text-ink-muted">Unknown</p>
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">
                    Touches {touching.length} book{touching.length === 1 ? "" : "s"}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {touching.map((w) => (
                      <Link
                        key={w.id}
                        href={`/books?id=${w.id}`}
                        className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-sunken"
                      >
                        {w.title}{" "}
                        <span className="text-ink-faint">— {getAuthorNames(library, w).join(", ")}</span>
                      </Link>
                    ))}
                    {touching.length === 0 && (
                      <p className="text-sm text-ink-muted">No notes reference this concept yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-muted">No concepts yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {library.tags.map((t) => {
              const count = tagUsageCount(library, t.id);
              return (
                <button key={t.id} type="button" onClick={() => setSelectedTagId(t.id)}>
                  <TagChip label={`${t.label} · ${count}`} muted={t.id !== selectedTagId} />
                </button>
              );
            })}
          </div>

          {selectedTag && (
            <div className="rounded-xl border border-line px-6 py-5">
              <h2 className="text-sm font-semibold text-ink">{selectedTag.label}</h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">Books</p>
                  <div className="flex flex-col gap-1.5">
                    {tagCopies.map((c) => {
                      const w = library.works.find((work) => work.copyId === c.id);
                      if (!w) return null;
                      return (
                        <Link
                          key={c.id}
                          href={`/books?id=${w.id}`}
                          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-sunken"
                        >
                          {w.title}
                        </Link>
                      );
                    })}
                    {tagCopies.length === 0 && <p className="text-sm text-ink-muted">None.</p>}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">Notes</p>
                  <div className="flex flex-col gap-1.5">
                    {tagNotes.map((n) => {
                      const w = library.works.find((work) => work.copyId === n.copyId);
                      return (
                        <Link
                          key={n.id}
                          href={w ? `/books?id=${w.id}#note-${n.id}` : "#"}
                          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-paper-sunken"
                        >
                          {n.title}
                        </Link>
                      );
                    })}
                    {tagNotes.length === 0 && <p className="text-sm text-ink-muted">None.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
