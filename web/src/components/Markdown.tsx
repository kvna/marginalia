"use client";

/**
 * A deliberately small markdown renderer: paragraphs, lists, bold, italic,
 * inline code, and `[[concept]]` links. No dependency, because the only syntax
 * the note editor promises is the syntax below — and `[[…]]` is the part that
 * matters, since it is a real FK into the Concept table rather than decoration.
 *
 * A `[[…]]` that resolves renders as a concept link. One that does not renders
 * as an unresolved marker rather than silently as plain text, so a typo in a
 * concept name is visible while writing.
 */

import Link from "next/link";
import { type ReactNode } from "react";
import { conceptByName } from "@/data/selectors";
import type { LibraryData } from "@/data/types";
import { routes } from "@/lib/routes";

export function Markdown({
  body,
  data,
  onConceptClick,
}: {
  body: string;
  data: LibraryData;
  onConceptClick?: (conceptId: string) => void;
}) {
  const blocks = body.split(/\n{2,}/);

  return (
    <div className="prose-note">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="display mt-4 mb-2 text-base font-semibold text-paper">
              {inline(trimmed.slice(3), data, onConceptClick)}
            </h3>
          );
        }

        if (/^[-*]\s/.test(trimmed)) {
          const items = trimmed.split("\n").map((l) => l.replace(/^[-*]\s/, ""));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{inline(item, data, onConceptClick)}</li>
              ))}
            </ul>
          );
        }

        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="evidence my-3 border-l-2 border-line-bright pl-3"
            >
              {inline(trimmed.replace(/^>\s?/gm, ""), data, onConceptClick)}
            </blockquote>
          );
        }

        return <p key={i}>{inline(trimmed, data, onConceptClick)}</p>;
      })}
    </div>
  );
}

/** Tokenises one block. Order matters: concept links before emphasis. */
function inline(
  text: string,
  data: LibraryData,
  onConceptClick?: (conceptId: string) => void,
): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[\[([^\]]+)\]\]|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    key += 1;

    if (m[1] !== undefined) {
      const name = m[1].trim();
      const concept = conceptByName(data, name);
      if (concept) {
        out.push(
          <Link
            key={key}
            href={routes.concept(concept.id)}
            onClick={() => onConceptClick?.(concept.id)}
            className="border-b border-dotted font-medium"
            style={{
              color: "var(--color-concept)",
              borderColor: "color-mix(in oklab, var(--color-concept) 50%, transparent)",
            }}
          >
            {name}
          </Link>,
        );
      } else {
        out.push(
          <span
            key={key}
            className="border-b border-dashed border-dim text-dim"
            title="No concept with this name yet"
          >
            {name}
          </span>,
        );
      }
    } else if (m[2] !== undefined) {
      out.push(<strong key={key}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      out.push(<em key={key}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      out.push(
        <code key={key} className="rounded bg-raised px-1 font-mono text-[0.8em]">
          {m[4]}
        </code>,
      );
    }
    last = re.lastIndex;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}
