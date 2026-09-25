"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/lib/store";
import { EDGE_TYPE_META, type EdgeType, type Library } from "@/lib/types";
import { layoutGraph } from "@/lib/graph";
import { edgeTypeDotClass } from "@/components/EdgeTypeBadge";

const EDGE_STROKE_VAR: Record<EdgeType, string> = {
  cites: "var(--edge-cites)",
  mentions: "var(--edge-mentions)",
  "attributes-to-author": "var(--edge-attributes)",
  "uses-idea": "var(--edge-idea)",
};

const EDGE_WIDTH: Record<EdgeType, number> = {
  cites: 2.5,
  mentions: 2,
  "attributes-to-author": 1.5,
  "uses-idea": 1.5,
};

const WIDTH = 960;
const HEIGHT = 620;

export function GraphClient() {
  const router = useRouter();
  const { library, enabledEdgeTypes, toggleEdgeType, dismissEdge, restoreEdge } = useLibrary();
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const { nodes, links } = useMemo(
    () => layoutGraph(library, enabledEdgeTypes, WIDTH, HEIGHT),
    [library, enabledEdgeTypes],
  );

  const selectedEdge = library.edges.find((e) => e.id === selectedEdgeId) ?? null;
  const selectedLink = links.find((l) => l.id === selectedEdgeId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Graph</h1>
        <p className="text-sm text-ink-muted">
          Node size tracks how many enabled edges point at it — hubs stay visibly hubs. Dashed outlines
          are books you don&apos;t own yet.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(EDGE_TYPE_META) as EdgeType[]).map((type) => {
          const meta = EDGE_TYPE_META[type];
          const on = enabledEdgeTypes.has(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleEdgeType(type)}
              title={meta.description}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                on
                  ? "border-line-strong bg-paper-raised text-ink"
                  : "border-line bg-paper-sunken text-ink-faint"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${edgeTypeDotClass(type)} ${on ? "" : "opacity-30"}`} />
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="overflow-hidden rounded-xl border border-line bg-paper-raised">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-[560px] w-full">
            <g>
              {links.map((link) => (
                <line
                  key={link.id}
                  x1={link.source.x}
                  y1={link.source.y}
                  x2={link.target.x}
                  y2={link.target.y}
                  stroke={EDGE_STROKE_VAR[link.type]}
                  strokeWidth={link.id === selectedEdgeId ? EDGE_WIDTH[link.type] + 2 : EDGE_WIDTH[link.type]}
                  strokeOpacity={selectedEdgeId && link.id !== selectedEdgeId ? 0.2 : 0.65}
                  className="cursor-pointer motion-safe-transition"
                  onClick={() => setSelectedEdgeId(link.id)}
                />
              ))}
            </g>
            <g>
              {nodes.map((node) => (
                <g
                  key={node.id}
                  transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                  className="cursor-pointer"
                  onClick={() => router.push(`/books?id=${node.id}`)}
                >
                  <circle
                    r={node.radius}
                    fill={node.owned ? nodeFill(library, node.id) : "var(--paper-raised)"}
                    stroke={node.owned ? "var(--paper-raised)" : "var(--ink-faint)"}
                    strokeWidth={node.owned ? 0 : 2}
                    strokeDasharray={node.owned ? undefined : "5 4"}
                  />
                  <text
                    y={node.radius + 14}
                    textAnchor="middle"
                    className="pointer-events-none select-none fill-ink text-[11px] font-medium"
                  >
                    {truncate(node.title, 22)}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        <aside className="rounded-xl border border-line bg-paper-raised p-4">
          {selectedEdge && selectedLink ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
                {EDGE_TYPE_META[selectedEdge.type].label}
              </p>
              <p className="mt-1 text-sm text-ink">
                <span className="font-medium">{selectedLink.source.title}</span> →{" "}
                <span className="font-medium">{selectedLink.target.title}</span>
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                p.{selectedEdge.evidence.page} — &ldquo;{selectedEdge.evidence.quote}&rdquo;
              </p>
              <div className="mt-3 flex gap-3">
                {selectedEdge.dismissed ? (
                  <button
                    type="button"
                    onClick={() => restoreEdge(selectedEdge.id)}
                    className="text-xs font-medium text-accent-ink hover:underline"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => dismissEdge(selectedEdge.id)}
                    className="text-xs font-medium text-hub hover:underline"
                  >
                    Dismiss
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEdgeId(null)}
                  className="text-xs font-medium text-ink-muted hover:text-ink"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ink-muted">
              <p className="mb-2 font-medium text-ink">
                {nodes.length} works, {links.length} references
              </p>
              <p>Click a node to open the book. Click an edge to see the evidence behind it.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function nodeFill(library: Library, workId: string): string {
  const work = library.works.find((w) => w.id === workId);
  const copy = work?.copyId ? library.copies.find((c) => c.id === work.copyId) : undefined;
  return copy?.coverColor ?? "var(--hub)";
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
