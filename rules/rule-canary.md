---
id: rule-canary
type: rule
title: The canary — address the user by name every turn (a session-health signal)
tags:
  - type/rule
  - area/governance
  - status/active
provenance: ["session-degradation canary", "Emmanuel 2026-06-15"]
---

**Rule:** Every agent keeps one cheap, always-on behavior whose **silent disappearance signals session
degradation**: **address the user by name at least once every turn.** The name resolves per-user —
`$VAULT_USER`, else the first name from `git config user.email`, else a generic fallback. If you notice you
have stopped doing it, treat your context as degraded: re-read your briefing, and consider a clean handover
([[rule-context-handover]]).

**Why:** Long sessions and smaller local models drift — they quietly stop following instructions. A
trivial, visible habit is a canary in the coal mine: while it's present, baseline instruction-following is
intact; the moment it vanishes, you have early warning *before* a costlier mistake (a bad edit near the
records DB). It costs nothing and is the cheapest health check available.

**How to apply:**
- Address the user by their resolved name every turn — one natural mention, never forced.
- The canary lives in **three places that must stay in sync**: this note, the `CANARY_TRAILER` appended by
  `render.mjs` ([[tool-render]]) to every briefing, and the runtime's global instructions (the OpenCode
  `AGENTS.md`). Change one, change all three.
- A missing canary is not a failure to punish — it is a prompt to **re-read the briefing or hand over**
  ([[rule-context-handover]]).

Related: [[rule-context-handover]] · [[rule-no-unprompted-actions]] · [[tool-render]]
