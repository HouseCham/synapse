---
id: rule-synapse-single-source-of-truth
type: rule
title: One fact, one note — edit in place, never duplicate
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["the context-vault single-source principle", "Emmanuel 2026-06-15"]
---

**Rule:** Every fact lives in exactly **one** place, addressed by a globally-unique kebab-case basename.
When reconciling, **edit the canonical note in place** — never copy content into a second note, never
create a near-duplicate. The split spans both substrates: **Markdown is canonical for knowledge, SQL for
records** ([[doc-storage-model]]); where they meet, one side is canonical and the other is **generated**
([[rule-derived-views-are-generated]]).

**Why:** The whole architecture exists to kill drift. Duplication is how drift starts: two copies
diverge, and a reader can no longer tell which is true. Unique basenames are also load-bearing — both
Obsidian and `render.mjs` ([[tool-render]]) address notes by basename, so a collision silently shadows a
note.

**How to apply:**
- Before creating a note, search for an existing one covering the fact; if found, update it instead.
- A `person` note never restates a `contact`'s structured fields, and a `contact` view holds no prose —
  they **link** ([[decision-0002-contact-record-plus-narrative]]).
- If a fact genuinely belongs in two places, keep the canonical copy and **link** to it
  ([[rule-synapse-edges-by-role]]); never re-state it.
- A note that has grown to cover several facts is a **split candidate** — an authoring decision, so
  escalate it ([[rule-synapse-fail-loudly]]); do not split or merge on your own.

Related: [[doc-storage-model]] · [[rule-synapse-frontmatter-schema]] · [[rule-derived-views-are-generated]] · [[rule-synapse-fail-loudly]] · [[conventions]]
