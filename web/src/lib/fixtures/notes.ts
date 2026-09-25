import type { Highlight, Note } from "@/lib/types";

export const highlights: Highlight[] = [
  {
    id: "h-tfas-1",
    copyId: "c-tfas",
    page: 20,
    quote: "Nothing in life is as important as you think it is, while you are thinking about it.",
  },
  {
    id: "h-tfas-2",
    copyId: "c-tfas",
    page: 209,
    quote: "We can be blind to the obvious, and we are also blind to our blindness.",
  },
  {
    id: "h-nudge-1",
    copyId: "c-nudge",
    page: 87,
    quote: "A nudge... is any aspect of the choice architecture that alters people's behavior in a predictable way without forbidding any options.",
  },
  {
    id: "h-noise-1",
    copyId: "c-noise",
    page: 12,
    quote: "Wherever there is judgment, there is noise, and more of it than you think.",
  },
  {
    id: "h-bets-1",
    copyId: "c-bets",
    page: 33,
    quote: "Resulting: judging a decision by its outcome rather than the quality of the decision itself.",
  },
  {
    id: "h-undoing-1",
    copyId: "c-undoing",
    page: 261,
    quote: "It was the fact of their collaboration, and the strange, ego-less way they went about it, that was so odd.",
  },
  {
    id: "h-range-1",
    copyId: "c-range",
    page: 74,
    quote: "Breadth of training predicts breadth of transfer.",
  },
  {
    id: "h-superforecasting-1",
    copyId: "c-superforecasting",
    page: 118,
    quote: "Forecasters who update their views in small increments, often, do better than those who cling to a big call.",
  },
];

