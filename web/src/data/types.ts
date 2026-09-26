/**
 * Types mirror docs/product-spec.md §1–§6 exactly, in the same names, so the
 * prototype's fixtures and the real API return the same shape. Relational
 * joins from the spec are modeled as id arrays here because the prototype has
 * no database; the field names are kept so the swap to real data is mechanical.
 */

export type EdgeType = "cites" | "mentions" | "attributes_to_author" | "uses_idea";

export type Confidence = "high" | "medium" | "low";

/** §1 — PDF only. Modeled as an enum with exactly one legal value today. */
export type FileFormat = "pdf";

export interface Author {
  id: string;
  name: string;
  /** "D. Kahneman", "Kahneman, Daniel" — for matching during resolution (§6). */
  aliases: string[];
  openlibrary_author_id: string | null;
}

/**
 * §1 — the referenceable thing. Exists whether or not the user owns it.
 * Every reference edge targets a Work, never a Copy.
 */
export interface Work {
  id: string;
  title: string;
  subtitle?: string;
  /** Lowercased, punctuation-stripped; used for de-dup matching (§6). */
  normalized_title: string;
  author_ids: string[];
  year: number;
  /** Trade nonfiction vs. the journal articles that sit under it. */
  kind: "book" | "article";
  openlibrary_work_id: string | null;
  isbn13: string | null;
  /** §6 step 5 — parsed out of a bibliography but never confidently resolved. */
  unresolved?: boolean;
  /** Cover treatment is generated, not fetched — keeps the prototype at £0. */
  cover: { hue: number; glyph: string };
}

/** §1 — the user's file, notes, highlights. Zero or one per Work. */
export interface Copy {
  id: string;
  work_id: string;
  file_format: FileFormat;
  /** Path inside the OneDrive folder nominated in Settings. */
  file_path: string;
  pages: number;
  added_at: string;
  reading_state: "unread" | "reading" | "finished";
  last_opened_page: number | null;
}

export interface Highlight {
  id: string;
  copy_id: string;
  page: number;
  text: string;
  /** The user's marginal remark on the highlight itself, if any. */
  remark: string | null;
}

/** §3 — notes attach to a Copy, never a Work. */
export interface Note {
  id: string;
  copy_id: string;
  title: string;
  /** Markdown, with inline [[concept]] links. */
  body: string;
  page_ref: number | null;
  /** Set when the note was written against a specific highlight. */
  highlight_id: string | null;
  created_at: string;
  updated_at: string;
  tag_ids: string[];
  /** NoteConcept join (§3) — the [[concept]] links inside body. */
  concept_ids: string[];
}

/** §3 — deliberately dumber than a Concept: a flat name, no origin. */
export interface Tag {
  id: string;
  name: string;
}

export interface Concept {
  id: string;
  name: string;
  /** §3 — what gives a shared-concept edge its direction. Nullable. */
  originating_work_id: string | null;
  description: string;
}

/**
 * §4 — one table, four types. No row exists without evidence_page and
 * evidence_quote; that invariant is asserted in tests/fixtures.test.ts.
 */
export interface Edge {
  id: string;
  source_copy_id: string;
  /** Populated for cites | mentions. */
  target_work_id: string | null;
  /** Populated only for attributes_to_author. */
  target_author_id: string | null;
  /** Populated only for uses_idea. */
  target_concept_id: string | null;
  edge_type: EdgeType;
  confidence: Confidence;
  evidence_page: number;
  evidence_quote: string;
  dismissed: boolean;
  dismissed_at: string | null;
  created_at: string;
}

export interface OneDriveConnection {
  connected: boolean;
  account: string | null;
  library_folder: string;
  last_sync: string | null;
}

/**
 * A PDF sync found in the library folder that does not match any existing
 * Work — the case the spec calls "if the book doesn't exist" (§7). Sits in
 * this queue until the user confirms or dismisses it; nothing is written to
 * `works`/`copies` until then. `scanned_text` stands in for the real pipeline
 * reading the first few pages of the PDF; null means the page came back
 * image-only (needs OCR, same caveat as the Settings screen's format note).
 */
export interface DiscoveredFile {
  id: string;
  file_path: string;
  scanned_text: string | null;
  found_at: string;
}

export interface LibraryData {
  authors: Author[];
  works: Work[];
  copies: Copy[];
  notes: Note[];
  tags: Tag[];
  concepts: Concept[];
  highlights: Highlight[];
  edges: Edge[];
  connection: OneDriveConnection;
  discovered: DiscoveredFile[];
}
