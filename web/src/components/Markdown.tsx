"use client";

/**
 * A deliberately small markdown renderer: headings, paragraphs, lists, bold,
 * italic, inline code, and `[[concept]]` links. No dependency, because the
 * syntax it has to cover is the note editor's own syntax plus whatever
 * book-pickup/scan_books.sh's imported notes already use (headings and a
 * numbered "term — description" list with a quote line beneath each item).
 *
 * A `[[…]]` that resolves renders as a concept link. One that does not renders
 * as an unresolved marker rather than silently as plain text, so a typo in a
 * concept name is visible while writing.
 *
 * A numbered item whose first line is `**Term** — description` gets its term
 * pulled out and rendered with the same highlight treatment as a concept chip
 * elsewhere in the app, so a key term is visible at a glance rather than
 * requiring the reader to parse the sentence to find it.
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

        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={i} className="display mb-3 text-xl font-bold text-paper">
              {inline(trimmed.slice(2), data, onConceptClick)}
            </h2>
          );
        }

        const ordered = trimmed.match(/^(\d+)\.\s+([\s\S]+)$/);
        if (ordered) {
          const [, index, rest] = ordered;
          const lines = rest!.split("\n");
          const textLines = [lines[0]!.trim()];
          const quoteLines: string[] = [];
          for (const raw of lines.slice(1)) {
            const line = raw.trim();
            if (!line) continue;
            if (line.startsWith(">")) quoteLines.push(line.replace(/^>\s?/, ""));
            else textLines.push(line);
          }
          const text = textLines.join(" ");
          const quote = quoteLines.join(" ");
          // "**Term** — rest of sentence" is the concept/extract convention
          // imported notes use; pull the term out so it can be highlighted
          // rather than reading as an undifferentiated wall of bold text.
          const term = text.match(/^\*\*([^*]+)\*\*\s*[—–-]\s*([\s\S]*)$/);

          return (
            <div key={i} className="mb-4 flex gap-3 last:mb-0">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.6875rem] font-semibold"
                style={{
                  borderColor: "color-mix(in oklab, var(--color-concept) 50%, transparent)",
                  color: "var(--color-concept)",
                }}
              >
                {index}
              </span>
              <div className="min-w-0 flex-1">
                <p>
                  {term ? (
                    <>
                      <mark
                        className="rounded px-1 py-0.5 font-semibold"
                        style={{
                          background: "color-mix(in oklab, var(--color-concept) 22%, transparent)",
                          color: "color-mix(in oklab, var(--color-concept) 85%, white)",
                        }}
                      >
                        {term[1]}
                      </mark>
                      {" — "}
                      {inline(term[2]!, data, onConceptClick)}
                    </>
                  ) : (
                    inline(text, data, onConceptClick)
                  )}
                </p>
                {quote && (
                  <blockquote className="evidence mt-2 border-l-2 border-line-bright pl-3">
                    {inline(quote, data, onConceptClick)}
                  </blockquote>
                )}
              </div>
            </div>
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
