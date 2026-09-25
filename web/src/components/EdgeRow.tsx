"use client";

import { useState } from "react";
import Link from "next/link";
import type { Edge } from "@/lib/types";
import { useLibrary } from "@/lib/store";
import { EdgeTypeBadge } from "./EdgeTypeBadge";

/**
 * One reference, collapsed by default. Expanding it is the edge-evidence
 * affordance: the page and sentence behind the claim, with a dismiss action.
 */
export function EdgeRow({
  edge,
  workTitle,
  workHref,
  unowned,
}: {
  edge: Edge;
  workTitle: string;
  workHref?: string;
  unowned?: boolean;
}) {
  const { dismissEdge, restoreEdge } = useLibrary();
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-lg border border-line bg-paper-raised ${edge.dismissed ? "opacity-50" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          {workHref ? (
            <Link
              href={workHref}
              className="truncate font-medium text-ink hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {workTitle}
            </Link>
          ) : (
            <span className="truncate font-medium text-ink-muted italic">{workTitle}</span>
          )}
          {unowned && (
            <span className="shrink-0 rounded-full bg-paper-sunken px-1.5 py-0.5 text-[11px] text-ink-faint">
              not in your library
            </span>
          )}
        </span>
        <EdgeTypeBadge type={edge.type} />
      </button>
      {open && (
        <div className="border-t border-line bg-paper-sunken px-3 py-2 text-sm">
          <p className="text-ink-muted">
            p.{edge.evidence.page} — &ldquo;{edge.evidence.quote}&rdquo;
          </p>
          <div className="mt-2">
            {edge.dismissed ? (
              <button
                type="button"
                onClick={() => restoreEdge(edge.id)}
                className="text-xs font-medium text-accent-ink hover:underline"
              >
                Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={() => dismissEdge(edge.id)}
                className="text-xs font-medium text-hub hover:underline"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
