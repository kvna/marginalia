"use client";

import { useMemo, useState } from "react";
import type { Tag } from "@/lib/types";

/** Multi-select with autocomplete over existing tags, plus create-on-the-fly. */
export function TagPicker({
  allTags,
  selectedIds,
  onChange,
  onCreate,
}: {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onCreate: (label: string) => Tag;
}) {
  const [query, setQuery] = useState("");
  const selected = allTags.filter((t) => selectedIds.includes(t.id));

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allTags
      .filter((t) => !selectedIds.includes(t.id) && t.label.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allTags, query, selectedIds]);

  const exactExists = allTags.some((t) => t.label.toLowerCase() === query.trim().toLowerCase());

  function add(tag: Tag) {
    onChange([...selectedIds, tag.id]);
    setQuery("");
  }

  function remove(id: string) {
    onChange(selectedIds.filter((s) => s !== id));
  }

  function createAndAdd() {
    const label = query.trim();
    if (!label) return;
    add(onCreate(label));
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full bg-tag-soft px-2.5 py-0.5 text-xs font-medium text-tag"
            >
              {t.label}
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-tag/70 hover:text-tag"
                aria-label={`Remove ${t.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions[0]) add(suggestions[0]);
              else createAndAdd();
            }
          }}
          placeholder="Add a tag…"
          className="w-full rounded-md border border-line bg-paper-raised px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
        />
        {query.trim() && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-line bg-paper-raised shadow-lg">
            {suggestions.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => add(t)}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-paper-sunken"
              >
                {t.label}
              </button>
            ))}
            {!exactExists && (
              <button
                type="button"
                onClick={createAndAdd}
                className="block w-full px-3 py-1.5 text-left text-sm text-accent-ink hover:bg-accent-soft"
              >
                Create “{query.trim()}”
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
