"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLibrary } from "@/lib/store";
import { getWorkForCopy } from "@/lib/selectors";
import { extractConceptTokens, findOpenConceptQuery, renderNoteBody } from "@/lib/markdown";
import { TagPicker } from "@/components/TagPicker";

export function NoteEditorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const copyId = searchParams.get("copyId") ?? "";
  const noteIdParam = searchParams.get("noteId") ?? "new";
  const { library, addNote, updateNote, addTag } = useLibrary();

  const work = getWorkForCopy(library, copyId);
  const isNew = noteIdParam === "new";
  const existing = isNew ? undefined : library.notes.find((n) => n.id === noteIdParam && n.copyId === copyId);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [tagIds, setTagIds] = useState<string[]>(existing?.tagIds ?? []);
  const [conceptQuery, setConceptQuery] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const conceptSuggestions = useMemo(() => {
    if (conceptQuery === null) return [];
    const q = conceptQuery.toLowerCase();
    return library.concepts.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 6);
  }, [conceptQuery, library.concepts]);

  if (!work || (!isNew && !existing)) {
    return (
      <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-ink-muted">
        Note not found. <Link href="/" className="text-accent-ink hover:underline">Back to library</Link>
      </div>
    );
  }

  const backHref = `/books?id=${work.id}`;

  function checkConceptQuery() {
    const el = textareaRef.current;
    if (!el) return;
    setConceptQuery(findOpenConceptQuery(el.value, el.selectionStart ?? el.value.length));
  }

  function insertConcept(label: string) {
    const el = textareaRef.current;
    if (!el) return;
    const cursor = el.selectionStart ?? body.length;
    const upTo = body.slice(0, cursor);
    const openIndex = upTo.lastIndexOf("[[");
    const before = body.slice(0, openIndex);
    const after = body.slice(cursor);
    const next = `${before}[[${label}]]${after}`;
    setBody(next);
    setConceptQuery(null);
    requestAnimationFrame(() => {
      const pos = before.length + label.length + 4;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  }

  function resolveConceptIds(text: string): string[] {
    const tokens = extractConceptTokens(text).map((t) => t.toLowerCase());
    const ids = library.concepts.filter((c) => tokens.includes(c.label.toLowerCase())).map((c) => c.id);
    return Array.from(new Set(ids));
  }

  function handleSave() {
    if (!title.trim()) return;
    const conceptIds = resolveConceptIds(body);
    if (isNew) {
      const note = addNote({ copyId, title: title.trim(), body, tagIds, conceptIds, highlightId: undefined });
      router.push(`${backHref}#note-${note.id}`);
    } else if (existing) {
      updateNote(existing.id, { title: title.trim(), body, tagIds, conceptIds });
      router.push(`${backHref}#note-${existing.id}`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={backHref} className="text-xs font-medium text-ink-muted hover:text-ink">
            ← {work.title}
          </Link>
          <h1 className="text-lg font-semibold text-ink">{isNew ? "New note" : "Edit note"}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={backHref}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-muted hover:text-ink"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-ink"
          >
            Save
          </button>
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="rounded-md border border-line bg-paper-raised px-3 py-2 text-base font-medium outline-none focus:border-accent"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">
            Markdown — type <code>[[</code> to link a concept
          </p>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              checkConceptQuery();
            }}
            onKeyUp={checkConceptQuery}
            onClick={checkConceptQuery}
            rows={14}
            className="w-full resize-none rounded-md border border-line bg-paper-raised px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          />
          {conceptQuery !== null && conceptSuggestions.length > 0 && (
            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-md border border-line bg-paper-raised shadow-lg">
              {conceptSuggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => insertConcept(c.label)}
                  className="block w-full px-3 py-1.5 text-left text-sm hover:bg-paper-sunken"
                >
                  <span className="font-medium text-ink">{c.label}</span>
                  <span className="ml-2 text-xs text-ink-faint">{c.summary}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">Preview</p>
          <div className="min-h-[21rem] rounded-md border border-line bg-paper-sunken px-4 py-3">
            {body.trim() ? renderNoteBody(body, library.concepts) : (
              <p className="text-sm text-ink-faint">Nothing written yet.</p>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-faint">Tags</p>
        <TagPicker allTags={library.tags} selectedIds={tagIds} onChange={setTagIds} onCreate={addTag} />
      </div>
    </div>
  );
}
