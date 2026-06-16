#!/usr/bin/env node
// render.mjs — manifest-driven, role-based context-vault renderer.
//
//   node _meta/tools/render.mjs <id> [<id> …] [--profile lean|standard|fat] \
//        [--include-tag t] [--exclude-tag t] [--dry-run] [--copy]
//   node _meta/tools/render.mjs --lint
//
// Walks the ROLE closure of one or more notes and concatenates linked bodies into a single context
// blob to feed any AI tool (or read live by an agent runtime).
//   • Multiple ids → one DEDUPED combined closure. Start ids are emitted first, in the order given.
//   • --copy → copy the blob to the OS clipboard (pbcopy/clip/xclip) instead of printing to stdout.
//   • --lint → validate manifest invariants over the whole index; never writes a file; exit 1 on violation.
//
// Nothing domain-specific is hardcoded: roles, fields, directions, endpoint types, profiles, auto-upgrade,
// drop tags, type priority and invariants ALL come from context.manifest.json. The same engine runs an
// arbitrary vault's manifest unchanged. The engine is stdin/stdout only and never writes/edits any .md.
//
// ROOT = the vault root (2 up from _meta/tools/). Manifest vaultRoot:"." is treated as this ROOT.
// Determinism: identical (start ids + flags) → byte-identical stdout.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MANIFEST = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "context.manifest.json"), "utf8"));
const SKIP = new Set(MANIFEST.skipDirs || []);
const VALUE_FLAGS = new Set(["--profile", "--include-tag", "--exclude-tag"]);

// ---- arg parse: collect ids (non-flag, non-flag-value) + flags + option values ----
const argv = process.argv.slice(2);
const ids = [];
const flags = new Set();
const optval = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (VALUE_FLAGS.has(a)) { optval[a] = argv[++i]; continue; }
  if (a.startsWith("--")) { flags.add(a); continue; }
  ids.push(a);
}
let profile = optval["--profile"] || "lean";
const includeTag = optval["--include-tag"];
const excludeTag = optval["--exclude-tag"];
const dryRun = flags.has("--dry-run");
const copy = flags.has("--copy");
const lint = flags.has("--lint");

if (!ids.length && !lint) {
  console.error("usage: render <id> [<id> …] [--profile lean|standard|fat] [--include-tag t] [--exclude-tag t] [--dry-run] [--copy] | render --lint");
  process.exit(2);
}

// ---- walk + index (built once; bodies/fields cached; no re-reads) ----
function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

// Every field referenced by any role — wikilink extraction is PER FIELD, scoped to these only.
const ROLE_FIELDS = new Set();
for (const r of Object.values(MANIFEST.roles)) for (const f of r.fields) ROLE_FIELDS.add(f);

const wikiRe = /\[\[([^\]]+)\]\]/g;
// Extract [[basename]] tokens from one frontmatter field's value only (strip |alias and #heading, drop junk).
function linksInField(fm, field) {
  const re = new RegExp(`^${field}:[ \\t]*(.*)$`, "m");
  const m = fm.match(re);
  if (!m) return [];
  let val = m[1];
  // Multi-line array robustness: value opens `[` with no closing `]` → keep appending following lines.
  if (val.includes("[") && !val.includes("]")) {
    const after = fm.slice(fm.indexOf(m[0]) + m[0].length);
    for (const line of after.split("\n")) {
      val += "\n" + line;
      if (line.includes("]")) break;
    }
  }
  const out = [];
  let w;
  while ((w = wikiRe.exec(val)) !== null) {
    const tok = w[1].split("|")[0].split("#")[0].trim();
    if (!tok || tok.includes("...") || tok.includes("<")) continue;
    out.push(tok);
  }
  return out;
}

// raw → frontmatter/body split kept EXACTLY (output bytes depend on it).
function parse(raw) {
  const end = raw.indexOf("\n---", 4);
  const fm = end > 0 ? raw.slice(0, end) : "";
  const body = (end > 0 ? raw.slice(end + 4) : raw).trim();
  const type = (fm.match(/^type:\s*(.+)$/m) || [])[1]?.trim() || "note";
  const tags = [...fm.matchAll(/-\s*([a-z][a-z0-9]*\/[a-z0-9.\-]+)/g)].map((m) => m[1]);
  const fields = {};
  for (const f of ROLE_FIELDS) fields[f] = linksInField(fm, f);
  return { type, tags, body, fields };
}

