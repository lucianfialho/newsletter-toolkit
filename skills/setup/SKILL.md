---
name: setup
description: >
  Valida a configuração do plugin newsletter-toolkit.
  Checa quais userConfig estão definidos, testa conexões com CMS e Serper,
  e mostra exatamente o que precisa ser configurado.
  Use com: /newsletter-toolkit:setup
allowed-tools:
  - Bash
  - WebFetch
---

# Setup — Validação de Configuração

Verifica se o plugin está corretamente configurado antes do primeiro uso.

## O QUE VERIFICAR

### 1. Variáveis de configuração

As variáveis abaixo estão disponíveis como env vars com prefixo `CLAUDE_PLUGIN_OPTION_`:

```bash
# Obrigatório
CLAUDE_PLUGIN_OPTION_SERPER_API_KEY      # chave Serper para busca de notícias

# Recomendado
CLAUDE_PLUGIN_OPTION_NEWSLETTER_FEED_URL # RSS da newsletter (anti-duplicação)

# Opcional
CLAUDE_PLUGIN_OPTION_PODCAST_FEED_URL
CLAUDE_PLUGIN_OPTION_BLOG_FEED_URL

# CMS (apenas se blog-post for usado)
CLAUDE_PLUGIN_OPTION_CMS_TYPE            # strapi | wordpress | none
CLAUDE_PLUGIN_OPTION_CMS_ENDPOINT
CLAUDE_PLUGIN_OPTION_CMS_AUTH_TOKEN

# Saída
CLAUDE_PLUGIN_OPTION_OUTPUT_DIR
```

Verificar quais estão definidas:

```bash
env | grep CLAUDE_PLUGIN_OPTION_ | sed 's/=.*/=***/' | sort
```

### 2. Testar Serper API

Se `SERPER_API_KEY` estiver configurada, fazer uma chamada de teste:

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "https://google.serper.dev/search" \
  -H "X-API-KEY: ${CLAUDE_PLUGIN_OPTION_SERPER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"q": "test", "num": 1}'
```

- `200` → Serper OK
- `401` → chave inválida
- Falhou → sem conexão ou chave não definida

### 3. Testar CMS (se configurado)

#### Strapi

```bash
curl -s -o /dev/null -w "%{http_code}" \
  "${CLAUDE_PLUGIN_OPTION_CMS_ENDPOINT}" \
  -H "Authorization: Bearer ${CLAUDE_PLUGIN_OPTION_CMS_AUTH_TOKEN}"
```

`200` ou `401` = endpoint acessível. `000` = endpoint inválido.

#### WordPress

```bash
curl -s -o /dev/null -w "%{http_code}" \
  "${CLAUDE_PLUGIN_OPTION_CMS_ENDPOINT}/wp-json/wp/v2/posts?per_page=1" \
  -H "Authorization: Bearer ${CLAUDE_PLUGIN_OPTION_CMS_AUTH_TOKEN}"
```

### 4. Verificar MCP server

```bash
node --version
```

Node.js 18+ é obrigatório. O MCP server está em `${CLAUDE_PLUGIN_ROOT}/servers/mcp-server/`.

```bash
ls "${CLAUDE_PLUGIN_ROOT}/servers/mcp-server/node_modules/@modelcontextprotocol" 2>/dev/null \
  && echo "deps OK" || echo "deps ausentes — rode: cd ${CLAUDE_PLUGIN_ROOT}/servers/mcp-server && npm install"
```

### 5. Voice profile

```bash
ls "${CLAUDE_PLUGIN_DATA}/voice-profile.json" 2>/dev/null \
  && echo "Voice profile existe" \
  || echo "Voice profile ausente — rode: build-voice-profile (após gerar newsletters)"
```

## OUTPUT

Apresentar um relatório claro:

```
NEWSLETTER-TOOLKIT — STATUS DE CONFIGURAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBRIGATÓRIO
  [OK/FALTANDO] Serper API Key
  [OK/FALTANDO] Newsletter RSS Feed

OPCIONAL
  [OK/FALTANDO] Podcast RSS Feed
  [OK/FALTANDO] Blog RSS Feed

CMS (blog-post)
  [OK/FALTANDO/N/A] cms_type: strapi | wordpress | none
  [OK/FALTANDO/N/A] cms_endpoint
  [OK/FALTANDO/N/A] cms_auth_token
  [OK/FALHOU/N/A]   Conectividade com o CMS

INFRAESTRUTURA
  [OK/FALTANDO] Node.js 18+
  [OK/FALTANDO] MCP server dependencies
  [OK/AUSENTE]  Voice profile

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRÓXIMOS PASSOS
[listar apenas o que falta, com o comando exato para resolver]
```

## PRÓXIMOS PASSOS — REFERÊNCIA

| O que falta | Como resolver |
|-------------|---------------|
| Qualquer config | `/plugin configure newsletter-toolkit` |
| MCP deps | `cd ${CLAUDE_PLUGIN_ROOT}/servers/mcp-server && npm install` |
| Voice profile | Gere algumas newsletters primeiro, depois: `build-voice-profile` |
| Conta Serper | Cadastro gratuito em https://serper.dev |
