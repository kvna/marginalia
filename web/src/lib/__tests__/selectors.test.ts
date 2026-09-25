import { describe, expect, it } from "vitest";
import { initialLibrary } from "@/lib/fixtures";
import {
  inboundCount,
  isBibliographyEdge,
  isOwned,
  referencedBy,
  referencesOut,
  worksTouchingConcept,
} from "@/lib/selectors";

describe("selectors against the Kahneman-cluster fixtures", () => {
  it("makes Thinking, Fast and Slow the biggest hub by inbound references", () => {
    const counts = initialLibrary.works.map((w) => ({
      id: w.id,
      inbound: inboundCount(initialLibrary, w.id),
    }));
    const tfas = counts.find((c) => c.id === "w-tfas")!;
    const others = counts.filter((c) => c.id !== "w-tfas");
    expect(tfas.inbound).toBeGreaterThan(0);
    for (const other of others) {
      expect(tfas.inbound).toBeGreaterThanOrEqual(other.inbound);
    }
  });

  it("keeps unowned hub works unowned but still referenceable", () => {
    const jou = initialLibrary.works.find((w) => w.id === "w-jou")!;
    expect(isOwned(jou)).toBe(false);
    expect(referencedBy(initialLibrary, jou.id).length).toBeGreaterThan(0);
  });

  it("splits references out into bibliography vs mentioned-in-text", () => {
    const outEdges = referencesOut(initialLibrary, "w-superforecasting");
    const bibliography = outEdges.filter((e) => isBibliographyEdge(e.type));
    const mentioned = outEdges.filter((e) => !isBibliographyEdge(e.type));
    expect(bibliography.length).toBeGreaterThan(0);
    expect(bibliography.every((e) => e.type === "cites")).toBe(true);
    expect(mentioned.every((e) => e.type !== "cites")).toBe(true);
  });

  it("respects an enabled-edge-types filter when counting inbound references", () => {
    const allTypes = new Set(["cites", "mentions", "attributes-to-author", "uses-idea"] as const);
    const citesOnly = new Set(["cites"] as const);
    const withAll = inboundCount(initialLibrary, "w-tfas", allTypes);
    const withCitesOnly = inboundCount(initialLibrary, "w-tfas", citesOnly);
    expect(withCitesOnly).toBeLessThanOrEqual(withAll);
  });

  it("finds every book that touches a concept, including the one it originated in", () => {
    const touching = worksTouchingConcept(initialLibrary, "co-sys1sys2");
    const ids = touching.map((w) => w.id);
    expect(ids).toContain("w-tfas");
    expect(touching.length).toBeGreaterThan(1);
  });
});
