/**
 * Best-guess metadata for a file the sync found that doesn't match a Work
 * yet (SUP-14). The real pipeline extracts text from the first few pages of
 * the PDF and falls back to the filename when a page is image-only; the
 * prototype has no PDF parser, so `DiscoveredFile.scanned_text` stands in for
 * that extraction and these two functions run the same matching logic a real
 * implementation would. The signature — takes a DiscoveredFile, returns a
 * BookGuess — is what should stay stable when the real scan replaces the
 * fixture text.
 */

import type { Confidence, DiscoveredFile } from "@/data/types";

export interface BookGuess {
  title: string;
  author: string;
  year: number | null;
  confidence: Confidence;
  /** Which signal produced this guess, shown in the UI so a low-confidence
   *  filename guess and a high-confidence content guess never look the same. */
  source: "content" | "filename";
}

const YEAR_RE = /\b(1[89]\d{2}|20\d{2})\b/;

function titleCase(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => (w === w.toUpperCase() && w.length > 1 ? w[0] + w.slice(1).toLowerCase() : w))
    .join(" ");
}

function cleanStem(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Sometimes the file name is all there is — "Author - Title (Year).pdf" and its variants. */
export function guessFromFilename(filePath: string): BookGuess {
  const fileName = filePath.split("/").pop() ?? filePath;
  const yearMatch = fileName.match(YEAR_RE);
  const stem = cleanStem(fileName.replace(/\((?:1[89]|20)\d{2}\)/, ""));

  const dashParts = stem.split(/\s+-\s+/).filter(Boolean);
  if (dashParts.length >= 2 && dashParts[0]) {
    const [first, ...rest] = dashParts;
    const title = rest.join(" - ").trim();
    // This library already names files "Author - Title.pdf" (see fixtures.ts
    // copies) — a short first segment with no digits reads as the author.
    if (first.split(" ").length <= 4 && !/\d/.test(first)) {
      return {
        title: titleCase(title),
        author: first.trim(),
        year: yearMatch ? Number(yearMatch[1]) : null,
        confidence: yearMatch ? "high" : "medium",
        source: "filename",
      };
    }
  }

  const fallbackTitle = titleCase(stem.replace(/\d+/g, "").replace(/\s+/g, " ").trim());
  return {
    title: fallbackTitle || "Untitled",
    author: "",
    year: yearMatch ? Number(yearMatch[1]) : null,
    confidence: "low",
    source: "filename",
  };
}

/** "Scan the first few pages" — a title page usually gives title, author and year, in that order. */
export function guessFromScannedText(text: string): BookGuess {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const yearMatch = text.match(YEAR_RE);
  const byLine = lines.find((l) => /^by\s+/i.test(l));
  const author = byLine ? byLine.replace(/^by\s+/i, "").trim() : "";
  const titleLine = lines.find((l) => l !== byLine);
  const title = titleLine ? titleCase(titleLine) : "";

  return {
    title: title || "Untitled",
    author,
    year: yearMatch ? Number(yearMatch[1]) : null,
    confidence: title && author ? "high" : title ? "medium" : "low",
    source: "content",
  };
}

/** Content beats filename when it actually yields something; otherwise fall back. */
export function bestGuess(file: DiscoveredFile): BookGuess {
  if (file.scanned_text) {
    const fromText = guessFromScannedText(file.scanned_text);
    if (fromText.confidence !== "low") return fromText;
  }
  return guessFromFilename(file.file_path);
}
