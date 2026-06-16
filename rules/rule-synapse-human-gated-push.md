---
id: rule-synapse-human-gated-push
type: rule
title: The loop opens a PR for a human — never force-pushes, never self-merges
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["human-in-the-loop PR gate", "Emmanuel 2026-06-15"]
---

**Rule:** The maintenance loop's only remote write is pushing a **fresh** branch (`synapse/curator-<date>`)
and opening a PR to `main`. It **NEVER** force-pushes, **NEVER** pushes to `main` (or any shared branch)
directly, and **NEVER** merges its own PR. Once the branch is pushed, the **PR is the handoff** — a human
reviews and merges. SQL changes ride the *same* PR as migration files
([[decision-0003-human-gated-mutation]]); a runner applies them on merge.

**Why:** A self-merging or force-pushing automation can silently land unreviewed changes or rewrite shared
history — the exact unattended drift the vault exists to prevent. Human review is the irreversible-action
gate; the loop proposes, a person disposes. This matters most near the records DB, which holds finances.

**How to apply:**
- Branch **fresh off the latest** `origin/main` each pass → conflicts are rare by construction.
- `git push -u origin HEAD` (new branch only) → open a PR with base `main`. Never merge it yourself.
- Stage only the files you changed; **never `git add -A`**, never touch the tooling or the DB binary.
- If the PR comes back CONFLICTING, do **not** force-push or rebase-and-force — **escalate** to
  `inbox/attention/` ([[rule-synapse-fail-loudly]]); a clean next-pass branch off the new HEAD is the
  normal recovery.

Related: [[rule-synapse-fail-loudly]] · [[rule-synapse-incremental-reconcile]] · [[decision-0003-human-gated-mutation]] · [[doc-governance-model]]
