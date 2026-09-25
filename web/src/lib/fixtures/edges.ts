import type { Edge } from "@/lib/types";

/**
 * The Kahneman cluster. `Thinking, Fast and Slow` sits at the centre;
 * six books the user owns point back at it or at the Kahneman/Tversky
 * research it popularised — some citing the book directly, some citing
 * the underlying papers, some borrowing System 1 / System 2 with no
 * citation at all. `Judgment Under Uncertainty` and `Prospect Theory`
 * are hubs in their own right, and the user doesn't own either.
 */
export const edges: Edge[] = [
  {
    id: "e-nudge-cites-tfas",
    type: "cites",
    fromWorkId: "w-nudge",
    toWorkId: "w-tfas",
    evidence: {
      page: 412,
      quote: "Kahneman, Daniel. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux, 2011.",
    },
  },
  {
    id: "e-nudge-cites-prospect",
    type: "cites",
    fromWorkId: "w-nudge",
    toWorkId: "w-prospect",
    evidence: {
      page: 406,
      quote: "Kahneman, Daniel, and Amos Tversky. \"Prospect Theory: An Analysis of Decision under Risk.\" Econometrica 47, no. 2 (1979).",
    },
  },
  {
    id: "e-noise-cites-tfas",
    type: "cites",
    fromWorkId: "w-noise",
    toWorkId: "w-tfas",
    evidence: {
      page: 389,
      quote: "As one of us explored at length in an earlier book, the intuitive System 1 is not built for this kind of task.",
    },
  },
  {
    id: "e-noise-cites-jou",
    type: "cites",
    fromWorkId: "w-noise",
    toWorkId: "w-jou",
    evidence: {
      page: 391,
      quote: "Kahneman, D., P. Slovic, and A. Tversky, eds. Judgment Under Uncertainty: Heuristics and Biases. Cambridge University Press, 1982.",
    },
  },
  {
    id: "e-bets-cites-tfas",
    type: "cites",
    fromWorkId: "w-bets",
    toWorkId: "w-tfas",
    evidence: {
      page: 214,
      quote: "Kahneman, Daniel. Thinking, Fast and Slow. Farrar, Straus and Giroux, 2011.",
    },
  },
  {
    id: "e-bets-attributes-prospect",
    type: "attributes-to-author",
    fromWorkId: "w-bets",
    toWorkId: "w-prospect",
    evidence: {
      page: 97,
      quote: "As Kahneman and Tversky found, we feel the sting of a loss about twice as much as the pleasure of an equivalent gain.",
    },
  },
  {
    id: "e-undoing-mentions-tfas",
    type: "mentions",
    fromWorkId: "w-undoing",
    toWorkId: "w-tfas",
    evidence: {
      page: 3,
      quote: "Thinking, Fast and Slow would become an unlikely international bestseller, and turn its author into an intellectual celebrity.",
    },
  },
  {
    id: "e-undoing-attributes-jou",
    type: "attributes-to-author",
    fromWorkId: "w-undoing",
    toWorkId: "w-jou",
    evidence: {
      page: 251,
      quote: "The heuristics and biases they had catalogued together were now simply part of how psychologists thought about thinking.",
    },
  },
  {
    id: "e-range-mentions-tfas",
    type: "mentions",
    fromWorkId: "w-range",
    toWorkId: "w-tfas",
    evidence: {
      page: 144,
      quote: "Daniel Kahneman's Thinking, Fast and Slow made the case for structured, checklist-driven judgment over intuition.",
    },
  },
  {
    id: "e-range-uses-idea-tfas",
    type: "uses-idea",
    fromWorkId: "w-range",
    toWorkId: "w-tfas",
    evidence: {
      page: 233,
      quote: "The slow, deliberate mode of analysis — as opposed to the fast, pattern-matching one — is what separates the two regimes.",
    },
  },
  {
    id: "e-superforecasting-cites-tfas",
    type: "cites",
    fromWorkId: "w-superforecasting",
    toWorkId: "w-tfas",
    evidence: {
      page: 341,
      quote: "Kahneman, Daniel. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux, 2011.",
    },
  },
  {
    id: "e-superforecasting-cites-jou",
    type: "cites",
    fromWorkId: "w-superforecasting",
    toWorkId: "w-jou",
    evidence: {
      page: 342,
      quote: "Kahneman, D., P. Slovic, and A. Tversky, eds. Judgment Under Uncertainty. Cambridge University Press, 1982.",
    },
  },
];