const index = new Map(); // basename → { type, tags, body, fields }
for (const f of walk(ROOT)) index.set(basename(f, ".md"), parse(readFileSync(f, "utf8")));

// Forward index: forward.get(src).get(field) = [targets present in index].
// Reverse index: for every src --field--> tgt, reverse.get(tgt).get(field) includes src.
const forward = new Map();
const reverse = new Map();
for (const [src, rec] of index) {
  for (const field of ROLE_FIELDS) {
    const targets = (rec.fields[field] || []).filter((t) => index.has(t));
    if (!targets.length) continue;
    if (!forward.has(src)) forward.set(src, new Map());
    forward.get(src).set(field, targets);
    for (const tgt of targets) {
      if (!reverse.has(tgt)) reverse.set(tgt, new Map());
      const m = reverse.get(tgt);
      if (!m.has(field)) m.set(field, []);
      m.get(field).push(src);
    }
  }
}
const edges = (idx, node, field) => idx.get(node)?.get(field) || [];

// The role whose reverseName === "members" (resolved generically, never hardcoded to BINDS).
const MEMBERS_ROLE = Object.keys(MANIFEST.roles).find((n) => MANIFEST.roles[n].reverseName === "members");

// Map a profile include-token → { role, name, cap } | { noop } | null(unknown).
function resolveToken(token) {
  if (token === "self" || token === "target") return { noop: true };
  if (MANIFEST.roles[token]) return { name: token, role: MANIFEST.roles[token], cap: Infinity };
  const reverseHit = Object.keys(MANIFEST.roles).find((n) => MANIFEST.roles[n].reverseName === token);
  if (reverseHit) return { name: reverseHit, role: MANIFEST.roles[reverseHit], cap: Infinity };
  const at = token.match(/^(.+)@(\d+)$/);
  if (at && MANIFEST.roles[at[1]]) return { name: at[1], role: MANIFEST.roles[at[1]], cap: parseInt(at[2], 10) };
  return null;
}

// All candidates reachable from `node` via one role (forward / reverse / both), across the role's fields.
function roleNeighbors(role, node) {
  const out = [];
  for (const field of role.fields) {
    if (role.direction === "forward" || role.direction === "both") out.push(...edges(forward, node, field));
    if (role.direction === "reverse" || role.direction === "both") out.push(...edges(reverse, node, field));
  }
  return out;
}

// ---- core closure for a set of start ids at the resolved profile ----
// Returns { seen:Set, addedBy:Map(node→roleName) }. Start ids are always kept (never dropped by filters).
function closure(startIds, prof) {
  const seen = new Set(startIds);
  const addedBy = new Map();

  const drop = (cand) => {
    const rec = index.get(cand);
    if (prof === "lean" && (MANIFEST.dropTagsAtLean || []).some((t) => rec.tags.includes(t))) return true;
    if (includeTag && !rec.tags.includes(includeTag)) return true;
    if (excludeTag && rec.tags.includes(excludeTag)) return true;
    return false;
  };
  // Add a candidate under a role: enforce endpointTypes, drop filter, dedupe, index membership.
  const tryAdd = (cand, role, roleName) => {
    if (!index.has(cand) || seen.has(cand)) return false;
    if (role.endpointTypes && !role.endpointTypes.includes(index.get(cand).type)) return false;
    if (drop(cand)) return false;
    seen.add(cand);
    addedBy.set(cand, roleName);
    return true;
  };

  const cfg = MANIFEST.profiles[prof] || {};
  for (const token of cfg.include || []) {
    const t = resolveToken(token);
    if (!t || t.noop) continue;
    if (t.cap === Infinity) {
      // single pass: expand ONCE from each start id (no recursion into newly-added nodes).
      for (const s of startIds) for (const c of roleNeighbors(t.role, s)) tryAdd(c, t.role, t.name);
    } else {
      // ROLE@N: BFS up to N hops over this single role, seeded from start ids.
      let frontier = [...startIds];
      for (let d = 0; d < t.cap && frontier.length; d++) {
        const next = [];
        for (const n of frontier) for (const c of roleNeighbors(t.role, n)) if (tryAdd(c, t.role, t.name)) next.push(c);
        frontier = next;
      }
    }
  }

  // fat profile: fixpoint BFS that keeps expanding the listed roles from EVERY reached node.
  if (cfg.transitive?.length) {
    const trans = cfg.transitive.map(resolveToken).filter((x) => x && !x.noop);
    let frontier = [...seen];
    while (frontier.length) {
      const next = [];
      for (const n of frontier) for (const t of trans) for (const c of roleNeighbors(t.role, n)) if (tryAdd(c, t.role, t.name)) next.push(c);
      frontier = next;
    }
  }

  return { seen, addedBy };
}

