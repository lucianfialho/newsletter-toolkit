# Examples

Configurações prontas de agentes de pesquisa para diferentes nichos de newsletter.

Cada exemplo tem 5 researcher agents que substituem os padrões (Analytics/Martech) do plugin.

## Nichos disponíveis

| Diretório | Nicho | Plataformas cobertas |
|-----------|-------|---------------------|
| [`analytics-martech/`](../agents/) | Analytics & Martech | GA4, GTM, BigQuery, Looker Studio, Meta Ads |
| [`devtools-saas/`](devtools-saas/) | DevTools & SaaS | Vercel, Supabase, GitHub, Cloudflare, Railway |
| [`ai-llm/`](ai-llm/) | AI & LLM Models | OpenAI, Anthropic, Google AI, Mistral, Hugging Face |
| [`js-ecosystem/`](js-ecosystem/) | JavaScript Ecosystem | Next.js, React/Vite, Node.js, TypeScript, Deno/Bun |

> Analytics & Martech é o padrão — os agents já estão em `agents/` na raiz do plugin.

## Como usar

1. Escolha o nicho que faz mais sentido para a sua audiência.

2. Copie os agents do exemplo escolhido para `agents/`:
   ```bash
   cp examples/devtools-saas/agents/*.md agents/
   ```

3. Edite `agents/digest-coordinator.md` — na **FASE 1**, substitua os 5 `Task()` calls pelos nomes dos novos agents. Atualize também a lista `results.research` no `state.json` do Passo 1.5.

4. Pronto. O workflow de pesquisa, adaptação de links e humanização funciona igual para qualquer nicho.

## Estrutura de cada exemplo

```
examples/{nicho}/
├── README.md          ← descrição do nicho, setup, exemplos de output
└── agents/
    ├── {plataforma-1}-researcher.md
    ├── {plataforma-2}-researcher.md
    ├── {plataforma-3}-researcher.md
    ├── {plataforma-4}-researcher.md
    └── {plataforma-5}-researcher.md
```

## Criando seu próprio nicho

Cada researcher agent segue o mesmo contrato:

**Input** (JSON no prompt do coordinator):
```json
{
  "date": "YYYY-MM-DD",
  "lookback_days": 7,
  "exclusions": ["tópicos já cobertos"],
  "run_dir": "/path/to/runs/YYYY-MM-DD"
}
```

**Output** (arquivo JSON em `run_dir`):
```json
{
  "agent": "nome-do-agent",
  "platform": "Nome da Plataforma",
  "source": "URL ou 'serper_news'",
  "nothing_new": false,
  "updates": [
    {
      "title": "...",
      "date": "YYYY-MM-DD",
      "summary": "...",
      "url": "...",
      "is_foreign": false,
      "platform": "...",
      "relevance": "high|medium|low",
      "category": "..."
    }
  ],
  "searchDate": "YYYY-MM-DD"
}
```

**Regra `is_foreign`**: `true` se a URL não pertence ao domínio oficial da plataforma (ex: artigo no TechCrunch sobre a plataforma). Updates com `is_foreign: true` são automaticamente adaptados para o blog do usuário antes de entrar no digest.

**Fonte sem release notes oficiais?** Use `serper_news` como os exemplos de Railway, Mistral e Hugging Face.