export const notes: Note[] = [
  // Thinking, Fast and Slow
  {
    id: "n-tfas-1",
    copyId: "c-tfas",
    title: "The two-system framing",
    body:
      "Kahneman's whole book rests on [[System 1 / System 2]] as a metaphor, not a literal claim about brain anatomy. Worth remembering when other authors (Duke, Epstein) borrow the framing wholesale later.\n\nSee also the closing chapters on [[Illusion of validity]] — confidence tracks coherence of the story, not its accuracy.",
    tagIds: ["t-judgment", "t-psychology"],
    conceptIds: ["co-sys1sys2", "co-illusion-validity"],
    highlightId: "h-tfas-1",
    createdAt: "2025-01-10T09:12:00Z",
    updatedAt: "2025-01-10T09:12:00Z",
  },
  {
    id: "n-tfas-2",
    copyId: "c-tfas",
    title: "Overconfidence in experts",
    body:
      "Chapter 20 is the one to reread before trusting any confident-sounding pundit. Directly relevant to how Tetlock later measures [[System 1 / System 2]] style overconfidence in *Superforecasting*.",
    tagIds: ["t-judgment"],
    conceptIds: ["co-sys1sys2"],
    highlightId: "h-tfas-2",
    createdAt: "2025-01-18T14:30:00Z",
    updatedAt: "2025-01-22T11:05:00Z",
  },
  // Nudge
  {
    id: "n-nudge-1",
    copyId: "c-nudge",
    title: "Defaults as the strongest nudge",
    body:
      "The book's central claim: [[Choice architecture]] isn't neutral — someone designs the default, so it might as well be designed well. Direct line back to Kahneman's System 1 as the thing being nudged.",
    tagIds: ["t-behavioral-econ", "t-policy"],
    conceptIds: ["co-choice-architecture", "co-sys1sys2"],
    highlightId: "h-nudge-1",
    createdAt: "2025-01-16T10:00:00Z",
    updatedAt: "2025-01-16T10:00:00Z",
  },
  {
    id: "n-nudge-2",
    copyId: "c-nudge",
    title: "Where nudge theory gets criticised",
    body:
      "Final edition adds a chapter responding to the \"nudge vs. mandate\" critique. Still leans on [[Loss aversion]] to explain why opt-out schemes outperform opt-in.",
    tagIds: ["t-policy"],
    conceptIds: ["co-loss-aversion"],
    createdAt: "2025-01-20T16:45:00Z",
    updatedAt: "2025-01-20T16:45:00Z",
  },
  // Noise
  {
    id: "n-noise-1",
    copyId: "c-noise",
    title: "Noise is not bias",
    body:
      "The book's core distinction: bias is systematic error in one direction; [[Noise (judgment variability)]] is scatter with no direction at all. Both hurt accuracy, but they need different fixes.",
    tagIds: ["t-judgment", "t-decision-making"],
    conceptIds: ["co-noise"],
    highlightId: "h-noise-1",
    createdAt: "2025-02-05T08:20:00Z",
    updatedAt: "2025-02-05T08:20:00Z",
  },
  {
    id: "n-noise-2",
    copyId: "c-noise",
    title: "Decision hygiene checklist",
    body:
      "Practical takeaway chapter — structured judgment protocols to reduce [[Noise (judgment variability)]] in hiring and underwriting decisions. Worth a reread before any panel interview.",
    tagIds: ["t-decision-making"],
    conceptIds: ["co-noise"],
    createdAt: "2025-02-10T13:00:00Z",
    updatedAt: "2025-02-10T13:00:00Z",
  },
  // Thinking in Bets
  {
    id: "n-bets-1",
    copyId: "c-bets",
    title: "Resulting",
    body:
      "Duke's poker framing of \"resulting\" is basically [[Illusion of validity]] applied to outcomes rather than judgments. Judge the decision, not the result — hard to do when the result is loud.",
    tagIds: ["t-poker", "t-decision-making"],
    conceptIds: ["co-illusion-validity"],
    highlightId: "h-bets-1",
    createdAt: "2025-02-22T19:00:00Z",
    updatedAt: "2025-02-22T19:00:00Z",
  },
  {
    id: "n-bets-2",
    copyId: "c-bets",
    title: "Betting language for certainty",
    body:
      "Reframe beliefs as odds, not binaries — forces you to notice [[Loss aversion]] creeping into how confidently you state things.",
    tagIds: ["t-poker"],
    conceptIds: ["co-loss-aversion"],
    createdAt: "2025-02-25T09:40:00Z",
    updatedAt: "2025-02-25T09:40:00Z",
  },
  // The Undoing Project
  {
    id: "n-undoing-1",
    copyId: "c-undoing",
    title: "The collaboration itself",
    body:
      "Lewis is less interested in the findings than in how two people thought together. Good companion read after *Thinking, Fast and Slow* — puts [[System 1 / System 2]] in its biographical context.",
    tagIds: ["t-biography", "t-psychology"],
    conceptIds: ["co-sys1sys2"],
    highlightId: "h-undoing-1",
    createdAt: "2025-03-06T12:00:00Z",
    updatedAt: "2025-03-06T12:00:00Z",
  },
  {
    id: "n-undoing-2",
    copyId: "c-undoing",
    title: "Tversky's shadow",
    body:
      "Tversky doesn't get his own bestseller; this book is partly Lewis correcting for that. Frames [[Anchoring]] and the other heuristics as joint work, credited unevenly by history.",
    tagIds: ["t-biography"],
    conceptIds: ["co-anchoring"],
    createdAt: "2025-03-10T15:15:00Z",
    updatedAt: "2025-03-10T15:15:00Z",
  },
  // Range
  {
    id: "n-range-1",
    copyId: "c-range",
    title: "Kind vs. wicked learning environments",
    body:
      "Epstein's central distinction. In \"kind\" domains fast intuition (System 1-ish) works; in \"wicked\" ones it actively misleads. Direct pushback on over-applying [[System 1 / System 2]] pattern matching outside its home turf.",
    tagIds: ["t-decision-making", "t-sports-science"],
    conceptIds: ["co-sys1sys2"],
    highlightId: "h-range-1",
    createdAt: "2025-03-21T10:30:00Z",
    updatedAt: "2025-03-21T10:30:00Z",
  },
  {
    id: "n-range-2",
    copyId: "c-range",
    title: "Sampling before specializing",
    body:
      "The sports-science chapters (Federer vs. Tiger) generalize surprisingly well to career advice. Loosely tagged to [[Anchoring]] — early specialization as an anchor you never revisit.",
    tagIds: ["t-sports-science"],
    conceptIds: ["co-anchoring"],
    createdAt: "2025-03-25T17:50:00Z",
    updatedAt: "2025-03-25T17:50:00Z",
  },
  // Superforecasting
  {
    id: "n-superforecasting-1",
    copyId: "c-superforecasting",
    title: "Foxes beat hedgehogs",
    body:
      "Tetlock's Good Judgment Project data: forecasters who hold views loosely and update often outperform confident pundits. Reads as [[Illusion of validity]] turned into a measurable, trainable failure mode.",
    tagIds: ["t-forecasting", "t-decision-making"],
    conceptIds: ["co-illusion-validity"],
    highlightId: "h-superforecasting-1",
    createdAt: "2025-04-04T08:00:00Z",
    updatedAt: "2025-04-04T08:00:00Z",
  },
  {
    id: "n-superforecasting-2",
    copyId: "c-superforecasting",
    title: "Granular probabilities",
    body:
      "The 0-100% scale in 1% increments forces precision that plain language ([[System 1 / System 2]]-style hedging: \"probably\", \"likely\") hides. Small habit, large effect on the Brier scores in the appendix.",
    tagIds: ["t-forecasting"],
    conceptIds: ["co-sys1sys2"],
    createdAt: "2025-04-08T11:25:00Z",
    updatedAt: "2025-04-08T11:25:00Z",
  },
];
