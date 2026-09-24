/**
 * These tests guard the three properties that make the fixtures worth anything.
 * They are cheap, and each one has already been broken once by hand during
 * authoring:
 *
 * 1. No edge exists without evidence (spec §4's hard rule).
 * 2. No edge points backwards in time — a 2008 book cannot cite a 2011 one.
 * 3. The Kahneman cluster actually has the hub-and-spoke shape the prototype
 *    claims to demonstrate, including an unowned hub.
 */

import { describe, expect, it } from "vitest";
import { fixtures } from "../src/data/fixtures";
import {
  buildGraph,
  DEFAULT_LAYERS,
  hubs,
  inboundEdges,
  inboundReferenceCount,
  isOwned,
  outboundEdges,
  search,
} from "../src/data/selectors";

const d = fixtures;

describe("referential integrity", () => {
  it("every edge has a resolvable source copy", () => {
    for (const e of d.edges) {
      expect(
        d.copies.some((c) => c.id === e.source_copy_id),
        `edge ${e.id} has no source copy`,
      ).toBe(true);
    }
  });

  it("every edge target resolves, and exactly one target column is set", () => {
    for (const e of d.edges) {
      const set = [e.target_work_id, e.target_author_id, e.target_concept_id].filter(
        (v) => v !== null,
      );
      expect(set.length, `edge ${e.id} must have exactly one target`).toBe(1);

      if (e.target_work_id) {
        expect(d.works.some((w) => w.id === e.target_work_id), e.id).toBe(true);
      }
      if (e.target_author_id) {
        expect(d.authors.some((a) => a.id === e.target_author_id), e.id).toBe(true);
      }
      if (e.target_concept_id) {
        expect(d.concepts.some((c) => c.id === e.target_concept_id), e.id).toBe(true);
      }
    }
  });

  it("target column matches edge type", () => {
    for (const e of d.edges) {
      if (e.edge_type === "cites" || e.edge_type === "mentions") {
        expect(e.target_work_id, e.id).not.toBeNull();
      }
      if (e.edge_type === "attributes_to_author") {
        expect(e.target_author_id, e.id).not.toBeNull();
      }
      if (e.edge_type === "uses_idea") {
        expect(e.target_concept_id, e.id).not.toBeNull();
      }
    }
  });

  it("every copy belongs to a work, and no work has two copies", () => {
    const seen = new Set<string>();
    for (const c of d.copies) {
      expect(d.works.some((w) => w.id === c.work_id), c.id).toBe(true);
      expect(seen.has(c.work_id), `${c.work_id} has two copies`).toBe(false);
      seen.add(c.work_id);
    }
  });

  it("every note, highlight, tag link and concept link resolves", () => {
    for (const n of d.notes) {
      expect(d.copies.some((c) => c.id === n.copy_id), n.id).toBe(true);
      for (const t of n.tag_ids) expect(d.tags.some((x) => x.id === t), `${n.id}/${t}`).toBe(true);
      for (const k of n.concept_ids)
        expect(d.concepts.some((x) => x.id === k), `${n.id}/${k}`).toBe(true);
      if (n.highlight_id) {
        expect(d.highlights.some((h) => h.id === n.highlight_id), n.id).toBe(true);
      }
    }
    for (const h of d.highlights) {
      expect(d.copies.some((c) => c.id === h.copy_id), h.id).toBe(true);
    }
    for (const k of d.concepts) {
      if (k.originating_work_id) {
        expect(d.works.some((w) => w.id === k.originating_work_id), k.id).toBe(true);
      }
    }
  });

  it("ids are unique within every collection", () => {
    const check = (name: string, ids: string[]) =>
      expect(new Set(ids).size, `${name} has duplicate ids`).toBe(ids.length);
    check("works", d.works.map((w) => w.id));
    check("copies", d.copies.map((c) => c.id));
    check("edges", d.edges.map((e) => e.id));
    check("notes", d.notes.map((n) => n.id));
    check("concepts", d.concepts.map((c) => c.id));
    check("authors", d.authors.map((a) => a.id));
    check("tags", d.tags.map((t) => t.id));
  });
});

