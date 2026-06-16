---
id: rule-synapse-fail-loudly
type: rule
title: Maintenance fails loudly — autofix the unambiguous, escalate everything else
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["loop-engineering: autofix the unambiguous, escalate the rest", "Emmanuel 2026-06-15"]
---

**Rule:** When maintaining the vault, only ever apply fixes that are **unambiguous and reversible**.
Anything that requires judgement — ambiguous intent, >1 candidate, authoring decisions, or anything
**destructive** (deleting/merging a note, a `DELETE` or bulk-`UPDATE` migration) — is **escalated**, never
guessed. Unresolved `lint.mjs` errors are surfaced loudly (in the run summary and, when a PR exists, its
body); they are **never** swallowed to make a run look clean.

**Why:** A knowledge graph rots silently. A maintainer that quietly "fixes" what it does not understand
manufactures drift faster than a human can catch it — the opposite of the vault's job. Loud failure + a
human-in-the-loop escalation queue (`inbox/attention/`) is the only thing that keeps the
single-source-of-truth guarantee honest over time.

**How to apply:**
1. Run `lint.mjs --strict`. Classify each finding: **autofix** (malformed `related:` YAML, single-candidate
   typo'd link, missing `#type/<type>` tag, derivable frontmatter, a stale generated view to regenerate)
   vs **escalate** (orphan that may be intentionally terminal, oversize split-candidate, missing
   `migration:` target, 0-or-many link candidates, contradictions, deletions, any DB write).
2. Apply only the autofix class. Re-run lint to `errors=0`.
3. For every escalation, write a dated note to `inbox/attention/` with: what you found, why you did not
   auto-fix, clear **Options**, and the safe fixes you already applied. Then **stop** on that item
   ([[rule-no-unprompted-actions]]).
4. Every `DELETE` and bulk-`UPDATE` migration lives permanently in the escalate bucket
   ([[decision-0003-human-gated-mutation]]).

Related: [[rule-synapse-single-source-of-truth]] · [[rule-synapse-human-gated-push]] · [[rule-no-unprompted-actions]] · [[doc-governance-model]]
