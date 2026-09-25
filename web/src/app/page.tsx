"use client";

import { useMemo, useState } from "react";
import { useLibrary } from "@/lib/store";
import { getAuthorNames, getCopy, inboundCount, tagsForIds } from "@/lib/selectors";
import { BookCard } from "@/components/BookCard";
import { AddBookDialog } from "@/components/AddBookDialog";

export default function LibraryPage() {
  const { library, promoteToLibrary } = useLibrary();
  const [addOpen, setAddOpen] = useState(false);

  const owned = useMemo(
    () =>
      library.works
        .filter((w) => w.copyId)
        .map((w) => ({ work: w, copy: getCopy(library, w.copyId!)! }))
        .sort((a, b) => (a.copy.addedAt < b.copy.addedAt ? 1 : -1)),
    [library],
  );

  const unownedHubs = useMemo(
    () =>
      library.works
        .filter((w) => !w.copyId)
        .map((w) => ({ work: w, inbound: inboundCount(library, w.id) }))
        .filter((w) => w.inbound > 0)
        .sort((a, b) => b.inbound - a.inbound),
    [library],
  );

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Your library</h1>
          <p className="text-sm text-ink-muted">
            {owned.length} book{owned.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink"
        >
          + Add a book
        </button>
      </div>

      {owned.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-ink-muted">
          No books yet. Add your first one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map(({ work, copy }) => (
            <BookCard
              key={work.id}
              work={work}
              copy={copy}
              authorNames={getAuthorNames(library, work)}
              tagLabels={tagsForIds(library, copy.tagIds).map((t) => t.label)}
              inboundCount={inboundCount(library, work.id)}
            />
          ))}
        </div>
      )}

      {unownedHubs.length > 0 && (
        <div>
          <h2 className="mb-1 text-sm font-semibold text-ink">Referenced often, not in your library</h2>
          <p className="mb-3 text-xs text-ink-muted">
            These show up as hubs in your graph because your books cite them — they&apos;re not copies you
            own yet.
          </p>
          <div className="flex flex-col gap-2">
            {unownedHubs.map(({ work, inbound }) => (
              <div
                key={work.id}
                className="flex items-center justify-between rounded-lg border border-dashed border-line-strong px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{work.title}</p>
                  <p className="text-xs text-ink-muted">
                    {getAuthorNames(library, work).join(", ")} · cited by {inbound} book
                    {inbound === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => promoteToLibrary(work.id, { tagIds: [], fileName: "" })}
                  className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:bg-paper-sunken"
                >
                  Add to library
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddBookDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