// ---- ordering: start ids first (given order), then manifest typePriority, tie-break localeCompare ----
function order(seen, startIds) {
  const PRIO = (type) => { const i = MANIFEST.typePriority.indexOf(type); return i === -1 ? 999 : i; };
  return [...seen].sort((a, b) => {
    const sa = startIds.indexOf(a), sb = startIds.indexOf(b);
    if (sa !== -1 || sb !== -1) return (sa === -1 ? 1e9 : sa) - (sb === -1 ? 1e9 : sb);
    return PRIO(index.get(a).type) - PRIO(index.get(b).type) || a.localeCompare(b);
  });
}
const tokensOf = (nodes) => Math.ceil(nodes.reduce((s, n) => s + index.get(n).body.length, 0) / 4);

// ====================================================================== --lint mode
// A threshold RHS is either a literal integer (`15000`) or a DYNAMIC cohort statistic
// (`3*median`, `p90`, `mean`, `max`) computed over the metric across all checked targets —
// so budgets self-scale as the vault grows instead of needing a hand-edited constant.
// Still a fixed, named vocabulary (metrics: members|tokens; stats: median|mean|max|pNN) — not a
// general expression evaluator. `when.excludeIds` drops listed ids from both the cohort and checks.
if (lint) {
  let failures = 0, checked = 0;
  const stat = (sorted, kind) => {
    if (!sorted.length) return 0;
    if (kind === "median") return sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    if (kind === "mean") return sorted.reduce((s, x) => s + x, 0) / sorted.length;
    if (kind === "max") return sorted[sorted.length - 1];
    const pm = kind.match(/^p(\d{1,3})$/);
    if (pm) return sorted[Math.max(0, Math.ceil((Math.min(100, +pm[1]) / 100) * sorted.length) - 1)];
    return NaN;
  };
  for (const inv of MANIFEST.invariants || []) {
    const { targetType, profile: invProfile, excludeIds = [] } = inv.when;
    const skip = new Set(excludeIds);
    const targets = [...index.keys()].filter((n) => index.get(n).type === targetType && !skip.has(n));
    // pass 1: resolve every target's metrics (so cohort stats can be computed before checks)
    const metrics = new Map();
    for (const node of targets) {
      const { seen, addedBy } = closure([node], invProfile);
      metrics.set(node, {
        members: [...addedBy.values()].filter((r) => r === MEMBERS_ROLE).length,
        tokens: tokensOf(order(seen, [node])),
      });
    }
    const cohort = (metric) => [...metrics.values()].map((m) => m[metric]).sort((a, b) => a - b);
    const threshold = (metric, rhs) => {
      if (/^\d+$/.test(rhs)) return parseInt(rhs, 10);
      const m = rhs.match(/^(?:([0-9]*\.?[0-9]+)\s*\*\s*)?(median|mean|max|p\d{1,3})$/);
      return m ? (m[1] ? parseFloat(m[1]) : 1) * stat(cohort(metric), m[2]) : NaN;
    };
    // pass 2: check each target's asserts against (possibly dynamic) thresholds
    for (const node of targets) {
      checked++;
      const mv = metrics.get(node);
      for (const assert of inv.assert) {
        const am = assert.match(/^(members|tokens)(>=|<=)(.+)$/);
        if (!am) { console.error(`  ✗ ${node}: unsupported assert "${assert}"`); failures++; continue; }
        const [, metric, op, rhsRaw] = am;
        const N = threshold(metric, rhsRaw.trim());
        if (Number.isNaN(N)) { console.error(`  ✗ ${node}: unsupported threshold "${rhsRaw.trim()}" in "${assert}"`); failures++; continue; }
        const actual = mv[metric];
        const ok = op === ">=" ? actual >= N : actual <= N;
        if (!ok) { console.error(`  ✗ ${node} (${targetType}@${invProfile}): ${assert} FAILED — actual ${metric}=${actual} vs ${Math.round(N)}`); failures++; }
      }
    }
  }
  console.error(`[render ${MANIFEST.repo}] --lint: ${checked} target(s) across ${(MANIFEST.invariants || []).length} invariant(s) — ${failures} violation(s)`);
  process.exit(failures ? 1 : 0);
}

