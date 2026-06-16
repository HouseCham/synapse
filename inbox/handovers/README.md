# inbox/handovers/ — clean session handoffs

An agent never runs a session to exhaustion. When a human asks to hand over (or context runs low), the
agent **lands the current step at a safe point**, leaves the work committed and lint-clean, writes a
handover note here, and returns the exact relaunch command. This is the durable bridge across a context
reset — the next session (or person) resumes without guessing what was half-done. See
[[rule-context-handover]].

## Naming

```
YYYY-MM-DD-<slug>.md
```

## Shape

```markdown
# <date> — <agent>: <one-line summary of where we landed>

## What was done
What this session completed, at the level the next session needs. Note that work is left committed and
`lint.mjs` is `errors=0`.

## What's next
The next concrete step(s), in order. Enough that the next session can pick up cold.

## Open escalations
Links to any `inbox/attention/` items still awaiting a human decision. "None" is valid.

## Relaunch command
The exact command to resume, e.g.:

    opencode run -m <model> --dir . "$(render.mjs <agent> <target> --profile standard)"
```

## Why this shape

The agent's context does not persist across runs; the durable state is git plus the inbox. The note plus
the relaunch command are what let the work survive a reset. Hand the relaunch command back in the reply as
well, and do not start new, unrequested work after a handover ([[rule-no-unprompted-actions]]). Consumed
handovers are cleared once the next session picks the thread back up.
