# Changelog

## [1.0.0] - 2026-04-06

### Added

- `digest` skill: weekly analytics/martech digest with parallel researchers for GA4, GTM, BigQuery, Looker Studio, and Meta Ads. Includes RSS-based deduplication, Phase 4.5 foreign source adaptation, and humanization.
- `blog-post` skill: adapts English articles to PT-BR and publishes to Strapi, WordPress, or local markdown. Multi-CMS via `userConfig`.
- `humanizer` skill: removes 18 categories of AI writing patterns. Voice calibration from saved newsletters via `build-voice-profile`.
- `lab-notes` skill: documents experiments with real metrics, honest failure reporting, and Skunkworks format.
- Bundled `newsletter-mcp` server with `get_current_time`, `fetch_rss_feed`, `scrape_web_page`, `serper_search`, `serper_news`.
- `build-voice-profile` CLI script: analyzes last N newsletters from plugin data dir and generates `voice-profile.json`.
- 7 agents: `digest-coordinator`, `ga4-researcher`, `gtm-researcher`, `bigquery-researcher`, `looker-researcher`, `meta-researcher`, `lab-notes-coordinator`.
