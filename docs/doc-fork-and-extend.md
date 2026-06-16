---
id: doc-fork-and-extend
type: doc
title: Fork and extend — framework vs. your vault (the two-layer architecture)
tags:
  - type/doc
  - area/meta
  - status/active
references_docs: ["[[conventions]]"]
related: ["[[moc-synapse]]"]
---

# Fork and extend

Synapse is a **framework**, not a finished vault. This note describes the two-layer architecture that lets
you take framework updates without ever leaking your private knowledge upstream.

## Two layers, two repos

- **The framework (the public template repo).** The render engine, the manifest, the conventions
  ([[conventions]]), the governance rules, the agents, the loop ([[loop-maintain-synapse]]), the docs, and
  the starter SQL schema (`migrations/0001-init-schema.sql`). It ships **no personal data**.
- **Your vault (a private repo).** A separate repo you create from the template. Its **`origin` is
  private** — your knowledge and records live only there. Its **`upstream` is the public framework repo**.

Pull framework updates by tracking upstream:

```sh
git remote add upstream https://github.com/<owner>/synapse.git   # one-time
git fetch upstream && git merge upstream/main                     # pull framework updates
```

**Never push your vault to `upstream`.** Contribute framework fixes back through a PR from a clean,
data-free branch.

## The boundary is by directory

| Upstream-owned (framework) | Yours (instance) |
|---|---|
| `_meta/` (engine, manifest, tools, rules), `agents/`, `loops/`, `docs/`, `rules/`, `skills/`, `tools/`, `migrations/0001-init-schema.sql` | `inbox/`, `notes/`, `journal/`, `projects/`, `plans/`, `people/`, your `db/`, your domain MOCs, your `0002+` migrations, your custom rules |

The split keeps merges clean: framework changes touch upstream-owned directories; your content lives in
the instance directories the framework leaves near-empty. A migration you add (`0002-owner.sql` and up) is
yours; the starter schema is upstream's.

## Why it's safe

The same governance that keeps the vault honest keeps the two layers separate: knowledge is
Markdown-in-git, records ride migration files, and every change is a reviewable diff
([[doc-governance-model]]). Because the framework carries no data, an `upstream` merge can only update the
engine and conventions — it can never overwrite your notes.

## Related
[[conventions]] · [[doc-storage-model]] · [[doc-governance-model]] · [[doc-repo-layout]] · [[moc-synapse]]
