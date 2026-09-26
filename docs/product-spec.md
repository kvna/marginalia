# Marginalia — Product Spec: Data Model, Reference Semantics, Screens

Status: settled. This document is the contract everyone else builds against —
the Prototype Engineer builds fixtures against the schema and screen data
below; the Backend Engineer builds the real schema against it. Anything here
that turns out to be wrong is a decision, not an open question — raise a
change, don't silently drift from it.

**Format: PDF only.** EPUB parsing is out of scope — no parser, no dependency
for it. `Copy.file_format` is modeled as an enum rather than a hardcoded
assumption so the schema doesn't have to change shape when that's revisited,
and as of SUP-13 the enum's second value, `epub`, is exposed a step early: the
Library's format filter (§7, Screen 1) offers "PDF" / "EPUB" chips now, in
preparation for the eventual parser, even though no Copy can carry `epub` yet
and that chip will only ever show zero results until it does.

---

## 1. The work/copy split

Two different things were being conflated: *the book as a referenceable
thing* and *the book as a file the user owns and annotates*. They're split
into two entities:

- **Work** — title + author(s). The node that gets referenced. Exists whether
  or not the user owns the book. Most works in a mature graph will be unowned
  — five of your books can cite *Thinking, Fast and Slow* without you owning
  a copy of it, and the graph is broken if that hub disappears.
- **Copy** — the user's file (in OneDrive), their notes, their highlights,
  their reading state. A Copy always belongs to exactly one Work. A Work can
  have zero or one Copy (one, because this is a personal library — you don't
  own the same book twice).

**Why this split makes everything else fall out cleanly:** every reference
edge targets a **Work**, never a Copy. That's the one rule that makes
"unowned hub" and "add to library" both trivial:

- An unowned Work can already sit at the center of a cluster, because edges
  never needed it to have a Copy in the first place.
- **Add-to-library is additive, not a migration.** When the user adds a file
  for a Work that already exists (because other books already reference it),
  the app creates a new `Copy` row pointing at the *existing* `Work.id`. No
  edge is rewritten, no graph data moves. The hub just gains a filled-in
  center instead of an outline one.

### Rendering an unowned work
- **Library / Graph:** renders as an outline/dashed node — title and
  author(s) if resolved, no cover thumbnail (or an OpenLibrary cover if one
  resolves), a "Not in library" badge, and a primary "Add to library" action.
- **Book detail:** still a real page — it has *Referenced by* data even
  without a Copy. No notes, no highlights, no note editor entry point;
  those affordances are replaced by "Add to library" so a note editor is
  never presented for a book that has no file to attach the note to.

---

## 2. Authors as first-class

An Author is a row, not a string on a Work. `Work ↔ Author` is many-to-many
(co-authored books — Kahneman & Tversky, Thaler & Sunstein — are the norm in
this domain, not the exception).

```
Author
  id
  name                    -- canonical display form
  aliases: string[]       -- "D. Kahneman", "Kahneman, Daniel" etc., for matching
  openlibrary_author_id   -- nullable, external key

WorkAuthor (join)
  work_id
  author_id
```

This is what makes "references Kahneman" resolve to a person: an
**attributes-to-author** edge (see below) targets `Author.id` directly, and
from there `WorkAuthor` gives every book of theirs in the graph — including
ones the user hasn't read.

---

## 3. Notes and concepts

```
Note
  id
  copy_id                 -- FK, required — notes attach to a Copy, not a Work,
                           -- because you can't annotate a book you don't have
  body                    -- markdown
  page_ref                -- nullable, anchors the note to a page/highlight
  created_at, updated_at

Tag
  id
  name

NoteTag (join)
  note_id
  tag_id

Concept
  id
  name                     -- "System 1 / System 2"
  originating_work_id      -- FK to Work, nullable
  description              -- optional, freeform

NoteConcept (join)         -- [[concept]] links inside a note body
  note_id
  concept_id
```

