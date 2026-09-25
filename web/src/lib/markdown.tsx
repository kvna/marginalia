import type { ReactNode } from "react";
import type { Concept } from "@/lib/types";
import Link from "next/link";

/**
 * A small, deliberately non-general markdown renderer: headings, bold,
 * italic, bullet lists, paragraphs, and `[[Concept Label]]` tokens resolved
 * against the concept table and rendered as links. Good enough for notes
 * written inside this app; not intended to round-trip arbitrary markdown.
 */
export function renderNoteBody(body: string, concepts: Concept[]): ReactNode[] {
  const byLabel = new Map(concepts.map((c) => [c.label.toLowerCase(), c]));
  const lines = body.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: ReactNode[] = [];

  const flushList = (key: string) => {
    if (listItems.length) {
      blocks.push(
        <ul key={key} className="list-disc pl-5 space-y-1 my-2">
          {listItems}
        </ul>,
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`ul-${i}`);
      return;
    }
    if (trimmed.startsWith("### ")) {
      flushList(`ul-${i}`);
      blocks.push(
        <h3 key={i} className="text-sm font-semibold text-ink mt-4 mb-1">
          {inline(trimmed.slice(4), byLabel)}
        </h3>,
      );
    } else if (trimmed.startsWith("## ")) {
      flushList(`ul-${i}`);
      blocks.push(
        <h2 key={i} className="text-base font-semibold text-ink mt-4 mb-1">
          {inline(trimmed.slice(3), byLabel)}
        </h2>,
      );
    } else if (trimmed.startsWith("- ")) {
      listItems.push(<li key={i}>{inline(trimmed.slice(2), byLabel)}</li>);
    } else {
      flushList(`ul-${i}`);
      blocks.push(
        <p key={i} className="leading-relaxed text-[15px] text-ink/90 my-2">
          {inline(trimmed, byLabel)}
        </p>,
      );
    }
  });
  flushList("ul-end");
  return blocks;
}

function inline(text: string, byLabel: Map<string, Concept>): ReactNode[] {
  const tokenPattern = /(\[\[[^\]]+\]\]|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenPattern).filter((p) => p.length > 0);
  return parts.map((part, i) => {
    if (part.startsWith("[[") && part.endsWith("]]")) {
      const label = part.slice(2, -2);
      const concept = byLabel.get(label.toLowerCase());
      if (concept) {
        return (
          <Link
            key={i}
            href={`/concepts?id=${concept.id}`}
            className="text-accent-ink bg-accent-soft rounded px-1 py-px font-medium hover:underline"
          >
            {label}
          </Link>
        );
      }
      return (
        <span key={i} className="text-ink-muted italic">
          {label}
        </span>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

/** Find `[[...]]` tokens in raw note body text, resolved or not. */
export function extractConceptTokens(body: string): string[] {
  const matches = body.match(/\[\[[^\]]+\]\]/g) ?? [];
  return matches.map((m) => m.slice(2, -2));
}

/**
 * If the cursor sits inside an unclosed `[[...` token, returns the partial
 * text typed so far (for autocomplete). Otherwise null.
 */
export function findOpenConceptQuery(text: string, cursor: number): string | null {
  const upToCursor = text.slice(0, cursor);
  const openIndex = upToCursor.lastIndexOf("[[");
  if (openIndex === -1) return null;
  const between = upToCursor.slice(openIndex + 2);
  if (between.includes("]]") || between.includes("\n")) return null;
  return between;
}
