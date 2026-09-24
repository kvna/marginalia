"use client";

/**
 * Screen 2 — Book detail. The hub of the app.
 *
 * Two structural decisions from the spec show up directly in this layout:
 *
 * 1. The page is keyed on a **Work**, not a Copy. An unowned work gets the same
 *    page shell with only *Referenced by* populated, and the note affordances
 *    replaced by "Add to library" — never a note editor for a book with no file.
 * 2. *References out* is split by edge type rather than merged into one list.
 *    A bibliography entry and a paragraph that borrows an idea without naming
 *    anyone are different claims, and stacking them in one list would launder
 *    the weak ones.
 */

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/data/store";
import {
  EDGE_TYPE_BLURB,
  EDGE_TYPE_LABEL,
  authorsForWork,
  conceptsForCopy,
  copyForWork,
  highlightsForCopy,
  inboundEdges,
  inboundReferenceCount,
  notesForCopy,
  outboundEdges,
  tagsForCopy,
  workById,
} from "@/data/selectors";
import {
  ConceptChip,
  Cover,
  EdgeEvidence,
  Empty,
  NotInLibraryBadge,
  Panel,
  TagChip,
} from "@/components/primitives";
import { Markdown } from "@/components/Markdown";
import { routes } from "@/lib/routes";
import type { EdgeType } from "@/data/types";

export default function BookPage() {
  return (
    <Suspense fallback={<p className="text-sm text-dim">Loading…</p>}>
      <BookDetail />
    </Suspense>
  );
}

