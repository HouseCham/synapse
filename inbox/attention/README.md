# inbox/attention/ — the escalation queue

When a maintenance or authoring pass hits something it cannot safely auto-fix, it **fails loudly** and
leaves a note here for a human to decide. It does not guess, and it does not silently move on. This is the
human-in-the-loop side of *autofix the unambiguous, escalate everything else* — see
[[rule-synapse-fail-loudly]]. An agent never starts new, unrequested work off the back of an escalation; it
writes the note and stops on that item ([[rule-no-unprompted-actions]]).

## What gets escalated

Anything that needs judgement or is destructive: ambiguous intent, more than one fix candidate (or none),
an authoring decision, a contradiction, a missing migration target, or any record mutation
(a `DELETE`/bulk-`UPDATE` is *always* escalated, never applied). Unresolved linter errors are surfaced here
loudly — never swallowed to make a pass look clean.

## Naming

```
YYYY-MM-DD-<slug>.md
```

## Template

```markdown
# <date> — <agent>: <one-line roadblock>

## What I found
A precise description of the issue, with paths/links to the affected notes or records.

## Why I did not auto-fix
The judgement call or risk that put this in the escalate bucket (ambiguous intent, >1 candidate,
authoring decision, destructive/record mutation, …).

## Options
- [ ] Option A — …
- [ ] Option B — …
- [ ] Option C — …

Recommendation: Option <X>, because …

## What I did safely
The unambiguous, reversible fixes already applied this pass (so the human sees the delta and trusts the
rest of the run). "None" is a valid answer.
```

## Resolving

A human picks an option (checks the box / edits the note). On the next pass the agent reads `attention/`
**first**, actions the resolved item, and clears the note. Open escalations stay until decided.
