import Link from "next/link";
import type { Copy, Work } from "@/lib/types";
import { TagChip } from "./TagChip";

export function BookCard({
  work,
  copy,
  authorNames,
  tagLabels,
  inboundCount,
}: {
  work: Work;
  copy: Copy;
  authorNames: string[];
  tagLabels: string[];
  inboundCount: number;
}) {
  return (
    <Link
      href={`/books?id=${work.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-paper-raised transition-shadow hover:shadow-md"
    >
      <div
        className="relative flex h-28 items-end px-4 py-3"
        style={{ backgroundColor: copy.coverColor }}
      >
        {inboundCount > 0 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white">
            {inboundCount} cite{inboundCount === 1 ? "" : "s"} this
          </span>
        )}
        <span className="line-clamp-2 text-base font-semibold leading-snug text-white drop-shadow-sm">
          {work.title}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <p className="text-sm text-ink-muted">{authorNames.join(", ")}</p>
        {tagLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tagLabels.map((label) => (
              <TagChip key={label} label={label} muted />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
