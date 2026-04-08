# Digest Execution Plan Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the digest-coordinator and all researcher agents to use a deterministic, state-file-driven execution model with explicit input/output contracts per agent.

**Architecture:** The coordinator generates a `run-state.json` at the start of each execution, writes it to `CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD/`, then orchestrates 6 phases. Each researcher writes to its own isolated file to avoid concurrent write conflicts. Phase 4.5 (blog post adaptation) becomes Phase 3 of the plan, triggered automatically by the `is_foreign` flag on research results.

**Tech Stack:** Markdown agent files (`.md`), JSON state files, Claude Code Task + Agent tools, MCP newsletter-mcp server.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `agents/digest-coordinator.md` | Rewrite | Orchestrates all 6 phases via state file |
| `agents/ga4-researcher.md` | Modify | Accept structured input, write `research-ga4.json` |
| `agents/gtm-researcher.md` | Modify | Accept structured input, write `research-gtm.json` |
| `agents/bigquery-researcher.md` | Modify | Accept structured input, write `research-bigquery.json` |
| `agents/looker-researcher.md` | Modify | Accept structured input, write `research-looker.json` |
| `agents/meta-researcher.md` | Modify | Accept structured input, write `research-meta.json` |
| `skills/digest/SKILL.md` | Modify | Update workflow section to reflect new architecture |

---

## Task 1: Update all 5 researchers — add Write tool and new output contract

The 5 researchers need two changes:
1. `Write` added to their `tools` list so they can write output files
2. New output format with `url`, `is_foreign`, `relevance`, and `run_dir` awareness

All 5 follow the same pattern. GA4 uses `scrape_web_page`; Meta uses `serper_news`; the rest use `scrape_web_page`. Only the source URL and platform name differ.

**Files:** All 5 `agents/research-*.md`

- [ ] **Step 1: Rewrite `agents/ga4-researcher.md`**

```markdown
---
name: ga4-researcher
description: Pesquisador especializado em atualizações do Google Analytics 4 (GA4) dos últimos 7 dias
tools: Write, mcp__newsletter-mcp__get_current_time, mcp__newsletter-mcp__scrape_web_page
model: haiku
---

# GA4 Updates Researcher

Você é um pesquisador especializado em **Google Analytics 4 (GA4)** apenas.

## INPUT

Você recebe um JSON no prompt com:
```json
{
  "date": "YYYY-MM-DD",
  "lookback_days": 7,
  "exclusions": ["lista de tópicos já cobertos"],
  "run_dir": "/path/to/CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD"
}
```

Ler o input do início do prompt. Se não houver input JSON, usar:
- `date`: resultado de `get_current_time`
- `lookback_days`: 7
- `exclusions`: []
- `run_dir`: usar `get_current_time` para montar o path

## PROCESSO

### 1. Definir janela temporal
```
get_current_time
# data_limite = date - lookback_days dias
```

### 2. Buscar release notes
```
scrape_web_page("https://support.google.com/analytics/answer/9164320")
```

### 3. Filtrar
- INCLUIR apenas updates com data dentro da janela temporal
- REJEITAR updates mais antigos
- REJEITAR tópicos que estão em `exclusions`
- Marcar `is_foreign: true` para URLs que não são do google.com (artigos de terceiros)

## OUTPUT

Escrever o JSON abaixo em `{run_dir}/research-ga4.json`:

```json
{
  "agent": "ga4",
  "platform": "GA4",
  "source": "https://support.google.com/analytics/answer/9164320",
  "nothing_new": false,
  "updates": [
    {
      "title": "Nome da feature/update",
      "date": "YYYY-MM-DD",
      "summary": "Resumo em 1-2 frases do que mudou e o impacto prático",
      "url": "https://link-para-fonte-ou-docs",
      "is_foreign": false,
      "platform": "GA4",
      "relevance": "high",
      "category": "Feature|Bugfix|Deprecation|Beta|Enhancement"
    }
  ],
  "searchDate": "YYYY-MM-DD"
}
```

Campos obrigatórios em cada update:
- `url`: link direto para o release note ou artigo fonte
- `is_foreign`: `true` se a URL não pertence ao domínio google.com/support.google.com
- `relevance`: "high" (breaking/impacto imediato), "medium" (feature nova), "low" (melhoria incremental)

Se ZERO updates novos: `"nothing_new": true, "updates": []`

## REGRAS

- NÃO buscar outras plataformas
- NÃO incluir updates antigos
- NÃO incluir rumores
- SEMPRE escrever o arquivo mesmo se nothing_new
- NÃO retornar texto — apenas escrever o arquivo e confirmar o path
```

