---
name: digest
description: >
  Gera o digest semanal gratuito com atualizações de Analytics/Martech.
  Pesquisa GA4, GTM, BigQuery, Looker Studio e Meta Ads automaticamente.
  Aplica anti-duplicação via RSS feed e humanização do texto.
  Use com: /newsletter-toolkit:digest
context: fork
agent: digest-coordinator
---

# Digest Semanal

Gera o digest semanal de Analytics/Martech.

## CONFIGURAÇÃO

Antes de rodar, certifique-se de ter configurado via `/plugin configure newsletter-toolkit`:
- `newsletter_feed_url` — RSS da sua newsletter (para anti-duplicação)
- `serper_api_key` — para buscar notícias de Meta Ads

## TOM E ESTILO

1. **Conversacional e direto**. Frases curtas. Falar com o leitor ("se você opera...", "quem já perdeu...").
2. **Sem travessões (—)**. Usar vírgulas, pontos ou parênteses.
3. **Português sempre**. Inglês só pra nomes de features e termos sem tradução natural.
4. **Opinião sutil e concreta**. Nunca: "isso é revolucionário" ou "um marco importante".
5. **Sem vocabulário de IA**. Nunca: crucial, fundamental, ecossistema vibrante, potencializar, robusto, abrangente, holístico, inovador, game-changer, nesse contexto, vale ressaltar, cabe destacar.
6. **Parágrafos curtos**. 2-3 linhas máximo.
7. **Nomes completos na primeira menção**: Google BigQuery, Google Analytics 4, Google Tag Manager.

## ESTRUTURA DO OUTPUT

```markdown
# [Nome do Digest] #XXX

[ABERTURA: 2-4 frases. O que marcou a semana. Quem ficou quieto.]

---

## O que rolou essa semana

[Bullets de 1 LINHA cada. Resumo seco de cada update.]

- **BigQuery** passa AI.FORECAST para GA com novas opções de customização
- **Meta Ads** lança novos formatos no IAB NewFronts
- **GA4, GTM, Looker Studio**: nada

---

## [Título criativo pro destaque 1]

[2-3 parágrafos curtos. O que mudou, como era antes, o que muda agora.
Opinião sutil. Link pra fonte no final.]

---

## [Título criativo pro destaque 2]

[Mesmo formato.]

---

## Drops

[Itens menores. Formato:
**Plataforma, nome do update**: 1-2 frases + link.]

---

[FECHAMENTO: 2-3 linhas sobre engajamento + teaser da próxima edição.]
```

## REGRAS DA ESTRUTURA

- **"O que rolou"**: SEMPRE bullets de 1 linha. Sem contexto expandido.
- **Destaques**: máximo 2 seções expandidas. Títulos criativos, não genéricos.
- **Features dentro de um destaque**: nome em **negrito** + 2-3 frases em parágrafo. Não é bullet list.
- **Podcast/Blog**: NUNCA seção separada. Integrar como menção natural ("aliás, gravamos sobre isso...").
- **Drops**: itens menores que não merecem destaque mas valem mencionar.
- **Fechamento**: sem heading, sem formalidade. Direto.

## O QUE NUNCA FAZER

- Travessões (—)
- Seção separada "Do nosso ecossistema"
- Bullets com 3-4 linhas de contexto (vai pro destaque ou pro drops)
- Deep dive (deep dive é para edições temáticas, não digest)
- Emojis no corpo (zero)
- Frontmatter no output final

## WORKFLOW EXECUTADO PELO COORDINATOR

1. **FASE 1**: RSS feed → lista de exclusão de temas já cobertos
2. **FASE 2**: 5 pesquisadores em paralelo (GA4, GTM, BigQuery, Looker Studio, Meta)
3. **FASE 3**: Agregação + filtro anti-duplicata
4. **FASE 4**: Conteúdo do ecossistema (podcast, blog)
5. **FASE 4.5**: Adaptação de fontes gringas para o blog
6. **FASE 5**: Geração da newsletter
7. **FASE 7**: Humanização
8. **FASE 8**: Salvamento

## SUBJECT LINES

Ao final, gerar 3 opções de subject para email:
- Máximo 60 caracteres (ideal 40-55)
- Resumir 2-3 destaques separados por vírgula
- Sem emojis, sem clickbait
- Tom informativo, como manchete de jornal técnico
