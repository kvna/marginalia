/**
 * Core data model for Marginalia.
 *
 * The central design decision (from the product spec): a `Work` — a
 * referenceable book, owned or not — is separate from a `Copy` — the file,
 * notes and highlights that exist only for books the user actually owns.
 * Most nodes in a mature reference graph are works without a copy; that's
 * the normal case, not an edge case.
 */

export type ID = string;

export interface Author {
  id: ID;
  name: string;
}

/** A referenceable book. May or may not be in the user's library. */
export interface Work {
  id: ID;
  title: string;
  authorIds: ID[];
  year: number;
  /** Set only when the user has added this work to their library. */
  copyId?: ID;
}

/** The user's copy of a Work: the file, and everything they've built on it. */
export interface Copy {
  id: ID;
  workId: ID;
  coverColor: string;
  addedAt: string;
  fileName: string;
  tagIds: ID[];
  /** Where the file lives — always PDF in this prototype. */
  location: "onedrive" | "local";
}

export interface Tag {
  id: ID;
  label: string;
}

export interface Concept {
  id: ID;
  label: string;
  summary: string;
  /** The work a concept is most associated with originating in. */
  originWorkId: ID;
}

export interface Highlight {
  id: ID;
  copyId: ID;
  page: number;
  quote: string;
}

export interface Note {
  id: ID;
  copyId: ID;
  title: string;
  /** Markdown body. `[[Concept Label]]` tokens are rendered as concept links. */
  body: string;
  tagIds: ID[];
  conceptIds: ID[];
  highlightId?: ID;
  createdAt: string;
  updatedAt: string;
}

export type EdgeType = "cites" | "mentions" | "attributes-to-author" | "uses-idea";

export type EdgeConfidence = "high" | "medium" | "low";

export const EDGE_TYPE_META: Record<
  EdgeType,
  { label: string; confidence: EdgeConfidence; defaultOn: boolean; description: string }
> = {
  cites: {
    label: "Cites",
    confidence: "high",
    defaultOn: true,
    description: "An entry in the bibliography.",
  },
  mentions: {
    label: "Mentions",
    confidence: "high",
    defaultOn: true,
    description: "The title appears in the body text.",
  },
  "attributes-to-author": {
    label: "Attributes to author",
    confidence: "medium",
    defaultOn: true,
    description: "“As Kahneman showed…” — credited, but no formal citation.",
  },
  "uses-idea": {
    label: "Uses idea",
    confidence: "low",
    defaultOn: false,
    description: "Borrows a concept (e.g. System 1 / System 2) without naming its source.",
  },
};

/** A directed reference from one work to another, with evidence. */
export interface Edge {
  id: ID;
  type: EdgeType;
  fromWorkId: ID;
  toWorkId: ID;
  evidence: {
    page: number;
    quote: string;
  };
  dismissed?: boolean;
}

export interface Library {
  authors: Author[];
  works: Work[];
  copies: Copy[];
  tags: Tag[];
  concepts: Concept[];
  notes: Note[];
  highlights: Highlight[];
  edges: Edge[];
}
