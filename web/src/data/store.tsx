"use client";

/**
 * In-memory library state for the prototype. Nothing is persisted and nothing
 * is fetched — the point is that edits (dismissing an edge, adding a book,
 * saving a note) propagate through every screen the way they will once there is
 * an API behind them, so the interactions can be judged for real.
 *
 * Mutations are named after the operations spec §1/§4 describes, so the
 * replacement is one-for-one: `addToLibrary` creates a Copy against an existing
 * Work.id and rewrites no edges; `dismissEdge` flips a flag and keeps the row.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fixtures } from "./fixtures";
import type { Highlight, LibraryData, Note } from "./types";
import { extractConceptLinks } from "@/lib/concepts";

export { extractConceptLinks };

/**
 * Why the user last moved between two nodes. Set only when a modeled
 * relationship was followed (spec §8) — the screens use it to justify motion,
 * and a state change like re-sorting never sets it.
 */
export interface Traversal {
  /** Monotonic, so the same destination twice still re-triggers. */
  seq: number;
  via: "edge" | "concept-origin" | "concept-link" | "graph-node" | "author";
  label: string;
}

interface StoreValue {
  data: LibraryData;
  traversal: Traversal | null;
  noteTraversal: (via: Traversal["via"], label: string) => void;
  dismissEdge: (edgeId: string) => void;
  restoreEdge: (edgeId: string) => void;
  addToLibrary: (workId: string) => string | null;
  addNewBook: (input: { title: string; author: string; year: number; pages: number }) => string;
  /** SUP-14 — confirms a sync-discovered file as a new book: creates the Work
   *  and its Copy (at the file's real path) and drops the file from the queue. */
  resolveDiscovered: (
    fileId: string,
    input: { title: string; author: string; year: number; pages: number },
  ) => string | null;
  /** "Not a book" — drops the file from the queue without creating anything. */
  dismissDiscovered: (fileId: string) => void;
  saveNote: (input: {
    noteId?: string;
    copyId: string;
    title: string;
    body: string;
    pageRef: number | null;
    tagIds: string[];
    /** Omit to leave an existing note's link untouched; pass null to clear it. */
    highlightId?: string | null;
  }) => string;
  deleteNote: (noteId: string) => void;
  /** The reader's quick-highlight action — a Highlight row with no remark and no Note. */
  createHighlight: (copyId: string, page: number, text: string) => string;
  createConcept: (name: string, originatingWorkId: string | null) => string;
  createTag: (name: string) => string;
  setConnection: (patch: Partial<LibraryData["connection"]>) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 32);

