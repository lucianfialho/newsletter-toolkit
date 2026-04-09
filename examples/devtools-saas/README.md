# Example: DevTools & SaaS Infrastructure

Weekly newsletter covering the developer tools and SaaS infrastructure ecosystem:
Vercel, Supabase, Railway, GitHub, and Cloudflare Workers.

## Platforms covered

| Agent file | Platform | Source |
|-----------|----------|--------|
| `vercel-researcher.md` | Vercel | https://vercel.com/changelog |
| `supabase-researcher.md` | Supabase | https://supabase.com/changelog |
| `github-researcher.md` | GitHub | https://github.blog/changelog |
| `cloudflare-researcher.md` | Cloudflare Workers | https://developers.cloudflare.com/changelog |
| `railway-researcher.md` | Railway | WebSearch |

## Setup

1. Copy the `agents/` files to your plugin's `agents/` directory, replacing the existing researchers:
   ```bash
   cp examples/devtools-saas/agents/*.md agents/
   ```

2. Update `agents/digest-coordinator.md` — in FASE 1, replace the 5 Task calls with:
   ```
   Task(vercel-researcher, ...)
   Task(supabase-researcher, ...)
   Task(github-researcher, ...)
   Task(cloudflare-researcher, ...)
   Task(railway-researcher, ...)
   ```
   And update `results.research` in state.json to:
   `{ "vercel": null, "supabase": null, "github": null, "cloudflare": null, "railway": null }`

3. Configure the plugin:
   ```
   /plugin configure newsletter-toolkit
   → Newsletter Feed URL: https://YOUR-NEWSLETTER.substack.com/feed
   ```

## Example output structure

```markdown
# DevTools Weekly #042

Semana movimentada no lado da infra. Vercel lançou X, Supabase entregou Y...

---

## O que rolou essa semana

- **Vercel** lançou X
- **Supabase** entregou Y
- **GitHub**: nada
- **Cloudflare, Railway**: atualizações menores
```
