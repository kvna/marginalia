/**
 * Seeded library: the real Kahneman cluster.
 *
 * Three rules this file holds itself to, because the point of the prototype is
 * to demonstrate the actual claim rather than to look full:
 *
 * 1. Real books, real authors, real publication years.
 * 2. No edge points backwards in time. *Nudge* (2008) cannot cite *Thinking,
 *    Fast and Slow* (2011) — so it doesn't. It cites the 1979 and 1982 sources
 *    and borrows System 1 / System 2 without naming anyone, which is exactly the
 *    `uses_idea` case the graph exists to show.
 * 3. Every edge carries a page and a sentence. Evidence text is plausible
 *    rather than verified against the physical page — flagged as such in the UI
 *    — but it is never absent.
 *
 * `inbound_reference_count` from spec §5 is *not* stored here. At fixture scale
 * it is derived in selectors.ts from the edge list, so it cannot drift out of
 * sync with the edges while the prototype is being edited.
 */

import type { LibraryData } from "./types";

const norm = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const fixtures: LibraryData = {
  authors: [
    {
      id: "a-kahneman",
      name: "Daniel Kahneman",
      aliases: ["Kahneman, D.", "D. Kahneman", "Kahneman"],
      openlibrary_author_id: "OL233414A",
    },
    {
      id: "a-tversky",
      name: "Amos Tversky",
      aliases: ["Tversky, A.", "A. Tversky", "Tversky"],
      openlibrary_author_id: "OL233415A",
    },
    {
      id: "a-thaler",
      name: "Richard H. Thaler",
      aliases: ["Thaler, R.", "R. H. Thaler", "Thaler"],
      openlibrary_author_id: "OL1394359A",
    },
    {
      id: "a-sunstein",
      name: "Cass R. Sunstein",
      aliases: ["Sunstein, C. R.", "C. Sunstein"],
      openlibrary_author_id: "OL233416A",
    },
    {
      id: "a-sibony",
      name: "Olivier Sibony",
      aliases: ["Sibony, O."],
      openlibrary_author_id: null,
    },
    {
      id: "a-slovic",
      name: "Paul Slovic",
      aliases: ["Slovic, P."],
      openlibrary_author_id: null,
    },
    {
      id: "a-duke",
      name: "Annie Duke",
      aliases: ["Duke, A."],
      openlibrary_author_id: null,
    },
    {
      id: "a-lewis",
      name: "Michael Lewis",
      aliases: ["Lewis, M."],
      openlibrary_author_id: "OL18319A",
    },
    {
      id: "a-epstein",
      name: "David Epstein",
      aliases: ["Epstein, D."],
      openlibrary_author_id: null,
    },
    {
      id: "a-tetlock",
      name: "Philip E. Tetlock",
      aliases: ["Tetlock, P. E.", "Tetlock"],
      openlibrary_author_id: null,
    },
    {
      id: "a-gardner",
      name: "Dan Gardner",
      aliases: ["Gardner, D."],
      openlibrary_author_id: null,
    },
    {
      id: "a-ariely",
      name: "Dan Ariely",
      aliases: ["Ariely, D."],
      openlibrary_author_id: null,
    },
    {
      id: "a-taleb",
      name: "Nassim Nicholas Taleb",
      aliases: ["Taleb, N. N.", "Taleb"],
      openlibrary_author_id: null,
    },
    {
      id: "a-ericsson",
      name: "K. Anders Ericsson",
      aliases: ["Ericsson, K. A.", "Ericsson"],
      openlibrary_author_id: null,
    },
    {
      id: "a-pool",
      name: "Robert Pool",
      aliases: ["Pool, R."],
      openlibrary_author_id: null,
    },
    {
      id: "a-gladwell",
      name: "Malcolm Gladwell",
      aliases: ["Gladwell, M."],
      openlibrary_author_id: "OL23919A",
    },
    {
      // Freshly imported via the OneDrive pickup pipeline — not part of the
      // Kahneman cluster, and no OpenLibrary lookup has run yet.
      id: "a-mccraw",
      name: "Thomas K. McCraw",
      aliases: ["McCraw, T. K.", "McCraw"],
      openlibrary_author_id: null,
    },
  ],

  works: [
    // ---- Owned ----
    {
      id: "w-tfs",
      title: "Thinking, Fast and Slow",
      normalized_title: norm("Thinking, Fast and Slow"),
      author_ids: ["a-kahneman"],
      year: 2011,
      kind: "book",
      openlibrary_work_id: "OL16305592W",
      isbn13: "9780374275631",
      cover: { hue: 28, glyph: "TF" },
    },
    {
      id: "w-nudge",
      title: "Nudge",
      subtitle: "Improving Decisions About Health, Wealth, and Happiness",
      normalized_title: norm("Nudge"),
      author_ids: ["a-thaler", "a-sunstein"],
      year: 2008,
      kind: "book",
      openlibrary_work_id: "OL5720557W",
      isbn13: "9780300122237",
      cover: { hue: 168, glyph: "NU" },
    },
    {
      id: "w-noise",
      title: "Noise",
      subtitle: "A Flaw in Human Judgment",
      normalized_title: norm("Noise"),
      author_ids: ["a-kahneman", "a-sibony", "a-sunstein"],
      year: 2021,
      kind: "book",
      openlibrary_work_id: "OL22997062W",
      isbn13: "9780316451406",
      cover: { hue: 212, glyph: "NO" },
    },
    {
      id: "w-bets",
      title: "Thinking in Bets",
      subtitle: "Making Smarter Decisions When You Don't Have All the Facts",
      normalized_title: norm("Thinking in Bets"),
      author_ids: ["a-duke"],
      year: 2018,
      kind: "book",
      openlibrary_work_id: "OL19818912W",
      isbn13: "9780735216350",
      cover: { hue: 312, glyph: "TB" },
    },
    {
      id: "w-undoing",
      title: "The Undoing Project",
      subtitle: "A Friendship That Changed Our Minds",
      normalized_title: norm("The Undoing Project"),
      author_ids: ["a-lewis"],
      year: 2016,
      kind: "book",
      openlibrary_work_id: "OL17573564W",
      isbn13: "9780393254594",
      cover: { hue: 286, glyph: "UP" },
    },
    {
      id: "w-range",
      title: "Range",
      subtitle: "Why Generalists Triumph in a Specialized World",
      normalized_title: norm("Range"),
      author_ids: ["a-epstein"],
      year: 2019,
      kind: "book",
      openlibrary_work_id: "OL20025159W",
      isbn13: "9780735214484",
      cover: { hue: 96, glyph: "RA" },
    },
    {
      id: "w-super",
      title: "Superforecasting",
      subtitle: "The Art and Science of Prediction",
      normalized_title: norm("Superforecasting"),
      author_ids: ["a-tetlock", "a-gardner"],
      year: 2015,
      kind: "book",
      openlibrary_work_id: "OL17298402W",
      isbn13: "9780804136693",
      cover: { hue: 190, glyph: "SF" },
    },
    {
      id: "w-misbehaving",
      title: "Misbehaving",
      subtitle: "The Making of Behavioral Economics",
      normalized_title: norm("Misbehaving"),
      author_ids: ["a-thaler"],
      year: 2015,
      kind: "book",
      openlibrary_work_id: "OL17324474W",
      isbn13: "9780393080940",
      cover: { hue: 46, glyph: "MI" },
    },

    // ---- Unowned: works that exist only because other books point at them ----
    {
      // The unowned hub. Six of the owned books cite it; the user has no copy.
      id: "w-juu",
      title: "Judgment Under Uncertainty",
      subtitle: "Heuristics and Biases",
      normalized_title: norm("Judgment Under Uncertainty"),
      author_ids: ["a-kahneman", "a-slovic", "a-tversky"],
      year: 1982,
      kind: "book",
      openlibrary_work_id: "OL2734184W",
      isbn13: "9780521284141",
      cover: { hue: 20, glyph: "JU" },
    },
    {
      id: "w-prospect",
      title: "Prospect Theory: An Analysis of Decision under Risk",
      normalized_title: norm("Prospect Theory An Analysis of Decision under Risk"),
      author_ids: ["a-kahneman", "a-tversky"],
      year: 1979,
      kind: "article",
      openlibrary_work_id: null,
      isbn13: null,
      cover: { hue: 8, glyph: "PT" },
    },
    {
      id: "w-epj",
      title: "Expert Political Judgment",
      subtitle: "How Good Is It? How Can We Know?",
      normalized_title: norm("Expert Political Judgment"),
      author_ids: ["a-tetlock"],
      year: 2005,
      kind: "book",
      openlibrary_work_id: "OL3419991W",
      isbn13: "9780691123028",
      cover: { hue: 200, glyph: "EP" },
    },
    {
      id: "w-peak",
      title: "Peak",
      subtitle: "Secrets from the New Science of Expertise",
      normalized_title: norm("Peak"),
      author_ids: ["a-ericsson", "a-pool"],
      year: 2016,
      kind: "book",
      openlibrary_work_id: "OL17356148W",
      isbn13: "9780544456235",
      cover: { hue: 128, glyph: "PK" },
    },
    {
      id: "w-blackswan",
      title: "The Black Swan",
      subtitle: "The Impact of the Highly Improbable",
      normalized_title: norm("The Black Swan"),
      author_ids: ["a-taleb"],
      year: 2007,
      kind: "book",
      openlibrary_work_id: "OL3295194W",
      isbn13: "9781400063512",
      cover: { hue: 276, glyph: "BS" },
    },
    {
      id: "w-predictably",
      title: "Predictably Irrational",
      subtitle: "The Hidden Forces That Shape Our Decisions",
      normalized_title: norm("Predictably Irrational"),
      author_ids: ["a-ariely"],
      year: 2008,
      kind: "book",
      openlibrary_work_id: "OL5720558W",
      isbn13: "9780061353239",
      cover: { hue: 320, glyph: "PI" },
    },
    {
      id: "w-moneyball",
      title: "Moneyball",
      subtitle: "The Art of Winning an Unfair Game",
      normalized_title: norm("Moneyball"),
      author_ids: ["a-lewis"],
      year: 2003,
      kind: "book",
      openlibrary_work_id: "OL45804W",
      isbn13: "9780393057652",
      cover: { hue: 240, glyph: "MB" },
    },
    {
      id: "w-blink",
      title: "Blink",
      subtitle: "The Power of Thinking Without Thinking",
      normalized_title: norm("Blink"),
      author_ids: ["a-gladwell"],
      year: 2005,
      kind: "book",
      // Parsed out of two bibliographies, never confidently resolved (§6 step 5).
      openlibrary_work_id: null,
      isbn13: null,
      unresolved: true,
      cover: { hue: 356, glyph: "BL" },
    },

    // ---- Freshly imported, outside the Kahneman cluster ----
    {
      // Landed via book-pickup/scan_books.sh straight into Notes/ — title and
      // author are certain (it's the user's own file), OpenLibrary just hasn't
      // been queried yet.
      id: "w-prophet",
      title: "Prophet of Innovation",
      subtitle: "Joseph Schumpeter and Creative Destruction",
      normalized_title: norm("Prophet of Innovation"),
      author_ids: ["a-mccraw"],
      year: 2007,
      kind: "book",
      openlibrary_work_id: null,
      isbn13: null,
      cover: { hue: 54, glyph: "SC" },
    },
  ],

  copies: [
    {
      id: "c-tfs",
      work_id: "w-tfs",
      file_format: "pdf",
      file_path: "Books/Kahneman - Thinking, Fast and Slow.pdf",
      pages: 499,
      added_at: "2026-01-14T09:20:00Z",
      reading_state: "finished",
      last_opened_page: 418,
    },
    {
      id: "c-nudge",
      work_id: "w-nudge",
      file_format: "pdf",
      file_path: "Books/Thaler, Sunstein - Nudge.pdf",
      pages: 312,
      added_at: "2026-01-19T18:05:00Z",
      reading_state: "finished",
      last_opened_page: 294,
    },
    {
      id: "c-noise",
      work_id: "w-noise",
      file_format: "pdf",
      file_path: "Books/Kahneman, Sibony, Sunstein - Noise.pdf",
      pages: 464,
      added_at: "2026-02-02T21:41:00Z",
      reading_state: "reading",
      last_opened_page: 212,
    },
    {
      id: "c-bets",
      work_id: "w-bets",
      file_format: "pdf",
      file_path: "Books/Duke - Thinking in Bets.pdf",
      pages: 288,
      added_at: "2026-02-11T07:55:00Z",
      reading_state: "finished",
      last_opened_page: 288,
    },
    {
      id: "c-undoing",
      work_id: "w-undoing",
      file_format: "pdf",
      file_path: "Books/Lewis - The Undoing Project.pdf",
      pages: 368,
      added_at: "2026-03-01T13:12:00Z",
      reading_state: "finished",
      last_opened_page: 351,
    },
    {
      id: "c-range",
      work_id: "w-range",
      file_format: "pdf",
      file_path: "Books/Epstein - Range.pdf",
      pages: 352,
      added_at: "2026-04-06T19:30:00Z",
      reading_state: "reading",
      last_opened_page: 147,
    },
    {
      id: "c-super",
      work_id: "w-super",
      file_format: "pdf",
      file_path: "Books/Tetlock, Gardner - Superforecasting.pdf",
      pages: 340,
      added_at: "2026-05-22T08:02:00Z",
      reading_state: "finished",
      last_opened_page: 320,
    },
    {
      id: "c-misbehaving",
      work_id: "w-misbehaving",
      file_format: "pdf",
      file_path: "Books/Thaler - Misbehaving.pdf",
      pages: 432,
      added_at: "2026-06-30T16:48:00Z",
      reading_state: "unread",
      last_opened_page: null,
    },
    {
      id: "c-prophet",
      work_id: "w-prophet",
      file_format: "pdf",
      file_path: "Books/McCraw - Prophet of Innovation.pdf",
      pages: 719,
      added_at: "2026-09-25T21:18:00Z",
      reading_state: "unread",
      last_opened_page: null,
    },
  ],

  tags: [
    { id: "t-behec", name: "behavioural-economics" },
    { id: "t-decision", name: "decision-making" },
    { id: "t-forecasting", name: "forecasting" },
    { id: "t-stats", name: "statistics" },
    { id: "t-learning", name: "learning" },
    { id: "t-psych", name: "psychology" },
    { id: "t-favourite", name: "favourite" },
    { id: "t-reread", name: "re-read" },
    { id: "t-teaching", name: "teaching" },
    { id: "t-unfinished", name: "unfinished" },
    // Marks a note produced by book-pickup/scan_books.sh rather than typed by hand.
    { id: "t-imported", name: "imported" },
  ],

  concepts: [
    {
      id: "k-system12",
      name: "System 1 / System 2",
      originating_work_id: "w-tfs",
      description:
        "Fast, automatic, associative thinking against slow, effortful, deliberate thinking. Kahneman borrows the labels from Stanovich and West and makes them load-bearing.",
    },
    {
      id: "k-prospect",
      name: "Prospect theory",
      originating_work_id: "w-prospect",
      description:
        "Value is felt as change from a reference point, not as absolute wealth, and the curve is steeper for losses.",
    },
    {
      id: "k-loss-aversion",
      name: "Loss aversion",
      originating_work_id: "w-prospect",
      description: "Losses loom roughly twice as large as equivalent gains.",
    },
    {
      id: "k-anchoring",
      name: "Anchoring",
      originating_work_id: "w-juu",
      description:
        "An arbitrary starting number drags the final estimate towards it, even when the anchor is known to be irrelevant.",
    },
    {
      id: "k-availability",
      name: "Availability heuristic",
      originating_work_id: "w-juu",
      description:
        "Frequency is judged by how easily examples come to mind, which tracks vividness rather than base rates.",
    },
    {
      id: "k-base-rate",
      name: "Base-rate neglect",
      originating_work_id: "w-juu",
      description:
        "Vivid case detail displaces the prior probability it should have been weighed against.",
    },
    {
      id: "k-wysiati",
      name: "WYSIATI",
      originating_work_id: "w-tfs",
      description:
        "What You See Is All There Is — confidence is built from the coherence of the evidence at hand, not from its completeness.",
    },
    {
      id: "k-planning-fallacy",
      name: "Planning fallacy",
      originating_work_id: "w-tfs",
      description:
        "Plans are built from best-case scenarios rather than from the distribution of outcomes for comparable projects.",
    },
    {
      id: "k-outside-view",
      name: "Outside view",
      originating_work_id: "w-tfs",
      description:
        "Estimate by reference class — what happened to similar cases — before reasoning from the specifics of this one.",
    },
    {
      id: "k-choice-arch",
      name: "Choice architecture",
      originating_work_id: "w-nudge",
      description:
        "The arrangement of options is never neutral; whoever designs the arrangement is making a decision on the chooser's behalf.",
    },
    {
      id: "k-lib-pat",
      name: "Libertarian paternalism",
      originating_work_id: "w-nudge",
      description:
        "Steer towards the better outcome while leaving the worse one freely available.",
    },
    {
      id: "k-mental-accounting",
      name: "Mental accounting",
      originating_work_id: "w-misbehaving",
      description:
        "Money is tracked in separate psychological buckets that violate fungibility.",
    },
    {
      id: "k-noise-bias",
      name: "Noise vs. bias",
      originating_work_id: "w-noise",
      description:
        "Bias is a shared shift in one direction; noise is scatter. Both cost the same in error, but only bias has a story attached, so only bias gets discussed.",
    },
    {
      id: "k-decision-hygiene",
      name: "Decision hygiene",
      originating_work_id: "w-noise",
      description:
        "Procedural defences against scatter — independent judgements first, aggregation second — applied without knowing which specific error they prevented.",
    },
    {
      id: "k-resulting",
      name: "Resulting",
      originating_work_id: "w-bets",
      description:
        "Grading the quality of a decision by the quality of its outcome, which confuses skill with variance.",
    },
    {
      id: "k-deliberate-practice",
      name: "Deliberate practice",
      // Origin is a work the user does not own — the link still resolves.
      originating_work_id: "w-peak",
      description:
        "Effortful practice at the edge of current ability, with immediate feedback, in a domain with a known path to expertise.",
    },
    {
      id: "k-fox-hedgehog",
      name: "Fox vs. hedgehog",
      originating_work_id: "w-epj",
      description:
        "Hedgehogs explain everything through one big idea; foxes stitch together many small ones and forecast better.",
    },
    {
      id: "k-kind-wicked",
      name: "Kind vs. wicked domains",
      originating_work_id: "w-range",
      description:
        "Kind domains give fast, accurate, repeated feedback. Wicked ones give feedback that is delayed, partial, or actively misleading.",
    },
    {
      id: "k-brier",
      name: "Brier score",
      // No origin resolved — renders as an outline concept.
      originating_work_id: null,
      description:
        "A proper scoring rule for probabilistic forecasts. Predates every book in this library; origin not resolved.",
    },
    {
      id: "k-narrative-fallacy",
      name: "Narrative fallacy",
      originating_work_id: "w-blackswan",
      description:
        "A coherent story about the past feels like an explanation of it, and coherence is easier to produce than accuracy.",
    },
  ],

  highlights: [
    {
      id: "h-tfs-1",
      copy_id: "c-tfs",
      page: 20,
      text: "System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control.",
      remark: "The whole book hangs off this one sentence.",
    },
    {
      id: "h-tfs-2",
      copy_id: "c-tfs",
      page: 87,
      text: "The measure of success for System 1 is the coherence of the story it manages to create.",
      remark: "Coherence, not accuracy. This is the WYSIATI mechanism stated plainly.",
    },
    {
      id: "h-tfs-3",
      copy_id: "c-tfs",
      page: 249,
      text: "Losses loom larger than gains. The loss aversion ratio has been estimated in several experiments and is usually in the range of 1.5 to 2.5.",
      remark: null,
    },
    {
      id: "h-tfs-4",
      copy_id: "c-tfs",
      page: 251,
      text: "Odd as it may seem, I am my remembering self, and the experiencing self, who does my living, is like a stranger to me.",
      remark: "Least-quoted, most unsettling line in the book.",
    },
    {
      id: "h-noise-1",
      copy_id: "c-noise",
      page: 6,
      text: "Wherever there is judgment, there is noise — and more of it than you think.",
      remark: null,
    },
    {
      id: "h-noise-2",
      copy_id: "c-noise",
      page: 41,
      text: "A bias is a shared error; noise is variability of error. You can be unbiased and still be wildly noisy.",
      remark: "The distinction the whole book rests on. Compare to TFS, which is almost entirely about bias.",
    },
    {
      id: "h-bets-1",
      copy_id: "c-bets",
      page: 9,
      text: "Poker players call this resulting: working backward from the quality of the result to the quality of the decision.",
      remark: null,
    },
    {
      id: "h-nudge-1",
      copy_id: "c-nudge",
      page: 19,
      text: "We will call the first system the Automatic System and the second the Reflective System.",
      remark:
        "Renamed, not credited. This is exactly the borrowing-without-attribution case — and in 2008 there was no Thinking, Fast and Slow to cite.",
    },
    {
      id: "h-range-1",
      copy_id: "c-range",
      page: 21,
      text: "The bigger the picture, the more unique the potential human contribution. Our greatest strength is the exact opposite of narrow specialization.",
      remark: null,
    },
    {
      id: "h-super-1",
      copy_id: "c-super",
      page: 68,
      text: "Forecast, measure, revise: it is the surest path to seeing better.",
      remark: null,
    },
    {
      id: "h-undoing-1",
      copy_id: "c-undoing",
      page: 218,
      text: "The mind's operations were not perverse. They were rational responses to an irrational world.",
      remark: null,
    },
  ],

  notes: [
    {
      id: "n-tfs-1",
      copy_id: "c-tfs",
      title: "The two systems are a device, not a claim about the brain",
      body: `Kahneman is explicit that [[System 1 / System 2]] are not two parts of the brain — they are a way of talking about processes that have no single seat. Worth holding onto, because almost every book that borrows the framing drops that caveat.

The useful version: System 2 believes itself to be the author of decisions it merely ratified. That is the load-bearing idea, and it is why [[WYSIATI]] follows so naturally — if System 2 only sees what System 1 hands it, then confidence tracks the coherence of the handoff, not the completeness of the evidence.`,
      page_ref: 20,
      highlight_id: "h-tfs-1",
      created_at: "2026-01-16T20:14:00Z",
      updated_at: "2026-01-16T20:41:00Z",
      tag_ids: ["t-psych", "t-favourite", "t-decision"],
      concept_ids: ["k-system12", "k-wysiati"],
    },
    {
      id: "n-tfs-2",
      copy_id: "c-tfs",
      title: "Loss aversion is the one that survives replication",
      body: `Of everything in here, [[Loss aversion]] is the finding I would still bet on. The 1.5–2.5 ratio has held up across contexts, and it is downstream of [[Prospect theory]] rather than a standalone curiosity.

Contrast with priming, which gets a confident chapter and has not aged well. Kahneman later said so himself about the priming literature, which is more than most authors manage.`,
      page_ref: 249,
      highlight_id: "h-tfs-3",
      created_at: "2026-01-21T08:33:00Z",
      updated_at: "2026-01-21T08:33:00Z",
      tag_ids: ["t-behec", "t-stats"],
      concept_ids: ["k-loss-aversion", "k-prospect"],
    },
    {
      id: "n-tfs-3",
      copy_id: "c-tfs",
      title: "Planning fallacy: the fix is boring and nobody uses it",
      body: `The remedy for the [[Planning fallacy]] is the [[Outside view]] — find the reference class, take its distribution, then adjust. It takes ten minutes and it is almost never done, because the inside view produces a *story* and the outside view produces a number.

This is the first place the book stops describing errors and starts prescribing procedure. [[Decision hygiene]] in *Noise* is the same instinct, thirteen years later and generalised.`,
      page_ref: 245,
      highlight_id: null,
      created_at: "2026-02-04T19:02:00Z",
      updated_at: "2026-02-05T07:19:00Z",
      tag_ids: ["t-decision", "t-teaching"],
      concept_ids: ["k-planning-fallacy", "k-outside-view", "k-decision-hygiene"],
    },
    {
      id: "n-tfs-4",
      copy_id: "c-tfs",
      title: "Where the citations actually go",
      body: `Reading the bibliography rather than the text: almost everything structural traces back to two places — the 1979 Econometrica paper and the 1982 *Judgment Under Uncertainty* collection. The trade books that came after cite *this* book instead, which flatters it. The ideas are mostly one layer further down.

[[Anchoring]], the [[Availability heuristic]] and [[Base-rate neglect]] are all 1982 or earlier. This book is where they became famous, not where they were found.

Worth buying the 1982 collection. It is the actual hub and I do not own it.`,
      page_ref: 481,
      highlight_id: null,
      created_at: "2026-03-09T22:48:00Z",
      updated_at: "2026-03-09T22:48:00Z",
      tag_ids: ["t-favourite", "t-reread"],
      concept_ids: ["k-anchoring", "k-availability", "k-base-rate"],
    },
    {
      id: "n-nudge-1",
      copy_id: "c-nudge",
      title: "Automatic / Reflective is System 1 / System 2 with the serial numbers filed off",
      body: `Thaler and Sunstein introduce the Automatic and Reflective Systems on page 19 with no citation to Kahneman and Tversky at that point — and in fairness, in 2008 there was no *Thinking, Fast and Slow* to cite. The bibliography does carry the 1979 and 1982 sources.

So this is a genuine [[System 1 / System 2]] borrowing without attribution *at the point of use*. It is exactly the edge type I do not want blended in with bibliography hits: the graph should show it, label it low-confidence, and let me judge.

[[Choice architecture]] is the original contribution here, and it is a good one.`,
      page_ref: 19,
      highlight_id: "h-nudge-1",
      created_at: "2026-01-25T11:20:00Z",
      updated_at: "2026-01-25T11:52:00Z",
      tag_ids: ["t-behec", "t-decision"],
      concept_ids: ["k-system12", "k-choice-arch"],
    },
    {
      id: "n-nudge-2",
      copy_id: "c-nudge",
      title: "The paternalism argument is weaker than the mechanism",
      body: `[[Libertarian paternalism]] does most of the rhetorical work and is the part that has aged least well — it assumes a designer who knows the better outcome. The mechanism survives the argument: defaults dominate regardless of who sets them, which is a fact about people, not a political position. [[Choice architecture]] stands on its own without the philosophy attached to it.`,
      page_ref: 236,
      highlight_id: null,
      created_at: "2026-02-08T09:05:00Z",
      updated_at: "2026-02-08T09:05:00Z",
      tag_ids: ["t-behec"],
      concept_ids: ["k-lib-pat", "k-choice-arch"],
    },
    {
      id: "n-noise-1",
      copy_id: "c-noise",
      title: "Noise is the more actionable half and got a fraction of the attention",
      body: `[[Noise vs. bias]] is the strongest idea Kahneman has published since prospect theory and it landed with a thud compared to *Thinking, Fast and Slow*. My guess at why: bias comes with a story and a villain, noise comes with a variance decomposition.

But noise is the one an organisation can actually fix, and [[Decision hygiene]] is the fix — independent judgements first, aggregate second, no discussion until the estimates are in. You never learn which error you prevented, which is precisely why nobody does it.`,
      page_ref: 41,
      highlight_id: "h-noise-2",
      created_at: "2026-02-14T21:30:00Z",
      updated_at: "2026-02-16T08:11:00Z",
      tag_ids: ["t-decision", "t-stats", "t-favourite"],
      concept_ids: ["k-noise-bias", "k-decision-hygiene"],
    },
    {
      id: "n-noise-2",
      copy_id: "c-noise",
      title: "Still unfinished — stalled in the sentencing chapters",
      body: `Part III is the strongest evidence and the hardest reading. Picking it back up at the medical-diagnosis chapter.

Open question I want to come back to: does [[Noise vs. bias]] apply to my own note-taking? Same book read twice a year apart would produce two different sets of highlights, and neither is biased — they are just noisy.`,
      page_ref: 212,
      highlight_id: null,
      created_at: "2026-06-02T07:44:00Z",
      updated_at: "2026-06-02T07:44:00Z",
      tag_ids: ["t-unfinished"],
      concept_ids: ["k-noise-bias"],
    },
    {
      id: "n-bets-1",
      copy_id: "c-bets",
      title: "Resulting is the best-named idea in the cluster",
      body: `[[Resulting]] — judging a decision by its outcome — is a better handle than anything in the academic literature for the same error, and it comes from poker rather than psychology.

Duke's move is to make every belief a bet, which forces a probability out of you. That is the same discipline as [[Brier score]] in *Superforecasting*, arrived at from the other direction.`,
      page_ref: 9,
      highlight_id: "h-bets-1",
      created_at: "2026-02-19T20:10:00Z",
      updated_at: "2026-02-19T20:10:00Z",
      tag_ids: ["t-decision", "t-forecasting", "t-favourite"],
      concept_ids: ["k-resulting", "k-brier"],
    },
    {
      id: "n-bets-2",
      copy_id: "c-bets",
      title: "Borrows the two systems, credits Kahneman loosely",
      body: `Duke uses [[System 1 / System 2]] throughout and attributes to "Kahneman" in the text without pinning it to a specific book, while the bibliography does carry *Thinking, Fast and Slow*. Two different edges from the same book, and both are true — one from the body text, one from the back matter.

Also leans on the [[Outside view]] without the name.`,
      page_ref: 54,
      highlight_id: null,
      created_at: "2026-03-14T18:22:00Z",
      updated_at: "2026-03-14T18:22:00Z",
      tag_ids: ["t-decision"],
      concept_ids: ["k-system12", "k-outside-view"],
    },
    {
      id: "n-undoing-1",
      copy_id: "c-undoing",
      title: "The biography explains the citation pattern",
      body: `Lewis's account makes something obvious that the citation graph only hints at: the ideas are Kahneman *and Tversky*, and Tversky died in 1996, fifteen years before the book that made them famous. So every later book cites *Thinking, Fast and Slow* and attributes to Kahneman alone, and the record quietly loses a name.

Which is an argument for the author-level edge being separate from the work-level one. "Attributes to Kahneman" and "cites Thinking, Fast and Slow" are not the same claim — and [[Prospect theory]] is the clearest case, since the paper that named it has two authors and the citations increasingly have one.

Lewis is also good on how late [[System 1 / System 2]] arrived: the labels are a 2011 retrofit onto work done in the 1970s.`,
      page_ref: 218,
      highlight_id: "h-undoing-1",
      created_at: "2026-03-20T14:09:00Z",
      updated_at: "2026-03-21T09:15:00Z",
      tag_ids: ["t-psych", "t-favourite"],
      concept_ids: ["k-prospect", "k-system12"],
    },
    {
      // The real output of book-pickup/scan_books.sh, landed in
      // Notes/the-undoing-project-michael-lewis.md — kept verbatim (minus the
      // title/author/source-file header, which the book detail page already
      // shows) so this doubles as a fixture for how an auto-imported note
      // actually reads, not a hand-tuned stand-in for it.
      id: "n-undoing-imported",
      copy_id: "c-undoing",
      title: "Imported reading notes",
      body: `## Summary

Michael Lewis frames the book as the missing intellectual backstory to his own *Moneyball*: the discovery, by two Israeli psychologists, that expert human judgment is systematically — not randomly — flawed, and that this flaw can be studied, modeled, and even corrected. The book traces the lives of Daniel "Danny" Kahneman, a Jewish child who survived the Nazi occupation of France and grew into a self-doubting, endlessly curious psychologist, and Amos Tversky, a fearless, logic-driven Israeli paratrooper-turned-mathematical-psychologist who radiated certainty. The two men, initially wary rivals at Hebrew University, "collided" in 1969 when Kahneman invited Tversky to guest-lecture in his seminar, and from that meeting grew one of the most productive scientific partnerships of the twentieth century — a nearly telepathic collaboration in which neither could later say which of them had originated a given idea.

Working first on how people generate random sequences and estimate probabilities, then on the broader question of how the mind makes judgments and decisions under uncertainty, Kahneman and Tversky identified a set of mental shortcuts — "heuristics" such as representativeness, availability, and anchoring — that generally work well but produce predictable, systematic errors (biases). Their 1974 *Science* paper "Judgment Under Uncertainty: Heuristics and Biases" became one of the most cited papers in the social sciences and effectively founded behavioral economics. They went on to develop "prospect theory" (1979), a mathematically rigorous alternative to expected-utility theory that explained how people actually evaluate gains and losses relative to a reference point, exhibiting "loss aversion" (losses hurt roughly twice as much as equivalent gains please) and reversing their risk preferences depending on how a choice is "framed."

Lewis follows the practical afterlife of these ideas: their adoption by economist Richard Thaler (who used prospect theory to explain his growing list of "anomalies" that rational-agent economics couldn't account for), by Israeli Air Force flight instructors and Kahneman's own consulting for the military, by physicians like Don Redelmeier fighting cognitive bias in diagnosis, by NBA executive Daryl Morey applying the lessons to talent evaluation, and eventually by policymakers such as Cass Sunstein. Threaded through the intellectual history is the personal story of Kahneman and Tversky's friendship — its extraordinary intimacy and productivity, and its slow fracture as Tversky's fame outstripped Kahneman's and credit became a source of pain. Kahneman moved on, in his final years working with Tversky, to a theory of "undoing" — how the mind constructs counterfactual, "if only" alternatives to reality, especially after tragedy or surprise.

The book closes with Tversky's diagnosis of terminal melanoma in 1996, the brief reconciliation this forced with Kahneman, and Tversky's death — followed six years later by Kahneman's winning the Nobel Prize in Economics (2002) for work he had done jointly with a man no longer alive to share it, since the prize cannot be awarded posthumously. Lewis presents their friendship, and its "undoing," as inseparable from the psychology of undoing that Kahneman had been developing at the very end of their collaboration.

## Key Concepts

1. **Representativeness Heuristic** — People judge probability by how closely something resembles a mental prototype ("parent population") rather than by calculating actual statistical likelihood. This explains errors like believing an "unrepresentative" birth-order sequence (BBBBBG) is less likely than a "representative" one (GBGBBG) even though both are equally probable, since we mistake resemblance for likelihood.
   > "Our thesis," they wrote, "is that, in many situations, an event A is judged to be more probable than an event B whenever A appears more representative than B." (Ch. 8, Going Viral)

2. **Availability Heuristic** — People estimate the frequency or probability of an event by how easily examples of it come to mind, which is distorted by memorability, recency, and vividness rather than true frequency. This is why famous names or vivid disasters skew our sense of what's common.
   > "Consequently," Amos and Danny wrote, "the use of the availability heuristic leads to systematic biases." Human judgment was distorted by . . . the memorable. (Ch. 8, Going Viral)

3. **Anchoring and Adjustment** — An initial number or reference point, even one known to be arbitrary or irrelevant, pulls subsequent numerical estimates toward it. Kahneman and Tversky demonstrated this with a spinning "wheel of fortune" that biased people's guesses about the percentage of African nations in the UN.
   > "The people who spun a higher number on the wheel tended to guess that a higher percentage of the United Nations consisted of African countries than did those for whom the needle landed on a lower number." (Ch. 8, Going Viral)

4. **Base-Rate Neglect** — People underweight or ignore the known statistical prevalence (base rate) of something in a population when given specific, if worthless, descriptive evidence about an individual case, even though a Bayesian calculation would weight the base rate heavily. The "engineers and lawyers" experiment with "Dick" showed people abandoning correct base rates the moment they were handed vivid but uninformative details.
   > "Evidently, people respond differently when given no specific evidence and when given worthless evidence," wrote Danny and Amos. "When no specific evidence is given, the prior probabilities are properly utilized; when worthless specific evidence is given, prior probabilities are ignored." (Ch. 7, The Rules of Prediction)

5. **Regression to the Mean** — Extreme performances (very good or very bad) tend to be followed by more average ones purely as a statistical artifact, not because of any causal effect of praise or punishment. Kahneman diagnosed this while consulting for the Israeli Air Force, where flight instructors wrongly concluded that praise hurt performance and criticism helped it.
   > "Because we tend to reward others when they do well and punish them when they do badly, and because there is regression to the mean," Danny later wrote, "it is part of the human condition that we are statistically punished for rewarding others and rewarded for punishing them." (Ch. 4, Errors)

6. **Hindsight Bias** — After an outcome is known, people misremember having predicted it with much greater confidence than they actually had, making the past look more predictable than it was. Baruch Fischhoff (Tversky's graduate student) demonstrated this using people's recalled odds for outcomes of Nixon's trips to China and Russia.
   > "They all believed that they had assigned higher probabilities to what happened than they actually had. They greatly overestimated the odds that they had assigned to what had actually happened." (Ch. 8, Going Viral)

7. **Prospect Theory / Loss Aversion** — People evaluate outcomes as gains or losses relative to a psychological reference point, not as absolute end-states, and losses are felt roughly twice as painfully as equivalent gains are felt pleasurably — making people risk-averse for gains but risk-seeking for losses. This replaced expected-utility theory as a more accurate descriptive model of choice under risk.
   > "For most people, the happiness involved in receiving a desirable object is smaller than the unhappiness involved in losing the same object." (Ch. 10, The Isolation Effect)

8. **Framing Effect** — Logically identical choices trigger different preferences depending on whether they are described (framed) in terms of gains or losses; the famous "Asian Disease Problem" showed majorities flipping their preferred policy purely because of how survival vs. death statistics were worded.
   > "People did not choose between things. They chose between descriptions of things." (Ch. 11, The Rules of Undoing)

9. **The Endowment Effect** — People assign extra value to things merely because they own them, making them irrationally reluctant to trade or sell possessions even when doing so would be economically advantageous — a phenomenon economist Richard Thaler named after encountering prospect theory.
   > "When you start looking for the endowment effect," Thaler said, "you see it everywhere." (Ch. 11, The Rules of Undoing)

10. **The Undoing Project (Counterfactual "Undoing" and the Downhill Rule)** — Late in his career, Kahneman studied how the mind spontaneously constructs counterfactual alternatives to a bad outcome, preferentially "undoing" whatever felt most surprising or unusual about the event rather than the most probabilistically effective point of intervention; the mind finds it easier to travel from the unusual back to the usual than the reverse.
    > "The mind also preferred to go downhill when it was engaged in undoing. 'The Downhill Rule,' Danny called this." (Ch. 12, This Cloud of Possibility)

## Extracts & Quotes

1. "Doubt is not a pleasant condition, but certainty is an absurd one." — Voltaire, the book's epigraph, sets up its central theme of overconfidence in judgment.
   > "Doubt is not a pleasant condition, but certainty is an absurd one." —Voltaire

2. On the origin of Kahneman and Tversky's partnership, capturing how thoroughly merged their thinking became — a striking claim about genuine intellectual fusion rather than mere collaboration.
   > "It was seldom possible for Amos and Danny to recall where their ideas had come from. They both found it pointless to allocate credit, as their thoughts felt like some alchemical by-product of their interaction."

3. Kahneman's memory of the night his father died while in hiding from the Nazis, a formative moment of loss and premature responsibility that shaped his lifelong preoccupation with fragility and human error.
   > "He told me I might have to become responsible," recalled Danny. "He told me to think of myself as the man of the family... And he gave them to him. And he died that night."

4. Amos's blunt reply defending psychology's right to describe irrational behavior without being accused of endorsing it — a concise statement of the book's core methodological stance.
   > "A theory of vision cannot be faulted for predicting optical illusions. Similarly, a descriptive theory of choice cannot be rejected on the grounds that it predicts 'irrational behavior' if the behavior in question is, in fact, observed."

5. Richard Thaler's epiphany on discovering Kahneman and Tversky's work, illustrating how their ideas single-handedly launched behavioral economics as a field.
   > "I have vivid memories of running from one article to another," says Thaler. "As if I have discovered the secret pot of gold... Then I realized: They had one idea. Which was systematic bias."

6. The naming of "Prospect Theory," chosen deliberately for its blankness so the idea could not be pre-judged by association with existing terms — a small but telling detail about how they marketed a scientific idea.
   > "The idea was to give the theory a completely distinct name that would have no associations whatsoever," said Danny. "When you say 'prospect theory,' no one knows what you're talking about."

7. Amos's biting assessment of Danny's need for institutional recognition, delivered just before the rupture in their friendship — a moment that crystallizes the imbalance of temperament between the two men.
   > Amos looked at Danny and said, "Other people might be impressed but I am not."

8. The devastating twist immediately following Kahneman's declaration that he and Tversky were "no longer even friends," when Tversky calls with his cancer diagnosis just three days later.
   > "Three days later Amos called Danny. He'd just received some news. A growth that doctors had discovered in his eye had just been diagnosed as malignant melanoma."

9. Tversky's stoic reflection on mortality shortly after learning he had six months to live, revealing the same fearless, logic-first temperament that defined his scientific work.
   > "He said, 'Life is a book. The fact that it was a short book doesn't mean it wasn't a good book. It was a very good book.'"

10. Tversky's dry response upon learning he was a Nobel Prize finalist while dying — the prize being awarded only to the living — showing his characteristic composure in the face of the news.
    > "I thank you very much for letting me know," she heard Amos say. "I can assure you that the Nobel Prize is not on the list of things I'm going to miss."

11. Peter Diamond's testimony to how thoroughly the Kahneman-Tversky research program reshaped economics from the outside in, describing years spent trying to operationalize their insight.
    > "I became a believer," said Nobel Prize–winning economist Peter Diamond of Danny and Amos's work. "It's all true. This stuff is not just lab stuff. It's capturing reality, and it's important to economists."

12. Don Redelmeier's summary of what he considered Amos Tversky's deepest lesson about human fallibility, tying the book's abstract psychology back to concrete, life-and-death stakes like drunk or distracted driving.
    > "It's not that people think they are perfect. No, no: They can make mistakes. It's that they don't appreciate the extent to which they are fallible."`,
      page_ref: null,
      highlight_id: null,
      created_at: "2026-09-25T21:17:00Z",
      updated_at: "2026-09-25T21:17:00Z",
      tag_ids: ["t-imported"],
      concept_ids: [],
    },
    {
      id: "n-range-1",
      copy_id: "c-range",
      title: "Kind vs. wicked is the load-bearing distinction",
      body: `Epstein's real argument is not "generalists win" — it is that [[Deliberate practice]] works in [[Kind vs. wicked domains]] and only the kind half. Chess, golf, firefighting: fast unambiguous feedback. Everything else: feedback that is late, partial, or misleading.

That reframes the Ericsson–Gladwell fight as a scope question rather than a disagreement about facts, which is more useful than either side's version.`,
      page_ref: 21,
      highlight_id: "h-range-1",
      created_at: "2026-04-11T19:55:00Z",
      updated_at: "2026-04-11T19:55:00Z",
      tag_ids: ["t-learning", "t-decision"],
      concept_ids: ["k-kind-wicked", "k-deliberate-practice"],
    },
    {
      id: "n-range-2",
      copy_id: "c-range",
      title: "Uses the two systems without ever naming them",
      body: `Chapter 5 runs an entire argument on fast pattern-matching versus slow structural reasoning and never says "System 1". The bibliography cites *Thinking, Fast and Slow*, but this passage does not attribute anything — the framing has become ambient.

That is the interesting case for the graph: the idea travelled further than the citation. [[System 1 / System 2]].`,
      page_ref: 108,
      highlight_id: null,
      created_at: "2026-05-02T08:12:00Z",
      updated_at: "2026-05-02T08:12:00Z",
      tag_ids: ["t-learning"],
      concept_ids: ["k-system12"],
    },
    {
      id: "n-super-1",
      copy_id: "c-super",
      title: "Foxes, Briers, and the only falsifiable book in the pile",
      body: `Tetlock is the only author here who scored himself. [[Brier score]] on real forecasts over years, [[Fox vs. hedgehog]] as the finding rather than the thesis.

Notable: superforecasters use the [[Outside view]] as a habit and correct for [[Base-rate neglect]] explicitly, which makes this the applied sequel to *Thinking, Fast and Slow* that *Thinking, Fast and Slow* does not contain.`,
      page_ref: 68,
      highlight_id: "h-super-1",
      created_at: "2026-05-28T21:03:00Z",
      updated_at: "2026-05-29T07:40:00Z",
      tag_ids: ["t-forecasting", "t-stats", "t-favourite"],
      concept_ids: ["k-brier", "k-fox-hedgehog", "k-outside-view", "k-base-rate"],
    },
    {
      id: "n-misbehaving-1",
      copy_id: "c-misbehaving",
      title: "Queued — read for the history, not the findings",
      body: `Starting this for the account of how the field got built rather than for [[Mental accounting]], which I already know from *Nudge*. Thaler is the funniest writer in the cluster and the most self-interested narrator of it.`,
      page_ref: null,
      highlight_id: null,
      created_at: "2026-07-01T07:10:00Z",
      updated_at: "2026-07-01T07:10:00Z",
      tag_ids: ["t-behec", "t-unfinished"],
      concept_ids: ["k-mental-accounting"],
    },
    {
      // Also a straight import from book-pickup/scan_books.sh — this book has
      // no relationship to the Kahneman cluster, which is the point: it shows
      // up here on its own, not because it was wedged into the demo graph.
      id: "n-prophet-1",
      copy_id: "c-prophet",
      title: "Imported reading notes",
      body: `## Summary

McCraw's biography has, as he puts it, "two protagonists: Joseph Alois Schumpeter (1883–1950) and the phenomenon of capitalist innovation." The book is organized in three parts that track both Schumpeter's life and a sequence of intellectual shifts: Part I ("L'Enfant Terrible," 1883–1926) follows the orphaned boy from provincial Moravia to a stepfather's noble title, elite Viennese schooling, and a meteoric academic and public career — culminating in his brilliant early book *The Theory of Economic Development* and a disastrous stint as Austria's finance minister and then a banker, whose failure wiped out the fortune he had built. Part II ("The Adult," 1926–1939) covers the crushing personal losses of 1926 (his mother, his young wife Annie, and their newborn son all died within weeks), his shift to Bonn and then Harvard, and his growing focus on capitalism as a social and institutional system rather than pure economic theory. Part III ("The Sage," 1939–1950) covers his American career at Harvard, the writing of his three major works of this period — *Business Cycles* (1939), *Capitalism, Socialism and Democracy* (1942), and the posthumously published *History of Economic Analysis* (1954) — and his sense of being permanently overshadowed by Keynes.

McCraw's central argument is that Schumpeter's thought fused into modern management and economic vocabulary more thoroughly than that of almost any other economist: entrepreneurship, innovation, business strategy, and "creative destruction" are, McCraw contends, largely his legacy. Schumpeter is presented as a rival to Marx (whom he respected but thought empirically wrong) and to Keynes (whose *General Theory* Schumpeter felt eclipsed his own less readable, more historically freighted work, and whose aggregate "macroeconomics" he thought erased the entrepreneur and firm — the actual engines of capitalist change — from the picture).

A recurring thread is Schumpeter's personal volatility: a man of extraordinary charm, vanity, and productivity, haunted by depression, sustained across his life by a trio of women (his mother Johanna, his young wife Annie, and his final wife and posthumous editor Elizabeth Boody). McCraw treats Schumpeter's intellectual "vision" — his belief that capitalism is inherently unstable, driven by waves of innovation that destroy old firms and industries even as they raise living standards — as inseparable from his personal experience of upheaval, reinvention, and loss.

McCraw also stresses the deep ambivalence in Schumpeter's mature thought: in *Capitalism, Socialism and Democracy* he argues capitalism is economically triumphant yet sociologically self-undermining — its very success bureaucratizes innovation, erodes the bourgeois class that defends it, and cultivates intellectuals hostile to it — so that it might eventually evolve into some form of socialism, not through economic failure but through cultural exhaustion. The Epilogue argues that Schumpeter's stock has risen steadily since his death, as globalization, Silicon Valley-style entrepreneurship, and the language of "business strategy" and "creative destruction" have become the default vocabulary for describing capitalism.

## Key Concepts

1. **Creative Destruction** — Schumpeter's signature term, first used in 1942, for the process by which innovative products, firms, and methods continually destroy and replace older ones; McCraw treats it as the organizing idea of the whole book and the essence of Schumpeter's view of capitalism as inherently unstable rather than equilibrium-seeking.
   > "Creative destruction is the essential fact about capitalism," he wrote. "Stabilized capitalism is a contradiction in terms."

2. **The Entrepreneur as "Pivot"** — Schumpeter's entrepreneur is not a manager or owner but a distinct psychological type driven to create "new combinations," someone who bears no direct financial risk (that falls on the creditor/banker) but who displaces incumbents through the sheer force of innovation. McCraw presents this concept as Schumpeter's most durable contribution to business thought, later embraced by business schools worldwide.
   > "The entrepreneur, Schumpeter once wrote, is 'the pivot on which everything turns.' Entrepreneurs—whether they operate in big firms or small ones, old companies or startups—are the agents of innovation and creative destruction."

3. **The Five Types of Innovation ("New Combinations")** — In *The Theory of Economic Development* (1911), Schumpeter formally enumerated the forms an entrepreneurial act can take: new goods, new production methods, new markets, new sources of supply, and new industrial organization. McCraw calls this list foundational, noting it has been "quoted many times by economists, historians, and others studying the anatomy of innovation" even though its individual elements now seem like conventional wisdom.
   > "(1) The introduction of a new good... (2) The introduction of a new method of production... (3) The opening of a new market... (4) The conquest of a new source of supply of raw materials or half-manufactured goods... (5) The carrying out of the new organization of any industry..." (Ch. 5, "Career Takeoff")

4. **Credit and the Money Market as "Headquarters of the Capitalist System"** — Schumpeter argued that entrepreneurship depends on credit created "out of nothing" by banks and investment bankers betting on future output, not on prior thrift; this reframes capitalism as fundamentally future-oriented. McCraw treats this as an underappreciated but essential piece of Schumpeter's system, distinguishing his theory of capital from classical economics.
   > "'The headquarters of the capitalist system,' says Schumpeter, is the money market—the place where credit is allocated... The investment banker is not just a middleman standing between savers and users of capital; he is instead 'a producer' of money and credit, 'the capitalist par excellence.'" (Ch. 5, "Career Takeoff")

5. **The Perennial Gale of Creative Destruction (Business Strategy)** — In *Capitalism, Socialism and Democracy*, Schumpeter argues that firms cannot be understood as static structures but only as attempts to survive amid constant upheaval; McCraw credits this passage with essentially founding the modern discipline of "business strategy" taught in business schools.
   > "Every piece of business strategy acquires its true significance only against the background of that process and within the situation created by it... [it] must be seen in its role in the perennial gale of creative destruction; it cannot be understood irrespective of it or, in fact, on the hypothesis that there is a perennial lull." (Ch. 21, "Capitalism, Socialism and Democracy")

6. **"Can Capitalism Survive? No, I Do Not Think That It Can."** — Schumpeter's deliberately provocative and heavily hedged thesis that capitalism's economic success will erode its own social and cultural foundations (bureaucratizing innovation, dissolving the bourgeoisie's political defenders, and feeding a class of hostile intellectuals), leading toward some form of socialism — not because capitalism fails economically but because it succeeds too well. McCraw frames this as the most misunderstood and most quoted argument in Schumpeter's whole body of work.
   > "Turning from the simplicity and purported certainty of Marx's economic utopia, Schumpeter poses his own deceptively guileless question and answer: 'Can capitalism survive? No. I do not think that it can.'" (Ch. 21, "Capitalism, Socialism and Democracy")

7. **Schumpeter vs. Keynes** — McCraw stages Schumpeter's rivalry with Keynes as one of the book's central intellectual dramas: Keynes's aggregate "macroeconomics" ignored the individual entrepreneur and firm, which for Schumpeter were capitalism's actual engine, and Schumpeter believed *The General Theory* had eclipsed his own less accessible *Business Cycles* despite being analytically inferior on the question of growth and innovation.
   > "In Keynesian and other macroeconomic models, individual entrepreneurs, companies, and industries simply vanish from the scene. Very tellingly, no mention of a single business firm can be found in the entire 403 pages of The General Theory." (Ch. 16, "Letters from Europe")

8. **The Three-Cycle ("Juglar/Kondratieff/Kitchin") Business Cycle Schema** — In *Business Cycles* (1939), Schumpeter tried to fit historical booms and busts into nested, quasi-regular wave patterns of different lengths, an ambitious but widely criticized attempt at "exact economics"; McCraw uses this to illustrate Schumpeter's unresolved tension between rigorous theory and messy historical fact.
   > "'Barring very few cases in which difficulties arise,' he writes, 'it is possible to count off, historically as well as statistically, six Juglars [8–10 year cycles] to a Kondratieff [50–60 years] and three Kitchins [40 months] to a Juglar—not as an average but in every individual case.'" (Ch. 15, "Business Cycles, Business History")

9. **"Vision"** — Schumpeter's own term (later borrowed by historians of economic thought) for the pre-analytic, ideologically shaped intuition that underlies even the most rigorous economic theorizing; McCraw shows Schumpeter applying it critically to Marx and Keynes while claiming, not fully successfully in McCraw's telling, that he himself could rise above it as a "value-neutral social scientist."
   > "He believed, for example, that Karl Marx had been profoundly correct on many issues but wrong on others because of an unyielding ideology—or, as Schumpeter came to call it, 'vision.' He made the same kind of judgment about John Maynard Keynes, his own contemporary." (Prologue, "Who He Was and What He Did")

10. **Big Business as an Engine of Progress, Not Monopoly** — Against the dominant American suspicion of "big business" as synonymous with harmful monopoly, Schumpeter argued in *Capitalism, Socialism and Democracy* that large enterprise, driven by creative destruction rather than static market power, had done more than small firms to raise living standards; McCraw presents this as Schumpeter's deliberately contrarian corrective to New Deal-era antitrust thinking.
    > "These units," he says in Capitalism, Socialism and Democracy, "not only arise in the process of creative destruction and function in a way entirely different from the static schema" but often actually make their own markets: "They largely create what they exploit." (Ch. 21, "Capitalism, Socialism and Democracy")

## Extracts & Quotes

1. On capitalism's core mechanism raising ordinary living standards, not luxury for the rich — a passage McCraw quotes at length in the Prologue to establish Schumpeter's populist case for capitalism:
   > "It is the cheap cloth, the cheap cotton and rayon fabric, boots, motorcars and so on that are the typical achievement of capitalist production, and not as a rule improvements that would mean much to the rich man... the capitalist process, not by coincidence but by virtue of its mechanism, progressively raises the standard of life of the masses."

2. Schumpeter's own wry deflation of the profit motive's romance, showing McCraw's insistence that Schumpeter never lost his ironic self-awareness about capitalism's moral ambiguity:
   > "The stock exchange is a poor substitute for the Holy Grail."

3. A diary line McCraw uses to show Schumpeter's private cynicism about the pervasiveness of commerce:
   > "I often wonder," Schumpeter wrote in his diary, "if there is any cause that ever arose and had success that was not business for somebody."

4. Schumpeter's playful, self-mocking account of his own ambitions, illustrating McCraw's portrait of his flamboyant personality:
   > "Then came his punch line: things were not going well with the horses."

5. On his mother Johanna as an entrepreneurial force in her own life, a formative influence McCraw draws a direct line from to his later economic theory:
   > "In the broad sense of the word 'entrepreneur,' Johanna was one of the most effective her son ever knew. She fit the type perfectly."

6. Schumpeter's grief-stricken letter after the triple loss of his mother, wife Annie, and newborn son within weeks in 1926 — the personal catastrophe McCraw treats as a hinge point in the biography:
   > "My beloved Annie is no more . . . Everything looks so grim now that I do not care what happens . . . I may have deserved much, but this, no."

7. Schumpeter's own assessment of his rivalry with Keynes, conceding Keynes's superior gift for popularization despite Schumpeter's broader erudition, and his sharp dismissal of Keynesian aggregates as a substitute for real theory:
   > "On the other hand, Keynes had a real genius for persuasive simplification... As Schumpeter later said of the kind of analysis at which Keynes excelled, 'We always put, against the heavy sacrifices it entails, its one great virtue, Simplification.'... Schumpeter once wrote to a former student of his, 'My model [of entrepreneurship] may seem fuzzy and difficult to handle mathematically but it is real and you can see it. The Keynesian determinants (so-called) are a paper screen interposed between the student and reality.'"

8. Jacob Viner's contemporary complaint about Keynes's terminology, quoted by McCraw to show that Schumpeter was far from alone in his skepticism of *The General Theory*:
   > "no old term for an old concept is used when a new one can be coined, and if old terms are used new meanings are generally assigned to them."

9. Schumpeter's diary explanation for why Americans distrust big business, revealing (per McCraw) a characteristically sharp psychological insight beneath his economic analysis:
   > "American opinion is so anti big business precisely because big business has made the country what it now is and in doing so it has set the secret standard of the American soul: who is not part of big bus., feels he does not meet the standard and by compensation turns against it."

10. Schumpeter's account of capitalism's corrosive rationalizing effect on its own legitimacy, part of the "seeds of its own destruction" argument in *Capitalism, Socialism and Democracy*:
    > "[Capitalism] 'rationalizes' people's habits of thought. It 'creates a critical frame of mind which, after having destroyed the moral authority of so many other institutions, in the end turns against its own.'"

11. Wassily Leontief's memorial tribute, which McCraw uses to close the biographical narrative and capture Schumpeter's paradoxical character:
    > "A pessimist and a skeptic in his view on the future of our western civilization which he cherished so much, Schumpeter was an optimist in his belief in the boundless progress of the inquiring mind."

12. Schumpeter's own last diary entries before his death, quoted by McCraw to convey both his continued devotion to work and his private exhaustion:
    > "Professorship the second semester was terrific. It is true that teaching gives me joy... It is not the less true that in the last years it has become different . . . My belief in the world's values and sense of things dies."`,
      page_ref: null,
      highlight_id: null,
      created_at: "2026-09-25T21:18:00Z",
      updated_at: "2026-09-25T21:18:00Z",
      tag_ids: ["t-imported"],
      concept_ids: [],
    },
  ],

  /**
   * Edges. Grouped by source book. Read the `evidence_quote` on each as
   * plausible-not-verified; the invariant that matters is that none is empty.
   */
  edges: [
    // ---------- Thinking, Fast and Slow (2011) ----------
    e("e-tfs-1", "c-tfs", { work: "w-juu" }, "cites", "high", 481,
      "Kahneman, D., Slovic, P., & Tversky, A. (eds.) (1982). Judgment Under Uncertainty: Heuristics and Biases. Cambridge University Press."),
    e("e-tfs-2", "c-tfs", { work: "w-prospect" }, "cites", "high", 483,
      "Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. Econometrica, 47, 263–291."),
    e("e-tfs-3", "c-tfs", { work: "w-blackswan" }, "mentions", "high", 199,
      "Nassim Taleb, the author of The Black Swan, introduced the notion of a narrative fallacy to describe how flawed stories of the past shape our views of the world."),
    e("e-tfs-4", "c-tfs", { work: "w-blink" }, "mentions", "high", 11,
      "Malcolm Gladwell's Blink is a bestseller about the marvels of expert intuition, and my views were formed in an adversarial collaboration with a scholar who disagreed with me about it."),
    e("e-tfs-5", "c-tfs", { author: "a-tversky" }, "attributes_to_author", "medium", 7,
      "Amos and I spent the best years of our careers studying the biases of intuitive thinking, and this book is in large part an attempt to report what we found."),
    e("e-tfs-6", "c-tfs", { author: "a-taleb" }, "attributes_to_author", "medium", 200,
      "Taleb suggests that we humans constantly fool ourselves by constructing flimsy accounts of the past and believing they are true."),

    // ---------- Nudge (2008) — predates TFS, so it cannot cite it ----------
    e("e-nudge-1", "c-nudge", { work: "w-juu" }, "cites", "high", 281,
      "Kahneman, Daniel, Paul Slovic, and Amos Tversky, eds. 1982. Judgment Under Uncertainty: Heuristics and Biases. New York: Cambridge University Press."),
    e("e-nudge-2", "c-nudge", { work: "w-prospect" }, "cites", "high", 281,
      "Kahneman, Daniel, and Amos Tversky. 1979. 'Prospect Theory: An Analysis of Decision Under Risk.' Econometrica 47: 263–91."),
    e("e-nudge-3", "c-nudge", { work: "w-predictably" }, "mentions", "high", 22,
      "For an engaging tour of the evidence that our mistakes are systematic rather than random, see Dan Ariely's Predictably Irrational."),
    e("e-nudge-4", "c-nudge", { author: "a-kahneman" }, "attributes_to_author", "medium", 19,
      "The distinction between the two modes of thinking draws on decades of work by Kahneman and others on intuitive and deliberate judgement."),
    e("e-nudge-5", "c-nudge", { author: "a-tversky" }, "attributes_to_author", "medium", 24,
      "Tversky's anchoring experiments showed that a starting number people knew to be arbitrary still moved their final estimates."),
    e("e-nudge-6", "c-nudge", { concept: "k-system12" }, "uses_idea", "low", 19,
      "We will call the first system the Automatic System and the second the Reflective System. The Automatic System is rapid and is or feels instinctive."),

    // ---------- Noise (2021) ----------
    e("e-noise-1", "c-noise", { work: "w-tfs" }, "cites", "high", 421,
      "Kahneman, D. (2011). Thinking, Fast and Slow. New York: Farrar, Straus and Giroux."),
    e("e-noise-2", "c-noise", { work: "w-tfs" }, "mentions", "high", 168,
      "Readers of Thinking, Fast and Slow will recognise this pattern, though that book was concerned almost entirely with bias and hardly at all with noise."),
    e("e-noise-3", "c-noise", { work: "w-juu" }, "cites", "high", 419,
      "Kahneman, D., Slovic, P., & Tversky, A. (Eds.). (1982). Judgment under uncertainty: Heuristics and biases. Cambridge University Press."),
    e("e-noise-4", "c-noise", { work: "w-prospect" }, "cites", "high", 421,
      "Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. Econometrica, 47(2), 263–291."),
    e("e-noise-5", "c-noise", { work: "w-super" }, "cites", "high", 432,
      "Tetlock, P. E., & Gardner, D. (2015). Superforecasting: The art and science of prediction. Crown."),
    e("e-noise-6", "c-noise", { work: "w-nudge" }, "mentions", "high", 372,
      "Elsewhere two of us have described such interventions as nudges; decision hygiene is their procedural cousin, aimed at the judge rather than the chooser."),
    e("e-noise-7", "c-noise", { author: "a-tetlock" }, "attributes_to_author", "medium", 264,
      "Tetlock's forecasting tournaments showed that the best predictors were not the most knowledgeable but the most willing to revise."),
    e("e-noise-8", "c-noise", { concept: "k-system12" }, "uses_idea", "low", 51,
      "The rapid, intuitive response comes first and the deliberate check, when it happens at all, comes second — and the check is far rarer than the confidence it produces."),

    // ---------- Thinking in Bets (2018) ----------
    e("e-bets-1", "c-bets", { work: "w-tfs" }, "cites", "high", 251,
      "Kahneman, Daniel. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux, 2011."),
    e("e-bets-2", "c-bets", { work: "w-tfs" }, "mentions", "high", 54,
      "In Thinking, Fast and Slow, Kahneman describes two systems of reasoning, and poker is a machine for catching the first one out."),
    e("e-bets-3", "c-bets", { work: "w-prospect" }, "cites", "high", 252,
      "Kahneman, Daniel, and Amos Tversky. 'Prospect Theory: An Analysis of Decision Under Risk.' Econometrica 47, no. 2 (1979): 263–91."),
    e("e-bets-4", "c-bets", { work: "w-undoing" }, "cites", "high", 253,
      "Lewis, Michael. The Undoing Project: A Friendship That Changed Our Minds. New York: W. W. Norton, 2016."),
    e("e-bets-5", "c-bets", { work: "w-super" }, "mentions", "high", 176,
      "Tetlock and Gardner's Superforecasting makes the same case from the outside: the good forecasters are the ones who update in small increments."),
    e("e-bets-6", "c-bets", { author: "a-kahneman" }, "attributes_to_author", "medium", 33,
      "As Kahneman has shown, we are pattern-matching creatures who mistake the fluency of a story for evidence of its truth."),
    e("e-bets-7", "c-bets", { author: "a-tversky" }, "attributes_to_author", "medium", 89,
      "Tversky's insight was that the errors were predictable, which is what made them worth studying rather than merely lamenting."),
    e("e-bets-8", "c-bets", { concept: "k-outside-view" }, "uses_idea", "low", 121,
      "Before you back your own read of the hand, ask what happens to players in this spot generally — the base rate is available and almost nobody consults it."),

    // ---------- The Undoing Project (2016) ----------
    e("e-undoing-1", "c-undoing", { work: "w-tfs" }, "cites", "high", 349,
      "Kahneman, Daniel. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux, 2011."),
    e("e-undoing-2", "c-undoing", { work: "w-tfs" }, "mentions", "high", 12,
      "Kahneman would go on to write Thinking, Fast and Slow, a book that made the work famous and mentioned its co-author on far fewer pages than he deserved."),
    e("e-undoing-3", "c-undoing", { work: "w-juu" }, "cites", "high", 350,
      "Kahneman, Daniel, Paul Slovic, and Amos Tversky, eds. Judgment Under Uncertainty: Heuristics and Biases. Cambridge: Cambridge University Press, 1982."),
    e("e-undoing-4", "c-undoing", { work: "w-prospect" }, "cites", "high", 350,
      "Kahneman, Daniel, and Amos Tversky. 'Prospect Theory: An Analysis of Decision Under Risk.' Econometrica 47 (1979): 263–291."),
    e("e-undoing-5", "c-undoing", { work: "w-moneyball" }, "mentions", "high", 6,
      "I'd written a book called Moneyball about the inefficiency of the market for baseball players, and had not understood that I was describing a psychological phenomenon I could not name."),
    e("e-undoing-6", "c-undoing", { author: "a-kahneman" }, "attributes_to_author", "medium", 231,
      "Kahneman's instinct was always to look for the way he himself might be wrong, which Tversky found both admirable and exhausting."),
    e("e-undoing-7", "c-undoing", { author: "a-tversky" }, "attributes_to_author", "medium", 218,
      "Tversky's argument was that the mind's operations were rational responses to an irrational world."),

    // ---------- Range (2019) ----------
    e("e-range-1", "c-range", { work: "w-tfs" }, "cites", "high", 301,
      "Kahneman, D. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux, 2011."),
    e("e-range-2", "c-range", { work: "w-tfs" }, "mentions", "high", 102,
      "Kahneman and Klein's adversarial collaboration, recounted in Thinking, Fast and Slow, ended in agreement about when intuition can be trusted — and it is a narrower set of conditions than either camp advertises."),
    e("e-range-3", "c-range", { work: "w-peak" }, "cites", "high", 299,
      "Ericsson, K. A., and R. Pool. Peak: Secrets from the New Science of Expertise. Boston: Houghton Mifflin Harcourt, 2016."),
    e("e-range-4", "c-range", { work: "w-epj" }, "cites", "high", 304,
      "Tetlock, P. E. Expert Political Judgment: How Good Is It? How Can We Know? Princeton, NJ: Princeton University Press, 2005."),
    e("e-range-5", "c-range", { work: "w-super" }, "mentions", "high", 219,
      "The superforecasters Tetlock and Gardner describe are the living argument for breadth: none of them were specialists in the questions they answered best."),
    e("e-range-6", "c-range", { work: "w-blink" }, "mentions", "high", 104,
      "The chess-master intuition that Blink made famous is real, and it is real in precisely the domains where feedback is fast, repeated and unambiguous."),
    e("e-range-7", "c-range", { author: "a-ericsson" }, "attributes_to_author", "medium", 26,
      "Ericsson's own work is careful about scope in a way that its popular retelling is not."),
    e("e-range-8", "c-range", { author: "a-kahneman" }, "attributes_to_author", "medium", 105,
      "Kahneman's conclusion was that expertise requires an environment regular enough to be learnable, and prompt enough feedback to learn from."),
    e("e-range-9", "c-range", { concept: "k-system12" }, "uses_idea", "low", 108,
      "The grandmaster sees the board and the answer arrives; the novice calculates. Neither mode is the better one — it depends entirely on whether the board is the kind of thing that repeats."),

    // ---------- Superforecasting (2015) ----------
    e("e-super-1", "c-super", { work: "w-tfs" }, "cites", "high", 315,
      "Kahneman, Daniel. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux, 2011."),
    e("e-super-2", "c-super", { work: "w-juu" }, "cites", "high", 314,
      "Kahneman, Daniel, Paul Slovic, and Amos Tversky, eds. Judgment Under Uncertainty: Heuristics and Biases. New York: Cambridge University Press, 1982."),
    e("e-super-3", "c-super", { work: "w-epj" }, "cites", "high", 319,
      "Tetlock, Philip E. Expert Political Judgment: How Good Is It? How Can We Know? Princeton, NJ: Princeton University Press, 2005."),
    e("e-super-4", "c-super", { work: "w-blackswan" }, "mentions", "high", 234,
      "Nassim Taleb's The Black Swan argues that the consequential events are precisely the ones outside the model, which is a serious objection and not a fatal one."),
    e("e-super-5", "c-super", { work: "w-moneyball" }, "mentions", "high", 33,
      "What Moneyball did to baseball scouting, forecasting tournaments can do to political punditry: replace the confident anecdote with a scored record."),
    e("e-super-6", "c-super", { author: "a-kahneman" }, "attributes_to_author", "medium", 40,
      "Kahneman showed that we substitute an easy question for a hard one and rarely notice the substitution."),
    e("e-super-7", "c-super", { author: "a-taleb" }, "attributes_to_author", "medium", 236,
      "Taleb's position is that the distribution has a fat tail and our estimates of it are theatre."),
    e("e-super-8", "c-super", { concept: "k-base-rate" }, "uses_idea", "low", 121,
      "The first question a good forecaster asks is how often this sort of thing happens at all — and it is astonishing how often that question is skipped entirely."),

    // ---------- Misbehaving (2015) ----------
    e("e-misb-1", "c-misbehaving", { work: "w-tfs" }, "cites", "high", 401,
      "Kahneman, Daniel. 2011. Thinking, Fast and Slow. New York: Farrar, Straus and Giroux."),
    e("e-misb-2", "c-misbehaving", { work: "w-juu" }, "cites", "high", 401,
      "Kahneman, Daniel, Paul Slovic, and Amos Tversky, eds. 1982. Judgment Under Uncertainty: Heuristics and Biases. Cambridge: Cambridge University Press."),
    e("e-misb-3", "c-misbehaving", { work: "w-prospect" }, "cites", "high", 401,
      "Kahneman, Daniel, and Amos Tversky. 1979. 'Prospect Theory: An Analysis of Decision Under Risk.' Econometrica 47 (2): 263–91."),
    e("e-misb-4", "c-misbehaving", { work: "w-nudge" }, "mentions", "high", 324,
      "Cass and I wrote Nudge because the alternative was to keep saying the same thing in journals nobody outside the field reads."),
    e("e-misb-5", "c-misbehaving", { work: "w-predictably" }, "mentions", "high", 183,
      "Dan Ariely's Predictably Irrational reached the audience we had been failing to reach for twenty years."),
    e("e-misb-6", "c-misbehaving", { author: "a-kahneman" }, "attributes_to_author", "medium", 38,
      "Kahneman's reaction to my list of anomalies was to ask which of them I could demonstrate rather than merely assert."),
    e("e-misb-7", "c-misbehaving", { author: "a-tversky" }, "attributes_to_author", "medium", 41,
      "Tversky had a gift for finding the cleanest possible version of a question, which is most of what experimental design is."),
  ],

  connection: {
    connected: true,
    account: "gary.kavanagh@outlook.com",
    library_folder: "OneDrive/Books",
    last_sync: "2026-09-24T07:12:00Z",
  },
};

type Target = { work: string } | { author: string } | { concept: string };

/** Keeps the edge list readable while guaranteeing evidence is never omitted. */
function e(
  id: string,
  source_copy_id: string,
  target: Target,
  edge_type: "cites" | "mentions" | "attributes_to_author" | "uses_idea",
  confidence: "high" | "medium" | "low",
  evidence_page: number,
  evidence_quote: string,
) {
  return {
    id,
    source_copy_id,
    target_work_id: "work" in target ? target.work : null,
    target_author_id: "author" in target ? target.author : null,
    target_concept_id: "concept" in target ? target.concept : null,
    edge_type,
    confidence,
    evidence_page,
    evidence_quote,
    dismissed: false,
    dismissed_at: null,
    created_at: "2026-09-01T00:00:00Z",
  };
}
