---
id: skill-maintain-synapse
type: skill
title: Maintain the Synapse vault
tags:
  - type/skill
  - area/governance
  - status/active
purpose: "Run one maintenance pass: detect drift (lint + DB↔view divergence + orphans + inbox), heal the unambiguous in .md + migration files, escalate the rest, open a human-gated PR to main, and log the pass."
provenance: [".opencode/command/maintain-synapse.md (canonical executable playbook)", "Emmanuel 2026-06-15"]
---

# Maintain the Synapse vault

## Goal
One maintenance pass over the whole vault: detect drift, heal the unambiguous (in `.md` + migration files
only), escalate the rest, open a reviewable PR to `main`, and log the pass. Owned by [[agent-curator]]; the
standing process is [[loop-maintain-synapse]].

## Steps
1. **Orient** — read `inbox/attention/` + `inbox/curator/logs/` first; action any resolved escalation.
2. **Detect** — `lint.mjs --strict` + DB↔derived-view divergence + orphans + inbox items.
3. **Dry gate** — nothing to do → log `no-op — dry` and stop (success).
4. **Heal — reconcile, don't regenerate** — mechanical autofixes in place; dispatch [[agent-reconciler]]
   per drifted unit (regenerate a stale view / minimal note edits); **verify each diff (maker ≠ checker)**.
   From-scratch authoring → escalate.
5. **PR + log** — re-lint to `errors=0`; if anything changed, open a human-gated PR to `main` (fresh branch,
   never force, never self-merge); write the run-log + a LOG.md heartbeat.

## Full playbook
The canonical, executable playbook lives at `.opencode/command/maintain-synapse.md` (run via OpenCode — the
cron renders the curator's briefing and invokes it). This note is the graph-renderable summary; the loop
contract is [[loop-maintain-synapse]].

## Related
[[loop-maintain-synapse]] · [[agent-curator]] · [[agent-reconciler]] · [[rule-synapse-fail-loudly]] · [[rule-synapse-human-gated-push]] · [[rule-synapse-incremental-reconcile]]
