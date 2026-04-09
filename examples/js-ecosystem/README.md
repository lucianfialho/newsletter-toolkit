# Example: JavaScript Ecosystem

Weekly newsletter covering the JavaScript ecosystem:
Next.js, React/Vite, Node.js, TypeScript, and Deno/Bun.

## Platforms covered

| Agent file | Platform | Source |
|-----------|----------|--------|
| `nextjs-researcher.md` | Next.js | https://nextjs.org/blog + GitHub releases |
| `react-vite-researcher.md` | React & Vite | GitHub releases |
| `nodejs-researcher.md` | Node.js | https://nodejs.org/en/blog/release |
| `typescript-researcher.md` | TypeScript | https://devblogs.microsoft.com/typescript |
| `runtime-researcher.md` | Deno & Bun | scrape + WebSearch fallback |

## Setup

1. Copy the `agents/` files to your plugin's `agents/` directory:
   ```bash
   cp examples/js-ecosystem/agents/*.md agents/
   ```

2. Update `agents/digest-coordinator.md` — in FASE 1, replace the 5 Task calls with:
   ```
   Task(nextjs-researcher, ...)
   Task(react-vite-researcher, ...)
   Task(nodejs-researcher, ...)
   Task(typescript-researcher, ...)
   Task(runtime-researcher, ...)
   ```
   And update `results.research` in state.json to:
   `{ "nextjs": null, "react-vite": null, "nodejs": null, "typescript": null, "runtime": null }`

3. Configure the plugin:
   ```
   /plugin configure newsletter-toolkit
   → Newsletter Feed URL: https://YOUR-NEWSLETTER.substack.com/feed
   ```

## Tone guidance

Audiência: devs que usam essas ferramentas no dia a dia. Bom digest:
- Foca no impacto prático ("migração necessária?", "performance melhora X%")
- Separa breaking changes de novas features
- Não explica conceitos básicos — assume que o leitor já sabe o que é hydration

## Example output structure

```markdown
# JS Weekly #089

Semana de releases. Next.js 15.1 com turbopack estável, TypeScript 5.4 saiu do beta...

---

## O que rolou essa semana

- **Next.js 15.1** — Turbopack estável, nova cache API
- **TypeScript 5.4** — saiu do RC, decorator support melhorado
- **Node.js 22.x** — WebSocket nativo sem flag experimental
- **React, Vite**: nada
- **Deno 2.0** — primeiro RC disponível
```
