---
id: rule-context-handover
type: rule
title: Hand over cleanly on request — land the step, write the note, return the relaunch command
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["context-handover discipline for long-running sessions", "Emmanuel 2026-06-15"]
---

**Rule:** An agent never runs a session to exhaustion. When a human asks to hand over (or context runs
low), the agent **lands the current step at a safe point**, writes a **handover note** to
`inbox/handovers/`, and returns the exact **relaunch command** to resume. Work is left committed,
lint-clean, and reviewable — never mid-mutation.

**Why:** Long sessions degrade, and an agent's context does not persist across runs; the durable state is
git + the inbox. A clean handover is how progress survives a reset — the next session (or the next person)
resumes without guessing what was half-done.

**How to apply:**
- On a handover request: finish or cleanly back out the in-flight edit, ensure `lint.mjs` is `errors=0`,
  and branch/commit per [[rule-synapse-human-gated-push]].
- Write `inbox/handovers/<YYYY-MM-DD>-<slug>.md`: what was done, what's next, open escalations, and the
  relaunch command (e.g. `opencode run -m <model> --dir . "$(render.mjs <agent> <target> --profile standard)"`).
- Hand back that relaunch command in the reply. Do not start new, unrequested work after a handover
  ([[rule-no-unprompted-actions]]).

Related: [[rule-no-unprompted-actions]] · [[rule-canary]] · [[rule-synapse-human-gated-push]] · [[loop-maintain-synapse]]
