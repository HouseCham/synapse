# journal/ — the work-log

A running log of work done in and on the vault: what changed, why, and how it was verified. One file per
entry, dated. Journal entries are **plain markdown with no `type:` frontmatter**, so the linter ignores
them — they are a human/agent work record, not typed knowledge-graph notes. Anything durable that belongs
in the graph gets ingested into a proper typed note; the journal just narrates the work.

## Naming

```
YYYY-MM-DD-<slug>.md
```

## Convention

Keep each entry short and to four sections:

```markdown
# <date> — <short title>

## What changed
The concrete edits/actions this entry covers.

## Why
The reason or trigger — what prompted the work.

## Verification
How it was checked (e.g. `lint.mjs` errors=0, JSON parses, the view matches its row).

## Next
The obvious follow-up, if any. "None" is valid.
```

Keep it factual and skimmable. The journal is for "what happened and why"; decisions worth preserving go to
a `decision-` note, and reusable conventions go to a `rule-` note.