describe("spec §4 — evidence is mandatory", () => {
  it("no edge exists without a page and a quote", () => {
    for (const e of d.edges) {
      expect(e.evidence_page, `edge ${e.id} has no page`).toBeGreaterThan(0);
      expect(e.evidence_quote.trim().length, `edge ${e.id} has no quote`).toBeGreaterThan(20);
    }
  });

  it("confidence bands follow the table in the spec", () => {
    const expected = {
      cites: "high",
      mentions: "high",
      attributes_to_author: "medium",
      uses_idea: "low",
    } as const;
    for (const e of d.edges) {
      expect(e.confidence, `edge ${e.id}`).toBe(expected[e.edge_type]);
    }
  });

  it("evidence pages fall inside the source book", () => {
    for (const e of d.edges) {
      const copy = d.copies.find((c) => c.id === e.source_copy_id);
      expect(copy).toBeDefined();
      expect(e.evidence_page, `edge ${e.id} past end of ${copy!.id}`).toBeLessThanOrEqual(
        copy!.pages,
      );
    }
  });
});

describe("no edge points backwards in time", () => {
  it("a book never references a work published after it", () => {
    for (const e of d.edges) {
      if (!e.target_work_id) continue;
      const copy = d.copies.find((c) => c.id === e.source_copy_id)!;
      const source = d.works.find((w) => w.id === copy.work_id)!;
      const target = d.works.find((w) => w.id === e.target_work_id)!;
      expect(
        target.year,
        `${source.title} (${source.year}) cannot reference ${target.title} (${target.year})`,
      ).toBeLessThanOrEqual(source.year);
    }
  });

  it("a concept's originating work is not newer than the books using the idea", () => {
    for (const e of d.edges) {
      if (e.edge_type !== "uses_idea" || !e.target_concept_id) continue;
      const concept = d.concepts.find((c) => c.id === e.target_concept_id)!;
      if (!concept.originating_work_id) continue;
      const origin = d.works.find((w) => w.id === concept.originating_work_id)!;
      const copy = d.copies.find((c) => c.id === e.source_copy_id)!;
      const source = d.works.find((w) => w.id === copy.work_id)!;
      // Nudge (2008) using System 1 / System 2 is the deliberate exception: the
      // labels predate Thinking, Fast and Slow even though the book does not.
      if (source.id === "w-nudge") continue;
      expect(
        origin.year,
        `${source.title} uses ${concept.name} from ${origin.title} (${origin.year})`,
      ).toBeLessThanOrEqual(source.year);
    }
  });
});

describe("the Kahneman cluster has the shape the prototype claims", () => {
  it("Thinking, Fast and Slow is the top hub by inbound references", () => {
    const ranked = hubs(d, 3);
    expect(ranked[0]?.work.id).toBe("w-tfs");
    expect(ranked[0]?.count).toBeGreaterThanOrEqual(8);
  });

  it("at least one hub is a work the user does not own", () => {
    const unownedHubs = hubs(d, 10).filter((h) => !h.owned);
    expect(unownedHubs.length).toBeGreaterThan(0);
    // The 1982 collection: cited by six of the owned books, owned by nobody.
    const juu = unownedHubs.find((h) => h.work.id === "w-juu");
    expect(juu?.count).toBeGreaterThanOrEqual(5);
    expect(isOwned(d, "w-juu")).toBe(false);
  });

  it("the hub is genuinely larger than its spokes", () => {
    const tfs = inboundReferenceCount(d, "w-tfs");
    const spokes = ["w-range", "w-bets", "w-noise", "w-misbehaving"].map((id) =>
      inboundReferenceCount(d, id),
    );
    for (const s of spokes) expect(tfs).toBeGreaterThan(s);
  });

  it("inbound counts ignore the softer two edge types", () => {
    const softTargets = d.edges.filter(
      (e) => e.edge_type === "attributes_to_author" || e.edge_type === "uses_idea",
    );
    expect(softTargets.length).toBeGreaterThan(10);
    // Those edges have no target_work_id at all, so they cannot inflate a hub.
    for (const e of softTargets) expect(e.target_work_id).toBeNull();
  });

  it("some books cite the hub and also mention it in the text", () => {
    const both = d.copies.filter((c) => {
      const out = d.edges.filter((e) => e.source_copy_id === c.id && e.target_work_id === "w-tfs");
      return (
        out.some((e) => e.edge_type === "cites") && out.some((e) => e.edge_type === "mentions")
      );
    });
    expect(both.length).toBeGreaterThanOrEqual(3);
  });

  it("System 1 / System 2 is borrowed without attribution by several books", () => {
    const ideaEdges = d.edges.filter(
      (e) => e.edge_type === "uses_idea" && e.target_concept_id === "k-system12",
    );
    expect(ideaEdges.length).toBeGreaterThanOrEqual(3);
    // Including Nudge, which could not have cited the book that named them.
    expect(ideaEdges.some((e) => e.source_copy_id === "c-nudge")).toBe(true);
  });

  it("at least one concept has an unresolved origin and one originates outside the library", () => {
    expect(d.concepts.some((c) => c.originating_work_id === null)).toBe(true);
    const external = d.concepts.filter(
      (c) => c.originating_work_id && !isOwned(d, c.originating_work_id),
    );
    expect(external.length).toBeGreaterThan(0);
  });
});

