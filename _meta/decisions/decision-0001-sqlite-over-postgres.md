---
id: decision-0001-sqlite-over-postgres
type: decision
title: Use SQLite for the records substrate (Postgres deferred)
tags:
  - type/decision
  - area/architecture
  - status/active
related: ["[[doc-storage-model]]"]
---

**Status:** Accepted — 2026-06-15

## Context
The records substrate must be queryable and "live," with a read-only query path (text-to-SQL) that can
never mutate, and a human-gated write path. The system is single-user, on one machine, with access
funneled through one local chat UI over Tailscale.

## Decision
Use **SQLite** — one file at `db/synapse.db`. The query/chat path opens it **read-only** (an immutable /
`query_only` connection); only the migration runner opens it read-write. The migration-file gate is
engine-agnostic.

## Consequences
- (+) One file: trivial backup (file copy), no server to run or secure, simplest possible operations.
- (+) Works directly with the local chat UI and a text-to-SQL tool.
- (−) Read-only is enforced at the **connection**, not by an engine-level role — mitigated by a dedicated
  read-only connection/process and filesystem permissions on the DB file.
- (↔) **Postgres stays a low-cost future switch** (the migration gate is unchanged) if we ever need an
  engine-level `SELECT`-only role or direct queries from other Tailnet devices.

## Related
[[doc-storage-model]] · [[doc-security-privacy]]