`Concept.originating_work_id` is what the spec calls for directly: "System 1
/ System 2" points back at Kahneman's Work row, which is what gives a
**shared-concept edge** a direction (see §4's `uses_idea` edge — it targets
the Concept, and the Concept's origin is the implied hub).

Tags are deliberately dumber than concepts — a flat name, no origin, no
resolution. Concepts carry meaning (an origin, a definition); tags are just
labels for the browser and search.

---

## 4. The four edge types

```
Edge
  id
  source_copy_id          -- FK to Copy — the book the reference was extracted FROM
  target_work_id           -- FK to Work — the book being referenced (always a Work:
                            -- owned or not, doesn't matter)
  target_author_id         -- FK to Author, populated only for attributes_to_author
  target_concept_id        -- FK to Concept, populated only for uses_idea
  edge_type                -- enum: cites | mentions | attributes_to_author | uses_idea
  confidence                -- enum: high | medium | low
  evidence_page             -- int, required, no exceptions
  evidence_quote             -- text, required, no exceptions — the sentence that produced the edge
  dismissed                  -- bool, default false
  dismissed_at                -- nullable
  created_at
```

**Hard rule, not a convention: no row is written to this table without both
`evidence_page` and `evidence_quote` populated.** If extraction can't produce
a quote, it doesn't produce an edge. This is what makes "open any edge, see
why it exists" true by construction rather than by UI discipline.

| Edge | Target | Evidence | Confidence (default) |
|---|---|---|---|
| **Cites** | `target_work_id` | Bibliography entry | High — structured text |
| **Mentions** | `target_work_id` | Title string in body + surrounding context | High — string match plus context |
| **Attributes to author** | `target_author_id` | "as Kahneman showed…", no citation | Medium — needs author resolution |
| **Uses idea** | `target_concept_id` | System 1 / System 2 used with no attribution | Low — a judgement call |

Two deliberate, non-obvious choices here:

1. **`attributes_to_author` targets an Author, not a Work.** The text names a
   person, not a title — there is usually no way to know *which* of
   Kahneman's books is meant, and picking one would fabricate precision the
   source text doesn't have. Better to be honestly coarse than confidently
   wrong.
2. **`uses_idea` targets a Concept, not a Work directly.** The Concept's
   `originating_work_id` supplies the implied target. This is the same
   "don't fabricate specificity" logic — the text says "System 1", not
   "*Thinking, Fast and Slow*, page 20."

Confidence is set from the table above at creation time and is **not**
auto-promoted. If the extraction spike later shows `attributes_to_author` or
`uses_idea` performing at high precision, that's a decision to bring with
numbers, not a schema change to make quietly.

**No fifth edge type.** If a new pattern shows up during extraction that
doesn't fit these four, it's a variant of one of them (most likely folded
into `mentions` or dropped), not a new row in this table.

### Dismissal
`dismissed = true` removes an edge from the graph and from inbound-count
queries but does not delete the row — it stays for audit and undo. A
dismissed edge can be un-dismissed; the evidence that justified it in the
first place is still attached.

### The idea-attribution layer is off by default
In any UI that renders edges (graph, References-out/Referenced-by panels),
`uses_idea` edges are filtered out unless the user explicitly turns that
layer on. `attributes_to_author` ships alongside `cites`/`mentions` by
default since it's medium confidence, not low — but it's visually
distinguishable (different edge style) so it's never confused with a
bibliography hit.

---

## 5. Inbound references as first-class

"Which books cite this one" is the interesting direction, and the schema is
built so it's a cheap, indexed lookup rather than a graph traversal:

```
Work
  id
  title
  normalized_title          -- lowercased, punctuation-stripped; used for de-dup matching
  openlibrary_work_id        -- nullable, external key
  isbn13 / isbn10             -- nullable
  inbound_reference_count      -- denormalized, high-confidence inbound count (cites + mentions, not dismissed)
  created_at
```

`inbound_reference_count` is maintained transactionally on edge insert /
dismiss / undismiss (or recomputed on a cheap scheduled pass — implementation
detail for the API layer, not a schema concern). It only counts `cites` +
`mentions` edges that aren't dismissed, which is the number the graph uses
for node sizing by default. Medium/low-confidence edges don't inflate hub
size unless the user has opted into that layer, at which point the *panel*
(not the counter) shows them separately.

**Referenced-by query** (book detail panel, and the count above is just a
cached version of this):

```sql
SELECT e.*, source_work.title AS source_title, source_work.id AS source_work_id
FROM edges e
JOIN copies source_copy ON source_copy.id = e.source_copy_id
JOIN works source_work ON source_work.id = source_copy.work_id
WHERE e.target_work_id = :work_id
  AND e.dismissed = false
ORDER BY e.confidence DESC, e.created_at DESC;
```

**Hub query** (graph view, top-N by inbound):

```sql
SELECT id, title, inbound_reference_count
FROM works
ORDER BY inbound_reference_count DESC
LIMIT 50;
```

Both are single-table-scan-or-index operations — no recursive traversal, no
N+1 per node. This is deliberate: hub discovery is the app's core interaction
and it has to stay cheap as the library grows past the Kahneman-cluster demo
size.

This document writes the schema in relational terms for precision. The
concrete store (Cosmos DB serverless, per the infra architecture doc) maps
each table here to a container with the same keys; `inbound_reference_count`
becomes a partition-friendly counter on the `Work` document rather than a
SQL column, but the query shape above is unchanged.

---

## 6. De-duplication

The same book shows up in eight bibliographies with eight different
formattings — "Kahneman, D. (2011). Thinking, Fast and Slow.", "Kahneman,
*Thinking Fast and Slow*, 2011", "D. Kahneman, Thinking, Fast and Slow" — and
all eight have to resolve to one `Work` row, or the hub fragments into eight
near-duplicate nodes with one or two inbound edges each instead of one node
with eight.

Resolution order, cheapest and most confident first:

1. **ISBN, if the citation has one.** Exact match against `Work.isbn13` /
   `isbn10`. Highest confidence possible; skip everything else.
2. **`openlibrary_work_id` / DOI, if already resolved once.** Local cache
   lookup — title+author string → resolved external ID — checked before any
   network call. This is the aggressive caching the cost budget requires:
   the same "Thinking, Fast and Slow" string parsed out of eight different
   PDFs should hit the external API once, not eight times.
3. **Local fuzzy match against existing `Work` rows** on
   `normalized_title` (+ author overlap via `WorkAuthor`), before going
   external at all. Two citations of the same book across two different
   PDFs should usually match each other locally without ever touching
   OpenLibrary.
4. **External lookup** — OpenLibrary Search API
   (`openlibrary.org/search.json?q=...&author=...`) for books; Crossref
   (`api.crossref.org/works?query.bibliographic=...`) for anything with a
   DOI-shaped citation, which is more likely for academic works than trade
   nonfiction. Both are free, keyless, and used to fetch a canonical
   `openlibrary_work_id`/ISBN/author-with-OpenLibrary-author-id, which gets
   cached locally and written onto the `Work` row so step 2 catches it next
   time.
5. **No confident match** — create a new `Work` row from the parsed
   title/author with `openlibrary_work_id = null`, and flag it (an
   `unresolved` state on the Work) rather than guessing. Merging two `Work`
   rows that turn out to be the same book later is a single
   operation — repoint every `Copy`, `Edge.target_work_id`, and
   `NoteConcept`-adjacent reference from the losing id to the surviving one,
   then delete the losing row. This is the same primitive that makes
   add-to-library safe (§1): identity lives on `Work.id`, everything else
   points at it, so merging or filling in a Work never requires touching the
   edges.

Author resolution follows the same shape at smaller scale: normalize the
name, check `Author.aliases`, fall back to OpenLibrary's author search, cache
the result.

---

## 7. Screens

Seven screens, no more. Each paragraph below states what the screen is for
and the data it pulls, so fixtures and the real API return the same shape.

### Library
Grid or list of the user's **Copies** (not Works) — the books they actually
own — with cover, title, author(s), tag chips, and an add-a-book flow that
uploads/links a file from OneDrive. Unowned Works never appear in Library
proper; Library is "your shelf," not the whole graph. Two filter rails: tags
(as above) and format — PDF / EPUB chips over `Copy.file_format` (SUP-13);
EPUB is a legal filter value ahead of the parser existing, so unlike the tag
rail it stays visible even at a zero count. Data: `Copy` joined to `Work`
(title, authors via `WorkAuthor`) and `NoteTag`-derived tag chips per Copy.

### Book detail
The hub of the app. For an **owned** book: notes timeline (`Note`, newest or
page-ordered), highlights, tags, and concepts touched (`NoteConcept`). Two
reference panels: **References out** (this book's outbound `Edge` rows,
split by `edge_type` — bibliography cites vs. in-text mentions vs. the
softer two behind a toggle) and **Referenced by** (inbound `Edge` rows via
the query in §5, each showing the source book, the edge type, confidence,
and — on demand — the evidence page/quote). For an **unowned** Work: same
page shell, only *Referenced by* has data, and the notes/highlights/outbound
sections are replaced by "Add to library." Data: one `Work`, its `Copy` if
any, inbound edges (always), outbound edges (if owned).

### Note editor
Markdown editor bound to one `Copy`. Inline `[[concept]]` linking that
autocompletes against existing `Concept.name` (and can create a new one,
which requires picking or leaving null an `originating_work_id`) and tag
autocomplete against existing `Tag.name`. Data: reads/writes `Note`,
`NoteConcept`, `NoteTag`; page_ref if the note is anchored to a highlight.

### Concepts & tags browser
Every `Concept`, its `originating_work_id` (rendered as a link to that Work,
owned or not), and every `Copy` whose notes reference it via `NoteConcept` —
the second way into the same cluster the spec calls for, since a concept
with an owned originating work and several `uses_idea` edges pointing at it
is the same hub, seen from the idea side rather than the citation side.
Tags get a flatter version of the same browser: name, count, jump to
matching Copies. Data: `Concept` + `NoteConcept` + `Work` (for origin) on one
side, `Tag` + `NoteTag` on the other.

### Graph view
Force-directed node graph. **Work** nodes sized by `inbound_reference_count`
(§5) — filled for owned, outline for unowned. Edges drawn from `cites` and
`mentions` by default; `attributes_to_author` edges (to Author nodes) and
`uses_idea` edges (to Concept nodes, which visually sit near their
`originating_work_id`) are separate toggleable layers, off by default for
`uses_idea` per §4. Clicking a node opens Book detail (or the Author/Concept
equivalent, if those get their own minimal page — not one of the seven, so
for the prototype a click on an Author/Concept node can just filter the
graph to their edges rather than navigate away). Clicking an edge shows its
evidence and a dismiss action. Data: `Work` rows with `inbound_reference_count`,
plus non-dismissed `Edge` rows filtered by active layer toggles.

### Search
Single search across `Work.title`, `Author.name`, `Note.body`,
`Concept.name`, and `Tag.name`, returning mixed-type results (a Note hit
shows its Copy's title as context; a Work hit shows owned/unowned state).
Data: read-only, no writes; this is the one screen that queries across
every entity in the schema.

### Settings
OneDrive connection status (the Entra ID consent flow — connect/reconnect,
show the account currently linked) and the library's storage location
(which OneDrive folder holds Copies' files). No data model of its own beyond
whatever token/connection state the Graph integration needs; not modeled in
this document since it's integration config, not library data.

---

## 8. Data hooks for visual weight (for SUP-6)

Design feedback (relayed via SUP-2) asks that key concepts and relationships
"pop" through contrast, size, and shape rather than requiring the reader to
extract hierarchy themselves, and that transitions between topics be
purposeful rather than decorative. This section is the data-model half of
that: which attributes already in this schema are strong enough signals to
drive visual weight, so SUP-6 has a concrete hook instead of inventing its
own scoring. Choosing the actual colors, sizes, shapes, and motion curves is
the Product Designer's call, not this document's — this stops at "here is
the number/enum to key off," not "here is what it should look like."

### What drives emphasis for a Concept
Concepts don't carry a stored weight, and this document doesn't add one — a
derived signal is enough, and storing it risks drifting out of sync the way
`inbound_reference_count` on Work does not (that one's updated by an explicit
trigger on edge insert/dismiss; a naive Concept counter wouldn't have that
discipline yet). The signal is:

- **Occurrence count** — number of non-dismissed `NoteConcept` rows
  referencing the Concept, plus non-dismissed `uses_idea` edges targeting it.
  A concept touched by one note should read smaller/quieter than System 1 /
  System 2 touched by twelve.
- **Origin resolved or not** — `originating_work_id` set vs. null. A concept
  with a known origin (Kahneman & Tversky) is a stronger, more citable hub
  than one the user coined themselves; that's a shape/style distinction
  (e.g., solid vs. outline, matching the Work owned/unowned treatment in §1),
  not a size one.

Both are cheap to compute at read time (a count against an existing FK, no
new column) at the prototype's data scale; precomputing them is a
Work-style denormalization to revisit with the Backend Engineer later, not a
decision to make now.

### What drives emphasis for an Edge
Already fully specified in §4 — no new attribute needed:
- **Confidence band** (`high`/`medium`/`low`) is the existing signal for
  line weight/opacity/saturation on any rendered edge.
- **Evidence is universal, not a nice-to-have** — §4's hard rule means every
  edge has a page and a quote, so "any edge can be opened to see why it
  exists" is true for all of them, not a subset to flag specially.

### What counts as a transition-worthy navigation event
A transition is justified when the user follows a modeled relationship — an
edge or an FK — from one node to another. It's not justified for actions
that stay inside one node's data (sorting, filtering, expanding a panel in
place). Concretely, in this schema:

- Clicking an inbound/outbound `Edge` row on book detail — the two ends of
  one Edge row.
- Clicking a graph node or edge to open what it points at (§7 Graph view).
- Clicking a `Concept.originating_work_id` link (concepts browser → Work) or
  a `[[concept]]` link inside a note (note editor → concept).
- Clicking an `attributes_to_author` edge's target, or an Author to their
  other Works via `WorkAuthor`.

Anything that doesn't cross one of those FK/edge boundaries — re-sorting the
library grid, toggling a graph layer, switching tabs on book detail — is a
state change, not a transition, and shouldn't get traversal-style motion.

---

## Open questions

None on the work/copy split or the four edge types — this document settles
both, per the issue's done-means. Anything that would change what a Work,
Copy, or Edge *is* (not just how it's queried or rendered) goes to the Chief
of staff, not back into this doc as a TBD.
