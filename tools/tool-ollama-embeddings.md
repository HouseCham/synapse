---
id: tool-ollama-embeddings
type: tool
title: Ollama embeddings — local vectors for semantic recall
tags:
  - type/tool
  - area/retrieval
  - status/active
---

# Ollama embeddings

The embedding source for Synapse's semantic-recall layer ([[doc-semantic-recall]]). The **same local
Ollama** that runs the agents (over Tailscale, no API key) also serves embedding models, so semantic
search adds **no new runtime and no cloud**.

## Models
- `mxbai-embed-large` (default) — richer, higher-dimensional (1024-dim); top retrieval quality for its class.
- `nomic-embed-text` — faster and lighter (768-dim); the lower-resource alternative.
- `embeddinggemma` — compact multilingual alternative.

Pin one model and store its name alongside each vector (`note_vectors.model`); changing models means
re-embedding, so the choice is recorded, not implicit.

## How it's used
`gen-embeddings.mjs` calls the Ollama embeddings endpoint for each note body and stores the returned float
vector as a BLOB in `note_vectors` ([[doc-sql-schema]]). `augment.mjs` embeds the query (briefing + task)
the same way, then ranks notes by cosine similarity. The endpoint and model come from the same config as
the chat runtime ([[decision-0004-opencode-local-ollama-runtime]]) — no hostname or key is hardcoded in the
vault.

## Caveat
If Ollama is unreachable, embedding generation and the augment step **skip with a clear message**
([[rule-semantic-suggests-links-decide]]); the deterministic briefing is never blocked.

## Related
[[doc-semantic-recall]] · [[decision-0005-hybrid-retrieval]] · [[rule-semantic-suggests-links-decide]] · [[tool-render]] · [[tool-sqlite]]
