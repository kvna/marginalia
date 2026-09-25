import type { Work, Copy } from "@/lib/types";

/**
 * Nine works. Seven are in the user's library (have a Copy). Two —
 * `w-jou` and `w-prospect` — are hubs the user references constantly but
 * has never added: they render as outline nodes in the graph. This is the
 * normal shape of a mature graph, not a special case.
 */
export const works: Work[] = [
  {
    id: "w-tfas",
    title: "Thinking, Fast and Slow",
    authorIds: ["a-kahneman"],
    year: 2011,
    copyId: "c-tfas",
  },
  {
    id: "w-nudge",
    title: "Nudge: The Final Edition",
    authorIds: ["a-thaler", "a-sunstein"],
    year: 2021,
    copyId: "c-nudge",
  },
  {
    id: "w-noise",
    title: "Noise: A Flaw in Human Judgment",
    authorIds: ["a-kahneman", "a-sibony", "a-sunstein"],
    year: 2021,
    copyId: "c-noise",
  },
  {
    id: "w-bets",
    title: "Thinking in Bets",
    authorIds: ["a-duke"],
    year: 2018,
    copyId: "c-bets",
  },
  {
    id: "w-undoing",
    title: "The Undoing Project",
    authorIds: ["a-lewis"],
    year: 2016,
    copyId: "c-undoing",
  },
  {
    id: "w-range",
    title: "Range",
    authorIds: ["a-epstein"],
    year: 2019,
    copyId: "c-range",
  },
  {
    id: "w-superforecasting",
    title: "Superforecasting",
    authorIds: ["a-tetlock", "a-gardner"],
    year: 2015,
    copyId: "c-superforecasting",
  },
  // Unowned hubs — referenced constantly, never added to the library.
  {
    id: "w-jou",
    title: "Judgment Under Uncertainty: Heuristics and Biases",
    authorIds: ["a-kahneman", "a-slovic", "a-tversky"],
    year: 1982,
  },
  {
    id: "w-prospect",
    title: "Prospect Theory: An Analysis of Decision under Risk",
    authorIds: ["a-kahneman", "a-tversky"],
    year: 1979,
  },
];

export const copies: Copy[] = [
  {
    id: "c-tfas",
    workId: "w-tfas",
    coverColor: "#c1440e",
    addedAt: "2025-01-08",
    fileName: "thinking-fast-and-slow.pdf",
    tagIds: ["t-behavioral-econ", "t-psychology", "t-judgment"],
    location: "onedrive",
  },
  {
    id: "c-nudge",
    workId: "w-nudge",
    coverColor: "#2f6fed",
    addedAt: "2025-01-15",
    fileName: "nudge-final-edition.pdf",
    tagIds: ["t-behavioral-econ", "t-policy"],
    location: "onedrive",
  },
  {
    id: "c-noise",
    workId: "w-noise",
    coverColor: "#189a6c",
    addedAt: "2025-02-02",
    fileName: "noise.pdf",
    tagIds: ["t-judgment", "t-decision-making"],
    location: "onedrive",
  },
  {
    id: "c-bets",
    workId: "w-bets",
    coverColor: "#c98a1c",
    addedAt: "2025-02-20",
    fileName: "thinking-in-bets.pdf",
    tagIds: ["t-decision-making", "t-poker"],
    location: "onedrive",
  },
  {
    id: "c-undoing",
    workId: "w-undoing",
    coverColor: "#9b3fd1",
    addedAt: "2025-03-04",
    fileName: "the-undoing-project.pdf",
    tagIds: ["t-biography", "t-psychology"],
    location: "onedrive",
  },
  {
    id: "c-range",
    workId: "w-range",
    coverColor: "#1c1a17",
    addedAt: "2025-03-19",
    fileName: "range.pdf",
    tagIds: ["t-decision-making", "t-sports-science"],
    location: "onedrive",
  },
  {
    id: "c-superforecasting",
    workId: "w-superforecasting",
    coverColor: "#6b655c",
    addedAt: "2025-04-02",
    fileName: "superforecasting.pdf",
    tagIds: ["t-forecasting", "t-decision-making"],
    location: "onedrive",
  },
];
