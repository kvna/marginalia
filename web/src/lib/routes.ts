/**
 * Every link in the app goes through here.
 *
 * Entity screens take their subject from a query parameter rather than a path
 * segment. On a static host the set of paths is fixed at build time, and the
 * prototype creates Works at runtime (add-a-book) — a `/books/[workId]` route
 * would 404 on exactly the book the user just added. One `/books/` page that
 * reads `?w=` has no such hole.
 *
 * When there is a server behind this, these become path routes and only this
 * file changes.
 */

export const routes = {
  library: "/",
  book: (workId: string) => `/books/?w=${encodeURIComponent(workId)}`,
  editor: (workId: string, noteId?: string) =>
    `/editor/?w=${encodeURIComponent(workId)}${noteId ? `&n=${encodeURIComponent(noteId)}` : ""}`,
  concepts: "/concepts/",
  concept: (conceptId: string) => `/concepts/?concept=${encodeURIComponent(conceptId)}`,
  tags: "/concepts/?tab=tags",
  tag: (tagId: string) => `/concepts/?tab=tags&tag=${encodeURIComponent(tagId)}`,
  graph: "/graph/",
  graphFocus: (nodeId: string) => `/graph/?focus=${encodeURIComponent(nodeId)}`,
  search: (q?: string) => (q ? `/search/?q=${encodeURIComponent(q)}` : "/search/"),
  settings: "/settings/",
} as const;
