import type { Library } from "@/lib/types";
import { getAuthorNames, getWorkForCopy } from "@/lib/selectors";

export type SearchResult =
  | { kind: "book"; id: string; title: string; subtitle: string; href: string }
  | { kind: "note"; id: string; title: string; subtitle: string; href: string; snippet: string }
  | { kind: "concept"; id: string; title: string; subtitle: string; href: string }
  | { kind: "author"; id: string; title: string; subtitle: string; href: string };

export function search(library: Library, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const work of library.works) {
    if (!work.copyId) continue;
    const authorNames = getAuthorNames(library, work).join(", ");
    if (work.title.toLowerCase().includes(q) || authorNames.toLowerCase().includes(q)) {
      results.push({
        kind: "book",
        id: work.id,
        title: work.title,
        subtitle: authorNames,
        href: `/books?id=${work.id}`,
      });
    }
  }

  for (const note of library.notes) {
    const haystack = `${note.title} ${note.body}`.toLowerCase();
    if (haystack.includes(q)) {
      const work = getWorkForCopy(library, note.copyId);
      const idx = haystack.indexOf(q);
      const snippet = note.body.slice(Math.max(0, idx - 40), idx + 80);
      results.push({
        kind: "note",
        id: note.id,
        title: note.title,
        subtitle: work?.title ?? "",
        href: work ? `/books?id=${work.id}#note-${note.id}` : "#",
        snippet: (idx > 40 ? "…" : "") + snippet.trim() + "…",
      });
    }
  }

  for (const concept of library.concepts) {
    if (concept.label.toLowerCase().includes(q) || concept.summary.toLowerCase().includes(q)) {
      results.push({
        kind: "concept",
        id: concept.id,
        title: concept.label,
        subtitle: concept.summary,
        href: `/concepts?id=${concept.id}`,
      });
    }
  }

  for (const author of library.authors) {
    if (author.name.toLowerCase().includes(q)) {
      const works = library.works.filter((w) => w.authorIds.includes(author.id));
      results.push({
        kind: "author",
        id: author.id,
        title: author.name,
        subtitle: `${works.length} work${works.length === 1 ? "" : "s"} in the graph`,
        href: `/search?q=${encodeURIComponent(author.name)}`,
      });
    }
  }

  return results;
}
