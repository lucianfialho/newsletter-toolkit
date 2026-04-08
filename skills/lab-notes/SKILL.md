---
name: lab-notes
description: >
  Gera Lab Note para Skunkworks — documenta experimentos de IA/Analytics
  com métricas brutally honest extraídas do projeto real. Para inner circle.
  Use com: /newsletter-toolkit:lab-notes "Nome do Experimento"
argument-hint: "[nome do experimento]"
disable-model-invocation: true
context: fork
agent: lab-notes-coordinator
---

# Lab Notes - Skunkworks

Gera Lab Note documentando experimento de IA/Analytics com métricas reais.

## OBJETIVO

Documentar experimentos com:
- Métricas REAIS extraídas do projeto
- Failures e learnings honestos
- Status de produção claro
- Formato exclusivo Skunkworks
- NÃO marketing speak ou estimativas

## USO

```bash
/newsletter-toolkit:lab-notes "Newsletter Automation"
/newsletter-toolkit:lab-notes "Multi-Agent Orchestration"
/newsletter-toolkit:lab-notes "Voice Profile System"
```

## O QUE O COORDINATOR FAZ

1. Analisa o projeto (agents, skills, newsletters geradas)
2. Extrai métricas REAIS (conta arquivos, analisa git)
3. Identifica failures (git log, TODOs)
4. Gera Lab Note no formato Skunkworks
5. Salva output e knowledge base

## OUTPUT

```
${CLAUDE_PLUGIN_DATA}/lab-notes/lab-note-{numero}-{data}.md
```

## QUALITY GATES

- [ ] Métricas REAIS (não estimativas)
- [ ] Pelo menos 1 failure documentado
- [ ] Learnings acionáveis
- [ ] Status de produção explícito
- [ ] Perguntas de feedback incluídas
- [ ] Tom brutally honest

## NÃO FAZ

- NÃO inventa métricas
- NÃO usa marketing speak
- NÃO omite failures
- NÃO publica automaticamente
