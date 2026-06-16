---
id: rule-derived-views-are-generated
type: rule
title: Derived projections are generated, never hand-edited — edit the canonical side
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["extends single-source-of-truth to the DB <-> view boundary", "Emmanuel 2026-06-15"]
---

**Rule:** Wherever one substrate projects into the other, the projection is **generated and never
hand-edited**; you edit the **canonical** side and regenerate. Two directions ([[doc-storage-model]]):

- **SQL → Markdown (derived views).** The DB row is canonical; `contacts/<slug>.md`, `accounts/<slug>.md`,
  and `summary-*` notes are generated read-only views.
- **Markdown → SQL (indexes).** The note is canonical; the `.md` index (`notes` + `note_links` tables) and
  the `plans` table are generated from the notes and their frontmatter.

A generated note carries `generated: true` and a `source:` pointer, and lives in a generated-view
directory. **A hand-edit to a generated artifact is a lint error → escalate, never silently keep.** To
change a derived view, change the canonical row (via a migration — [[decision-0003-human-gated-mutation]])
and regenerate.

**Why:** This keeps [[rule-synapse-single-source-of-truth]] honest once a fact has both a row and a Markdown
face. Without it, the row and its view become exactly the "two copies that diverge" the constitution
forbids — and you can no longer tell which is true. Generation makes the canonical side the *only* edit
point; the view is a pure function of it.

**How to apply:**
- Never edit a file with `generated: true` by hand. Want it different? Edit the source row (a migration) or
  the generator, then regenerate ([[agent-reconciler]]).
- `lint.mjs` flags any note in a generated-view dir missing the `generated: true` marker (a hand-created or
  hand-edited file). The maintainer detects **row ↔ view divergence** at runtime and regenerates, or
  escalates a hand-edit it cannot safely overwrite ([[rule-synapse-fail-loudly]]).
- A generated view's `source:` must resolve; any referenced `migration:` must exist on disk.

Related: [[rule-synapse-single-source-of-truth]] · [[doc-storage-model]] · [[decision-0003-human-gated-mutation]] · [[agent-reconciler]] · [[tool-lint]]
