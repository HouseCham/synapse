---
id: decision-0003-human-gated-mutation
type: decision
title: All mutation is human-gated through one PR; SQL rides migration files
tags:
  - type/decision
  - area/governance
  - status/active
related: ["[[doc-governance-model]]"]
---

**Status:** Accepted — 2026-06-15

## Context
The agent is the write path, and updates and deletes are allowed (correct a figure, fix a contact, revise
a plan). But nothing may be applied unattended — finances are in scope, and silent edits are how a
knowledge graph rots.

## Decision
Every mutation becomes a reviewable diff a human merges:
- **Markdown** rides git's PR diff directly.
- **SQL** rides **migration files** (`migrations/`) through the *same* PR gate; a runner applies them on
  merge. Migration files are the audit log and the revert path.

The agent **autofixes** only the trivial / reversible / unambiguous (into the PR) and **escalates**
everything ambiguous, destructive, authoring, or deletion-shaped to `inbox/attention/` with Options, then
stops. **Every DELETE and bulk-UPDATE escalates**, always.

## Consequences
- (+) No unattended data loss; full audit trail; easy revert.
- (↔) A deliberate delay between propose and apply — the chosen feature, not a cost.

## Related
[[doc-governance-model]] · [[rule-synapse-human-gated-push]] · [[rule-synapse-fail-loudly]] · [[rule-no-unprompted-actions]]
