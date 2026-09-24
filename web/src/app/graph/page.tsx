"use client";

/**
 * Screen 5 — Graph view.
 *
 * The screen the app exists for. Three things it has to get right, in order:
 *
 * 1. **Hubs must look like hubs.** Node radius is driven by
 *    `inbound_reference_count`, so *Thinking, Fast and Slow* and the 1982
 *    collection are visibly larger than the books pointing at them without
 *    anyone being told to look.
 * 2. **Owned and unowned must be distinguishable without colour.** Owned works
 *    are filled rectangles, unowned are dashed outlines, authors are circles,
 *    concepts are lozenges. Shape carries entity kind; hue carries edge type.
 * 3. **Every edge is arguable.** Clicking one opens its page and sentence with a
 *    dismiss action, and dismissing it changes hub sizes immediately.
 *
 * `uses_idea` is off by default per spec §4 — it is the judgement-call layer, and
 * a graph that quietly blends it into bibliography hits is a graph you stop
 * trusting.
 */

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { useStore } from "@/data/store";
import {
  CONFIDENCE_LABEL,
  DEFAULT_LAYERS,
  EDGE_TYPE_BLURB,
  EDGE_TYPE_LABEL,
  buildGraph,
  type GraphNode,
  type LayerState,
} from "@/data/selectors";
import { routes } from "@/lib/routes";
import type { EdgeType } from "@/data/types";

type SimNode = GraphNode & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & { id: string; edgeId: string; type: EdgeType };

/** Node radius from inbound references — the one rule the graph is built on. */
function nodeRadius(node: { weight: number }, maxWeight: number): number {
  return 13 + (node.weight / maxWeight) * 27;
}

const WIDTH = 1100;
const HEIGHT = 720;

const EDGE_COLOUR: Record<EdgeType, string> = {
  cites: "var(--color-cites)",
  mentions: "var(--color-mentions)",
  attributes_to_author: "var(--color-attrib)",
  uses_idea: "var(--color-idea)",
};

const EDGE_DASH: Record<EdgeType, string | undefined> = {
  cites: undefined,
  mentions: undefined,
  attributes_to_author: "7 5",
  uses_idea: "2 4",
};

export default function GraphPage() {
  return (
    <Suspense fallback={<p className="text-sm text-dim">Loading graph…</p>}>
      <GraphView />
    </Suspense>
  );
}

