---
id: tool-git
type: tool
title: git — version history and the diff that is the mutation gate
tags:
  - type/tool
  - area/meta
  - status/active
---

# tool-git

The **version-history layer** and the spine of the mutation model. Every change to the vault — Markdown
notes *and* the `migrations/NNNN-*.sql` files that drive the records DB — lives in one private git repo,
so every mutation is a reviewable, revertible diff ([[doc-governance-model]]).

## What it is
The repo holds all Markdown (knowledge + generated views), the manifest, the tooling, and the migration
files. The local SQLite DB is gitignored — it is derived and replayable from the migrations, which double
as the records' audit log and revert path ([[doc-storage-model]]).

## How it is used in Synapse
Agents propose; a human merges. The maintenance loop ([[loop-maintain-synapse]]) commits its work on a
dated branch and never touches `main` directly:

```sh
git switch -c synapse/curator-2026-06-15        # branch off latest main, never edit main
git add <only the files you touched>          # never `git add -A`
git commit -m "curator: synapse maintenance 2026-06-15"
```

Discipline the agents follow ([[rule-synapse-human-gated-push]]): branch off the latest `main`, stage only
what was touched (never `git add -A`), commit with the marker subject the loop uses to find its last run,
and **never force-push, push to `main`, or self-merge**. The pull request is the handoff — opening it is
[[tool-gh]]'s job.

## Related
[[tool-gh]] · [[doc-governance-model]] · [[rule-synapse-human-gated-push]] · [[loop-maintain-synapse]]
