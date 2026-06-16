---
id: rule-semantic-suggests-links-decide
type: rule
title: Semantic recall suggests; typed links decide — additive, labeled, never authoritative
tags:
  - type/rule
  - area/retrieval
  - status/active
provenance: ["hybrid-retrieval determinism boundary", "Emmanuel 2026-06-16"]
---

**Rule:** Semantic-recall results are **additive, labeled suggestions** — never canonical, never a
substitute for the deterministic closure, and never sufficient on their own to drive a mutation. The
deterministic briefing ([[tool-render]]) is the spine; the augment layer ([[doc-semantic-recall]]) only
*appends* a clearly-marked "semantically related (not yet linked)" section. When a suggested note is
genuinely relevant, **promote it to a typed `related:` link** ([[rule-synapse-edges-by-role]]) so the
connection becomes deterministic — do not rely on the similarity match recurring.

**Why:** Embedding search is fuzzy and non-deterministic; it surfaces candidates, some irrelevant. If a
similarity score could silently mutate a note or write a record (especially in finances), the whole
human-gated, single-source, reproducible design would leak. Keeping semantics *additive and labeled*
preserves determinism and review; promoting good hits to links makes the graph smarter without making it
guess.

**How to apply:**
- Treat augment output as **context, not instruction**. Cite a semantic hit when it informs an answer;
  never act on it as if it were a typed edge.
- A mutation (an edit, a migration, a new link) stays a normal human-gated proposal
  ([[rule-synapse-human-gated-push]], [[rule-no-unprompted-actions]]) — the semantic hit is merely what
  prompted it.
- When a hit recurs or is clearly load-bearing, **propose the `related:` link** in the PR so future
  briefings reach it deterministically.
- If Ollama is unreachable, **skip the augment and say so** ([[rule-synapse-fail-loudly]]); never block the
  deterministic briefing.

Related: [[doc-semantic-recall]] · [[decision-0005-hybrid-retrieval]] · [[rule-synapse-edges-by-role]] · [[rule-derived-views-are-generated]] · [[rule-no-unprompted-actions]]
