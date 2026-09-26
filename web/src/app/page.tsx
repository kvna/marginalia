"use client";

/**
 * Screen 1 — Library.
 *
 * Library is the user's shelf: Copies, not Works (spec §7). The works that exist
 * only because something cites them are deliberately kept *out* of the grid and
 * shown in a separate strip below it, so "your shelf" and "your graph" never get
 * conflated — but the strip is on the same screen, because the most-cited work in
 * this library is one the user does not own, and that fact should be visible on
 * the first screen rather than buried in the graph.
 */

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/data/store";
import {
  authorLine,
  conceptsForCopy,
  hubs,
  inboundReferenceCount,
  isOwned,
  notesForCopy,
  tagsForCopy,
} from "@/data/selectors";
import { Cover, Panel, TagChip } from "@/components/primitives";
import type { Copy, Work } from "@/data/types";
import { routes } from "@/lib/routes";

type View = "grid" | "list";

export default function LibraryPage() {
  const { data, addNewBook } = useStore();
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<"added" | "title" | "referenced">("added");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const shelf = useMemo(() => {
    const rows = data.copies
      .map((copy) => {
        const work = data.works.find((w) => w.id === copy.work_id);
        return work ? { copy, work } : null;
      })
      .filter((r): r is { copy: Copy; work: Work } => r !== null)
      .filter(({ copy }) =>
        filterTag ? tagsForCopy(data, copy.id).some((t) => t.id === filterTag) : true,
      );

    return rows.sort((a, b) => {
      if (sort === "title") return a.work.title.localeCompare(b.work.title);
      if (sort === "referenced")
        return (
          inboundReferenceCount(data, b.work.id) - inboundReferenceCount(data, a.work.id)
        );
      return b.copy.added_at.localeCompare(a.copy.added_at);
    });
  }, [data, sort, filterTag]);

  const referencedOnly = useMemo(
    () =>
      data.works
        .filter((w) => !isOwned(data, w.id))
        .map((work) => ({ work, count: inboundReferenceCount(data, work.id) }))
        .sort((a, b) => b.count - a.count),
    [data],
  );

  const topHubs = hubs(data, 5);
  const unownedHub = topHubs.find((h) => !h.owned);

  return (
    <div className="space-y-8">
      {/* ---- Masthead. The one place the library states its own shape. ---- */}
      <section className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="eyebrow">Your shelf</p>
          <h1 className="display mt-1 text-4xl font-bold">
            {data.copies.length} books,{" "}
            <span style={{ color: "var(--color-cites)" }}>{data.edges.filter((e) => !e.dismissed).length}</span>{" "}
            references between them
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            {referencedOnly.length} more works exist in the graph only because your books
            point at them.
            {unownedHub && (
              <>
                {" "}
                The most-cited work here is{" "}
                <Link
                  href={routes.book(unownedHub.work.id)}
                  className="border-b border-dotted font-medium"
                  style={{ color: "var(--color-cites)", borderColor: "var(--color-cites)" }}
                >
                  {unownedHub.work.title}
                </Link>
                , and you do not own it.
              </>
            )}
          </p>
          {data.discovered.length > 0 && (
            <Link
              href={routes.settings}
              className="mt-2 inline-block text-sm font-medium"
              style={{ color: "var(--color-attrib)" }}
            >
              {data.discovered.length} new file{data.discovered.length === 1 ? "" : "s"} found in
              OneDrive, not yet a book — review in Settings →
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Toggle value={view} onChange={setView} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1.5 font-mono text-[0.6875rem] text-muted"
          >
            <option value="added">recently added</option>
            <option value="title">title</option>
            <option value="referenced">most referenced</option>
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold text-void"
            style={{ background: "var(--color-cites)" }}
          >
            Add a book
          </button>
        </div>
      </section>

      {/* ---- Tag filter rail ---- */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="eyebrow mr-1">Tags</span>
        <button
          type="button"
          onClick={() => setFilterTag(null)}
          className={`chip-tag cursor-pointer ${filterTag === null ? "!border-cites !text-paper" : ""}`}
        >
          all
        </button>
        {data.tags.map((tag) => {
          const count = data.copies.filter((c) =>
            tagsForCopy(data, c.id).some((t) => t.id === tag.id),
          ).length;
          if (count === 0) return null;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
              className={`chip-tag cursor-pointer ${filterTag === tag.id ? "!border-cites !text-paper" : ""}`}
            >
              #{tag.name} <span className="ml-1 opacity-50">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ---- The shelf ---- */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shelf.map(({ copy, work }) => (
            <BookCard key={copy.id} copy={copy} work={work} />
          ))}
        </div>
      ) : (
        <div className="panel divide-y divide-line">
          {shelf.map(({ copy, work }) => (
            <BookRow key={copy.id} copy={copy} work={work} />
          ))}
        </div>
      )}

      {shelf.length === 0 && (
        <p className="py-10 text-center text-sm text-dim italic">
          No books carry that tag.
        </p>
      )}

      {/* ---- Referenced but not owned ---- */}
      <Panel
        eyebrow="Referenced, not owned"
        title="Works that exist because your books cite them"
        aside={
          <Link href="/graph" className="text-xs text-dim hover:text-paper">
            see them in the graph →
          </Link>
        }
      >
        <p className="mb-4 max-w-3xl text-sm text-muted">
          Each of these is a real node with real inbound references and no file. Adding one
          creates a Copy against the existing Work — no edge is rewritten, so the node keeps
          every reference it already had.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {referencedOnly.map(({ work, count }) => (
            <Link
              key={work.id}
              href={routes.book(work.id)}
              className="unowned group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-line-bright"
              style={{ borderColor: "var(--color-line)" }}
            >
              <Cover work={work} owned={false} size="sm" />
              <div className="min-w-0">
                <p className="display truncate text-sm font-semibold group-hover:text-cites">
                  {work.title}
                </p>
                <p className="truncate text-[0.6875rem] text-dim">
                  {authorLine(data, work)} · {work.year}
                </p>
                <p className="mt-1 font-mono text-[0.625rem]" style={{ color: count >= 5 ? "var(--color-cites)" : "var(--color-dim)" }}>
                  ← {count} inbound
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Panel>

      {adding && <AddBookDialog onClose={() => setAdding(false)} onAdd={addNewBook} />}
    </div>
  );
}

/* --------------------------------------------------------------- card / row */

function BookCard({ copy, work }: { copy: Copy; work: Work }) {
  const { data } = useStore();
  const tags = tagsForCopy(data, copy.id);
  const concepts = conceptsForCopy(data, copy.id);
  const noteCount = notesForCopy(data, copy.id).length;
  const inbound = inboundReferenceCount(data, work.id);

  return (
    <Link
      href={routes.book(work.id)}
      className="group panel flex flex-col gap-3 p-3 transition-transform hover:-translate-y-0.5 hover:border-line-bright"
    >
      <div className="flex gap-3">
        <Cover work={work} owned size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="display text-[0.975rem] leading-tight font-semibold group-hover:text-cites">
            {work.title}
          </h3>
          <p className="mt-1 text-[0.6875rem] text-dim">
            {authorLine(data, work)}
            <br />
            {work.year}
          </p>
          {inbound > 0 && (
            <p
              className="mt-1.5 font-mono text-[0.625rem]"
              style={{ color: inbound >= 5 ? "var(--color-cites)" : "var(--color-dim)" }}
            >
              ← {inbound} inbound
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {tags.slice(0, 4).map((t) => (
          <TagChip key={t.id} tag={t} />
        ))}
      </div>

      {concepts.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-line pt-2">
          {concepts.slice(0, 3).map((c, i) => (
            <span key={c.id} className="font-mono text-[0.625rem]">
              {i > 0 && <span className="mr-1.5 text-dim">·</span>}
              <span style={{ color: "var(--color-concept)" }}>{c.name}</span>
            </span>
          ))}
          {concepts.length > 3 && (
            <span className="font-mono text-[0.625rem] text-dim">
              +{concepts.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between font-mono text-[0.625rem] text-dim">
        <span>{noteCount} notes</span>
        <span className="uppercase">{copy.reading_state}</span>
      </div>
    </Link>
  );
}

function BookRow({ copy, work }: { copy: Copy; work: Work }) {
  const { data } = useStore();
  const tags = tagsForCopy(data, copy.id);
  const inbound = inboundReferenceCount(data, work.id);
  const outbound = data.edges.filter((e) => e.source_copy_id === copy.id && !e.dismissed).length;

  return (
    <Link href={routes.book(work.id)} className="group flex items-center gap-4 p-3 hover:bg-raised/60">
      <Cover work={work} owned size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="display truncate text-[0.975rem] font-semibold group-hover:text-cites">
          {work.title}
        </h3>
        <p className="truncate text-[0.6875rem] text-dim">
          {authorLine(data, work)} · {work.year} · {copy.pages} pp · {copy.file_path}
        </p>
      </div>
      <div className="hidden w-64 flex-wrap gap-1 md:flex">
        {tags.slice(0, 3).map((t) => (
          <TagChip key={t.id} tag={t} />
        ))}
      </div>
      <div className="w-32 text-right font-mono text-[0.6875rem] text-dim">
        <span style={{ color: inbound >= 5 ? "var(--color-cites)" : undefined }}>←{inbound}</span>
        {" / "}
        <span>{outbound}→</span>
      </div>
      <span className="w-20 text-right font-mono text-[0.625rem] text-dim uppercase">
        {copy.reading_state}
      </span>
    </Link>
  );
}

function Toggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-line">
      {(["grid", "list"] as View[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`cursor-pointer px-2.5 py-1.5 font-mono text-[0.6875rem] ${
            value === v ? "bg-raised text-paper" : "text-dim hover:text-muted"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------- add-a-book flow */

/**
 * Two paths in, because the schema makes them genuinely different operations:
 * attach a file to a Work the graph already knows about (§1, additive), or
 * create a new Work *and* its Copy. The first is the interesting one and it is
 * listed first.
 */
function AddBookDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: { title: string; author: string; year: number; pages: number }) => string;
}) {
  const { data, addToLibrary } = useStore();
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("2020");
  const [pages, setPages] = useState("300");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const candidates = data.works
    .filter((w) => !isOwned(data, w.id))
    .map((work) => ({ work, count: inboundReferenceCount(data, work.id) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-void/75 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="arriving panel mt-10 w-full max-w-2xl p-5"
        style={{ background: "var(--color-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between">
          <div>
            <p className="eyebrow">Add a book</p>
            <h2 className="display mt-1 text-xl font-bold">Point Marginalia at a PDF</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer font-mono text-xs text-dim hover:text-paper"
          >
            esc
          </button>
        </header>

        <div className="mb-4 flex gap-1 border-b border-line">
          {(
            [
              ["existing", "Already in your graph"],
              ["new", "Something new"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                tab === key
                  ? "border-b-2 text-paper"
                  : "border-b-2 border-transparent text-dim hover:text-muted"
              }`}
              style={tab === key ? { borderColor: "var(--color-cites)" } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "existing" ? (
          <div className="space-y-2">
            <p className="text-sm text-muted">
              These works are already nodes in your graph. Attaching a file creates a Copy
              against the existing Work — every inbound reference survives.
            </p>
            <div className="max-h-80 divide-y divide-line overflow-y-auto rounded-md border border-line">
              {candidates.map(({ work, count }) => (
                <div key={work.id} className="flex items-center gap-3 p-2.5">
                  <Cover work={work} owned={false} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="display truncate text-sm font-semibold">{work.title}</p>
                    <p className="truncate text-[0.6875rem] text-dim">
                      {authorLine(data, work)} · {work.year} · {count} inbound
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addToLibrary(work.id);
                      setJustAdded(work.title);
                    }}
                    className="shrink-0 cursor-pointer rounded border border-line-bright px-2.5 py-1 font-mono text-[0.625rem] uppercase hover:border-cites hover:text-cites"
                  >
                    link pdf
                  </button>
                </div>
              ))}
              {candidates.length === 0 && (
                <p className="p-4 text-sm text-dim italic">
                  Every referenced work is already in your library.
                </p>
              )}
            </div>
            {justAdded && (
              <p className="traced rounded p-2 text-sm" style={{ color: "var(--color-cites)" }}>
                {justAdded} is now on your shelf. Its inbound references are unchanged.
              </p>
            )}
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!title.trim() || !author.trim()) return;
              onAdd({
                title,
                author,
                year: Number(year) || 2020,
                pages: Number(pages) || 300,
              });
              onClose();
            }}
          >
            <Field label="Title" value={title} onChange={setTitle} placeholder="The Enigma of Reason" />
            <Field label="Author" value={author} onChange={setAuthor} placeholder="Hugo Mercier" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Year" value={year} onChange={setYear} />
              <Field label="Pages" value={pages} onChange={setPages} />
            </div>
            <div className="rounded-md border border-dashed border-line-bright p-3 text-center">
              <p className="font-mono text-[0.6875rem] text-dim uppercase">
                drop a pdf, or pick from {data.connection.library_folder}
              </p>
              <p className="mt-1 text-[0.625rem] text-dim">
                PDF only. Parsing runs once, on add — stubbed in the prototype.
              </p>
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-md px-3 py-2 text-sm font-semibold text-void"
              style={{ background: "var(--color-cites)" }}
            >
              Add to library
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-line bg-void/60 px-2.5 py-1.5 text-sm text-paper outline-none focus:border-cites"
      />
    </label>
  );
}
