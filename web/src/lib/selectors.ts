import type { Edge, EdgeType, Library, Work } from "@/lib/types";

export function getWork(library: Library, workId: string): Work | undefined {
  return library.works.find((w) => w.id === workId);
}

export function getCopy(library: Library, copyId: string) {
  return library.copies.find((c) => c.id === copyId);
}

export function getWorkForCopy(library: Library, copyId: string): Work | undefined {
  const copy = getCopy(library, copyId);
  if (!copy) return undefined;
  return getWork(library, copy.workId);
}

export function getAuthorNames(library: Library, work: Work): string[] {
  return work.authorIds.map((id) => library.authors.find((a) => a.id === id)?.name ?? "Unknown");
}

export function isOwned(work: Work): boolean {
  return Boolean(work.copyId);
}

/** Edges pointing away from a work — "this work references these others." */
export function referencesOut(library: Library, workId: string, includeDismissed = false): Edge[] {
  return library.edges.filter(
    (e) => e.fromWorkId === workId && (includeDismissed || !e.dismissed),
  );
}

/** Edges pointing at a work — "these other works reference this one." */
export function referencedBy(library: Library, workId: string, includeDismissed = false): Edge[] {
  return library.edges.filter(
    (e) => e.toWorkId === workId && (includeDismissed || !e.dismissed),
  );
}

/** cites -> bibliography; everything else is a body-text mention of some kind. */
export function isBibliographyEdge(type: EdgeType): boolean {
  return type === "cites";
}

export function inboundCount(library: Library, workId: string, enabledTypes?: Set<EdgeType>): number {
  return referencedBy(library, workId).filter((e) => !enabledTypes || enabledTypes.has(e.type)).length;
}

export function conceptsForCopy(library: Library, copyId: string) {
  const noteIds = library.notes.filter((n) => n.copyId === copyId);
  const conceptIds = new Set(noteIds.flatMap((n) => n.conceptIds));
  return library.concepts.filter((c) => conceptIds.has(c.id));
}

export function tagsForIds(library: Library, tagIds: string[]) {
  return tagIds.map((id) => library.tags.find((t) => t.id === id)).filter((t): t is NonNullable<typeof t> => Boolean(t));
}

export function worksTouchingConcept(library: Library, conceptId: string): Work[] {
  const copyIds = new Set(
    library.notes.filter((n) => n.conceptIds.includes(conceptId)).map((n) => n.copyId),
  );
  return library.works.filter((w) => w.copyId && copyIds.has(w.copyId));
}

export function tagUsageCount(library: Library, tagId: string): number {
  const copyCount = library.copies.filter((c) => c.tagIds.includes(tagId)).length;
  const noteCount = library.notes.filter((n) => n.tagIds.includes(tagId)).length;
  return copyCount + noteCount;
}
