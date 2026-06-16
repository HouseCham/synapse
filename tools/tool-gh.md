---
id: tool-gh
type: tool
title: gh — open the human-gated pull request
tags:
  - type/tool
  - area/meta
  - status/active
---

# tool-gh

The GitHub CLI — the agents' interface to the **human-gated pull request**, the single point where a
proposed change waits for a human to review and merge ([[doc-governance-model]]).

## What it is
`gh` opens (and inspects) PRs against the private repo from the command line, so an agent can hand off its
work without a browser. The PR is the gate: Markdown diffs and proposed record migrations both ride the
*same* pull request, reviewed together before anything is applied.

## How it is used in Synapse
At the end of a non-dry maintenance pass, the curator opens **one** PR to `main` from its dated branch:

```sh
gh pr create --base main --head synapse/curator-2026-06-15 \
  --title "curator: synapse maintenance 2026-06-15" \
  --body "lint errors=0; reconciled N views; M escalations in inbox/attention/"
```

The PR body surfaces any unresolved lint error loudly rather than swallowing it
([[rule-synapse-fail-loudly]]), and lists what was reconciled and what was escalated. A **dry pass opens no
PR**. The agent never self-merges and never force-pushes — a human reviews the diff and merges, after
which the migration runner applies any DB changes ([[rule-synapse-human-gated-push]]).

## Related
[[tool-git]] · [[doc-governance-model]] · [[rule-synapse-human-gated-push]] · [[rule-synapse-fail-loudly]]