function GraphView() {
  const params = useSearchParams();
  const router = useRouter();
  const { data, dismissEdge, restoreEdge, noteTraversal } = useStore();

  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const focus = params.get("focus");

  const graph = useMemo(() => buildGraph(data, layers), [data, layers]);

  const maxWeight = Math.max(1, ...graph.nodes.map((n) => n.weight));

  /* ------------------------------------------------------------- simulation */

  const [tickNodes, setTickNodes] = useState<SimNode[]>([]);
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  // Positions persist across layer toggles so turning a layer on does not
  // reshuffle the whole graph — toggling a layer is a state change, not a
  // traversal, and should not look like one.
  const positions = useRef(new Map<string, { x: number; y: number }>());

  const graphKey = `${graph.nodes.map((n) => n.id).join("|")}::${graph.links.length}`;

  useEffect(() => {
    const nodes: SimNode[] = graph.nodes.map((n) => {
      const prev = positions.current.get(n.id);
      return {
        ...n,
        x: prev?.x ?? WIDTH / 2 + (Math.random() - 0.5) * 300,
        y: prev?.y ?? HEIGHT / 2 + (Math.random() - 0.5) * 300,
      };
    });
    const links: SimLink[] = graph.links.map((l) => ({
      id: l.id,
      edgeId: l.edge.id,
      type: l.edge.edge_type,
      source: l.source,
      target: l.target,
    }));

    const radius = (n: SimNode) => nodeRadius(n, maxWeight);

    const sim = forceSimulation<SimNode, SimLink>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          // Hubs get shorter links so their spokes read as a cluster rather
          // than a ring at uniform distance.
          .distance((l) => {
            const t = l.target as SimNode;
            return 215 - (t.weight / maxWeight) * 75;
          })
          .strength(0.3),
      )
      .force("charge", forceManyBody<SimNode>().strength((n) => -900 - n.weight * 150))
      .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
      .force(
        "collide",
        // Collide against the label, not the node: labels are what actually
        // overlap, and an unreadable label makes the node useless.
        forceCollide<SimNode>().radius((n) => Math.max(radius(n) + 30, n.label.length * 3.2)),
      )
      .alphaDecay(0.028)
      .on("tick", () => {
        for (const n of nodes) {
          // Keep the cluster inside the frame. Without this, charge pushes the
          // outermost spokes past the viewBox and their labels get clipped.
          const pad = 30 + nodeRadius(n, maxWeight);
          if (n.x !== undefined) n.x = Math.max(pad, Math.min(WIDTH - pad, n.x));
          if (n.y !== undefined) n.y = Math.max(pad, Math.min(HEIGHT - pad - 14, n.y));
          if (n.x !== undefined && n.y !== undefined) {
            positions.current.set(n.id, { x: n.x, y: n.y });
          }
        }
        setTickNodes([...nodes]);
      });

    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [graph.nodes, graph.links, graphKey, maxWeight]);

  const nodeById = useMemo(
    () => new Map(tickNodes.map((n) => [n.id, n])),
    [tickNodes],
  );

  /* ------------------------------------------------------------ interaction */

  const focusNeighbourhood = useMemo(() => {
    if (!focus) return null;
    const keep = new Set<string>([focus]);
    for (const l of graph.links) {
      if (l.source === focus) keep.add(l.target);
      if (l.target === focus) keep.add(l.source);
    }
    return keep;
  }, [focus, graph.links]);

  const activeEdge = selectedEdge
    ? data.edges.find((e) => e.id === selectedEdge)
    : undefined;
  const activeLink = selectedEdge ? graph.links.find((l) => l.edge.id === selectedEdge) : undefined;

  function onNodeClick(node: SimNode) {
    if (node.kind === "work") {
      noteTraversal("graph-node", node.label);
      router.push(routes.book(node.id.slice(5)));
      return;
    }
    // Author and concept nodes are not screens of their own (spec §7) — clicking
    // one filters the graph to its edges instead of navigating away.
    router.push(focus === node.id ? routes.graph : routes.graphFocus(node.id));
  }

  const drag = useRef<{ id: string } | null>(null);

  function onPointerDown(node: SimNode, ev: React.PointerEvent) {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    drag.current = { id: node.id };
    node.fx = node.x;
    node.fy = node.y;
    simRef.current?.alphaTarget(0.12).restart();
  }

  function onPointerMove(ev: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const svg = ev.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * WIDTH;
    const y = ((ev.clientY - rect.top) / rect.height) * HEIGHT;
    const node = nodeById.get(drag.current.id);
    if (node) {
      node.fx = x;
      node.fy = y;
    }
  }

  function onPointerUp() {
    if (!drag.current) return;
    const node = nodeById.get(drag.current.id);
    if (node) {
      node.fx = null;
      node.fy = null;
    }
    drag.current = null;
    simRef.current?.alphaTarget(0);
  }

  const visibleEdgeCount = graph.links.length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-5">
        <div>
          <p className="eyebrow">Graph</p>
          <h1 className="display mt-1 text-3xl font-bold">
            {graph.nodes.length} nodes, {visibleEdgeCount} edges
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Node size is inbound references. Filled rectangles are books you own; dashed
            outlines are works that exist only because something cites them. Click a node to
            open it, an edge to see the sentence behind it.
          </p>
        </div>

        {focus && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.6875rem] text-dim">
              focused: {nodeById.get(focus)?.label ?? focus}
            </span>
            <Link
              href={routes.graph}
              className="rounded border border-line px-2 py-1 font-mono text-[0.625rem] uppercase hover:text-paper"
            >
              clear
            </Link>
          </div>
        )}
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* ---------------------------------------------------------- canvas */}
        <div className="panel relative overflow-hidden p-0">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block h-[min(72vh,720px)] w-full touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <defs>
              {(Object.keys(EDGE_COLOUR) as EdgeType[]).map((type) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="4.5"
                  markerHeight="4.5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_COLOUR[type]} opacity="0.85" />
                </marker>
              ))}
            </defs>

            {/* ---- links ---- */}
            <g>
              {graph.links.map((l) => {
                const s = nodeById.get(l.source);
                const t = nodeById.get(l.target);
                if (!s || !t || s.x === undefined || t.x === undefined) return null;

                const dx = t.x - s.x;
                const dy = t.y! - s.y!;
                const len = Math.hypot(dx, dy) || 1;
                const ux = dx / len;
                const uy = dy / len;
                const x1 = s.x + ux * (nodeRadius(s, maxWeight) + 3);
                const y1 = s.y! + uy * (nodeRadius(s, maxWeight) + 3);
                const x2 = t.x - ux * (nodeRadius(t, maxWeight) + 7);
                const y2 = t.y! - uy * (nodeRadius(t, maxWeight) + 7);

                const dimmed =
                  (focusNeighbourhood &&
                    !(focusNeighbourhood.has(l.source) && focusNeighbourhood.has(l.target))) ||
                  (hovered !== null && hovered !== l.source && hovered !== l.target);
                const selected = selectedEdge === l.edge.id;

                return (
                  <g key={l.id}>
                    {/*
                      A 1.5px line is not a click target. The visible stroke stays
                      hairline-thin so the graph reads cleanly; this transparent
                      one underneath is what the pointer actually hits.
                    */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="transparent"
                      strokeWidth={14}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedEdge(selected ? null : l.edge.id)}
                    />
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={EDGE_COLOUR[l.edge.edge_type]}
                      strokeWidth={selected ? 3.5 : l.edge.confidence === "high" ? 1.6 : 1.1}
                      strokeDasharray={EDGE_DASH[l.edge.edge_type]}
                      strokeOpacity={
                        selected ? 1 : dimmed ? 0.1 : l.edge.confidence === "high" ? 0.6 : 0.4
                      }
                      style={{ color: EDGE_COLOUR[l.edge.edge_type], pointerEvents: "none" }}
                      markerEnd={`url(#arrow-${l.edge.edge_type})`}
                    />
                  </g>
                );
              })}
            </g>

            {/* ---- nodes ---- */}
            <g>
              {tickNodes.map((n) => {
                if (n.x === undefined || n.y === undefined) return null;
                const r = nodeRadius(n, maxWeight);
                const dimmed = focusNeighbourhood ? !focusNeighbourhood.has(n.id) : false;
                const isHub = n.weight >= maxWeight * 0.55;

                return (
                  <g
                    key={n.id}
                    transform={`translate(${n.x} ${n.y})`}
                    opacity={dimmed ? 0.18 : 1}
                    style={{ cursor: "pointer" }}
                    onPointerDown={(ev) => onPointerDown(n, ev)}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onNodeClick(n)}
                  >
                    <NodeShape node={n} r={r} />
                    <text
                      y={r + 15}
                      textAnchor="middle"
                      className="select-none"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: isHub ? 17 : 12.5,
                        fontWeight: isHub ? 700 : 500,
                        fill: dimmed
                          ? "var(--color-dim)"
                          : isHub
                            ? "var(--color-paper)"
                            : "var(--color-muted)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {n.label.length > 26 ? `${n.label.slice(0, 24)}…` : n.label}
                    </text>
                    {n.kind === "work" && n.weight > 0 && (
                      <text
                        textAnchor="middle"
                        dy="0.34em"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: isHub ? 14 : 10,
                          fontWeight: 700,
                          fill: n.solid ? "var(--color-void)" : "var(--color-paper)",
                          pointerEvents: "none",
                        }}
                      >
                        {n.weight}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {tickNodes.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-dim">
              Every layer is off — turn one on to see the graph.
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------ rail */}
        <div className="space-y-4">
          <section className="panel p-4">
            <p className="eyebrow">Edge layers</p>
            <div className="mt-2 space-y-1">
              {(Object.keys(EDGE_TYPE_LABEL) as EdgeType[]).map((type) => {
                const count = data.edges.filter(
                  (e) => !e.dismissed && e.edge_type === type,
                ).length;
                const on = layers[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLayers((prev) => ({ ...prev, [type]: !prev[type] }))}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-md border px-2.5 py-2 text-left transition-colors ${
                      on ? "border-line-bright bg-raised/60" : "border-line opacity-55"
                    }`}
                  >
                    <span className={`edge-swatch edge-${type} shrink-0`} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.8125rem] font-semibold text-paper">
                        {EDGE_TYPE_LABEL[type]}
                      </span>
                      <span className="block text-[0.625rem] text-dim">
                        {EDGE_TYPE_BLURB[type]}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.625rem] text-dim">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[0.625rem] text-dim">
              <em className="not-italic" style={{ color: "var(--color-idea)" }}>
                Uses idea
              </em>{" "}
              is off by default — it is a judgement call, not a citation, and it only counts
              once you have chosen to look at it.
            </p>
          </section>

          {/* Evidence for the selected edge. */}
          {activeEdge && activeLink ? (
            <section className="panel arriving p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">Edge evidence</p>
                  <p className="display mt-1 text-base font-semibold">
                    {nodeById.get(activeLink.source)?.label} →{" "}
                    {nodeById.get(activeLink.target)?.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEdge(null)}
                  className="cursor-pointer font-mono text-[0.625rem] text-dim uppercase hover:text-paper"
                >
                  close
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-dim">
                <span className="inline-flex items-center gap-1.5">
                  <span className={`edge-swatch edge-${activeEdge.edge_type}`} aria-hidden />
                  {EDGE_TYPE_LABEL[activeEdge.edge_type]}
                </span>
                <span>p.{activeEdge.evidence_page}</span>
                <span>{CONFIDENCE_LABEL[activeEdge.confidence]}</span>
              </div>

              <p className="evidence mt-3 border-l-2 border-line-bright pl-3">
                “{activeEdge.evidence_quote}”
              </p>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[0.625rem] text-dim">
                  Fixture evidence — plausible, not verified.
                </p>
                {activeEdge.dismissed ? (
                  <button
                    type="button"
                    onClick={() => restoreEdge(activeEdge.id)}
                    className="cursor-pointer font-mono text-[0.625rem] uppercase"
                    style={{ color: "var(--color-mentions)" }}
                  >
                    restore
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      dismissEdge(activeEdge.id);
                      setSelectedEdge(null);
                    }}
                    className="cursor-pointer rounded border border-line px-2 py-1 font-mono text-[0.625rem] uppercase hover:border-idea hover:text-idea"
                  >
                    dismiss edge
                  </button>
                )}
              </div>
            </section>
          ) : (
            <section className="panel p-4">
              <p className="eyebrow">Edge evidence</p>
              <p className="mt-2 text-sm text-muted">
                Click any edge to see the page and the sentence that produced it — and dismiss
                it if it is wrong. Dismissing re-sizes the hubs immediately.
              </p>
            </section>
          )}

          <section className="panel p-4">
            <p className="eyebrow">Reading the shapes</p>
            <ul className="mt-2 space-y-2 text-[0.8125rem] text-muted">
              <LegendRow
                swatch={<rect width="16" height="11" rx="1.5" fill="var(--color-cites)" />}
                label="Book you own"
              />
              <LegendRow
                swatch={
                  <rect
                    width="16"
                    height="11"
                    rx="1.5"
                    fill="none"
                    stroke="var(--color-line-bright)"
                    strokeDasharray="3 2"
                  />
                }
                label="Referenced, not owned"
              />
              <LegendRow
                swatch={<circle cx="8" cy="5.5" r="5.5" fill="var(--color-attrib)" />}
                label="Author"
              />
              <LegendRow
                swatch={<rect width="16" height="10" rx="5" fill="var(--color-concept)" />}
                label="Concept"
              />
            </ul>
            <p className="mt-3 text-[0.625rem] text-dim">
              The number inside a work node is its inbound reference count. Drag a node to
              pull the cluster apart.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Shape carries entity kind, so the graph survives being read in greyscale. */
function NodeShape({ node, r }: { node: SimNode; r: number }) {
  const fill = node.solid
    ? node.kind === "work"
      ? `hsl(${node.hue} 62% 58%)`
      : node.kind === "author"
        ? "var(--color-attrib)"
        : "var(--color-concept)"
    : "transparent";
  const stroke = node.solid
    ? `hsl(${node.hue} 70% 74%)`
    : node.kind === "concept"
      ? "var(--color-concept)"
      : "var(--color-line-bright)";

  if (node.kind === "author") {
    return (
      <circle
        r={r * 0.75}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        fillOpacity={0.85}
      />
    );
  }

  if (node.kind === "concept") {
    const w = r * 2.2;
    const h = r * 1.15;
    return (
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={fill}
        fillOpacity={0.8}
        stroke={stroke}
        strokeWidth={1.5}
        strokeDasharray={node.solid ? undefined : "4 3"}
      />
    );
  }

  const w = r * 1.75;
  const h = r * 1.3;
  return (
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      rx={2.5}
      fill={fill}
      stroke={stroke}
      strokeWidth={node.solid ? 1.5 : 1.75}
      strokeDasharray={node.solid ? undefined : "5 4"}
    />
  );
}

function LegendRow({ swatch, label }: { swatch: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2.5">
      <svg width="16" height="11" className="shrink-0 overflow-visible">
        {swatch}
      </svg>
      <span>{label}</span>
    </li>
  );
}