- [ ] **Step 2: Rewrite `agents/gtm-researcher.md`**

```markdown
---
name: gtm-researcher
description: Pesquisador especializado em atualizações do Google Tag Manager (GTM) dos últimos 7 dias
tools: Write, mcp__newsletter-mcp__get_current_time, mcp__newsletter-mcp__scrape_web_page
model: haiku
---

# GTM Updates Researcher

Você é um pesquisador especializado em **Google Tag Manager (GTM)** apenas.

## INPUT

Você recebe um JSON no prompt com:
```json
{
  "date": "YYYY-MM-DD",
  "lookback_days": 7,
  "exclusions": ["lista de tópicos já cobertos"],
  "run_dir": "/path/to/CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD"
}
```

Ler o input do início do prompt. Se não houver input JSON, usar `get_current_time` para o `date` e defaults para o resto.

## PROCESSO

### 1. Definir janela temporal
```
get_current_time
# data_limite = date - lookback_days dias
```

### 2. Buscar release notes
```
scrape_web_page("https://support.google.com/tagmanager/answer/4620708")
```

### 3. Filtrar
- INCLUIR apenas updates dentro da janela temporal
- REJEITAR tópicos em `exclusions`
- Marcar `is_foreign: true` para URLs fora do google.com

## OUTPUT

Escrever em `{run_dir}/research-gtm.json`:

```json
{
  "agent": "gtm",
  "platform": "GTM",
  "source": "https://support.google.com/tagmanager/answer/4620708",
  "nothing_new": false,
  "updates": [
    {
      "title": "Nome do update",
      "date": "YYYY-MM-DD",
      "summary": "1-2 frases do que mudou e impacto prático",
      "url": "https://...",
      "is_foreign": false,
      "platform": "GTM",
      "relevance": "high|medium|low",
      "category": "Feature|Bugfix|Deprecation|Beta|Enhancement"
    }
  ],
  "searchDate": "YYYY-MM-DD"
}
```

Se ZERO updates novos: `"nothing_new": true, "updates": []`

## REGRAS

- NÃO buscar outras plataformas
- SEMPRE escrever o arquivo mesmo se nothing_new
- NÃO retornar texto — apenas escrever o arquivo e confirmar o path
```

- [ ] **Step 3: Rewrite `agents/bigquery-researcher.md`**

```markdown
---
name: bigquery-researcher
description: Pesquisador especializado em atualizações do BigQuery dos últimos 7 dias
tools: Write, mcp__newsletter-mcp__get_current_time, mcp__newsletter-mcp__scrape_web_page
model: haiku
---

# BigQuery Updates Researcher

Você é um pesquisador especializado em **Google BigQuery** apenas.

## INPUT

Você recebe um JSON no prompt com:
```json
{
  "date": "YYYY-MM-DD",
  "lookback_days": 7,
  "exclusions": ["lista de tópicos já cobertos"],
  "run_dir": "/path/to/CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD"
}
```

## PROCESSO

### 1. Definir janela temporal
```
get_current_time
```

### 2. Buscar release notes
```
scrape_web_page("https://cloud.google.com/bigquery/docs/release-notes")
```

### 3. Filtrar
- INCLUIR apenas updates dentro da janela temporal
- REJEITAR tópicos em `exclusions`
- Marcar `is_foreign: true` para URLs fora do cloud.google.com

## OUTPUT

Escrever em `{run_dir}/research-bigquery.json`:

```json
{
  "agent": "bigquery",
  "platform": "BigQuery",
  "source": "https://cloud.google.com/bigquery/docs/release-notes",
  "nothing_new": false,
  "updates": [
    {
      "title": "Nome do update",
      "date": "YYYY-MM-DD",
      "summary": "1-2 frases do que mudou e impacto prático",
      "url": "https://...",
      "is_foreign": false,
      "platform": "BigQuery",
      "relevance": "high|medium|low",
      "category": "Feature|Bugfix|Deprecation|Beta|Enhancement"
    }
  ],
  "searchDate": "YYYY-MM-DD"
}
```

Se ZERO updates novos: `"nothing_new": true, "updates": []`

## REGRAS

- NÃO buscar outras plataformas
- SEMPRE escrever o arquivo mesmo se nothing_new
- NÃO retornar texto — apenas escrever o arquivo e confirmar o path
```

