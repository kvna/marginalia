"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLibrary } from "@/lib/store";
import {
  conceptsForCopy,
  getAuthorNames,
  getCopy,
  getWork,
  isBibliographyEdge,
  referencedBy,
  referencesOut,
  tagsForIds,
} from "@/lib/selectors";
import { renderNoteBody } from "@/lib/markdown";
import { TagChip } from "@/components/TagChip";
import { EdgeRow } from "@/components/EdgeRow";

export function BookDetailClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { library } = useLibrary();

  const work = getWork(library, id);

  if (!work) {
    return (
      <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-ink-muted">
        Book not found. <Link href="/" className="text-accent-ink hover:underline">Back to library</Link>
      </div>
    );
  }

  if (!work.copyId) {
    return <UnownedWorkView workId={work.id} />;
  }

  return <OwnedBookView workId={work.id} />;
}

function UnownedWorkView({ workId }: { workId: string }) {
  const { library, promoteToLibrary } = useLibrary();
  const work = getWork(library, workId)!;
  const inbound = referencedBy(library, work.id, true);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-dashed border-line-strong bg-paper-sunken px-6 py-5">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
            Not in your library
          </p>
          <h1 className="text-xl font-semibold text-ink">{work.title}</h1>
          <p className="text-sm text-ink-muted">
            {getAuthorNames(library, work).join(", ")} · {work.year}
          </p>
        </div>
        <button
          type="button"
          onClick={() => promoteToLibrary(work.id, { tagIds: [], fileName: "" })}
          className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-ink"
        >
          Add to library
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink">
          Referenced by ({inbound.length})
        </h2>
        <div className="flex flex-col gap-2">
          {inbound.map((edge) => {
            const source = getWork(library, edge.fromWorkId);
            return (
              <EdgeRow
                key={edge.id}
                edge={edge}
                workTitle={source?.title ?? "Unknown"}
                workHref={source ? `/books?id=${source.id}` : undefined}
                unowned={source ? !source.copyId : false}
              />
            );
          })}
          {inbound.length === 0 && (
            <p className="text-sm text-ink-muted">No books in your library reference this yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function OwnedBookView({ workId }: { workId: string }) {
  const { library } = useLibrary();
  const work = getWork(library, workId)!;
  const copy = getCopy(library, work.copyId!)!;

  const authorNames = getAuthorNames(library, work);
  const tags = tagsForIds(library, copy.tagIds);
  const concepts = conceptsForCopy(library, copy.id);

  const notes = useMemo(
    () =>
      library.notes
        .filter((n) => n.copyId === copy.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [library, copy.id],
  );

  const highlights = useMemo(
    () => library.highlights.filter((h) => h.copyId === copy.id).sort((a, b) => a.page - b.page),
    [library, copy.id],
  );

  const outEdges = referencesOut(library, work.id, true);
  const bibliography = outEdges.filter((e) => isBibliographyEdge(e.type));
  const mentionedInText = outEdges.filter((e) => !isBibliographyEdge(e.type));
  const inbound = referencedBy(library, work.id, true);

  return (
    <div className="flex flex-col gap-10">
      <div
        className="flex flex-wrap items-end justify-between gap-4 rounded-xl px-6 py-6"
        style={{ backgroundColor: copy.coverColor }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-white drop-shadow-sm">{work.title}</h1>
          <p className="mt-1 text-sm text-white/85">
            {authorNames.join(", ")} · {work.year}
          </p>
        </div>
        <div className="rounded-lg bg-black/25 px-3 py-2 text-xs text-white/90">
          <p>{copy.fileName}</p>
          <p className="text-white/70">Added {copy.addedAt} · {copy.location}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {tags.map((t) => (
          <TagChip key={t.id} label={t.label} />
        ))}
        {concepts.map((c) => (
          <TagChip key={c.id} label={c.label} href={`/concepts?id=${c.id}`} muted />
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Notes</h2>
          <Link
            href={`/books/note?copyId=${copy.id}&noteId=new`}
            className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:bg-paper-sunken"
          >
            + New note
          </Link>
        </div>
        {notes.length === 0 ? (
          <p className="text-sm text-ink-muted">No notes yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <div key={note.id} id={`note-${note.id}`} className="rounded-lg border border-line px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-ink">{note.title}</h3>
                  <Link
                    href={`/books/note?copyId=${copy.id}&noteId=${note.id}`}
                    className="shrink-0 text-xs font-medium text-accent-ink hover:underline"
                  >
                    Edit
                  </Link>
                </div>
                <p className="mb-1 text-xs text-ink-faint">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                <div className="text-sm">{renderNoteBody(note.body, library.concepts)}</div>
                {note.tagIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tagsForIds(library, note.tagIds).map((t) => (
                      <TagChip key={t.id} label={t.label} muted />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {highlights.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Highlights</h2>
          <div className="flex flex-col gap-2">
            {highlights.map((h) => (
              <blockquote
                key={h.id}
                className="rounded-lg border-l-4 border-accent bg-accent-soft px-4 py-2 text-sm text-ink"
              >
                &ldquo;{h.quote}&rdquo;
                <span className="ml-2 text-xs text-ink-muted">p.{h.page}</span>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">References out</h2>
          <RefGroup title="In bibliography" edges={bibliography} library={library} />
          <div className="mt-4">
            <RefGroup title="Mentioned in text" edges={mentionedInText} library={library} />
          </div>
          {outEdges.length === 0 && (
            <p className="text-sm text-ink-muted">This book doesn&apos;t reference anything else yet.</p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Referenced by ({inbound.filter((e) => !e.dismissed).length})</h2>
          <div className="flex flex-col gap-2">
            {inbound.map((edge) => {
              const source = getWork(library, edge.fromWorkId);
              return (
                <EdgeRow
                  key={edge.id}
                  edge={edge}
                  workTitle={source?.title ?? "Unknown"}
                  workHref={source ? `/books?id=${source.id}` : undefined}
                  unowned={source ? !source.copyId : false}
                />
              );
            })}
            {inbound.length === 0 && (
              <p className="text-sm text-ink-muted">Nothing in your library references this yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function RefGroup({
  title,
  edges,
  library,
}: {
  title: string;
  edges: ReturnType<typeof referencesOut>;
  library: ReturnType<typeof useLibrary>["library"];
}) {
  if (edges.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint">{title}</p>
      <div className="flex flex-col gap-2">
        {edges.map((edge) => {
          const target = getWork(library, edge.toWorkId);
          return (
            <EdgeRow
              key={edge.id}
              edge={edge}
              workTitle={target?.title ?? "Unknown"}
              workHref={target ? `/books?id=${target.id}` : undefined}
              unowned={target ? !target.copyId : false}
            />
          );
        })}
      </div>
    </div>
  );
}