// ====================================================================== render mode
const unknown = ids.filter((x) => !index.has(x));
if (unknown.length) { console.error(`unknown artifact(s): ${unknown.join(", ")}`); process.exit(2); }

// Auto-upgrade: lean + any start id's type is a key in autoUpgrade → bump profile (idempotent).
if (profile === "lean") {
  for (const id of ids) {
    const up = MANIFEST.autoUpgrade?.[index.get(id).type];
    if (up) { profile = up; break; }
  }
}

const { seen } = closure(ids, profile);
const ord = order(seen, ids);
const tokens = tokensOf(ord);

console.error(`[render ${MANIFEST.repo}] ids=${ids.length} profile=${profile} closure=${ord.length} notes ~${tokens} tokens${includeTag ? ` +tag=${includeTag}` : ""}${excludeTag ? ` -tag=${excludeTag}` : ""}`);

if (dryRun) {
  for (const n of ord) console.error(`  - ${n} (${index.get(n).type})`);
  process.exit(0);
}

// Canary/handover trailer — appended to every rendered briefing (see rule-canary, rule-context-handover).
// Name resolves: $VAULT_USER → first name from `git config user.email` → generic fallback. Stable per
// machine, so determinism (same ids+flags → same output) holds for a given checkout.
const NAME = process.env.VAULT_USER || (() => {
  try {
    const email = spawnSync("git", ["config", "user.email"], { encoding: "utf8" }).stdout.trim();
    const n = (email.split("@")[0] || "").split(/[._-]/)[0];
    return n ? n[0].toUpperCase() + n.slice(1) : "";
  } catch { return ""; }
})() || "there";
const CANARY_TRAILER = `\n<!-- canary (always on) -->\n` +
  `> Canary: address the user as **${NAME}** at least once every turn. If you notice you've stopped, your ` +
  `session has degraded — re-read this briefing. To hand over: land the step, ensure lint is errors=0, ` +
  `write inbox/handovers/<date>-<slug>.md, and return the relaunch command. (rule-canary · rule-context-handover)\n`;

const out = ord.map((n) => `\n<!-- ${n} (${index.get(n).type}) -->\n${index.get(n).body}`).join("\n") + "\n" + CANARY_TRAILER;

if (copy) {
  const tool = process.platform === "darwin" ? ["pbcopy", []]
    : process.platform === "win32" ? ["clip", []]
    : ["xclip", ["-selection", "clipboard"]];
  const r = spawnSync(tool[0], tool[1], { input: out });
  if (r.error || r.status !== 0) {
    console.error(`[render] --copy: '${tool[0]}' unavailable — falling back to stdout. (${r.error?.message || `exit ${r.status}`})`);
    process.stdout.write(out);
  } else {
    console.error(`[render] ✓ copied ${ord.length} notes (~${tokens} tokens) to clipboard — paste into your AI tool.`);
  }
} else {
  process.stdout.write(out);
}
