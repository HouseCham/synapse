# inbox/curator/logs/ — maintenance heartbeat + run-logs

The audit trail for the maintenance loop ([[loop-maintain-synapse]]). Every pass — dry or not — leaves a
trace here, so there is always proof the maintainer ran and a record of what it touched. The loop reads
this directory (and `inbox/attention/`) **first**, every pass, to orient itself.

## Two artifacts

### `LOG.md` — the heartbeat (one line per pass)

Every pass appends exactly one line, whether or not it changed anything. The common, healthy outcome is a
dry pass:

```
<date> — no-op — dry
<date> — reconciled <n> unit(s), opened PR <ref> — see <date>-<slug>.md
```

A dry night appends a `no-op — dry` line and exits — that is success, not a reason to act. `LOG.md` is the
at-a-glance "did it run, and did it do anything" view.

### `<date>-<slug>.md` — per-pass note (only when the pass did something)

When a pass reconciles drift, heals lint findings, or raises escalations, it writes a fuller per-pass note:

```
YYYY-MM-DD-<slug>.md
```

What it detected, what it healed (the unambiguous autofixes), what it escalated to `inbox/attention/`, and
the PR it opened. A dry pass writes **no** per-pass note — just the `LOG.md` line.

## Convention

- `LOG.md` is append-only; one line per pass; never rewritten.
- Per-pass notes are dated and slugged like the rest of the inbox.
- The latest maintenance commit on the main branch plus these logs are the loop's external memory across
  runs.