const normalize = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Fixtures are frozen at module scope; state starts as a deep copy of them. */
const clone = (d: LibraryData): LibraryData => JSON.parse(JSON.stringify(d)) as LibraryData;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LibraryData>(() => clone(fixtures));
  const [traversal, setTraversal] = useState<Traversal | null>(null);

  const noteTraversal = useCallback((via: Traversal["via"], label: string) => {
    setTraversal((prev) => ({ seq: (prev?.seq ?? 0) + 1, via, label }));
  }, []);

  const dismissEdge = useCallback((edgeId: string) => {
    setData((prev) => ({
      ...prev,
      edges: prev.edges.map((e) =>
        e.id === edgeId
          ? { ...e, dismissed: true, dismissed_at: new Date().toISOString() }
          : e,
      ),
    }));
  }, []);

  const restoreEdge = useCallback((edgeId: string) => {
    setData((prev) => ({
      ...prev,
      edges: prev.edges.map((e) =>
        e.id === edgeId ? { ...e, dismissed: false, dismissed_at: null } : e,
      ),
    }));
  }, []);

  /**
   * §1 — additive. A new Copy row points at the *existing* Work.id; no edge is
   * touched, so the hub keeps every inbound reference it already had and simply
   * stops rendering as an outline.
   */
  const addToLibrary = useCallback((workId: string) => {
    const copyId = `c-added-${slug(workId)}`;
    let created: string | null = null;
    setData((prev) => {
      if (prev.copies.some((c) => c.work_id === workId)) return prev;
      created = copyId;
      return {
        ...prev,
        copies: [
          ...prev.copies,
          {
            id: copyId,
            work_id: workId,
            file_format: "pdf" as const,
            file_path: `${prev.connection.library_folder}/${workId}.pdf`,
            pages: 300,
            added_at: new Date().toISOString(),
            reading_state: "unread" as const,
            last_opened_page: null,
          },
        ],
      };
    });
    return created ?? copyId;
  }, []);

  /** The add-a-book flow: a Work the graph has never seen, plus its Copy. */
  const addNewBook = useCallback(
    ({
      title,
      author,
      year,
      pages,
    }: {
      title: string;
      author: string;
      year: number;
      pages: number;
    }) => {
      const workId = `w-${slug(title)}-${Date.now().toString(36).slice(-4)}`;
      setData((prev) => {
        const existingAuthor = prev.authors.find(
          (a) => a.name.toLowerCase() === author.trim().toLowerCase(),
        );
        const authorId = existingAuthor?.id ?? `a-${slug(author)}`;
        const authors = existingAuthor
          ? prev.authors
          : [
              ...prev.authors,
              { id: authorId, name: author.trim(), aliases: [], openlibrary_author_id: null },
            ];
        return {
          ...prev,
          authors,
          works: [
            ...prev.works,
            {
              id: workId,
              title: title.trim(),
              normalized_title: normalize(title),
              author_ids: [authorId],
              year,
              kind: "book" as const,
              openlibrary_work_id: null,
              isbn13: null,
              // §6 step 5 — added by hand, nothing resolved against OpenLibrary yet.
              unresolved: true,
              cover: { hue: Math.abs(hash(title)) % 360, glyph: initials(title) },
            },
          ],
          copies: [
            ...prev.copies,
            {
              id: `c-${slug(title)}`,
              work_id: workId,
              file_format: "pdf" as const,
              file_path: `${prev.connection.library_folder}/${title.trim()}.pdf`,
              pages,
              added_at: new Date().toISOString(),
              reading_state: "unread" as const,
              last_opened_page: null,
            },
          ],
        };
      });
      return workId;
    },
    [],
  );

  /** SUP-14 — same shape as addNewBook, but the Copy's file_path is the file's
   *  real location rather than a fabricated one, and the source file leaves the queue. */
  const resolveDiscovered = useCallback(
    (
      fileId: string,
      { title, author, year, pages }: { title: string; author: string; year: number; pages: number },
    ) => {
      const workId = `w-${slug(title)}-${Date.now().toString(36).slice(-4)}`;
      let created: string | null = null;
      setData((prev) => {
        const file = prev.discovered.find((f) => f.id === fileId);
        if (!file) return prev;
        created = workId;

        const trimmedAuthor = author.trim();
        const existingAuthor = trimmedAuthor
          ? prev.authors.find((a) => a.name.toLowerCase() === trimmedAuthor.toLowerCase())
          : undefined;
        const authorId = existingAuthor?.id ?? (trimmedAuthor ? `a-${slug(trimmedAuthor)}` : null);
        const authors =
          existingAuthor || !trimmedAuthor
            ? prev.authors
            : [
                ...prev.authors,
                { id: authorId!, name: trimmedAuthor, aliases: [], openlibrary_author_id: null },
              ];

        return {
          ...prev,
          authors,
          works: [
            ...prev.works,
            {
              id: workId,
              title: title.trim(),
              normalized_title: normalize(title),
              author_ids: authorId ? [authorId] : [],
              year,
              kind: "book" as const,
              openlibrary_work_id: null,
              isbn13: null,
              unresolved: true,
              cover: { hue: Math.abs(hash(title)) % 360, glyph: initials(title) },
            },
          ],
          copies: [
            ...prev.copies,
            {
              id: `c-${slug(title)}`,
              work_id: workId,
              file_format: "pdf" as const,
              file_path: file.file_path,
              pages,
              added_at: new Date().toISOString(),
              reading_state: "unread" as const,
              last_opened_page: null,
            },
          ],
          discovered: prev.discovered.filter((f) => f.id !== fileId),
        };
      });
      return created;
    },
    [],
  );

  const dismissDiscovered = useCallback((fileId: string) => {
    setData((prev) => ({
      ...prev,
      discovered: prev.discovered.filter((f) => f.id !== fileId),
    }));
  }, []);

  /**
   * Saves a note and re-derives its NoteConcept rows from the `[[…]]` links in
   * the body, so the concepts browser and the graph's idea layer stay in step
   * with what was actually written.
   */
  const saveNote = useCallback(
    ({
      noteId,
      copyId,
      title,
      body,
      pageRef,
      tagIds,
      highlightId,
    }: {
      noteId?: string;
      copyId: string;
      title: string;
      body: string;
      pageRef: number | null;
      tagIds: string[];
      highlightId?: string | null;
    }) => {
      const id = noteId ?? `n-${Date.now().toString(36)}`;
      const now = new Date().toISOString();
      setData((prev) => {
        const linked = extractConceptLinks(body);
        const conceptIds = linked
          .map((name) => prev.concepts.find((c) => c.name.toLowerCase() === name.toLowerCase()))
          .filter((c): c is LibraryData["concepts"][number] => Boolean(c))
          .map((c) => c.id);

        const existing = prev.notes.find((n) => n.id === id);
        const next: Note = {
          id,
          copy_id: copyId,
          title: title.trim() || "Untitled note",
          body,
          page_ref: pageRef,
          highlight_id: highlightId !== undefined ? highlightId : (existing?.highlight_id ?? null),
          created_at: existing?.created_at ?? now,
          updated_at: now,
          tag_ids: tagIds,
          concept_ids: conceptIds,
        };
        return {
          ...prev,
          notes: existing
            ? prev.notes.map((n) => (n.id === id ? next : n))
            : [next, ...prev.notes],
        };
      });
      return id;
    },
    [],
  );

  const deleteNote = useCallback((noteId: string) => {
    setData((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== noteId) }));
  }, []);

  /**
   * The reader's one-click action on a text selection. Returns the new id
   * directly (computed before the setData call) rather than reading it back
   * out of the updater closure — see createConcept/createTag below, whose
   * ids are similarly deterministic. A version that instead stashed the
   * created row in a `let` inside the updater and returned that would only
   * be reliable for the first setData call in a batch; the reader calls this
   * and then saveNote in the same handler, so that pattern would silently
   * return undefined on the second call.
   */
  const createHighlight = useCallback((copyId: string, page: number, text: string) => {
    const id = `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const highlight: Highlight = { id, copy_id: copyId, page, text, remark: null };
    setData((prev) => ({ ...prev, highlights: [...prev.highlights, highlight] }));
    return id;
  }, []);

  const createConcept = useCallback((name: string, originatingWorkId: string | null) => {
    const id = `k-${slug(name)}`;
    setData((prev) =>
      prev.concepts.some((c) => c.id === id)
        ? prev
        : {
            ...prev,
            concepts: [
              ...prev.concepts,
              {
                id,
                name: name.trim(),
                originating_work_id: originatingWorkId,
                description: "",
              },
            ],
          },
    );
    return id;
  }, []);

  const createTag = useCallback((name: string) => {
    const clean = slug(name);
    const id = `t-${clean}`;
    setData((prev) =>
      prev.tags.some((t) => t.id === id)
        ? prev
        : { ...prev, tags: [...prev.tags, { id, name: clean }] },
    );
    return id;
  }, []);

  const setConnection = useCallback((patch: Partial<LibraryData["connection"]>) => {
    setData((prev) => ({ ...prev, connection: { ...prev.connection, ...patch } }));
  }, []);

  const reset = useCallback(() => {
    setData(clone(fixtures));
    setTraversal(null);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      traversal,
      noteTraversal,
      dismissEdge,
      restoreEdge,
      addToLibrary,
      addNewBook,
      resolveDiscovered,
      dismissDiscovered,
      saveNote,
      deleteNote,
      createHighlight,
      createConcept,
      createTag,
      setConnection,
      reset,
    }),
    [
      data,
      traversal,
      noteTraversal,
      dismissEdge,
      restoreEdge,
      addToLibrary,
      addNewBook,
      resolveDiscovered,
      dismissDiscovered,
      saveNote,
      deleteNote,
      createHighlight,
      createConcept,
      createTag,
      setConnection,
      reset,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

export function useLibrary(): LibraryData {
  return useStore().data;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

function initials(title: string): string {
  return title
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