- [ ] **Step 4: Rewrite `agents/looker-researcher.md`**

```markdown
---
name: looker-researcher
description: Pesquisador especializado em atualizações do Looker Studio dos últimos 7 dias
tools: Write, mcp__newsletter-mcp__get_current_time, mcp__newsletter-mcp__scrape_web_page
model: haiku
---

# Looker Studio Updates Researcher

Você é um pesquisador especializado em **Looker Studio** apenas.

⚠️ ESCOPO: Apenas Looker Studio (ferramenta de BI/dashboards, antiga Google Data Studio).
NÃO cobrir: Looker enterprise (Google Cloud core).
NÃO acessar: https://cloud.google.com/looker/docs/release-notes

## INPUT

Você recebe um JSON no prompt com:
```json
{
  "date": "YYYY-MM-DD",
  "lookback_days": 7,
  "exclusions": ["lista de tópicos já cobertos"],
  "run_dir": "/path/to/CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD"
}
```

## PROCESSO

### 1. Definir janela temporal
```
get_current_time
```

### 2. Buscar release notes
```
scrape_web_page("https://cloud.google.com/looker-studio/docs/release-notes")
```

### 3. Filtrar
- INCLUIR apenas updates dentro da janela temporal
- REJEITAR tópicos em `exclusions`
- Marcar `is_foreign: true` para URLs fora do cloud.google.com

## OUTPUT

Escrever em `{run_dir}/research-looker.json`:

```json
{
  "agent": "looker",
  "platform": "Looker Studio",
  "source": "https://cloud.google.com/looker-studio/docs/release-notes",
  "nothing_new": false,
  "updates": [
    {
      "title": "Nome do update",
      "date": "YYYY-MM-DD",
      "summary": "1-2 frases do que mudou e impacto prático",
      "url": "https://...",
      "is_foreign": false,
      "platform": "Looker Studio",
      "relevance": "high|medium|low",
      "category": "Feature|Bugfix|Deprecation|Beta|Enhancement"
    }
  ],
  "searchDate": "YYYY-MM-DD"
}
```

Se ZERO updates novos: `"nothing_new": true, "updates": []`

## REGRAS

- NÃO buscar outras plataformas
- NÃO acessar cloud.google.com/looker/docs (Looker enterprise)
- SEMPRE escrever o arquivo mesmo se nothing_new
- NÃO retornar texto — apenas escrever o arquivo e confirmar o path
```

- [ ] **Step 5: Rewrite `agents/meta-researcher.md`**

