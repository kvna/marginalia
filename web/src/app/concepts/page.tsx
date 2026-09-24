"use client";

/**
 * Screen 4 — Concepts & tags browser.
 *
 * The second way into the same cluster: from the idea side rather than the
 * citation side. A concept with a resolved origin and several `uses_idea` edges
 * pointing at it is the same hub seen from underneath — System 1 / System 2 is
 * the clearest case, since three books borrow it without citing anyone.
 *
 * Concepts and tags share a screen but not a treatment, because they are not the
 * same kind of thing: a concept has an origin and a weight, a tag is a label.
 * The tag half is deliberately flatter.
 */

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/data/store";
import {
  authorLine,
  conceptWeight,
  copiesTouchingConcept,
  ideaEdgesForConcept,
  isOwned,
  notesForTag,
  workById,
  workForCopy,
} from "@/data/selectors";
import { ConceptChip, Cover, EdgeEvidence, Empty, Panel } from "@/components/primitives";
import { Markdown } from "@/components/Markdown";
import { routes } from "@/lib/routes";

export default function ConceptsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-dim">Loading…</p>}>
      <ConceptsBrowser />
    </Suspense>
  );
}

function ConceptsBrowser() {
  const params = useSearchParams();
  const { data, traversal, noteTraversal } = useStore();

  const tab = params.get("tab") === "tags" ? "tags" : "concepts";
  const selectedConceptId = params.get("concept");
  const selectedTagId = params.get("tag");
  const [sort, setSort] = useState<"weight" | "name">("weight");

  const concepts = useMemo(() => {
    const rows = data.concepts.map((concept) => ({
      concept,
      weight: conceptWeight(data, concept.id),
    }));
    return rows.sort((a, b) =>
      sort === "name"
        ? a.concept.name.localeCompare(b.concept.name)
        : b.weight.total - a.weight.total || a.concept.name.localeCompare(b.concept.name),
    );
  }, [data, sort]);

  const selected = selectedConceptId
    ? data.concepts.find((c) => c.id === selectedConceptId)
    : undefined;
  const selectedTag = selectedTagId ? data.tags.find((t) => t.id === selectedTagId) : undefined;

  const unresolvedCount = data.concepts.filter((c) => c.originating_work_id === null).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Concepts &amp; tags</p>
          <h1 className="display mt-1 text-3xl font-bold">
            {data.concepts.length} concepts, {data.tags.length} tags
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Chip size is how often a concept appears — across your notes and across the
            books that use it without attribution. {unresolvedCount} of them have no
            resolved origin and render as outlines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-line">
            {(
              [
                ["concepts", routes.concepts],
                ["tags", routes.tags],
              ] as const
            ).map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`px-3 py-1.5 font-mono text-[0.6875rem] ${
                  tab === label ? "bg-raised text-paper" : "text-dim hover:text-muted"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          {tab === "concepts" && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1.5 font-mono text-[0.6875rem] text-muted"
            >
              <option value="weight">by weight</option>
              <option value="name">alphabetical</option>
            </select>
          )}
        </div>
      </header>

      {tab === "concepts" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          {/* ---- the cloud. Size is the whole point, so it comes first. ---- */}
          <Panel eyebrow="Every concept" title="Weighted by occurrence">
            <div className="flex flex-wrap items-baseline gap-2">
              {concepts.map(({ concept }) => (
                <ConceptChip
                  key={concept.id}
                  concept={concept}
                  data={data}
                  href={routes.concept(concept.id)}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-3 text-[0.625rem] text-dim">
              <span>solid = origin resolved</span>
              <span>dashed = origin unresolved</span>
              <span>number = notes + idea edges</span>
            </div>
          </Panel>

          {/* ---- the detail pane ---- */}
          <div
            className={traversal?.via === "concept-link" ? "arriving" : ""}
            key={traversal?.seq ?? "direct"}
          >
            {selected ? (
              <ConceptDetail conceptId={selected.id} />
            ) : (
              <Panel eyebrow="Pick a concept" title="Jump through to the books">
                <p className="text-sm text-muted">
                  Choose a concept to see which book it originated in, which of your books
                  touch it in their notes, and which books use it without naming anyone.
                </p>
                <div className="mt-4 space-y-2">
                  {concepts.slice(0, 5).map(({ concept, weight }) => (
                    <Link
                      key={concept.id}
                      href={routes.concept(concept.id)}
                      onClick={() => noteTraversal("concept-link", concept.name)}
                      className="flex items-center justify-between gap-3 rounded-md border border-line p-2.5 hover:border-line-bright"
                    >
                      <span className="text-sm font-semibold" style={{ color: "var(--color-concept)" }}>
                        {concept.name}
                      </span>
                      <span className="font-mono text-[0.625rem] text-dim">
                        {weight.noteCount} notes · {weight.ideaEdgeCount} idea edges
                      </span>
                    </Link>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <Panel eyebrow="Every tag" title="Flat labels, no origin">
            <div className="divide-y divide-line">
              {data.tags.map((tag) => {
                const notes = notesForTag(data, tag.id);
                return (
                  <Link
                    key={tag.id}
                    href={routes.tag(tag.id)}
                    className={`flex items-center justify-between gap-3 py-2 ${
                      selectedTagId === tag.id ? "text-paper" : "text-muted hover:text-paper"
                    }`}
                  >
                    <span className="font-mono text-[0.8125rem]">#{tag.name}</span>
                    <span className="font-mono text-[0.625rem] text-dim">
                      {notes.length} note{notes.length === 1 ? "" : "s"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Panel>

          {selectedTag ? (
            <Panel eyebrow="Tag" title={`#${selectedTag.name}`}>
              {notesForTag(data, selectedTag.id).length === 0 && (
                <Empty>No notes carry this tag yet.</Empty>
              )}
              <ul className="space-y-3">
                {notesForTag(data, selectedTag.id).map((note) => {
                  const work = workForCopy(data, note.copy_id);
                  return (
                    <li key={note.id} className="rounded-md border border-line p-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="display text-sm font-semibold">{note.title}</h3>
                        {work && (
                          <Link
                            href={routes.book(work.id)}
                            className="shrink-0 font-mono text-[0.625rem] text-dim hover:text-cites"
                          >
                            {work.title}
                          </Link>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[0.8125rem] text-muted">
                        {note.body.replace(/\[\[|\]\]/g, "").slice(0, 160)}…
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ) : (
            <Panel eyebrow="Pick a tag" title="Tags are just labels">
              <p className="text-sm text-muted">
                Tags carry no origin and no weight — that is the difference from a concept.
                They exist to find notes again, nothing more.
              </p>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ concept detail */

function ConceptDetail({ conceptId }: { conceptId: string }) {
  const { data, noteTraversal } = useStore();
  const concept = data.concepts.find((c) => c.id === conceptId);
  if (!concept) return null;

  const weight = conceptWeight(data, concept.id);
  const origin = concept.originating_work_id
    ? workById(data, concept.originating_work_id)
    : undefined;
  const copies = copiesTouchingConcept(data, concept.id);
  const ideaEdges = ideaEdgesForConcept(data, concept.id);
  const notes = data.notes.filter((n) => n.concept_ids.includes(concept.id));

  return (
    <div className="space-y-4">
      <section className="panel p-5">
        <p className="eyebrow">Concept</p>
        <h2
          className="display mt-1 text-3xl font-bold"
          style={{ color: "var(--color-concept)" }}
        >
          {concept.name}
        </h2>
        {concept.description && (
          <p className="mt-2 max-w-prose text-sm text-muted">{concept.description}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="eyebrow">Originates in</p>
            {origin ? (
              <Link
                href={routes.book(origin.id)}
                onClick={() => noteTraversal("concept-origin", origin.title)}
                className="mt-1 flex items-center gap-2.5 hover:text-cites"
              >
                <Cover work={origin} owned={isOwned(data, origin.id)} size="sm" />
                <span>
                  <span className="display block text-sm font-semibold">{origin.title}</span>
                  <span className="block text-[0.6875rem] text-dim">
                    {authorLine(data, origin)} · {origin.year}
                    {isOwned(data, origin.id) ? "" : " · not in library"}
                  </span>
                </span>
              </Link>
            ) : (
              <p className="mt-1 text-sm text-dim italic">
                Unresolved — this idea has no single work behind it in your library.
              </p>
            )}
          </div>

          <div className="ml-auto flex gap-5 text-right">
            <div>
              <p className="display text-2xl font-bold">{weight.noteCount}</p>
              <p className="font-mono text-[0.625rem] text-dim uppercase">notes</p>
            </div>
            <div>
              <p
                className="display text-2xl font-bold"
                style={{ color: weight.ideaEdgeCount > 0 ? "var(--color-idea)" : undefined }}
              >
                {weight.ideaEdgeCount}
              </p>
              <p className="font-mono text-[0.625rem] text-dim uppercase">idea edges</p>
            </div>
          </div>
        </div>
      </section>

      <Panel eyebrow="Books that touch it" title={`${copies.length} of your books`}>
        {copies.length === 0 ? (
          <Empty>No notes reference this concept yet.</Empty>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {copies.map((copy) => {
              const work = workForCopy(data, copy.id);
              if (!work) return null;
              const isOrigin = concept.originating_work_id === work.id;
              return (
                <Link
                  key={copy.id}
                  href={routes.book(work.id)}
                  onClick={() => noteTraversal("concept-link", work.title)}
                  className="flex items-center gap-2.5 rounded-md border border-line p-2.5 hover:border-line-bright"
                  style={isOrigin ? { borderColor: "var(--color-cites)" } : undefined}
                >
                  <Cover work={work} owned size="sm" />
                  <span className="min-w-0">
                    <span className="display block truncate text-sm font-semibold">
                      {work.title}
                    </span>
                    <span className="block text-[0.625rem] text-dim">
                      {isOrigin ? "origin" : `${notes.filter((n) => n.copy_id === copy.id).length} notes`}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </Panel>

      {ideaEdges.length > 0 && (
        <Panel
          eyebrow="Used without attribution"
          title={`${ideaEdges.length} books borrow this idea`}
        >
          <p className="mb-2 text-[0.8125rem] text-muted">
            These are `uses_idea` edges — the idea appears with no citation and no author
            named. Low confidence by construction, evidence attached anyway.
          </p>
          {ideaEdges.map((r) => (
            <EdgeEvidence key={r.edge.id} resolved={r} data={data} direction="in" />
          ))}
        </Panel>
      )}

      {notes.length > 0 && (
        <Panel eyebrow="What you wrote" title={`${notes.length} notes mention it`}>
          <ul className="space-y-4">
            {notes.map((note) => {
              const work = workForCopy(data, note.copy_id);
              return (
                <li key={note.id} className="border-l border-line pl-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="display text-sm font-semibold">{note.title}</h4>
                    {work && (
                      <Link
                        href={routes.book(work.id)}
                        className="font-mono text-[0.625rem] text-dim hover:text-cites"
                      >
                        {work.title} · {note.created_at.slice(0, 10)}
                      </Link>
                    )}
                  </div>
                  <div className="mt-1">
                    <Markdown body={note.body} data={data} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
}
