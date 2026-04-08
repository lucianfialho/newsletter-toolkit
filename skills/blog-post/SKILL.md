---
name: blog-post
description: >
  Adapta um artigo em inglês para o blog em PT-BR e publica no CMS configurado.
  Suporta Strapi, WordPress ou salvar localmente como markdown.
  Use com: /newsletter-toolkit:blog-post URL
  Ou passe a URL como argumento: /newsletter-toolkit:blog-post https://...
argument-hint: "[URL do artigo em inglês]"
allowed-tools:
  - Read
  - Write
  - Bash
  - WebFetch
---

# Blog Post — Adaptação e Publicação

Adapta um artigo de fonte em inglês para PT-BR e publica no CMS configurado.

## CONFIGURAÇÃO NECESSÁRIA

Via `/plugin configure newsletter-toolkit`:
- `cms_type` — `strapi`, `wordpress`, ou `none`
- `cms_endpoint` — URL da API do CMS
- `cms_auth_token` — token Bearer
- `output_dir` — diretório de saída (se `cms_type: none`)

## WORKFLOW

### PASSO 1: Extrair conteúdo da fonte

```
WebFetch("$ARGUMENTS")
→ Extrair título original, data, conteúdo principal
→ Ignorar nav, sidebar, ads, rodapé
→ Identificar tema/plataforma para mapear categoria
```

Se a página retornar paywall ou conteúdo vazio → PARAR e avisar o usuário.

### PASSO 2: Adaptar para PT-BR

NÃO é tradução literal. É adaptação editorial:

1. Reescrever em português natural
2. Adicionar contexto prático para o público de analytics/martech no Brasil
3. Manter termos técnicos em inglês quando não têm tradução natural (deploy, preview, GA, rollout, endpoint, CRM, etc.)
4. Citar a fonte no final: `Fonte: [título original](url)`
5. Gerar:
   - `title`: PT-BR, máximo 70 chars
   - `description`: resumo 1-2 frases, máximo 160 chars, SEO-friendly
   - `content`: markdown, 400-800 palavras
   - `slug`: lowercase, hifens, sem acentos (ex: `meta-iab-newfronts-2026-novos-formatos`)

**Tom do blog:**
- Mais didático que newsletter (leitor pode não ter contexto)
- Parágrafos curtos (2-3 linhas)
- Subtítulos a cada 2-3 parágrafos
- Sem opinião forte
- Foco em: o que é + como funciona + o que muda na prática
- Português com acentos corretos

### PASSO 3: Verificar duplicata

Antes de publicar, verificar se slug similar já existe:

**Strapi:**
```bash
curl -s "${user_config.cms_endpoint}?filters[slug][$eq]=SLUG" \
  -H "Authorization: Bearer ${user_config.cms_auth_token}"
```

**WordPress:**
```bash
curl -s "${user_config.cms_endpoint}?slug=SLUG" \
  -H "Authorization: Bearer ${user_config.cms_auth_token}"
```

Se já existir → PARAR e retornar URL existente.

### PASSO 4: Publicar

#### Strapi (cms_type: strapi)

```bash
curl -s -X POST "${user_config.cms_endpoint}" \
  -H "Authorization: Bearer ${user_config.cms_auth_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "title": "TITLE",
      "description": "DESCRIPTION",
      "content": "CONTENT",
      "slug": "SLUG"
    }
  }'
```

A resposta contém o `documentId` e `slug`. URL final: `[base-url]/artigos/SLUG`

#### WordPress (cms_type: wordpress)

```bash
curl -s -X POST "${user_config.cms_endpoint}/wp-json/wp/v2/posts" \
  -H "Authorization: Bearer ${user_config.cms_auth_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TITLE",
    "content": "CONTENT",
    "excerpt": "DESCRIPTION",
    "slug": "SLUG",
    "status": "publish"
  }'
```

URL final: `[base-url]/SLUG`

#### Local (cms_type: none)

Salvar em `${CLAUDE_PLUGIN_DATA}/blog-posts/SLUG.md` com frontmatter:

```markdown
---
title: TITLE
description: DESCRIPTION
date: YYYY-MM-DD
slug: SLUG
source: URL_ORIGINAL
---

CONTENT
```

URL final: `${CLAUDE_PLUGIN_DATA}/blog-posts/SLUG.md`

### PASSO 5: Retornar

```
url_blog: URL final do artigo publicado
titulo_ptbr: título em PT-BR
fonte_original: URL da fonte
```

## CHECKLIST

- Conteúdo adaptado (não traduzido literalmente)?
- Título em PT-BR com máximo 70 chars?
- Description com máximo 160 chars?
- Slug sem acentos, lowercase, com hifens?
- Fonte original citada no final?
- Markdown válido?
- Duplicata verificada?
- Publicado com sucesso?

## LIMITES

- NÃO publicar se conteúdo for paywall ou vazio
- NÃO duplicar: verificar slug antes de publicar
- 400-800 palavras (não é deep dive, é adaptação)