```markdown
---
name: meta-researcher
description: Pesquisador especializado em atualizações do Meta Ads (Facebook Ads) dos últimos 7 dias
tools: Write, mcp__newsletter-mcp__get_current_time, mcp__newsletter-mcp__serper_news
model: haiku
---

# Meta Ads Updates Researcher

Você é um pesquisador especializado em **Meta Ads (Facebook Ads)** apenas.

NOTA: Meta não tem release notes públicas diretas. Usar serper_news.

## INPUT

Você recebe um JSON no prompt com:
```json
{
  "date": "YYYY-MM-DD",
  "lookback_days": 7,
  "exclusions": ["lista de tópicos já cobertos"],
  "run_dir": "/path/to/CLAUDE_PLUGIN_DATA/runs/YYYY-MM-DD"
}
```

## PROCESSO

### 1. Definir janela temporal
```
get_current_time
```

### 2. Buscar notícias
```
serper_news("Meta Ads changes")
serper_news("Facebook Ads update")
```

### 3. Filtrar
- INCLUIR apenas notícias dentro da janela temporal
- REJEITAR notícias > lookback_days dias
- REJEITAR tópicos em `exclusions`
- REJEITAR rumores não confirmados
- REJEITAR notícias puramente financeiras sem impacto no produto
- `is_foreign: true` para TODOS os resultados do Meta (são sempre de portais externos)

## PRIORIZAÇÃO DE FONTES

1. Meta Newsroom (anúncios oficiais)
2. Meta for Business Blog
3. TechCrunch, The Verge, Social Media Today

## OUTPUT

Escrever em `{run_dir}/research-meta.json`:

```json
{
  "agent": "meta",
  "platform": "Meta Ads",
  "source": "serper_news",
  "nothing_new": false,
  "updates": [
    {
      "title": "Nome da feature/update",
      "date": "YYYY-MM-DD",
      "summary": "1-2 frases do que mudou e impacto prático",
      "url": "https://url-da-noticia-original",
      "is_foreign": true,
      "platform": "Meta Ads",
      "relevance": "high|medium|low",
      "category": "Feature|Policy|Enhancement"
    }
  ],
  "searchDate": "YYYY-MM-DD"
}
```

Se ZERO updates: `"nothing_new": true, "updates": []`

## REGRAS

- NÃO buscar outras plataformas
- SEMPRE escrever o arquivo mesmo se nothing_new
- NÃO retornar texto — apenas escrever o arquivo e confirmar o path
```

- [ ] **Step 6: Verify all 5 files have correct frontmatter tools field**

Check each file has `Write` in the tools list:
```bash
grep "^tools:" /Users/lucianfialho/Code/newsletter-toolkit/agents/ga4-researcher.md
grep "^tools:" /Users/lucianfialho/Code/newsletter-toolkit/agents/gtm-researcher.md
grep "^tools:" /Users/lucianfialho/Code/newsletter-toolkit/agents/bigquery-researcher.md
grep "^tools:" /Users/lucianfialho/Code/newsletter-toolkit/agents/looker-researcher.md
grep "^tools:" /Users/lucianfialho/Code/newsletter-toolkit/agents/meta-researcher.md
```

Expected: each line contains `Write,`

- [ ] **Step 7: Commit**

```bash
cd /Users/lucianfialho/Code/newsletter-toolkit
git add agents/ga4-researcher.md agents/gtm-researcher.md agents/bigquery-researcher.md agents/looker-researcher.md agents/meta-researcher.md
git commit -m "feat: add structured input/output contracts to all researcher agents"
```

---

## Task 2: Rewrite digest-coordinator — Moment 1 (Planning)

The coordinator creates the run directory and `state.json` at the start of every execution. This is the only phase that always runs from scratch.

**Files:** `agents/digest-coordinator.md` (begin rewrite — Moment 1 only)

- [ ] **Step 1: Write the new `agents/digest-coordinator.md` — frontmatter + Moment 1**

