/**
 * SUP-14 — "if the book doesn't exist, sync appears to do nothing." These
 * guesses are what replaces that silence, so the three failure modes of a
 * real scan (clean filename, messy filename rescued by page text, no text at
 * all) each need a guess that is honest about how confident it is.
 */

import { describe, expect, it } from "vitest";
import { bestGuess, guessFromFilename, guessFromScannedText } from "../src/lib/bookGuess";
import { fixtures } from "../src/data/fixtures";

describe("guessFromFilename", () => {
  it("reads 'Author - Title.pdf' as author and title, medium confidence with no year", () => {
    const guess = guessFromFilename("OneDrive/Books/Gigerenzer - Risk Savvy.pdf");
    expect(guess.author).toBe("Gigerenzer");
    expect(guess.title).toBe("Risk Savvy");
    expect(guess.year).toBeNull();
    expect(guess.confidence).toBe("medium");
    expect(guess.source).toBe("filename");
  });

  it("pulls a year out of the filename when present", () => {
    const guess = guessFromFilename("Books/Ariely - Predictably Irrational (2008).pdf");
    expect(guess.year).toBe(2008);
    expect(guess.confidence).toBe("high");
  });

  it("falls back to a low-confidence title guess for a name with no structure", () => {
    const guess = guessFromFilename("OneDrive/Books/scan_2026-09-18_0043.pdf");
    expect(guess.author).toBe("");
    expect(guess.confidence).toBe("low");
    expect(guess.source).toBe("filename");
  });
});

describe("guessFromScannedText", () => {
  it("reads a title page: title, 'by Author', and a year", () => {
    const guess = guessFromScannedText(
      "THE SIGNAL AND THE NOISE\nWhy So Many Predictions Fail—but Some Don't\nby Nate Silver\nPenguin Press, New York, 2012",
    );
    expect(guess.title).toBe("The Signal And The Noise");
    expect(guess.author).toBe("Nate Silver");
    expect(guess.year).toBe(2012);
    expect(guess.confidence).toBe("high");
    expect(guess.source).toBe("content");
  });
});

describe("bestGuess", () => {
  it("prefers scanned text over a useless filename", () => {
    const file = fixtures.discovered.find((f) => f.id === "df-signal-noise")!;
    const guess = bestGuess(file);
    expect(guess.source).toBe("content");
    expect(guess.author).toBe("Nate Silver");
  });

  it("falls back to the filename when there is no scanned text", () => {
    const file = fixtures.discovered.find((f) => f.id === "df-risk-savvy")!;
    const guess = bestGuess(file);
    expect(guess.source).toBe("filename");
    expect(guess.author).toBe("Gigerenzer");
  });

  it("never crashes on an unreadable scan with a meaningless filename", () => {
    const file = fixtures.discovered.find((f) => f.id === "df-unscanned")!;
    const guess = bestGuess(file);
    expect(guess.confidence).toBe("low");
    expect(guess.title.length).toBeGreaterThan(0);
  });
});
