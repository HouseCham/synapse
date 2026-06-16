# inbox/ — the human ↔ agent handoff queue

This is the single channel where humans and agents hand work to each other. It is a **queue, not an
archive**: items land here to be *acted on*, then drained once resolved. If something belongs in the
knowledge graph, it gets ingested into a typed note and the inbox item goes away. If it is a decision a
human owes the system, it stays until the human resolves it.

## What lands here

- **Raw captures awaiting ingestion** — quick notes, pasted snippets, links, anything dropped in fast and
  not yet shaped into a typed vault note. An agent (or you) later turns these into the right note type and
  clears the capture.
- **Escalations** (`attention/`) — a maintenance or authoring pass hit something it could not safely
  auto-fix and is asking a human to decide. See `attention/README.md`.
- **Handovers** (`handovers/`) — a session landed at a safe point and wrote down what was done, what is
  next, and how to relaunch. See `handovers/README.md`.
- **Curator audit trail** (`curator/logs/`) — the maintenance heartbeat and per-pass run-logs. See
  `curator/logs/README.md`.

## Naming

Top-level captures and most queue items use a dated slug:

```
YYYY-MM-DD-<slug>.md
```

One date-prefixed file per item. The date is the day it was captured/raised; the slug is a short,
hyphenated handle for the item. Sub-queues (`attention/`, `handovers/`, `curator/logs/`) follow the same
convention and add their own shape — see their READMEs.

## Queue, not archive

The health of the inbox is measured by how empty it is. A clean inbox means every capture has been
ingested, every escalation resolved, and every handover consumed. Resolved items are removed (their durable
content now lives in a typed note, a record, or git history) — they are not left to accumulate. An item
that lingers is a signal that something is still owed.
