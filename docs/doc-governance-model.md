---
id: doc-governance-model
type: doc
title: Governance & mutation model — read freely, write through one gate
tags:
  - type/doc
  - area/governance
  - status/active
references_docs: ["[[conventions]]"]
related: ["[[moc-synapse]]"]
---

# Governance & mutation model

Reads are free; every write becomes a reviewable diff a human merges. Nothing applies unattended.

## Read freely
The model may query both stores — RAG over Markdown + **read-only** text-to-SQL. The query credential is
read-only ([[doc-security-privacy]]): a generated query can never mutate or drop a table.

## Write only through the gate
Every change — Markdown or SQL — becomes a diff a human merges ([[rule-synapse-human-gated-push]],
[[rule-no-unprompted-actions]]):
- **Markdown** rides git's PR diff directly.
- **SQL** rides **migration files** through the *same* PR gate; a runner applies them on merge
  ([[doc-storage-model]]). The migration files in git **are** the audit log and the revert path.

## Autofix vs escalate — what keeps the gate real
- **Autofix** — trivial, reversible, unambiguous fixes (malformed frontmatter, a single-candidate typo'd
  link, a stale generated view) are prepared *into* the PR, still visible before merge.
- **Escalate-and-stop** — ambiguous, destructive, authoring, or deletion calls go to `inbox/attention/`
  with clear Options, and the agent **stops** on that item ([[rule-synapse-fail-loudly]]). Every **DELETE**
  and **bulk-UPDATE** lives permanently in the escalate bucket.

## Maker ≠ checker
The agent that writes an edit never approves it. The scoped doer ([[agent-reconciler]]) makes the minimal
edit; the steward ([[agent-curator]]) reviews the diff (in scope? single-sourced? schema-clean? no stray
edits?), repairs the unambiguous, escalates the rest, and opens the PR. The human merges.

## Fail loudly
Unresolved lint errors are surfaced in the run summary and the PR body — never swallowed to fake a clean
run. When in doubt, escalate; never guess ([[rule-synapse-fail-loudly]]).

## Related
[[doc-storage-model]] · [[doc-security-privacy]] · [[doc-maintainer-loop]] · [[rule-synapse-human-gated-push]] · [[rule-synapse-fail-loudly]] · [[rule-no-unprompted-actions]] · [[agent-curator]] · [[agent-reconciler]] · [[moc-synapse]]
