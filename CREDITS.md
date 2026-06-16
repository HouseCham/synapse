# Credits

Synapse is a manifest-driven, local-first personal-knowledge-vault framework. It stands on ideas and
open tooling from others. Credited here for what it genuinely uses or is inspired by — nothing more.

## Special thanks

[@JavierCorado](https://github.com/JavierCorado) — for teaching me and inspiring me to develop this.

## Ideas

- **Andrej Karpathy — the ["LLM Wiki" gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** —
  the seed idea: an LLM incrementally maintains a persistent, interlinked Markdown knowledge base as a
  *compiled artifact* that grows richer with each source, while the human curates and asks. Synapse is a
  manifest-driven realization of that pattern: typed atoms (notes) → typed edges (links) → an ontology
  (the manifest) → a deterministic rendered context (the briefing the engine compiles).
- **The loop-engineering pattern** — standing "run-until-dry" maintenance: a loop that re-detects on each
  pass, heals the unambiguous, escalates the rest, and exits only when a pass is dry. Implemented by the
  nightly maintainer loop (`loops/loop-maintain-synapse.md`).
- **Reciprocal Rank Fusion (RRF)** — the hybrid-retrieval technique used to fuse the deterministic
  typed-graph closure with embedding-similarity hits in the semantic-recall layer.
- **[MemPalace](https://github.com/MemPalace/mempalace)** — a local-first AI memory system (verbatim
  storage + semantic search). Studying it shaped Synapse's hybrid semantic-recall design and its
  additive, never-authoritative suggestions boundary. Well worth a look for a complementary,
  recall-first take on local memory.

## Tooling the framework runs on

- **[OpenCode](https://opencode.ai)** — the local, config-driven agent runtime (`opencode-ai`).
- **[Ollama](https://ollama.com)** — local models and embeddings (`mxbai-embed-large` by default).
- **[Obsidian](https://obsidian.md)** — graph visualization and Markdown editing over the vault.
- **Node's built-in SQLite (`node:sqlite`)** — the records substrate; no native dependency.
- **[`sqlite-vec`](https://github.com/asg017/sqlite-vec)** — the documented scale-up path for vector
  search beyond the default brute-force cosine.

## License

Synapse is released under the [MIT License](LICENSE).
