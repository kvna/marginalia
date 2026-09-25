"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Copy, Edge, EdgeType, Library, Note, Tag, Work } from "@/lib/types";
import { EDGE_TYPE_META } from "@/lib/types";
import { initialLibrary } from "@/lib/fixtures";

const STORAGE_KEY = "marginalia:library:v1";

/**
 * The whole app reads and writes through this hook. Today it's backed by
 * fixtures plus localStorage. When a real backend exists, the actions below
 * become API calls and this file is the only one that has to change —
 * every screen already depends on the hook, not on the data source.
 */
interface LibraryContextValue {
  library: Library;
  enabledEdgeTypes: Set<EdgeType>;
  toggleEdgeType: (type: EdgeType) => void;
  addCopy: (input: {
    title: string;
    authorName: string;
    year: number;
    tagIds: string[];
    fileName: string;
  }) => Work;
  /** Promotes an existing unowned Work to owned by attaching a Copy, keeping its id (and edges) intact. */
  promoteToLibrary: (workId: string, input: { tagIds: string[]; fileName: string }) => Copy;
  addNote: (input: Omit<Note, "id" | "createdAt" | "updatedAt">) => Note;
  updateNote: (id: string, patch: Partial<Omit<Note, "id" | "copyId">>) => void;
  dismissEdge: (id: string) => void;
  restoreEdge: (id: string) => void;
  addTag: (label: string) => Tag;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function loadStoredLibrary(): Library {
  if (typeof window === "undefined") return initialLibrary;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialLibrary;
    const parsed = JSON.parse(raw) as Library;
    if (!parsed.works || !parsed.edges) return initialLibrary;
    return parsed;
  } catch {
    return initialLibrary;
  }
}

function defaultEnabledEdgeTypes(): Set<EdgeType> {
  return new Set(
    (Object.keys(EDGE_TYPE_META) as EdgeType[]).filter((t) => EDGE_TYPE_META[t].defaultOn),
  );
}

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Library>(initialLibrary);
  const [hydrated, setHydrated] = useState(false);
  const [enabledEdgeTypes, setEnabledEdgeTypes] = useState<Set<EdgeType>>(defaultEnabledEdgeTypes);

  useEffect(() => {
    setLibrary(loadStoredLibrary());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }, [library, hydrated]);

  const toggleEdgeType = useCallback((type: EdgeType) => {
    setEnabledEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const addTag = useCallback((label: string): Tag => {
    let created: Tag | undefined;
    setLibrary((prev) => {
      const existing = prev.tags.find((t) => t.label.toLowerCase() === label.toLowerCase());
      if (existing) {
        created = existing;
        return prev;
      }
      const tag: Tag = { id: nextId("t"), label };
      created = tag;
      return { ...prev, tags: [...prev.tags, tag] };
    });
    return created!;
  }, []);

  const addCopy = useCallback(
    (input: { title: string; authorName: string; year: number; tagIds: string[]; fileName: string }) => {
      let createdWork!: Work;
      setLibrary((prev) => {
        let author = prev.authors.find(
          (a) => a.name.toLowerCase() === input.authorName.toLowerCase(),
        );
        const authors = author ? prev.authors : [...prev.authors, (author = { id: nextId("a"), name: input.authorName })];

        const work: Work = {
          id: nextId("w"),
          title: input.title,
          authorIds: [author.id],
          year: input.year,
          copyId: undefined,
        };
        const copy: Copy = {
          id: nextId("c"),
          workId: work.id,
          coverColor: PALETTE[prev.copies.length % PALETTE.length],
          addedAt: new Date().toISOString().slice(0, 10),
          fileName: input.fileName || `${slugify(input.title)}.pdf`,
          tagIds: input.tagIds,
          location: "onedrive",
        };
        work.copyId = copy.id;
        createdWork = work;

        return {
          ...prev,
          authors,
          works: [...prev.works, work],
          copies: [...prev.copies, copy],
        };
      });
      return createdWork;
    },
    [],
  );

  const promoteToLibrary = useCallback(
    (workId: string, input: { tagIds: string[]; fileName: string }) => {
      let createdCopy!: Copy;
      setLibrary((prev) => {
        const work = prev.works.find((w) => w.id === workId);
        if (!work || work.copyId) {
          createdCopy = prev.copies.find((c) => c.id === work?.copyId)!;
          return prev;
        }
        const copy: Copy = {
          id: nextId("c"),
          workId,
          coverColor: PALETTE[prev.copies.length % PALETTE.length],
          addedAt: new Date().toISOString().slice(0, 10),
          fileName: input.fileName || `${slugify(work.title)}.pdf`,
          tagIds: input.tagIds,
          location: "onedrive",
        };
        createdCopy = copy;
        return {
          ...prev,
          works: prev.works.map((w) => (w.id === workId ? { ...w, copyId: copy.id } : w)),
          copies: [...prev.copies, copy],
        };
      });
      return createdCopy;
    },
    [],
  );

  const addNote = useCallback((input: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const note: Note = { ...input, id: nextId("n"), createdAt: now, updatedAt: now };
    setLibrary((prev) => ({ ...prev, notes: [...prev.notes, note] }));
    return note;
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<Omit<Note, "id" | "copyId">>) => {
    setLibrary((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n,
      ),
    }));
  }, []);

  const dismissEdge = useCallback((id: string) => {
    setLibrary((prev) => ({
      ...prev,
      edges: prev.edges.map((e: Edge) => (e.id === id ? { ...e, dismissed: true } : e)),
    }));
  }, []);

  const restoreEdge = useCallback((id: string) => {
    setLibrary((prev) => ({
      ...prev,
      edges: prev.edges.map((e: Edge) => (e.id === id ? { ...e, dismissed: false } : e)),
    }));
  }, []);

  const value = useMemo<LibraryContextValue>(
    () => ({
      library,
      enabledEdgeTypes,
      toggleEdgeType,
      addCopy,
      promoteToLibrary,
      addNote,
      updateNote,
      dismissEdge,
      restoreEdge,
      addTag,
    }),
    [
      library,
      enabledEdgeTypes,
      toggleEdgeType,
      addCopy,
      promoteToLibrary,
      addNote,
      updateNote,
      dismissEdge,
      restoreEdge,
      addTag,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}

const PALETTE = ["#c1440e", "#2f6fed", "#189a6c", "#c98a1c", "#9b3fd1", "#1c1a17", "#6b655c"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
