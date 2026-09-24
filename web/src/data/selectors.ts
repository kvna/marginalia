/**
 * The query layer. Everything a screen needs is derived here, not stored, and
 * every function takes `LibraryData` as its first argument — so when a real API
 * arrives these become server queries with the same signatures and the
 * components above them do not change shape.
 */

import type {
  Author,
  Concept,
  Confidence,
  Copy,
  Edge,
  EdgeType,
  Highlight,
  LibraryData,
  Note,
  Tag,
  Work,
} from "./types";
import { routes } from "@/lib/routes";

export const HIGH_CONFIDENCE_TYPES: EdgeType[] = ["cites", "mentions"];

export const EDGE_TYPE_LABEL: Record<EdgeType, string> = {
  cites: "Cites",
  mentions: "Mentions",
  attributes_to_author: "Attributes to author",
  uses_idea: "Uses idea",
};

export const EDGE_TYPE_BLURB: Record<EdgeType, string> = {
  cites: "An entry in the bibliography.",
  mentions: "The title appears in the body text.",
  attributes_to_author: "Names the author, with no citation.",
  uses_idea: "Uses the idea without naming anyone.",
};

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/* ------------------------------------------------------------------ lookups */

export function workById(d: LibraryData, id: string): Work | undefined {
  return d.works.find((w) => w.id === id);
}

export function copyForWork(d: LibraryData, workId: string): Copy | undefined {
  return d.copies.find((c) => c.work_id === workId);
}

export function workForCopy(d: LibraryData, copyId: string): Work | undefined {
  const copy = d.copies.find((c) => c.id === copyId);
  return copy ? workById(d, copy.work_id) : undefined;
}

export function authorsForWork(d: LibraryData, work: Work): Author[] {
  return work.author_ids
    .map((id) => d.authors.find((a) => a.id === id))
    .filter((a): a is Author => Boolean(a));
}

