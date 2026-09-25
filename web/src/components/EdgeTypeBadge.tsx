import type { EdgeType } from "@/lib/types";
import { EDGE_TYPE_META } from "@/lib/types";

const DOT_CLASS: Record<EdgeType, string> = {
  cites: "bg-edge-cites",
  mentions: "bg-edge-mentions",
  "attributes-to-author": "bg-edge-attributes",
  "uses-idea": "bg-edge-idea",
};

export function EdgeTypeBadge({ type }: { type: EdgeType }) {
  const meta = EDGE_TYPE_META[type];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted whitespace-nowrap">
      <span className={`h-2 w-2 rounded-full ${DOT_CLASS[type]}`} aria-hidden />
      {meta.label}
    </span>
  );
}

export function edgeTypeDotClass(type: EdgeType): string {
  return DOT_CLASS[type];
}
