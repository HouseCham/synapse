---
id: decision-0005-hybrid-retrieval
type: decision
title: Add an optional semantic-recall layer (local embeddings + vectors-in-SQLite) over the deterministic render
tags:
  - type/decision
  - area/retrieval
  - status/active
related: ["[[doc-semantic-recall]]"]
---

**Status:** Accepted — 2026-06-16

## Context
The render engine retrieves deterministically — it walks the typed-link closure from the start node(s).
That is precise and reviewable, but it only reaches what is **explicitly linked**: a task that spans a
domain the user did not name (or never linked) is invisible to it. The missing capability is **semantic
retrieval** — finding conceptually-related notes across the whole vault regardless of links or wording.

## Decision
Add an **optional, opt-in semantic-recall layer** as a second phase on top of the deterministic render —
classic **hybrid retrieval** (graph + vector, fused with Reciprocal Rank Fusion):
- **Embeddings** come from the local **Ollama** already in use over Tailscale (`mxbai-embed-large` by
  default) — no API key, no cloud, no new runtime ([[tool-ollama-embeddings]]).
- **Vectors live in `synapse.db`** as a generated `note_vectors` table, rebuilt from the notes by
  `gen-embeddings.mjs` — another derived projection ([[rule-derived-views-are-generated]]), never
  canonical, gitignored with the DB.
- **v1 storage is a plain BLOB + brute-force cosine in JS.** A personal vault is hundreds–thousands of
  notes; that is milliseconds and needs no extension. `sqlite-vec` is the documented scale-up path,
  drop-in when the vault grows large.
- **Phase 2 is a separate tool** (`augment.mjs`), so `render.mjs` stays pure, offline, and byte-identical.
  `augment` embeds (briefing + task), runs KNN over `note_vectors`, RRF-fuses with the closure, trims to
  budget, and appends a **clearly-labeled** "semantically related" section.

## Consequences
- (+) Fills the cross-domain recall gap and answers the open "RAG over Markdown" question — entirely local.
- (+) `render.mjs` stays **pure and deterministic** (no network); the semantic layer is a separate opt-in
  tool, so the deterministic spine is untouched.
- (Δ) Semantic results are **additive and labeled**, never canonical, and never drive a mutation on their
  own ([[rule-semantic-suggests-links-decide]]). The agent **promotes** a useful hit into a typed
  `related:` link — so semantic discovery feeds the deterministic graph over time.
- (−) Requires Ollama reachable for embeddings; degrade gracefully (skip the augment, warn) when it isn't.

## Related
[[doc-semantic-recall]] · [[rule-semantic-suggests-links-decide]] · [[tool-ollama-embeddings]] · [[doc-storage-model]] · [[rule-derived-views-are-generated]]
