# newsletter-toolkit

A Claude Code plugin for generating weekly analytics/martech newsletters with automated research, multi-CMS publishing, and voice-calibrated humanization.

## Skills

| Skill | Command | Description |
|-------|---------|-------------|
| `setup` | `/newsletter-toolkit:setup` | Validate configuration, test Serper and CMS connections, show what's missing |
| `digest` | `/newsletter-toolkit:digest` | Generate weekly digest with automated research across GA4, GTM, BigQuery, Looker Studio, and Meta Ads |
| `blog-post` | `/newsletter-toolkit:blog-post <URL>` | Adapt an English article to PT-BR and publish to your CMS |
| `humanizer` | `/newsletter-toolkit:humanizer` | Remove AI writing patterns and calibrate tone to match past editions |
| `lab-notes` | `/newsletter-toolkit:lab-notes "Experiment Name"` | Document experiments with real metrics and honest failure analysis |

## Requirements

- Node.js 18+
- Serper API key (free tier available at [serper.dev](https://serper.dev))

## Installation

```bash
/plugin install newsletter-toolkit
```

After installation, validate your setup:

```
/newsletter-toolkit:setup
```

This checks all config values, tests Serper and CMS connectivity, verifies Node.js and MCP server dependencies, and lists exactly what needs to be fixed.

To update any config value after installation:

```
/plugin configure newsletter-toolkit
```

During installation you'll be prompted for:

- `serper_api_key` — required for Meta Ads news search
- `newsletter_feed_url` — RSS feed of your newsletter (for deduplication)
- `podcast_feed_url` — RSS feed of your podcast (optional, integrated into digest)
- `blog_feed_url` — RSS feed of your blog (optional)
- `cms_type` — `strapi`, `wordpress`, or `none`
- `cms_endpoint` — CMS API URL (e.g. `https://api.yourblog.com/api/articles`)
- `cms_auth_token` — Bearer token for CMS authentication
- `output_dir` — Local directory for saving newsletters (default: plugin data dir)

## Usage

### Weekly digest

```
/newsletter-toolkit:digest
```

Runs 5 researchers in parallel (GA4, GTM, BigQuery, Looker Studio, Meta), deduplicates against your RSS feed, adapts foreign sources to your blog, and humanizes the final text.

### Blog post from URL

```
/newsletter-toolkit:blog-post https://example.com/article
```

Fetches the article, adapts it to PT-BR, checks for duplicate slugs, and publishes to your configured CMS. Returns the published URL.

### Humanizer

```
/newsletter-toolkit:humanizer
```

Reads the voice profile (or regenerates it from your last 5 newsletters), identifies AI writing patterns, and rewrites the text to match the author's real voice.

### Build voice profile manually

```bash
build-voice-profile        # analyze last 5 newsletters
build-voice-profile 10     # analyze last 10
build-voice-profile --force  # recalculate even if < 14 days old
```

### Lab notes

```
/newsletter-toolkit:lab-notes "Multi-Agent Orchestration"
```

Analyzes the project, extracts real metrics, documents failures honestly, and saves a Skunkworks Lab Note to the plugin data directory.

## CMS configuration

### Strapi v5

```
cms_type: strapi
cms_endpoint: https://api.yourblog.com/api/articles
cms_auth_token: your-bearer-token
```

### WordPress

```
cms_type: wordpress
cms_endpoint: https://yourblog.com
cms_auth_token: your-application-password
```

### Local files (no CMS)

```
cms_type: none
```

Saves articles as markdown files in `~/.claude/plugins/data/newsletter-toolkit/blog-posts/`.

## Architecture

The plugin bundles a lightweight MCP server (`newsletter-mcp`) that provides four tools:

- `get_current_time` — temporal context for date filtering
- `fetch_rss_feed` — parses RSS/Atom feeds
- `scrape_web_page` — extracts main content from web pages
- `serper_search` / `serper_news` — news and web search via Serper API

The digest skill delegates to a coordinator agent that orchestrates five researcher agents in parallel, then aggregates, filters, and generates the final newsletter.

## Data storage

All generated files are stored in `~/.claude/plugins/data/newsletter-toolkit/`:

```
newsletters/    ← saved digest editions
blog-posts/     ← blog posts (when cms_type: none)
lab-notes/      ← skunkworks lab notes
voice-profile.json  ← author voice calibration
```

## License

MIT
