# Design: Digest Execution Plan — State File + Agent Teams

**Date:** 2026-04-08
**Status:** Approved
**Scope:** Refactor `digest-coordinator` and all researcher agents to use a structured, deterministic execution plan with shared state via isolated files per agent.

---

## Problem

The current `digest-coordinator` is a long narrative markdown document that Claude interprets differently on each run. This causes:

- Inconsistent newsletter structure across editions
- Phase 4.5 (adapt foreign sources to blog) is always skipped because the coordinator can't call skills
- No recovery if execution fails mid-way
- No auditability of what happened in a given run

## Goal

Every `/newsletter-toolkit:digest` run follows the same 6 phases in the same order. The only variation is the dynamic content of the execution context (which topics to exclude, which URLs to adapt). A run can be resumed if it fails. Each agent has a contract — explicit input and output.

---

## Architecture

### Run directory structure

Each execution creates an isolated directory:

```
CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD/
  ├── state.json             ← coordinator reads/writes (orchestration only)
  ├── research-ga4.json      ← written by ga4-researcher
  ├── research-gtm.json      ← written by gtm-researcher
  ├── research-bigquery.json ← written by bigquery-researcher
  ├── research-looker.json   ← written by looker-researcher
  ├── research-meta.json     ← written by meta-researcher
  ├── blog-post-{hash}.json  ← one per foreign URL, written by blog-post agent ({hash} = first 8 chars of URL's SHA-256)
  └── digest-draft.json      ← written by coordinator in Phase 4
```

Parallel agents write to their own files to avoid concurrent write conflicts on `state.json`.

### `state.json` schema

```json
{
  "run_id": "2026-04-08",
  "created_at": "ISO timestamp",
  "status": "planning | executing | completed | failed",

  "plan": {
    "phases": [
      { "id": "research",   "agents": ["ga4", "gtm", "bigquery", "looker", "meta"], "parallel": true  },
      { "id": "aggregate",  "agents": ["digest-coordinator"], "parallel": false },
      { "id": "blog_posts", "agents": ["blog-post"], "parallel": true, "dynamic": true },
      { "id": "generate",   "agents": ["digest-coordinator"], "parallel": false },
      { "id": "humanize",   "agents": ["humanizer"], "parallel": false },
      { "id": "save",       "agents": ["digest-coordinator"], "parallel": false }
    ]
  },

  "context": {
    "date": "2026-04-08",
    "lookback_days": 7,
    "exclusions": ["list of topics already covered, extracted from RSS feed"],
    "foreign_urls": [
      { "url": "https://...", "platform": "meta", "context": "brief summary" }
    ]
  },

  "results": {
    "research":      { "ga4": null, "gtm": null, "bigquery": null, "looker": null, "meta": null },
    "blog_posts":    {},
    "digest_draft":  null,
    "digest_final":  null,
    "output_path":   null
  }
}
```

---

## Coordinator Flow

### Moment 1 — Planning (Phase 0)

Always static. Creates the run directory and `state.json`:

1. `get_current_time` → set `run_id` and `context.date`
2. `fetch_rss_feed(newsletter_feed_url)` → extract `context.exclusions[]`
3. Write `state.json` with static plan skeleton + dynamic context
4. Set `status: "executing"`

### Moment 2 — Execution

**Phase 1 — Research (parallel)**
Spawn 5 researcher agents simultaneously. Each receives:
```json
{ "date": "...", "lookback_days": 7, "exclusions": [...] }
```
Each writes to its own `research-{name}.json`. Coordinator waits for all to complete.

**Phase 2 — Aggregate**
Coordinator reads all `research-*.json` files. For each update where `is_foreign: true`, appends to `context.foreign_urls[]`. Updates `state.json`.

**Phase 3 — Blog Posts (parallel, dynamic)**
For each URL in `context.foreign_urls[]`, spawn one blog-post agent. Each writes to `blog-post-{url-hash}.json`. Failures write `status: "failed"` — execution continues with the original URL as fallback.

**Phase 4 — Generate**
Coordinator reads all research results and blog post results. Replaces foreign URLs with `blog_url` where `status: "published"`. Generates digest draft. Writes to `digest-draft.json`.

**Phase 5 — Humanize**
Humanizer agent reads `digest-draft.json`. Applies voice calibration. Writes `digest_final` back to `state.json`.

**Phase 6 — Save**
Coordinator writes final digest to `output_path`. Sets `status: "completed"`. Cleans up run directories older than 10 runs.

### Moment 3 — Recovery

On startup, coordinator checks if a run file already exists for today:
- `status: "completed"` → skip, already done
- `status: "executing"` → read `results.*`, skip phases where result is non-null, resume from first null result

---

## Agent Contracts

### Researchers

**Input (via prompt):**
```json
{
  "date": "2026-04-08",
  "lookback_days": 7,
  "exclusions": ["topic A", "topic B"]
}
```

**Output (writes to `research-{name}.json`):**
```json
{
  "agent": "meta",
  "nothing_new": false,
  "updates": [
    {
      "title": "Update title",
      "summary": "1-2 sentences",
      "date": "2026-04-05",
      "url": "https://...",
      "is_foreign": true,
      "platform": "meta",
      "relevance": "high | medium | low"
    }
  ]
}
```

The `is_foreign: true` flag is what automatically populates `context.foreign_urls` in Phase 2. No manual intervention needed.

### Blog-Post Agent

**Input:**
```json
{
  "url": "https://socialmediatoday.com/...",
  "platform": "meta",
  "newsletter_context": "brief context from researcher"
}
```

**Output (writes to `blog-post-{hash}.json`):**
```json
{
  "url": "https://socialmediatoday.com/...",
  "blog_url": "https://metricasboss.com.br/artigos/slug",
  "title_ptbr": "Título em PT-BR",
  "status": "published | failed",
  "error": null
}
```

On failure: `status: "failed"`, coordinator uses original `url` as fallback in the digest.

---

## Edge Cases

### All researchers return `nothing_new: true`
Coordinator detects this after Phase 2. Generates a short "no updates this week" edition and skips Phases 3-5. Sets `status: "completed"`.

### Blog-post agent fails
Sets `status: "failed"` in its result file. Coordinator uses the original foreign URL in the digest instead of the blog URL. Does not block other phases.

### Run file exists with `status: "executing"`
Coordinator resumes from first phase where result is `null`. Phases with non-null results are skipped entirely.

### Run retention
After saving, coordinator checks `CLAUDE_PLUGIN_DATA/runs/` and removes the oldest run directories if total count exceeds 10.

---

## Files Changed

| File | Change |
|------|--------|
| `agents/digest-coordinator.md` | Full rewrite — structured 6-phase flow reading/writing state files |
| `agents/ga4-researcher.md` | Add explicit input/output contract, write to `research-ga4.json` |
| `agents/gtm-researcher.md` | Same |
| `agents/bigquery-researcher.md` | Same |
| `agents/looker-researcher.md` | Same |
| `agents/meta-researcher.md` | Same |
| `skills/digest/SKILL.md` | Update workflow description to reflect new architecture |

No new files. No changes to MCP server or plugin.json.
