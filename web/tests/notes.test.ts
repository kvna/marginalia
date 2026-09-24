/**
 * The `[[concept]]` syntax is a foreign key wearing a text convention, so the
 * extraction is worth testing directly — a note that saves with the wrong
 * concept links is a note that silently drops out of the concepts browser and the
 * graph's idea layer.
 */

import { describe, expect, it } from "vitest";
import { extractConceptLinks } from "../src/lib/concepts";
import { fixtures } from "../src/data/fixtures";
import { conceptByName, conceptWeight } from "../src/data/selectors";

describe("extractConceptLinks", () => {
  it("pulls names out of a body and de-duplicates them", () => {
    const body = "Uses [[System 1 / System 2]] and again [[System 1 / System 2]], plus [[WYSIATI]].";
    expect(extractConceptLinks(body)).toEqual(["System 1 / System 2", "WYSIATI"]);
  });

  it("trims whitespace inside the brackets", () => {
    expect(extractConceptLinks("a [[  Anchoring  ]] b")).toEqual(["Anchoring"]);
  });

  it("ignores single brackets and unclosed links", () => {
    expect(extractConceptLinks("[not a link] and [[unclosed")).toEqual([]);
  });

  it("finds nothing in an empty body", () => {
    expect(extractConceptLinks("")).toEqual([]);
  });
});

describe("every [[link]] in the seeded notes resolves", () => {
  it("has a matching concept for each link in every note body", () => {
    for (const note of fixtures.notes) {
      for (const name of extractConceptLinks(note.body)) {
        expect(conceptByName(fixtures, name), `${note.id} links "${name}"`).toBeDefined();
      }
    }
  });

  it("stored concept_ids match the links actually written in the body", () => {
    for (const note of fixtures.notes) {
      const fromBody = extractConceptLinks(note.body)
        .map((n) => conceptByName(fixtures, n)?.id)
        .filter((id): id is string => Boolean(id))
        .sort();
      expect([...note.concept_ids].sort(), note.id).toEqual(fromBody);
    }
  });
});

describe("concept weight drives visual emphasis", () => {
  it("System 1 / System 2 is the heaviest concept", () => {
    const weights = fixtures.concepts.map((c) => ({
      id: c.id,
      total: conceptWeight(fixtures, c.id).total,
    }));
    const top = weights.sort((a, b) => b.total - a.total)[0];
    expect(top?.id).toBe("k-system12");
  });

  it("counts notes and idea edges separately", () => {
    const w = conceptWeight(fixtures, "k-system12");
    expect(w.noteCount).toBeGreaterThan(0);
    expect(w.ideaEdgeCount).toBeGreaterThan(0);
    expect(w.total).toBe(w.noteCount + w.ideaEdgeCount);
  });
});
