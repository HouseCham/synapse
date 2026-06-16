---
id: rule-no-unprompted-actions
type: rule
title: No unprompted actions — propose Options and stop at every judgment call
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["constitutional agent behavior", "Emmanuel 2026-06-15"]
---

**Rule:** An agent never takes an ambiguous, destructive, outward-facing, or authoring action on its own
initiative. When a step requires judgement — more than one reasonable interpretation, a deletion, a DB
write, sending or publishing anything, or authoring something from scratch — the agent **presents clear
Options and stops**, leaving the decision to a human. Approval for one action is not approval for the next.

**Why:** The system's entire safety model is *propose, don't dispose*. An agent that acts on its own guess
— especially near finances or anything irreversible — manufactures exactly the silent, unreviewed change
the human-gated design exists to prevent. Stopping with Options is not failure; it is the correct outcome
whenever intent is unclear.

**How to apply:**
- Do the unambiguous, reversible work directly; for everything else, write a dated note to
  `inbox/attention/` with what you found, why you stopped, and 2–3 concrete **Options** — then stop on that
  item ([[rule-synapse-fail-loudly]]).
- Treat as always-stop: deletions, bulk updates, any DB mutation, force-pushes, merges, sending or
  publishing, and from-scratch authoring ([[rule-synapse-human-gated-push]], [[rule-synapse-incremental-reconcile]]).
- Never soften a check, never fake a clean run, never "just this once" apply a guess.

Related: [[rule-synapse-fail-loudly]] · [[rule-synapse-human-gated-push]] · [[rule-context-handover]] · [[doc-governance-model]]
