---
id: decision-0004-opencode-local-ollama-runtime
type: decision
title: Agents run on OpenCode + local Ollama over Tailscale (no cloud, no API key)
tags:
  - type/decision
  - area/runtime
  - status/active
related: ["[[doc-agent-architecture]]"]
---

**Status:** Accepted — 2026-06-15

## Context
Synapse must be LLM-agnostic, private, and local-first, with no public endpoint and no SaaS dependency in
the core loop. A local setup already runs **OpenCode** against local models over Tailscale.

## Decision
The agent runtime is **OpenCode** (`opencode-ai`), configured at `~/.config/opencode/opencode.json`,
pointing at **Ollama** over **Tailscale** (an OpenAI-compatible endpoint). Primary model
`ollama/qwen3.6-256k` (256K context); a larger model is the heavy-reasoning fallback. Agents are launched
headlessly with `opencode run -m <model> --dir <vault> "<briefing>"`, where the briefing is produced by
the render engine. This **replaces** the source pattern's single-vendor `claude -p` (subscription) CLI.

## Consequences
- (+) Fully local inference — **no API key, no cloud, no subscription** in the core loop; strictly more
  private and more vendor-neutral than the pattern it ports.
- (+) Config-driven model choice keeps the system LLM-agnostic (swap models in one config file).
- (−) Local throughput and an 8K output cap mean the maintainer must work in small, scoped diffs (which
  the design already favors) and chunk large outputs.
- (Δ) The nightly maintainer is constrained by OpenCode's **permission config** (allow/deny/ask, per
  agent) plus the human-gated PR — **not** by `--dangerously-skip-permissions`, which is unsafe for a
  finances-bearing vault.
- (open) The source OpenCode setup uses the TUI as the interface, with **no Open WebUI and no MCP**.
  Whether to add Open WebUI as a separate read-only RAG/chat front-end is unresolved — flagged for review.

## Related
[[doc-agent-architecture]] · [[doc-maintainer-loop]] · [[doc-security-privacy]]