export function authorLine(d: LibraryData, work: Work): string {
  const names = authorsForWork(d, work).map((a) => a.name);
  if (names.length === 0) return "Unknown author";
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

export function conceptById(d: LibraryData, id: string): Concept | undefined {
  return d.concepts.find((c) => c.id === id);
}

export function conceptByName(d: LibraryData, name: string): Concept | undefined {
  const target = name.trim().toLowerCase();
  return d.concepts.find((c) => c.name.toLowerCase() === target);
}

export function authorById(d: LibraryData, id: string): Author | undefined {
  return d.authors.find((a) => a.id === id);
}

export function tagById(d: LibraryData, id: string): Tag | undefined {
  return d.tags.find((t) => t.id === id);
}

export function isOwned(d: LibraryData, workId: string): boolean {
  return d.copies.some((c) => c.work_id === workId);
}

export function notesForCopy(d: LibraryData, copyId: string): Note[] {
  return d.notes
    .filter((n) => n.copy_id === copyId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function highlightsForCopy(d: LibraryData, copyId: string): Highlight[] {
  return d.highlights.filter((h) => h.copy_id === copyId).sort((a, b) => a.page - b.page);
}

/** Library tag chips: the union of tags across a Copy's notes (spec §7). */
export function tagsForCopy(d: LibraryData, copyId: string): Tag[] {
  const ids = new Set(notesForCopy(d, copyId).flatMap((n) => n.tag_ids));
  return d.tags.filter((t) => ids.has(t.id));
}

/** Concepts touched by a Copy's notes, via the NoteConcept join. */
export function conceptsForCopy(d: LibraryData, copyId: string): Concept[] {
  const ids = new Set(notesForCopy(d, copyId).flatMap((n) => n.concept_ids));
  return d.concepts.filter((c) => ids.has(c.id));
}

/* -------------------------------------------------------------------- edges */

const live = (e: Edge) => !e.dismissed;

/**
 * §5 — `inbound_reference_count`. Derived rather than stored at this scale so
 * it cannot drift from the edge list. Counts non-dismissed cites + mentions
 * only: the softer two layers never inflate hub size.
 */
export function inboundReferenceCount(d: LibraryData, workId: string): number {
  return d.edges.filter(
    (e) =>
      live(e) &&
      e.target_work_id === workId &&
      HIGH_CONFIDENCE_TYPES.includes(e.edge_type),
  ).length;
}

export interface ResolvedEdge {
  edge: Edge;
  sourceCopy: Copy;
  sourceWork: Work;
  targetWork?: Work;
  targetAuthor?: Author;
  targetConcept?: Concept;
  /** Display label for whatever this edge points at. */
  targetLabel: string;
}

function resolve(d: LibraryData, edge: Edge): ResolvedEdge | null {
  const sourceCopy = d.copies.find((c) => c.id === edge.source_copy_id);
  if (!sourceCopy) return null;
  const sourceWork = workById(d, sourceCopy.work_id);
  if (!sourceWork) return null;

  const targetWork = edge.target_work_id ? workById(d, edge.target_work_id) : undefined;
  const targetAuthor = edge.target_author_id
    ? authorById(d, edge.target_author_id)
    : undefined;
  const targetConcept = edge.target_concept_id
    ? conceptById(d, edge.target_concept_id)
    : undefined;

  return {
    edge,
    sourceCopy,
    sourceWork,
    targetWork,
    targetAuthor,
    targetConcept,
    targetLabel: targetWork?.title ?? targetAuthor?.name ?? targetConcept?.name ?? "Unknown",
  };
}

const CONFIDENCE_ORDER: Record<Confidence, number> = { high: 0, medium: 1, low: 2 };

/** Book detail — *References out*. Includes dismissed rows when asked, for undo. */
export function outboundEdges(
  d: LibraryData,
  copyId: string,
  opts: { includeDismissed?: boolean } = {},
): ResolvedEdge[] {
  return d.edges
    .filter((e) => e.source_copy_id === copyId && (opts.includeDismissed || live(e)))
    .map((e) => resolve(d, e))
    .filter((r): r is ResolvedEdge => r !== null)
    .sort(
      (a, b) =>
        CONFIDENCE_ORDER[a.edge.confidence] - CONFIDENCE_ORDER[b.edge.confidence] ||
        a.targetLabel.localeCompare(b.targetLabel),
    );
}

/** Book detail — *Referenced by*, the §5 query. Always available, owned or not. */
export function inboundEdges(
  d: LibraryData,
  workId: string,
  opts: { includeDismissed?: boolean } = {},
): ResolvedEdge[] {
  return d.edges
    .filter((e) => e.target_work_id === workId && (opts.includeDismissed || live(e)))
    .map((e) => resolve(d, e))
    .filter((r): r is ResolvedEdge => r !== null)
    .sort(
      (a, b) =>
        CONFIDENCE_ORDER[a.edge.confidence] - CONFIDENCE_ORDER[b.edge.confidence] ||
        a.sourceWork.title.localeCompare(b.sourceWork.title),
    );
}

/** Every book that attributes an idea to this author, without citing a title. */
export function attributionEdgesForAuthor(d: LibraryData, authorId: string): ResolvedEdge[] {
  return d.edges
    .filter((e) => live(e) && e.target_author_id === authorId)
    .map((e) => resolve(d, e))
    .filter((r): r is ResolvedEdge => r !== null);
}

export function ideaEdgesForConcept(d: LibraryData, conceptId: string): ResolvedEdge[] {
  return d.edges
    .filter((e) => live(e) && e.target_concept_id === conceptId)
    .map((e) => resolve(d, e))
    .filter((r): r is ResolvedEdge => r !== null);
}

/* ----------------------------------------------------------------- concepts */

/**
 * §8 — the emphasis signal for a Concept, derived at read time: NoteConcept
 * rows plus non-dismissed `uses_idea` edges. Size keys off this; shape keys off
 * whether `originating_work_id` resolved.
 */
export function conceptWeight(
  d: LibraryData,
  conceptId: string,
): { noteCount: number; ideaEdgeCount: number; total: number } {
  const noteCount = d.notes.filter((n) => n.concept_ids.includes(conceptId)).length;
  const ideaEdgeCount = ideaEdgesForConcept(d, conceptId).length;
  return { noteCount, ideaEdgeCount, total: noteCount + ideaEdgeCount };
}

/** Copies whose notes reference a concept — the concepts browser's jump-through. */
export function copiesTouchingConcept(d: LibraryData, conceptId: string): Copy[] {
  const copyIds = new Set(
    d.notes.filter((n) => n.concept_ids.includes(conceptId)).map((n) => n.copy_id),
  );
  return d.copies.filter((c) => copyIds.has(c.id));
}

export function notesForTag(d: LibraryData, tagId: string): Note[] {
  return d.notes.filter((n) => n.tag_ids.includes(tagId));
}

/* -------------------------------------------------------------------- graph */

export interface GraphNode {
  id: string;
  kind: "work" | "author" | "concept";
  label: string;
  sublabel: string;
  /** Works: owned vs. outline. Concepts: origin resolved vs. not. */
  solid: boolean;
  weight: number;
  hue: number;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  edge: Edge;
}

export type LayerState = Record<EdgeType, boolean>;

export const DEFAULT_LAYERS: LayerState = {
  cites: true,
  mentions: true,
  // §4 — medium confidence, on by default, visually distinguishable.
  attributes_to_author: true,
  // §4 — the judgement-call layer. Off until the user asks for it.
  uses_idea: false,
};

/**
 * Builds the graph for the active layers. Nodes are only included if a visible
 * edge touches them, so toggling a layer off genuinely shrinks the graph rather
 * than leaving orphans floating.
 */
export function buildGraph(
  d: LibraryData,
  layers: LayerState,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const visible = d.edges.filter((e) => live(e) && layers[e.edge_type]);

  const nodeIds = new Set<string>();
  const links: GraphLink[] = [];

  for (const edge of visible) {
    const copy = d.copies.find((c) => c.id === edge.source_copy_id);
    if (!copy) continue;
    const sourceId = `work:${copy.work_id}`;
    const targetId = edge.target_work_id
      ? `work:${edge.target_work_id}`
      : edge.target_author_id
        ? `author:${edge.target_author_id}`
        : edge.target_concept_id
          ? `concept:${edge.target_concept_id}`
          : null;
    if (!targetId) continue;
    nodeIds.add(sourceId);
    nodeIds.add(targetId);
    links.push({ id: edge.id, source: sourceId, target: targetId, edge });
  }

  const nodes: GraphNode[] = [];
  for (const id of nodeIds) {
    const [kind, rawId] = [id.slice(0, id.indexOf(":")), id.slice(id.indexOf(":") + 1)];
    if (kind === "work") {
      const work = workById(d, rawId);
      if (!work) continue;
      nodes.push({
        id,
        kind: "work",
        label: work.title,
        sublabel: `${authorLine(d, work)} · ${work.year}`,
        solid: isOwned(d, work.id),
        weight: inboundReferenceCount(d, work.id),
        hue: work.cover.hue,
      });
    } else if (kind === "author") {
      const author = authorById(d, rawId);
      if (!author) continue;
      nodes.push({
        id,
        kind: "author",
        label: author.name,
        sublabel: "Author",
        solid: true,
        weight: attributionEdgesForAuthor(d, author.id).length,
        hue: 268,
      });
    } else {
      const concept = conceptById(d, rawId);
      if (!concept) continue;
      nodes.push({
        id,
        kind: "concept",
        label: concept.name,
        sublabel: "Concept",
        solid: concept.originating_work_id !== null,
        weight: conceptWeight(d, concept.id).total,
        hue: 330,
      });
    }
  }

  return { nodes, links };
}

/* ------------------------------------------------------------------- search */

export type SearchHitKind = "work" | "note" | "concept" | "author" | "tag";

export interface SearchHit {
  kind: SearchHitKind;
  id: string;
  title: string;
  /** Where this hit lives — a Note shows its book, a Work shows owned state. */
  context: string;
  snippet: string;
  href: string;
}

function snippetAround(body: string, needle: string): string {
  const i = body.toLowerCase().indexOf(needle.toLowerCase());
  if (i === -1) return body.slice(0, 140);
  const start = Math.max(0, i - 60);
  return `${start > 0 ? "…" : ""}${body.slice(start, i + needle.length + 80).replace(/\n+/g, " ")}…`;
}

/** §7 Search — one query across every entity. Read-only. */
export function search(d: LibraryData, raw: string): SearchHit[] {
  const q = raw.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  for (const work of d.works) {
    const owned = isOwned(d, work.id);
    const titleHit = `${work.title} ${work.subtitle ?? ""}`.toLowerCase().includes(q);
    // An author's name matching is a work hit too. Typing "Kahneman" and getting
    // only the Author row would be technically correct and useless — the books
    // are what the user is reaching for.
    const authorHit = authorsForWork(d, work).some(
      (a) =>
        a.name.toLowerCase().includes(q) || a.aliases.some((x) => x.toLowerCase().includes(q)),
    );
    if (titleHit || authorHit) {
      hits.push({
        kind: "work",
        id: work.id,
        title: work.title,
        context: owned ? "In your library" : "Not in library",
        snippet: `${authorLine(d, work)} · ${work.year} · ${inboundReferenceCount(d, work.id)} inbound references`,
        href: routes.book(work.id),
      });
    }
  }

  for (const author of d.authors) {
    if (author.name.toLowerCase().includes(q) || author.aliases.some((a) => a.toLowerCase().includes(q))) {
      const works = d.works.filter((w) => w.author_ids.includes(author.id));
      hits.push({
        kind: "author",
        id: author.id,
        title: author.name,
        context: "Author",
        snippet: works.length
          ? `${works.length} work${works.length === 1 ? "" : "s"} in the graph: ${works.map((w) => w.title).join(", ")}`
          : "No works in the graph yet",
        href: routes.graphFocus(`author:${author.id}`),
      });
    }
  }

  for (const note of d.notes) {
    const haystack = `${note.title} ${note.body}`.toLowerCase();
    if (haystack.includes(q)) {
      const work = workForCopy(d, note.copy_id);
      hits.push({
        kind: "note",
        id: note.id,
        title: note.title,
        context: work ? `Note on ${work.title}` : "Note",
        snippet: snippetAround(note.body, q),
        href: work ? routes.editor(work.id, note.id) : routes.library,
      });
    }
  }

  for (const concept of d.concepts) {
    if (`${concept.name} ${concept.description}`.toLowerCase().includes(q)) {
      const origin = concept.originating_work_id
        ? workById(d, concept.originating_work_id)
        : undefined;
      hits.push({
        kind: "concept",
        id: concept.id,
        title: concept.name,
        context: origin ? `Originates in ${origin.title}` : "Origin unresolved",
        snippet: concept.description,
        href: routes.concept(concept.id),
      });
    }
  }

  for (const tag of d.tags) {
    if (tag.name.toLowerCase().includes(q)) {
      const count = notesForTag(d, tag.id).length;
      hits.push({
        kind: "tag",
        id: tag.id,
        title: `#${tag.name}`,
        context: "Tag",
        snippet: `${count} note${count === 1 ? "" : "s"}`,
        href: routes.tag(tag.id),
      });
    }
  }

  const order: Record<SearchHitKind, number> = { work: 0, concept: 1, note: 2, author: 3, tag: 4 };
  return hits.sort((a, b) => order[a.kind] - order[b.kind] || a.title.localeCompare(b.title));
}

/* ---------------------------------------------------------------- hub stats */

export function hubs(d: LibraryData, limit = 8): { work: Work; count: number; owned: boolean }[] {
  return d.works
    .map((work) => ({
      work,
      count: inboundReferenceCount(d, work.id),
      owned: isOwned(d, work.id),
    }))
    .filter((h) => h.count > 0)
    .sort((a, b) => b.count - a.count || a.work.title.localeCompare(b.work.title))
    .slice(0, limit);
}
