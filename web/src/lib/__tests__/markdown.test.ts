import { describe, expect, it } from "vitest";
import { extractConceptTokens, findOpenConceptQuery } from "@/lib/markdown";

describe("extractConceptTokens", () => {
  it("finds every [[concept]] token in a note body", () => {
    const body = "Kahneman's [[System 1 / System 2]] framing echoes [[Loss aversion]] later on.";
    expect(extractConceptTokens(body)).toEqual(["System 1 / System 2", "Loss aversion"]);
  });

  it("returns nothing when there are no tokens", () => {
    expect(extractConceptTokens("Plain text, no links.")).toEqual([]);
  });
});

describe("findOpenConceptQuery", () => {
  it("detects an unclosed [[ token at the cursor", () => {
    const text = "Reread the chapter on [[Sys";
    expect(findOpenConceptQuery(text, text.length)).toBe("Sys");
  });

  it("returns null once the token is closed", () => {
    const text = "Reread the chapter on [[System 1]] and move on";
    expect(findOpenConceptQuery(text, text.length)).toBeNull();
  });

  it("returns null when there is no open bracket at all", () => {
    expect(findOpenConceptQuery("no brackets here", 5)).toBeNull();
  });

  it("does not leak across a newline", () => {
    const text = "[[Old token\nNew line typing here";
    expect(findOpenConceptQuery(text, text.length)).toBeNull();
  });
});