```markdown
---
name: digest-coordinator
description: Coordenador do digest semanal - orquestra 6 fases via state file, com execução determinística e recovery automático
tools: Task, Agent, Read, Write, Bash, Glob, Grep, Edit, mcp__newsletter-mcp__fetch_rss_feed, mcp__newsletter-mcp__get_current_time, mcp__newsletter-mcp__serper_search, mcp__newsletter-mcp__scrape_web_page, mcp__newsletter-mcp__serper_news
model: sonnet
---

# Digest Coordinator — State-Driven Execution

Você é o coordenador do digest semanal. Executa 6 fases em ordem determinística usando um state file como fonte de verdade.

## CONFIGURAÇÃO

- Newsletter RSS: `${user_config.newsletter_feed_url}`
- Podcast RSS: `${user_config.podcast_feed_url}`
- Blog RSS: `${user_config.blog_feed_url}`
- Output dir: `${user_config.output_dir}`
- Plugin data: `${CLAUDE_PLUGIN_DATA}`

## MOMENTO 1 — PLANNING (Sempre executa primeiro)

### Passo 1.1: Obter data e definir run_id

```
get_current_time
```

Extrair: `run_id = YYYY-MM-DD` (data atual), `run_dir = ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD`

### Passo 1.2: Verificar se run já existe

```bash
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/state.json 2>/dev/null
```

- Se `status: "completed"` → PARAR. Digest já gerado hoje.
- Se `status: "executing"` → IR PARA MOMENTO 3 (Recovery).
- Se não existe → CONTINUAR planning.

### Passo 1.3: Criar run directory

```bash
mkdir -p ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD
```

### Passo 1.4: Carregar exclusions do RSS

```
fetch_rss_feed("${user_config.newsletter_feed_url}")
```

Extrair dos últimos 3 itens: lista de tópicos/plataformas já mencionados.
Formato: array de strings descrevendo temas cobertos.
Exemplo: ["BigQuery ML Vertex AI deploy", "Looker 26.4 Visualization Assistant", "Meta IAB NewFronts"]

### Passo 1.5: Escrever state.json

Escrever em `${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/state.json`:

```json
{
  "run_id": "YYYY-MM-DD",
  "created_at": "<ISO timestamp>",
  "status": "executing",
  "plan": {
    "phases": [
      { "id": "research",   "agents": ["ga4", "gtm", "bigquery", "looker", "meta"], "parallel": true  },
      { "id": "aggregate",  "agents": ["digest-coordinator"], "parallel": false },
      { "id": "blog_posts", "agents": ["blog-post-worker"], "parallel": true, "dynamic": true },
      { "id": "generate",   "agents": ["digest-coordinator"], "parallel": false },
      { "id": "humanize",   "agents": ["digest-coordinator"], "parallel": false },
      { "id": "save",       "agents": ["digest-coordinator"], "parallel": false }
    ]
  },
  "context": {
    "date": "YYYY-MM-DD",
    "lookback_days": 7,
    "exclusions": ["<extraído do RSS>"],
    "foreign_urls": []
  },
  "results": {
    "research":     { "ga4": null, "gtm": null, "bigquery": null, "looker": null, "meta": null },
    "blog_posts":   {},
    "digest_draft": null,
    "digest_final": null,
    "output_path":  null
  }
}
```

→ Continuar para MOMENTO 2.
```

- [ ] **Step 2: Verify the file exists and has correct structure**

```bash
head -20 /Users/lucianfialho/Code/newsletter-toolkit/agents/digest-coordinator.md
```

Expected: frontmatter with `Agent` in tools list, Momento 1 section present.

---

## Task 3: Rewrite digest-coordinator — Momento 2 (Execution, Phases 1–3)

**Files:** `agents/digest-coordinator.md` (append Momento 2 phases 1-3)

- [ ] **Step 1: Append Momento 2 — Phases 1, 2, 3 to `agents/digest-coordinator.md`**

Append after the Momento 1 section:

```markdown
## MOMENTO 2 — EXECUTION

### FASE 1: RESEARCH (paralelo)

Spawnar os 5 pesquisadores em paralelo via Task, passando o input JSON:

```
Task(ga4-researcher,
  prompt: '{"date":"YYYY-MM-DD","lookback_days":7,"exclusions":[<da state>],"run_dir":"${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD"}',
  run_in_background: true)

Task(gtm-researcher,
  prompt: '{"date":"YYYY-MM-DD","lookback_days":7,"exclusions":[<da state>],"run_dir":"${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD"}',
  run_in_background: true)

Task(bigquery-researcher,
  prompt: '{"date":"YYYY-MM-DD","lookback_days":7,"exclusions":[<da state>],"run_dir":"${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD"}',
  run_in_background: true)

Task(looker-researcher,
  prompt: '{"date":"YYYY-MM-DD","lookback_days":7,"exclusions":[<da state>],"run_dir":"${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD"}',
  run_in_background: true)

Task(meta-researcher,
  prompt: '{"date":"YYYY-MM-DD","lookback_days":7,"exclusions":[<da state>],"run_dir":"${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD"}',
  run_in_background: true)
```

Aguardar todos completarem. Verificar que cada arquivo existe:
```bash
ls ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-*.json
```

Atualizar `results.research.*` em state.json com `"done"` para cada pesquisador que completou.

---

### FASE 2: AGGREGATE

Ler cada arquivo de resultado:
```bash
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-ga4.json
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-gtm.json
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-bigquery.json
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-looker.json
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-meta.json
```

**Verificar nothing_new total:**
Se TODOS os arquivos têm `nothing_new: true` → pular para FASE 4 com flag `all_quiet: true`.

**Coletar foreign_urls:**
Para cada update em cada arquivo onde `is_foreign: true`:
```json
{ "url": "<url>", "platform": "<platform>", "context": "<summary do update>" }
```

Atualizar `context.foreign_urls` em state.json com a lista coletada.

---

### FASE 3: BLOG POSTS (paralelo, dinâmico)

Para cada item em `context.foreign_urls[]`:

1. Calcular hash: primeiros 8 chars do SHA-256 da URL
   ```bash
   echo -n "URL" | sha256sum | cut -c1-8
   ```

2. Verificar se já existe `${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/blog-post-{hash}.json`
   - Se sim → pular (recovery)

3. Spawnar Agent inline com as instruções de adaptação:

```
Agent(prompt: "
Adapta este artigo para PT-BR e publica no CMS configurado.

INPUT:
- url: {url}
- platform: {platform}
- newsletter_context: {context}
- cms_type: ${user_config.cms_type}
- cms_endpoint: ${user_config.cms_endpoint}
- cms_auth_token: ${user_config.cms_auth_token}
- output_file: ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/blog-post-{hash}.json

TAREFA:
1. WebFetch da URL para extrair conteúdo
2. Adaptar para PT-BR (não tradução — adaptação editorial, 400-800 palavras)
3. Se cms_type = strapi: POST para cms_endpoint com {data:{title,description,content,slug}}
   Se cms_type = wordpress: POST para cms_endpoint/wp-json/wp/v2/posts com {title,content,excerpt,slug,status:publish}
   Se cms_type = none: salvar em ${CLAUDE_PLUGIN_DATA}/blog-posts/{slug}.md
4. Escrever resultado em output_file:
   {
     'url': '{url}',
     'blog_url': '<url publicada ou path local>',
     'title_ptbr': '<titulo em PT-BR>',
     'status': 'published' ou 'failed',
     'error': null ou '<mensagem de erro>'
   }
",
run_in_background: true)
```

Spawnar todos em paralelo. Aguardar todos completarem.

Atualizar `results.blog_posts` em state.json com `{url: "done"}` para cada URL processada.
```

- [ ] **Step 2: Verify phases 1-3 are present in the file**

```bash
grep -n "FASE 1\|FASE 2\|FASE 3" /Users/lucianfialho/Code/newsletter-toolkit/agents/digest-coordinator.md
```

Expected: 3 matches with correct line numbers.

---

## Task 4: Rewrite digest-coordinator — Momento 2 (Phases 4–6) + Momento 3 (Recovery)

**Files:** `agents/digest-coordinator.md` (append Phases 4-6 and Momento 3)

- [ ] **Step 1: Append Phases 4, 5, 6 and Momento 3 to `agents/digest-coordinator.md`**

```markdown
### FASE 4: GENERATE

Ler todos os arquivos de resultado:
```bash
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/research-*.json
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/blog-post-*.json 2>/dev/null
```

**Construir mapa de substituição de URLs:**
Para cada `blog-post-{hash}.json` onde `status: "published"`:
- Mapear: `{url original}` → `{blog_url}`

**Se all_quiet: true** (todas plataformas sem updates):
Gerar digest curto:
```
# [Nome do Digest] #XXX

Semana tranquila. [GA4, GTM, BigQuery, Looker Studio e Meta Ads] sem updates relevantes nos últimos 7 dias.

[Fechamento com teaser]
```
Pular para FASE 6.

**Caso normal:** Gerar digest completo seguindo a estrutura do SKILL.md:
- Abertura (2-4 frases, contexto da semana)
- "O que rolou essa semana" (bullets de 1 linha)
- Máximo 2 seções de destaque expandidas
- Drops (itens menores)
- Fechamento

Para cada link no texto: substituir URL original pelo blog_url quando disponível no mapa de substituição.

Escrever rascunho em `${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/digest-draft.json`:
```json
{ "content": "<texto completo do digest em markdown>" }
```

Atualizar `results.digest_draft: "done"` em state.json.

---

### FASE 5: HUMANIZE

Ler voice profile:
```bash
cat ${CLAUDE_PLUGIN_DATA}/voice-profile.json 2>/dev/null
```

Se não existir, tentar gerar:
```bash
build-voice-profile 2>/dev/null || true
```

Ler rascunho:
```bash
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/digest-draft.json
```

Aplicar humanização (mesmas regras do skill humanizer):
- Eliminar padrões de IA: inflação de importância, vocabulário IA, gerundismo decorativo, regra de três forçada
- Calibrar tom pelo voice profile se disponível
- Preservar todos os fatos, datas, nomes de features e links

Atualizar state.json com `results.digest_final: "<texto humanizado>"`.

---

### FASE 6: SAVE

Determinar output path:
- Se `${user_config.output_dir}` configurado: `${user_config.output_dir}/digest-YYYY-MM-DD.md`
- Senão: `${CLAUDE_PLUGIN_DATA}/newsletters/digest-YYYY-MM-DD.md`

```bash
mkdir -p <output_dir>
```

Escrever arquivo final com o conteúdo de `results.digest_final`.

Escrever na knowledge base:
```bash
mkdir -p ${CLAUDE_PLUGIN_DATA}/newsletters
```
Salvar cópia em `${CLAUDE_PLUGIN_DATA}/newsletters/digest-YYYY-MM-DD.md`.

Atualizar state.json:
```json
{
  "status": "completed",
  "results": {
    "output_path": "<path do arquivo salvo>"
  }
}
```

**Run retention:** Manter apenas os 10 runs mais recentes.
```bash
ls -t ${CLAUDE_PLUGIN_DATA}/runs/ | tail -n +11 | xargs -I{} rm -rf ${CLAUDE_PLUGIN_DATA}/runs/{}
```

Retornar ao usuário:
```
Digest gerado: <output_path>
Edição: #XXX
Highlights: [lista dos 2-3 principais updates]
```

---

## MOMENTO 3 — RECOVERY

Ativado quando `state.json` existe com `status: "executing"`.

```bash
cat ${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/state.json
```

Lógica de retomada:
- `results.research.*` com algum `null` → re-executar FASE 1 apenas para pesquisadores com resultado null
- Todos research done, `context.foreign_urls` vazio → re-executar FASE 2
- `results.blog_posts` incompleto → re-executar FASE 3 apenas para URLs ausentes
- `results.digest_draft` null → re-executar FASE 4
- `results.digest_final` null → re-executar FASE 5
- `results.output_path` null → re-executar FASE 6

## REGRAS CRÍTICAS

- NUNCA re-executar uma fase onde o resultado já está preenchido
- SEMPRE atualizar state.json ao completar cada fase
- Em caso de falha de um blog-post agent: registrar `status: "failed"` e usar URL original no digest
- Se all_quiet + no podcast/blog → digest curto é válido, não forçar conteúdo
```

- [ ] **Step 2: Verify all 6 phases and Momento 3 are present**

```bash
grep -n "FASE\|MOMENTO" /Users/lucianfialho/Code/newsletter-toolkit/agents/digest-coordinator.md
```

Expected: FASE 1 through FASE 6 and MOMENTO 1, 2, 3 all present.

- [ ] **Step 3: Commit coordinator rewrite**

```bash
cd /Users/lucianfialho/Code/newsletter-toolkit
git add agents/digest-coordinator.md
git commit -m "feat: rewrite digest-coordinator with 6-phase state-driven execution and recovery"
```

---

## Task 5: Update `skills/digest/SKILL.md`

Update only the WORKFLOW section to reflect the new architecture. Keep tone/style rules intact.

**Files:** `skills/digest/SKILL.md`

- [ ] **Step 1: Replace the WORKFLOW section**

Find the `## WORKFLOW EXECUTADO PELO COORDINATOR` section (or similar) and replace with:

```markdown
## WORKFLOW EXECUTADO PELO COORDINATOR

O coordinator executa 6 fases determinísticas via state file em `${CLAUDE_PLUGIN_DATA}/runs/YYYY-MM-DD/`:

1. **Planning** — lê RSS feed, monta `state.json` com contexto dinâmico (exclusions, run_id)
2. **Research** — 5 pesquisadores em paralelo, cada um escreve em arquivo isolado
3. **Aggregate** — coleta resultados, identifica fontes estrangeiras (`is_foreign: true`)
4. **Blog Posts** — adapta fontes estrangeiras para PT-BR e publica no CMS (paralelo, automático)
5. **Generate** — monta digest substituindo links estrangeiros pelos links do blog
6. **Humanize** — aplica voice profile e regras anti-IA
7. **Save** — salva o digest final e limpa runs antigos (mantém últimos 10)

**Recovery automático:** se a execução for interrompida, o coordinator retoma da fase onde parou usando o `state.json` existente.
```

- [ ] **Step 2: Verify the SKILL.md still has tone/style rules intact**

```bash
grep -c "travessão\|vocabulário\|Português" /Users/lucianfialho/Code/newsletter-toolkit/skills/digest/SKILL.md
```

Expected: 3 or more matches (rules still present).

- [ ] **Step 3: Commit**

```bash
cd /Users/lucianfialho/Code/newsletter-toolkit
git add skills/digest/SKILL.md
git commit -m "docs: update digest SKILL.md workflow to reflect state-driven execution"
```

---

## Task 6: Push and integration test

- [ ] **Step 1: Push all commits**

```bash
cd /Users/lucianfialho/Code/newsletter-toolkit
git push
```

- [ ] **Step 2: Update installed plugin**

```bash
git -C ~/.claude/plugins/installed/newsletter-toolkit pull 2>/dev/null \
  || git -C ~/.claude-plugins/newsletter-toolkit pull
```

- [ ] **Step 3: Verify state.json is created on digest run**

Start a Claude Code session with the plugin and run:
```
/newsletter-toolkit:digest
```

After the Planning moment completes, check:
```bash
cat ~/.claude/plugins/data/newsletter-toolkit/runs/$(date +%Y-%m-%d)/state.json
```

Expected: valid JSON with `status: "executing"`, `context.exclusions` populated from RSS, `plan.phases` array with 6 items.

- [ ] **Step 4: Verify researcher files are created**

After Phase 1 (research) completes:
```bash
ls ~/.claude/plugins/data/newsletter-toolkit/runs/$(date +%Y-%m-%d)/research-*.json
```

Expected: 5 files — `research-ga4.json`, `research-gtm.json`, `research-bigquery.json`, `research-looker.json`, `research-meta.json`.

Check one file has correct structure:
```bash
cat ~/.claude/plugins/data/newsletter-toolkit/runs/$(date +%Y-%m-%d)/research-meta.json | python3 -m json.tool
```

Expected: valid JSON with `agent`, `nothing_new`, `updates[]` fields. Each update has `url`, `is_foreign`, `relevance`.

- [ ] **Step 5: Verify final digest is saved**

After full run:
```bash
ls ~/.claude/plugins/data/newsletter-toolkit/newsletters/
```

Expected: `digest-YYYY-MM-DD.md` present with newsletter content.

- [ ] **Step 6: Verify state.json shows completed**

```bash
cat ~/.claude/plugins/data/newsletter-toolkit/runs/$(date +%Y-%m-%d)/state.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['status'])"
```

Expected: `completed`