function BookDetail() {
  const params = useSearchParams();
  const router = useRouter();
  const workId = params.get("w") ?? "";
  const { data, addToLibrary, traversal, noteTraversal } = useStore();

  const work = workById(data, workId);
  const [showSoft, setShowSoft] = useState(false);
  const [showDismissed, setShowDismissed] = useState(false);

  if (!work) {
    return (
      <div className="py-20 text-center">
        <p className="display text-2xl">No such work</p>
        <Link href={routes.library} className="mt-3 inline-block text-sm text-cites">
          back to the library
        </Link>
      </div>
    );
  }

  const copy = copyForWork(data, work.id);
  const owned = Boolean(copy);
  const inbound = inboundEdges(data, work.id, { includeDismissed: showDismissed });
  const outbound = copy
    ? outboundEdges(data, copy.id, { includeDismissed: showDismissed })
    : [];
  const notes = copy ? notesForCopy(data, copy.id) : [];
  const highlights = copy ? highlightsForCopy(data, copy.id) : [];
  const concepts = copy ? conceptsForCopy(data, copy.id) : [];
  const tags = copy ? tagsForCopy(data, copy.id) : [];
  const inboundCount = inboundReferenceCount(data, work.id);

  // Motion is only justified here if the user arrived by following a relationship.
  const arrived = traversal !== null;

  const bibliography = outbound.filter((r) => r.edge.edge_type === "cites");
  const inText = outbound.filter((r) => r.edge.edge_type === "mentions");
  const soft = outbound.filter(
    (r) =>
      r.edge.edge_type === "attributes_to_author" || r.edge.edge_type === "uses_idea",
  );

  return (
    <div className={`space-y-7 ${arrived ? "arriving" : ""}`} key={traversal?.seq ?? "direct"}>
      {/* ------------------------------------------------------------ header */}
      <header className="flex flex-wrap items-start gap-6 border-b border-line pb-6">
        <Cover work={work} owned={owned} size="lg" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">{work.kind === "article" ? "Article" : "Book"}</span>
            {!owned && <NotInLibraryBadge />}
            {work.unresolved && (
              <span
                className="font-mono text-[0.625rem] uppercase"
                style={{ color: "var(--color-attrib)" }}
                title="Parsed out of a bibliography but never matched against OpenLibrary"
              >
                unresolved metadata
              </span>
            )}
          </div>

          <h1 className="display mt-1.5 text-4xl leading-[1.03] font-bold">{work.title}</h1>
          {work.subtitle && (
            <p className="display mt-1 text-lg text-muted italic">{work.subtitle}</p>
          )}

          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            {authorsForWork(data, work).map((a, i) => (
              <span key={a.id}>
                {i > 0 && <span className="text-dim">· </span>}
                <Link
                  href={routes.graphFocus(`author:${a.id}`)}
                  onClick={() => noteTraversal("author", a.name)}
                  className="hover:text-paper hover:underline"
                >
                  {a.name}
                </Link>
              </span>
            ))}
            <span className="text-dim">· {work.year}</span>
            {copy && (
              <span className="font-mono text-[0.6875rem] text-dim">
                · {copy.pages} pp · pdf
              </span>
            )}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {tags.map((t) => (
              <TagChip key={t.id} tag={t} href={routes.tag(t.id)} />
            ))}
          </div>
        </div>

        {/* The number that makes this book a hub, sized to be read first. */}
        <div className="flex items-start gap-6">
          <Stat
            value={inboundCount}
            label="inbound refs"
            accent={inboundCount >= 5 ? "var(--color-cites)" : undefined}
          />
          <Stat value={outbound.filter((r) => !r.edge.dismissed).length} label="outbound" />
          {owned && <Stat value={notes.length} label="notes" />}
        </div>
      </header>

      {/* --------------------------------------------------- unowned CTA row */}
      {!owned && (
        <div
          className="panel unowned flex flex-wrap items-center justify-between gap-4 p-4"
          style={{ borderColor: "var(--color-line-bright)" }}
        >
          <div>
            <p className="display text-lg font-semibold">
              {inboundCount} of your books point at this one. You don&apos;t own it.
            </p>
            <p className="mt-1 text-sm text-muted">
              Adding a file creates a Copy against this existing Work — the{" "}
              {inboundCount} references above stay exactly as they are, and this node stops
              rendering as an outline.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              addToLibrary(work.id);
              router.refresh();
            }}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-void"
            style={{ background: "var(--color-cites)" }}
          >
            Add to library
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------- left: the notes */}
        <div className="space-y-6">
          {owned ? (
            <>
              <Panel
                eyebrow="Notes"
                title="Timeline"
                aside={
                  <Link
                    href={routes.editor(work.id)}
                    className="cursor-pointer rounded border border-line-bright px-2.5 py-1 font-mono text-[0.625rem] uppercase hover:border-cites hover:text-cites"
                  >
                    new note
                  </Link>
                }
              >
                {notes.length === 0 && <Empty>No notes on this book yet.</Empty>}
                <ol className="relative space-y-5">
                  {notes.map((note) => (
                    <li key={note.id} className="relative border-l border-line pl-4">
                      <span
                        className="absolute top-1.5 -left-[3.5px] h-[7px] w-[7px] rounded-full"
                        style={{ background: "var(--color-cites)" }}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="display text-base font-semibold">{note.title}</h3>
                        <div className="flex items-center gap-2 font-mono text-[0.625rem] text-dim">
                          {note.page_ref !== null && <span>p.{note.page_ref}</span>}
                          <span>{note.created_at.slice(0, 10)}</span>
                          <Link
                            href={routes.editor(work.id, note.id)}
                            className="uppercase hover:text-paper"
                          >
                            edit
                          </Link>
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <Markdown
                          body={note.body}
                          data={data}
                          onConceptClick={(id) =>
                            noteTraversal(
                              "concept-link",
                              data.concepts.find((c) => c.id === id)?.name ?? "",
                            )
                          }
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {note.tag_ids.map((id) => {
                          const tag = data.tags.find((t) => t.id === id);
                          return tag ? (
                            <TagChip key={id} tag={tag} href={routes.tag(id)} />
                          ) : null;
                        })}
                      </div>
                    </li>
                  ))}
                </ol>
              </Panel>

              <Panel eyebrow="Highlights" title={`${highlights.length} passages`}>
                {highlights.length === 0 && <Empty>No highlights yet.</Empty>}
                <ul className="space-y-4">
                  {highlights.map((h) => (
                    <li key={h.id} className="border-l-2 pl-3" style={{ borderColor: "var(--color-line-bright)" }}>
                      <p className="evidence">“{h.text}”</p>
                      <p className="mt-1 font-mono text-[0.625rem] text-dim">p.{h.page}</p>
                      {h.remark && (
                        <p className="mt-1.5 text-[0.8125rem] text-muted italic">{h.remark}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          ) : (
            <Panel eyebrow="Notes and highlights" title="Nothing to annotate yet">
              <p className="text-sm text-muted">
                Notes attach to a Copy, not a Work — there is no file here to anchor them to.
                Everything on the right is still real: it comes from the books that reference
                this one.
              </p>
            </Panel>
          )}
        </div>

        {/* --------------------------------------------- right: the graph side */}
        <div className="space-y-6">
          {owned && concepts.length > 0 && (
            <Panel eyebrow="Concepts touched" title="What this book is about">
              <div className="flex flex-wrap items-baseline gap-2">
                {concepts.map((c) => (
                  <ConceptChip
                    key={c.id}
                    concept={c}
                    data={data}
                    href={routes.concept(c.id)}
                  />
                ))}
              </div>
              <p className="mt-3 text-[0.6875rem] text-dim">
                Chip size is occurrence count across your notes; a dashed chip means the
                concept&apos;s origin is unresolved.
              </p>
            </Panel>
          )}

          {/* Referenced by — always available, owned or not. */}
          <Panel
            eyebrow="Referenced by"
            title={`${inbound.filter((r) => !r.edge.dismissed).length} of your books point here`}
            aside={
              <button
                type="button"
                onClick={() => setShowDismissed((v) => !v)}
                className="cursor-pointer font-mono text-[0.625rem] text-dim uppercase hover:text-paper"
              >
                {showDismissed ? "hide dismissed" : "show dismissed"}
              </button>
            }
          >
            {inbound.length === 0 ? (
              <Empty>Nothing in your library references this yet.</Empty>
            ) : (
              <div>
                {inbound.map((r) => (
                  <EdgeEvidence key={r.edge.id} resolved={r} data={data} direction="in" />
                ))}
              </div>
            )}
          </Panel>

          {/* References out — split, never merged. */}
          {owned && (
            <Panel eyebrow="References out" title="What this book points at">
              <EdgeGroup
                type="cites"
                rows={bibliography}
                caption="In the bibliography"
              />
              <EdgeGroup type="mentions" rows={inText} caption="Mentioned in the text" />

              <div className="mt-4 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={() => setShowSoft((v) => !v)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
                >
                  <span>
                    <span className="eyebrow">The softer layer</span>
                    <span className="mt-0.5 block text-[0.8125rem] text-muted">
                      {soft.length} author attributions and unattributed idea borrowings —
                      lower confidence, judged separately.
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[0.625rem] text-dim uppercase">
                    {showSoft ? "hide" : "show"}
                  </span>
                </button>
                {showSoft && (
                  <div className="arriving mt-3">
                    {(["attributes_to_author", "uses_idea"] as EdgeType[]).map((t) => (
                      <EdgeGroup
                        key={t}
                        type={t}
                        rows={soft.filter((r) => r.edge.edge_type === t)}
                        caption={EDGE_TYPE_BLURB[t]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          )}

          <Link
            href={routes.graphFocus(`work:${work.id}`)}
            onClick={() => noteTraversal("graph-node", work.title)}
            className="panel block p-4 transition-colors hover:border-line-bright"
          >
            <p className="eyebrow">Graph</p>
            <p className="display mt-1 text-base font-semibold">
              See this node in the graph →
            </p>
            <p className="mt-1 text-[0.8125rem] text-muted">
              Opens the force-directed view focused on {work.title}.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function EdgeGroup({
  type,
  rows,
  caption,
}: {
  type: EdgeType;
  rows: ReturnType<typeof outboundEdges>;
  caption: string;
}) {
  const { data } = useStore();
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-2">
          <span className={`edge-swatch edge-${type}`} aria-hidden />
          <span className="text-[0.8125rem] font-semibold text-paper">
            {EDGE_TYPE_LABEL[type]}
          </span>
        </span>
        <span className="font-mono text-[0.625rem] text-dim">{rows.length}</span>
      </div>
      <p className="mb-1 text-[0.6875rem] text-dim">{caption}</p>
      {rows.length === 0 ? (
        <Empty>None.</Empty>
      ) : (
        rows.map((r) => (
          <EdgeEvidence key={r.edge.id} resolved={r} data={data} direction="out" />
        ))
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: string;
}) {
  return (
    <div className="text-right">
      <p
        className="display text-3xl leading-none font-bold"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      <p className="mt-1 font-mono text-[0.625rem] tracking-wide text-dim uppercase">
        {label}
      </p>
    </div>
  );
}
