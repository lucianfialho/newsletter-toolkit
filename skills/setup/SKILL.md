---
name: setup
description: >
  Guia interativo de configuração do newsletter-toolkit.
  Valida o que está configurado, explica como obter cada credencial,
  testa conexões e orienta passo a passo até tudo estar funcionando.
  Use com: /newsletter-toolkit:setup
allowed-tools:
  - Bash
---

# Setup — Configuração Guiada

Valida a configuração atual e guia o que falta configurar, com instruções exatas para cada serviço.

## PROCESSO

### PASSO 1: Checar o que está configurado

```bash
env | grep CLAUDE_PLUGIN_OPTION_ | sed 's/=.*/=***/' | sort
```

Mapear quais variáveis estão presentes:

| Variável | Status |
|----------|--------|
| `CLAUDE_PLUGIN_OPTION_SERPER_API_KEY` | obrigatório |
| `CLAUDE_PLUGIN_OPTION_NEWSLETTER_FEED_URL` | recomendado |
| `CLAUDE_PLUGIN_OPTION_PODCAST_FEED_URL` | opcional |
| `CLAUDE_PLUGIN_OPTION_BLOG_FEED_URL` | opcional |
| `CLAUDE_PLUGIN_OPTION_CMS_TYPE` | obrigatório para blog-post |
| `CLAUDE_PLUGIN_OPTION_CMS_ENDPOINT` | obrigatório se CMS ≠ none |
| `CLAUDE_PLUGIN_OPTION_CMS_AUTH_TOKEN` | obrigatório se CMS ≠ none |

### PASSO 2: Checar Node.js e dependências do MCP server

```bash
node --version
```

```bash
ls "${CLAUDE_PLUGIN_ROOT}/servers/mcp-server/node_modules/@modelcontextprotocol" 2>/dev/null \
  && echo "MCP deps OK" \
  || echo "MCP deps ausentes"
```

### PASSO 3: Checar voice profile

```bash
ls "${CLAUDE_PLUGIN_DATA}/voice-profile.json" 2>/dev/null \
  && echo "voice profile OK" \
  || echo "ausente"
```

---

## RELATÓRIO E GUIA

Ao final, gerar um relatório completo. Para cada item em falta, mostrar as instruções abaixo.

---

### SERPER API KEY — como obter

A chave Serper é usada para buscar notícias do Meta Ads (que não tem release notes públicas).

1. Acesse **https://serper.dev**
2. Crie uma conta gratuita (não precisa cartão)
3. No dashboard, copie a API key
4. O plano gratuito inclui **2.500 buscas/mês** — suficiente para uso semanal

Para configurar:
```
/plugin configure newsletter-toolkit
→ Serper API Key: cole a chave aqui
```

---

### NEWSLETTER FEED URL — como encontrar

A URL do RSS da sua newsletter é usada para evitar repetir conteúdo já coberto.

**Substack:**
```
https://SEU-USUARIO.substack.com/feed
```
Exemplo: `https://lucianfialho.substack.com/feed`

**Ghost:**
```
https://SEU-BLOG.com/rss/
```

**Mailchimp / Beehiiv / outros:**
Procure por "RSS feed" nas configurações da newsletter. Geralmente fica em Configurações → Distribuição → RSS.

Para configurar:
```
/plugin configure newsletter-toolkit
→ Newsletter RSS Feed URL: cole a URL aqui
```

---

### PODCAST FEED URL — como encontrar (opcional)

Usado para mencionar episódios relacionados no digest.

**Spotify for Podcasters / Anchor:**
```
https://anchor.fm/s/SEU-ID/podcast/rss
```

**Apple Podcasts / qualquer plataforma:**
No seu player, procure por "RSS feed" ou "Feed URL" nas configurações do podcast.

---

### CMS — como configurar

O skill `blog-post` adapta artigos em inglês para PT-BR e publica no seu CMS.

#### Opção 1: Sem CMS (salvar localmente)

```
/plugin configure newsletter-toolkit
→ CMS Type: none
```

Artigos são salvos em `~/.claude/plugins/data/newsletter-toolkit/blog-posts/`.

#### Opção 2: Strapi v4/v5

1. No painel do Strapi: **Settings → API Tokens → Create new token**
2. Tipo: **Full access** (ou Custom com create/read em articles)
3. Copie o token gerado

```
/plugin configure newsletter-toolkit
→ CMS Type: strapi
→ CMS API Endpoint: https://api.SEU-STRAPI.com/api/articles
→ CMS Auth Token: cole o token aqui
```

#### Opção 3: WordPress

1. No WordPress: **Usuários → Seu perfil → Senhas de aplicativo**
2. Crie uma senha de aplicativo com nome "newsletter-toolkit"
3. Copie a senha gerada (formato: `xxxx xxxx xxxx xxxx xxxx xxxx`)

```
/plugin configure newsletter-toolkit
→ CMS Type: wordpress
→ CMS API Endpoint: https://SEU-WORDPRESS.com
→ CMS Auth Token: usuario:senha-de-aplicativo
```

---

### MCP SERVER — instalar dependências

O MCP server precisa de `npm install` após a instalação do plugin.

```bash
cd "${CLAUDE_PLUGIN_ROOT}/servers/mcp-server" && npm install
```

Depois reinicie a sessão do Claude Code.

---

### VOICE PROFILE — gerar após primeiras newsletters

O voice profile é gerado automaticamente após você ter algumas newsletters salvas.

```bash
build-voice-profile
```

Ou rode `/newsletter-toolkit:digest` algumas vezes primeiro — o perfil será gerado automaticamente.

---

## OUTPUT FINAL

Apresentar assim:

```
NEWSLETTER-TOOLKIT — SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBRIGATÓRIO
  ✅ Serper API Key           configurada
  ❌ Newsletter Feed URL      FALTANDO → veja instruções acima

OPCIONAL
  ❌ Podcast Feed URL         não configurado (ok pular)
  ❌ Blog Feed URL            não configurado (ok pular)

BLOG-POST
  ✅ CMS Type: none           artigos salvos localmente
  —  CMS Endpoint             N/A
  —  CMS Auth Token           N/A

INFRAESTRUTURA
  ✅ Node.js v22.x            OK
  ❌ MCP server deps          ausentes → rode: cd ${CLAUDE_PLUGIN_ROOT}/servers/mcp-server && npm install
  ❌ Voice profile            ainda não gerado (normal no início)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRÓXIMOS PASSOS

1. Configure a Newsletter Feed URL:
   /plugin configure newsletter-toolkit

2. Instale as dependências do MCP server:
   cd ${CLAUDE_PLUGIN_ROOT}/servers/mcp-server && npm install

3. Tudo pronto? Rode:
   /newsletter-toolkit:digest
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Mostrar APENAS os próximos passos que realmente faltam, em ordem de prioridade.
