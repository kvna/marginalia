import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { EdgeType, Library } from "@/lib/types";
import { inboundCount } from "@/lib/selectors";

/**
 * The force-directed layout is computed once per (library, enabled edge
 * types) pair, then rendered as a static positioned SVG — no continuous
 * animation loop. Keeping this in its own module means the physics can be
 * swapped out later without touching the rendering component.
 */
export interface GraphNode extends SimulationNodeDatum {
  id: string;
  title: string;
  owned: boolean;
  inbound: number;
  radius: number;
}

export interface GraphLink {
  id: string;
  type: EdgeType;
  source: GraphNode;
  target: GraphNode;
  index?: number;
}

const MIN_RADIUS = 16;
const MAX_RADIUS = 48;
const TICKS = 300;

function radiusFor(inbound: number): number {
  return Math.min(MAX_RADIUS, MIN_RADIUS + Math.sqrt(inbound) * 9);
}

export function layoutGraph(
  library: Library,
  enabledEdgeTypes: Set<EdgeType>,
  width: number,
  height: number,
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodeById = new Map<string, GraphNode>();
  const nodes: GraphNode[] = library.works.map((w) => {
    const inbound = inboundCount(library, w.id, enabledEdgeTypes);
    const node: GraphNode = {
      id: w.id,
      title: w.title,
      owned: Boolean(w.copyId),
      inbound,
      radius: radiusFor(inbound),
    };
    nodeById.set(w.id, node);
    return node;
  });

  const links: GraphLink[] = library.edges
    .filter((e) => !e.dismissed && enabledEdgeTypes.has(e.type))
    .map((e) => {
      const source = nodeById.get(e.fromWorkId);
      const target = nodeById.get(e.toWorkId);
      if (!source || !target) return null;
      return { id: e.id, type: e.type, source, target };
    })
    .filter((l): l is GraphLink => l !== null);

  const simulation = forceSimulation(nodes)
    .force("link", forceLink<GraphNode, GraphLink>(links).distance(140).strength(0.5))
    .force("charge", forceManyBody().strength(-220))
    .force("center", forceCenter(width / 2, height / 2))
    .force("collide", forceCollide<GraphNode>().radius((d) => d.radius + 14))
    .stop();

  for (let i = 0; i < TICKS; i += 1) simulation.tick();

  return { nodes, links };
}
