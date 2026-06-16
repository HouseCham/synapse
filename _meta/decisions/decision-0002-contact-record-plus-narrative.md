---
id: decision-0002-contact-record-plus-narrative
type: decision
title: People are a contact record plus an optional narrative note
tags:
  - type/decision
  - area/contacts
  - status/active
related: ["[[doc-storage-model]]"]
---

**Status:** Accepted — 2026-06-15

## Context
A person has **structured fields** worth querying and relating (name, phone, email, city, birthday) and
**narrative** worth writing in prose (history, context, the relationship). Holding both in one place risks
the "two copies that diverge" problem the single-source rule exists to forbid.

## Decision
Model the two separately and link them:
- **`contact`** — the structured record. Canonical in SQL; a read-only Markdown view
  (`contacts/<slug>.md`) is generated.
- **`person`** — an optional, hand-authored narrative note, canonical in Markdown, created only when there
  is real narrative.

They **link, never duplicate**: the person note does not restate structured fields; the contact view holds
no prose.

## Consequences
- (+) Clean single source per fact; queryable structure *and* linkable narrative.
- (−) Requires discipline (link, don't restate) — enforced by [[rule-synapse-single-source-of-truth]] and
  [[rule-derived-views-are-generated]].

## Related
[[doc-storage-model]] · [[rule-synapse-single-source-of-truth]] · [[rule-derived-views-are-generated]]