describe("graph and panels", () => {
  it("the default graph excludes the uses_idea layer", () => {
    const graph = buildGraph(d, DEFAULT_LAYERS);
    expect(graph.links.some((l) => l.edge.edge_type === "uses_idea")).toBe(false);
    expect(graph.nodes.some((n) => n.kind === "concept")).toBe(false);
    expect(graph.nodes.some((n) => n.kind === "author")).toBe(true);
  });

  it("turning the idea layer on adds concept nodes without orphans", () => {
    const graph = buildGraph(d, { ...DEFAULT_LAYERS, uses_idea: true });
    expect(graph.nodes.some((n) => n.kind === "concept")).toBe(true);
    const ids = new Set(graph.nodes.map((n) => n.id));
    for (const l of graph.links) {
      expect(ids.has(l.source), l.id).toBe(true);
      expect(ids.has(l.target), l.id).toBe(true);
    }
  });

  it("an unowned work still has a populated Referenced by panel", () => {
    const inbound = inboundEdges(d, "w-juu");
    expect(inbound.length).toBeGreaterThanOrEqual(5);
    expect(outboundEdges(d, "c-juu")).toHaveLength(0);
  });

  it("References out splits into bibliography and in-text for the same book", () => {
    const out = outboundEdges(d, "c-noise");
    expect(out.filter((r) => r.edge.edge_type === "cites").length).toBeGreaterThan(0);
    expect(out.filter((r) => r.edge.edge_type === "mentions").length).toBeGreaterThan(0);
  });

  it("dismissing an edge removes it from inbound counts", () => {
    const before = inboundReferenceCount(d, "w-tfs");
    const target = d.edges.find(
      (e) => e.target_work_id === "w-tfs" && e.edge_type === "cites",
    )!;
    const mutated = {
      ...d,
      edges: d.edges.map((e) => (e.id === target.id ? { ...e, dismissed: true } : e)),
    };
    expect(inboundReferenceCount(mutated, "w-tfs")).toBe(before - 1);
  });
});

describe("search covers every entity kind", () => {
  it("finds works, authors, notes, concepts and tags", () => {
    const kinds = (q: string) => new Set(search(d, q).map((h) => h.kind));
    expect(kinds("Kahneman")).toContain("author");
    expect(kinds("Kahneman")).toContain("work");
    expect(kinds("System 1")).toContain("concept");
    expect(kinds("bibliography")).toContain("note");
    expect(kinds("forecasting")).toContain("tag");
  });

  it("ignores queries shorter than two characters", () => {
    expect(search(d, "a")).toHaveLength(0);
    expect(search(d, " ")).toHaveLength(0);
  });

  it("a note hit carries its book as context", () => {
    const hit = search(d, "bibliography").find((h) => h.kind === "note");
    expect(hit?.context).toMatch(/^Note on /);
  });
});
