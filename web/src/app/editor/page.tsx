"use client";

/**
 * Screen 3 — Note editor.
 *
 * Bound to one Copy, because a note has nowhere to live without a file. The
 * `[[concept]]` autocomplete is the load-bearing part: what looks like a text
 * convention is the NoteConcept join being written, so the preview resolves each
 * link against the real Concept table and flags the ones that do not match
 * rather than leaving a typo to fail silently at save time.
 *
 * Creating a concept from inside the editor asks for its originating work, since
 * a concept without an origin is a weaker node (spec §3/§8) and the moment of
 * creation is the only cheap time to ask.
 */

import Link from "next/link";
import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { extractConceptLinks, useStore } from "@/data/store";
import {
  authorLine,
  conceptByName,
  copyForWork,
  highlightsForCopy,
  workById,
} from "@/data/selectors";
import { Markdown } from "@/components/Markdown";
import { ConceptChip, Panel } from "@/components/primitives";
import { routes } from "@/lib/routes";

export default function EditorPage() {
  return (
    <Suspense fallback={<p className="text-sm text-dim">Loading…</p>}>
      <NoteEditor />
    </Suspense>
  );
}

function NoteEditor() {
  const params = useSearchParams();
  const router = useRouter();
  const { data, saveNote, deleteNote, createConcept, createTag } = useStore();

  const workId = params.get("w") ?? "";
  const noteId = params.get("n") ?? undefined;
  const work = workById(data, workId);
  const copy = work ? copyForWork(data, work.id) : undefined;
  const existing = noteId ? data.notes.find((n) => n.id === noteId) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [pageRef, setPageRef] = useState(
    existing?.page_ref !== null && existing?.page_ref !== undefined
      ? String(existing.page_ref)
      : "",
  );
  const [tagIds, setTagIds] = useState<string[]>(existing?.tag_ids ?? []);
  const [tagQuery, setTagQuery] = useState("");
  const [caret, setCaret] = useState(0);
  const [saved, setSaved] = useState(false);
  const [newConcept, setNewConcept] = useState<string | null>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  if (!work || !copy) {
    return (
      <div className="py-20 text-center">
        <p className="display text-2xl">
          {work ? "You don’t own this book" : "No such book"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Notes attach to a Copy. Add the file first and the editor opens.
        </p>
        <Link href={routes.library} className="mt-3 inline-block text-sm text-cites">
          back to the library
        </Link>
      </div>
    );
  }

  /* ------------------------------------------------- [[concept]] completion */

  // The open `[[` fragment immediately before the caret, if there is one.
  const fragment = useMemo(() => {
    const before = body.slice(0, caret);
    const open = before.lastIndexOf("[[");
    if (open === -1) return null;
    const between = before.slice(open + 2);
    if (between.includes("]]") || between.includes("\n")) return null;
    return { start: open, query: between };
  }, [body, caret]);

  const conceptMatches = useMemo(() => {
    if (!fragment) return [];
    const q = fragment.query.trim().toLowerCase();
    return data.concepts
      .filter((c) => c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 7);
  }, [data.concepts, fragment]);

  function completeConcept(name: string) {
    if (!fragment) return;
    const next = `${body.slice(0, fragment.start)}[[${name}]]${body.slice(caret)}`;
    setBody(next);
    const pos = fragment.start + name.length + 4;
    requestAnimationFrame(() => {
      textarea.current?.focus();
      textarea.current?.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  }

  const linked = extractConceptLinks(body);
  const resolvedLinks = linked
    .map((name) => ({ name, concept: conceptByName(data, name) }))
    .filter((l) => l.concept);
  const unresolvedLinks = linked.filter((name) => !conceptByName(data, name));

  /* ------------------------------------------------------------ tag helpers */

  const tagMatches = data.tags
    .filter(
      (t) => !tagIds.includes(t.id) && t.name.toLowerCase().includes(tagQuery.toLowerCase()),
    )
    .slice(0, 6);

  function addTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setTagQuery("");
  }

  /* ------------------------------------------------------------------- save */

  function onSave() {
    const id = saveNote({
      noteId: existing?.id,
      copyId: copy!.id,
      title,
      body,
      pageRef: pageRef.trim() === "" ? null : Number(pageRef),
      tagIds,
    });
    setSaved(true);
    if (!existing) router.replace(routes.editor(work!.id, id));
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="eyebrow">{existing ? "Editing note" : "New note"}</p>
          <h1 className="display mt-1 text-2xl font-bold">
            <Link href={routes.book(work.id)} className="hover:text-cites">
              {work.title}
            </Link>
          </h1>
          <p className="mt-1 text-[0.8125rem] text-dim">
            {authorLine(data, work)} · {copy.pages} pp · {copy.file_path}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {existing && (
            <button
              type="button"
              onClick={() => {
                deleteNote(existing.id);
                router.push(routes.book(work.id));
              }}
              className="cursor-pointer rounded-md border border-line px-3 py-1.5 font-mono text-[0.6875rem] text-dim uppercase hover:border-idea hover:text-idea"
            >
              delete
            </button>
          )}
          <Link
            href={routes.book(work.id)}
            className="rounded-md border border-line px-3 py-1.5 font-mono text-[0.6875rem] text-dim uppercase hover:text-paper"
          >
            done
          </Link>
          <button
            type="button"
            onClick={onSave}
            className="cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold text-void"
            style={{ background: saved ? "var(--color-mentions)" : "var(--color-cites)" }}
          >
            {saved ? "Saved" : "Save note"}
          </button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ------------------------------------------------------- the editor */}
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="display w-full rounded-md border border-line bg-void/50 px-3 py-2 text-lg font-semibold outline-none focus:border-cites"
          />

          <div className="relative">
            <textarea
              ref={textarea}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setCaret(e.target.selectionStart);
              }}
              onKeyUp={(e) => setCaret(e.currentTarget.selectionStart)}
              onClick={(e) => setCaret(e.currentTarget.selectionStart)}
              rows={18}
              placeholder={"Markdown. Type [[ to link a concept.\n\n**bold**, *italic*, - lists, > quotes."}
              className="w-full resize-y rounded-md border border-line bg-void/50 p-3 font-mono text-[0.8125rem] leading-relaxed outline-none focus:border-cites"
            />

            {/* Concept autocomplete, anchored under the editor. */}
            {fragment && (
              <div className="arriving absolute right-3 bottom-3 left-3 z-20 overflow-hidden rounded-md border border-line-bright bg-surface shadow-2xl">
                <p className="border-b border-line px-3 py-1.5 font-mono text-[0.625rem] text-dim uppercase">
                  concepts matching “{fragment.query || "…"}”
                </p>
                {conceptMatches.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => completeConcept(c.name)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-left text-sm hover:bg-raised"
                  >
                    <span style={{ color: "var(--color-concept)" }}>{c.name}</span>
                    <span className="font-mono text-[0.625rem] text-dim">
                      {c.originating_work_id
                        ? (workById(data, c.originating_work_id)?.title ?? "")
                        : "origin unresolved"}
                    </span>
                  </button>
                ))}
                {fragment.query.trim().length > 1 && !conceptByName(data, fragment.query) && (
                  <button
                    type="button"
                    onClick={() => setNewConcept(fragment.query.trim())}
                    className="w-full cursor-pointer border-t border-line px-3 py-1.5 text-left text-sm text-muted hover:bg-raised"
                  >
                    + create concept “{fragment.query.trim()}”
                  </button>
                )}
                {conceptMatches.length === 0 && fragment.query.trim().length <= 1 && (
                  <p className="px-3 py-2 text-sm text-dim italic">Keep typing…</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-[6rem_1fr] items-start gap-3">
            <label className="block">
              <span className="eyebrow">Page</span>
              <input
                value={pageRef}
                onChange={(e) => setPageRef(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="—"
                className="mt-1 w-full rounded-md border border-line bg-void/50 px-2 py-1.5 font-mono text-sm outline-none focus:border-cites"
              />
            </label>

            <div>
              <span className="eyebrow">Tags</span>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-md border border-line bg-void/50 p-2">
                {tagIds.map((id) => {
                  const tag = data.tags.find((t) => t.id === id);
                  if (!tag) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTagIds((prev) => prev.filter((t) => t !== id))}
                      className="chip-tag cursor-pointer hover:!border-idea hover:!text-idea"
                      title="Remove tag"
                    >
                      #{tag.name} ×
                    </button>
                  );
                })}
                <input
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagQuery.trim()) {
                      e.preventDefault();
                      const match = tagMatches[0];
                      addTag(match ? match.id : createTag(tagQuery));
                    }
                  }}
                  placeholder="add a tag…"
                  className="min-w-24 flex-1 bg-transparent font-mono text-[0.75rem] outline-none"
                />
              </div>
              {tagQuery && (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {tagMatches.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => addTag(t.id)}
                      className="chip-tag cursor-pointer hover:!border-cites hover:!text-paper"
                    >
                      #{t.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => addTag(createTag(tagQuery))}
                    className="chip-tag cursor-pointer"
                    style={{ borderStyle: "dashed" }}
                  >
                    + {tagQuery}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Highlights on this book, as anchors to write against. */}
          <Panel eyebrow="Highlights on this book" title="Anchor a note to a passage">
            <div className="max-h-44 space-y-2 overflow-y-auto">
              {highlightsForCopy(data, copy.id).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setPageRef(String(h.page));
                    setBody((b) => `${b}${b ? "\n\n" : ""}> ${h.text}\n\n`);
                  }}
                  className="w-full cursor-pointer rounded border border-line p-2 text-left hover:border-line-bright"
                >
                  <p className="evidence text-[0.8125rem]">“{h.text}”</p>
                  <p className="mt-1 font-mono text-[0.625rem] text-dim">
                    p.{h.page} — click to quote
                  </p>
                </button>
              ))}
              {highlightsForCopy(data, copy.id).length === 0 && (
                <p className="text-sm text-dim italic">No highlights on this book.</p>
              )}
            </div>
          </Panel>
        </div>

        {/* ------------------------------------------------------ the preview */}
        <div className="space-y-3">
          <Panel eyebrow="Preview" title={title || "Untitled note"}>
            {body.trim() ? (
              <Markdown body={body} data={data} />
            ) : (
              <p className="text-sm text-dim italic">
                Nothing written yet. The preview resolves every `[[link]]` against the
                concept table as you type.
              </p>
            )}
          </Panel>

          <Panel
            eyebrow="Concepts this note links"
            title={`${resolvedLinks.length} resolved`}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              {resolvedLinks.map(({ concept }) =>
                concept ? (
                  <ConceptChip
                    key={concept.id}
                    concept={concept}
                    data={data}
                    href={routes.concept(concept.id)}
                  />
                ) : null,
              )}
              {resolvedLinks.length === 0 && (
                <p className="text-sm text-dim italic">
                  Type <code className="font-mono">[[</code> in the body to link one.
                </p>
              )}
            </div>

            {unresolvedLinks.length > 0 && (
              <div className="mt-4 rounded-md border border-dashed border-line-bright p-3">
                <p className="eyebrow" style={{ color: "var(--color-idea)" }}>
                  {unresolvedLinks.length} link{unresolvedLinks.length === 1 ? "" : "s"} match
                  no concept
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unresolvedLinks.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setNewConcept(name)}
                      className="cursor-pointer rounded border border-dashed border-dim px-2 py-1 text-[0.8125rem] text-muted hover:border-concept hover:text-paper"
                    >
                      create “{name}”
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[0.625rem] text-dim">
                  Saving keeps the text as written; only resolved links become NoteConcept
                  rows.
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {newConcept && (
        <NewConceptDialog
          name={newConcept}
          onClose={() => setNewConcept(null)}
          onCreate={(originWorkId) => {
            createConcept(newConcept, originWorkId);
            if (fragment) completeConcept(newConcept);
            setNewConcept(null);
          }}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------- concept creation */

function NewConceptDialog({
  name,
  onClose,
  onCreate,
}: {
  name: string;
  onClose: () => void;
  onCreate: (originatingWorkId: string | null) => void;
}) {
  const { data } = useStore();
  const [origin, setOrigin] = useState<string>("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-void/75 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="arriving panel mt-16 w-full max-w-lg p-5"
        style={{ background: "var(--color-surface)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow">New concept</p>
        <h2 className="display mt-1 mb-3 text-xl font-bold" style={{ color: "var(--color-concept)" }}>
          {name}
        </h2>
        <p className="mb-3 text-sm text-muted">
          Which work does this idea originate in? A concept with a resolved origin is a
          stronger node — it gives every later borrowing of the idea a direction to point
          in. Leaving it blank is allowed and renders as an outline chip.
        </p>
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="w-full cursor-pointer rounded-md border border-line bg-void/60 px-2.5 py-2 text-sm outline-none focus:border-cites"
        >
          <option value="">Origin unresolved</option>
          {[...data.works]
            .sort((a, b) => a.year - b.year)
            .map((w) => (
              <option key={w.id} value={w.id}>
                {w.title} ({w.year})
              </option>
            ))}
        </select>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md border border-line px-3 py-1.5 font-mono text-[0.6875rem] text-dim uppercase hover:text-paper"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={() => onCreate(origin || null)}
            className="cursor-pointer rounded-md px-4 py-1.5 text-sm font-semibold text-void"
            style={{ background: "var(--color-concept)" }}
          >
            Create concept
          </button>
        </div>
      </div>
    </div>
  );
}
