"use client";

/**
 * The small shared vocabulary every screen is built from: covers, chips, edge
 * markers, evidence cards. Kept together because they are what enforces the
 * visual rules — a concept is always a lozenge sized by weight, an unowned work
 * is always a dashed outline, an edge always carries its dash pattern — and
 * those rules should be impossible to break by accident on one screen.
 */

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useStore } from "@/data/store";
import {
  CONFIDENCE_LABEL,
  EDGE_TYPE_BLURB,
  EDGE_TYPE_LABEL,
  authorLine,
  conceptWeight,
  isOwned,
  type ResolvedEdge,
} from "@/data/selectors";
import type { Concept, EdgeType, LibraryData, Tag, Work } from "@/data/types";
import { routes } from "@/lib/routes";

/* ------------------------------------------------------------------- covers */

/**
 * Covers are generated from the Work's hue and initials rather than fetched —
 * no image requests, no cost, and an unowned work can be rendered as an outline
 * of the same shape so the two states are directly comparable.
 */
export function Cover({
  work,
  owned,
  size = "md",
}: {
  work: Work;
  owned: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm"
      ? "w-10 h-14 text-[0.6rem]"
      : size === "lg"
        ? "w-28 h-40 text-lg"
        : "w-16 h-24 text-xs";

  return (
    <div
      className={`${dims} relative shrink-0 overflow-hidden rounded-sm border flex items-end`}
      style={
        owned
          ? {
              borderColor: `hsl(${work.cover.hue} 45% 34%)`,
              background: `linear-gradient(155deg, hsl(${work.cover.hue} 48% 22%), hsl(${work.cover.hue} 38% 11%) 65%, #0d0f13)`,
            }
          : {
              borderColor: "var(--color-line-bright)",
              borderStyle: "dashed",
              background:
                "repeating-linear-gradient(135deg, transparent, transparent 5px, rgb(255 255 255 / 3%) 5px, rgb(255 255 255 / 3%) 6px)",
            }
      }
    >
      <span
        className="display absolute top-1.5 left-1.5 font-bold tracking-tight"
        style={{ color: owned ? `hsl(${work.cover.hue} 70% 72%)` : "var(--color-dim)" }}
      >
        {work.cover.glyph}
      </span>
      {work.kind === "article" && (
        <span className="absolute right-1 bottom-1 font-mono text-[0.5rem] text-dim">§</span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------- chips */

export function ConceptChip({
  concept,
  data,
  onClick,
  href,
}: {
  concept: Concept;
  data: LibraryData;
  onClick?: () => void;
  href?: string;
}) {
  const weight = conceptWeight(data, concept.id);
  // Normalised against the busiest concept so one loud concept does not make
  // everything else illegibly small.
  const max = useMemo(
    () => Math.max(1, ...data.concepts.map((c) => conceptWeight(data, c.id).total)),
    [data],
  );
  const pop = Math.min(1, weight.total / max);
  const resolved = concept.originating_work_id !== null;

  const inner = (
    <>
      <span>{concept.name}</span>
      <span className="font-mono text-[0.625rem] opacity-60">{weight.total}</span>
    </>
  );

  const props = {
    className: "chip-concept",
    style: { "--pop": pop } as React.CSSProperties,
    "data-origin": resolved ? "resolved" : "unresolved",
    title: resolved
      ? `${weight.noteCount} notes, ${weight.ideaEdgeCount} idea edges`
      : "Origin unresolved",
  };

  if (href) {
    return (
      <Link href={href} {...props}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} {...props}>
      {inner}
    </button>
  );
}

export function TagChip({ tag, href }: { tag: Tag; href?: string }) {
  if (href) {
    return (
      <Link href={href} className="chip-tag">
        #{tag.name}
      </Link>
    );
  }
  return <span className="chip-tag">#{tag.name}</span>;
}

export function NotInLibraryBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-dashed border-line-bright px-1.5 py-0.5 font-mono text-[0.625rem] tracking-wide text-dim uppercase">
      Not in library
    </span>
  );
}

export function EdgeTypeMarker({ type }: { type: EdgeType }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`edge-swatch edge-${type}`} aria-hidden />
      <span className="font-mono text-[0.6875rem] tracking-wide text-muted">
        {EDGE_TYPE_LABEL[type]}
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------- evidence */

/**
 * The edge-evidence affordance. Every edge can be opened to see the page and the
 * sentence that produced it, and dismissed from there — which is what makes the
 * graph arguable rather than something to be taken on faith.
 */
export function EdgeEvidence({
  resolved,
  data,
  direction,
}: {
  resolved: ResolvedEdge;
  data: LibraryData;
  direction: "out" | "in";
}) {
  const { dismissEdge, restoreEdge, noteTraversal } = useStore();
  const [open, setOpen] = useState(false);
  const { edge } = resolved;

  const counterpart =
    direction === "out" ? resolved.targetLabel : resolved.sourceWork.title;
  const counterpartHref =
    direction === "out"
      ? resolved.targetWork
        ? routes.book(resolved.targetWork.id)
        : resolved.targetConcept
          ? routes.concept(resolved.targetConcept.id)
          : routes.graphFocus(`author:${resolved.targetAuthor?.id}`)
      : routes.book(resolved.sourceWork.id);

  const sub =
    direction === "out"
      ? resolved.targetWork
        ? `${authorLine(data, resolved.targetWork)} · ${resolved.targetWork.year}${
            isOwned(data, resolved.targetWork.id) ? "" : " · not in library"
          }`
        : resolved.targetAuthor
          ? "Author"
          : "Concept"
      : `${authorLine(data, resolved.sourceWork)} · ${resolved.sourceWork.year}`;

  return (
    <div
      className={`group border-b border-line last:border-0 ${edge.dismissed ? "opacity-40" : ""}`}
    >
      <div className="flex items-start gap-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-0.5 shrink-0 cursor-pointer"
          title="Show the evidence for this edge"
        >
          <span className={`edge-swatch edge-${edge.edge_type}`} aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              href={counterpartHref}
              onClick={() => noteTraversal("edge", counterpart)}
              className="display truncate text-[0.975rem] font-semibold text-paper hover:text-cites"
            >
              {counterpart}
            </Link>
            {edge.dismissed && (
              <span className="font-mono text-[0.625rem] tracking-wide text-dim uppercase">
                dismissed
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.6875rem] text-dim">
            <span style={{ color: `var(--color-${edge.edge_type === "attributes_to_author" ? "attrib" : edge.edge_type === "uses_idea" ? "idea" : edge.edge_type})` }}>
              {EDGE_TYPE_LABEL[edge.edge_type].toLowerCase()}
            </span>
            <span aria-hidden>·</span>
            <span>{sub}</span>
            <span aria-hidden>·</span>
            <span>p.{edge.evidence_page}</span>
            <span aria-hidden>·</span>
            <Confidence level={edge.confidence} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 cursor-pointer font-mono text-[0.625rem] tracking-wide text-dim uppercase hover:text-paper"
        >
          {open ? "hide" : "why"}
        </button>
      </div>

      {open && (
        <div className="arriving mb-3 rounded-md border border-line bg-void/60 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="eyebrow">
              {EDGE_TYPE_LABEL[edge.edge_type]} — page {edge.evidence_page}
            </span>
            {edge.dismissed ? (
              <button
                type="button"
                onClick={() => restoreEdge(edge.id)}
                className="cursor-pointer font-mono text-[0.625rem] text-mentions uppercase hover:underline"
              >
                restore
              </button>
            ) : (
              <button
                type="button"
                onClick={() => dismissEdge(edge.id)}
                className="cursor-pointer font-mono text-[0.625rem] text-dim uppercase hover:text-idea"
              >
                dismiss edge
              </button>
            )}
          </div>
          <p className="evidence border-l-2 border-line-bright pl-3">
            “{edge.evidence_quote}”
          </p>
          <p className="mt-2 text-[0.625rem] text-dim">
            {EDGE_TYPE_BLURB[edge.edge_type]} Extracted from{" "}
            <em className="not-italic text-muted">{resolved.sourceWork.title}</em>. Fixture
            evidence — plausible, not verified against the page.
          </p>
        </div>
      )}
    </div>
  );
}

export function Confidence({ level }: { level: "high" | "medium" | "low" }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  const colour =
    level === "high" ? "var(--color-cites)" : level === "medium" ? "var(--color-attrib)" : "var(--color-idea)";
  return (
    <span className="inline-flex items-center gap-1" title={CONFIDENCE_LABEL[level]}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1 w-1.5 rounded-[1px]"
          style={{ background: i < filled ? colour : "var(--color-line-bright)" }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------- layout */

export function Panel({
  eyebrow,
  title,
  aside,
  children,
  className = "",
}: {
  eyebrow?: string;
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel p-4 ${className}`}>
      {(eyebrow || title || aside) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="display mt-1 text-lg font-semibold">{title}</h2>}
          </div>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-3 text-sm text-dim italic">{children}</p>;
}
