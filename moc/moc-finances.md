---
id: moc-finances
type: moc
title: Finances — domain hub
tags:
  - type/moc
  - area/finances
  - status/active
references_docs: ["[[doc-sql-schema]]", "[[doc-storage-model]]"]
related: ["[[moc-synapse]]"]
---

# Finances — domain hub

The map for the **finances** domain: accounts, transactions, balances, and the aggregate summaries built
over them. Money records are SQL-canonical — they live in `db/synapse.db` and surface in Markdown only as
generated views and `summary` notes, never one note per transaction ([[doc-sql-schema]]).

## What lives here
- **Accounts** — one generated view per account (`accounts/<slug>.md`), regenerated from its canonical
  row ([[rule-derived-views-are-generated]]).
- **Transactions & balances** — high-volume, SQL-only; queried with read-only text-to-SQL and rolled up
  into `summary-finances-<period>` notes rather than per-row notes.

## How to work this domain
- **Add records:** write a forward-only file under `migrations/`, then `node _meta/tools/apply-migrations.mjs`
  (on merge) — the migration is the only writer of the DB and doubles as the audit log.
- **Refresh views/summaries:** `node _meta/tools/gen-views.mjs` regenerates `accounts/<slug>.md` and
  `summary-finances-<period>.md` from canonical rows; never hand-edit them.
- **Maintenance pass:** `reconciler moc-finances` (scoped doer) or `curator moc-finances "rebuild stale
  summaries"` (steward → human-gated PR).

## Members
*Populate as records and notes land.* Account views and finance summaries roll up here automatically once
they link back via `related` ([[rule-synapse-edges-by-role]]).

## Related
[[doc-sql-schema]] · [[doc-storage-model]] · [[moc-synapse]]
