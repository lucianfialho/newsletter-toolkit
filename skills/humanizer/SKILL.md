---
name: humanizer
description: >
  Remove padrões de escrita de IA e ajusta o tom para soar como o autor real.
  Lê edições anteriores para calibrar voz, ritmo e vocabulário automaticamente.
  Use após gerar qualquer rascunho de newsletter ou texto longo.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
---

# Humanizer

Remove padrões de escrita de IA e ajusta o tom para soar como o autor real. Aprende o tom lendo edições anteriores — não aplica regras fixas de estilo.

## PASSO 1: Calibrar a voz (OBRIGATÓRIO)

**Caminho rápido:** Ler o voice profile pré-computado:

```
Read: ${CLAUDE_PLUGIN_DATA}/voice-profile.json
```

O voice profile contém: ritmo de frases (média, variação), padrões de abertura, transições, frases editoriais recorrentes, vocabulário frequente, palavras que o autor evita.

Se o voice profile NÃO existir ou tiver mais de 14 dias:
```bash
build-voice-profile --force
```

**Fallback:** Se não houver histórico, ler as 3 últimas newsletters:
```
Glob: ${CLAUDE_PLUGIN_DATA}/newsletters/*-digest.md
→ Pegar as 3 mais recentes por data
→ Ler os primeiros 120 linhas de cada
```

Ao ler, calibrar mentalmente:
- **Ritmo**: tamanho médio das frases, variação entre curtas e longas
- **Abertura**: como o autor conecta a edição anterior com a atual
- **Transições**: como muda de tema
- **Opinião**: onde e como insere opinião editorial
- **Vocabulário**: palavras que usa e que evita

---

## PASSO 2: Identificar padrões de IA

### PADRÕES DE CONTEÚDO

**1. Inflação de importância**
Sinais: "representa um marco", "momento decisivo", "papel fundamental/crucial", "redefine o cenário"
Fix: descrever o que mudou e o que muda na prática, sem adjetivar.

**2. Atribuições vagas**
Sinais: "especialistas apontam", "analistas do setor", "segundo fontes do mercado"
Fix: citar fonte exata ou apresentar como fato/observação própria.

**3. Seções de "desafios e perspectivas"**
Sinais: "Apesar dos desafios...", "O futuro promete...", "Perspectivas futuras"
Fix: fechar com ação concreta ou simplesmente parar.

**4. Linguagem promocional**
Sinais: revolucionário, inovador, poderoso, robusto, game-changer, disruptivo, ecossistema vibrante
Fix: descrever o que a feature faz.

### PADRÕES DE LINGUAGEM

**5. Vocabulário típico de IA em PT-BR**
- Adicionalmente, Além disso (início de parágrafo)
- Crucial, fundamental, essencial (adjetivo de tudo)
- Destacar, ressaltar, evidenciar (verbos principais)
- Cenário (abstrato), panorama, ecossistema, jornada
- Potencializar, alavancar, otimizar (verbos vagos)
- Nesse contexto, nesse sentido, diante disso
- Vale ressaltar, é importante notar, cabe destacar
- Sem dúvida, certamente
- Abrangente, holístico, robusto

Fix: palavras comuns. "Crucial" vira "importante" ou some.

**6. Gerundismo decorativo**
Sinais: "...destacando a importância de...", "...contribuindo para...", "...garantindo que..."
Fix: encerrar a frase e começar outra.

Antes: "O runtime melhora a performance, contribuindo para resultados mais rápidos."
Depois: "O runtime melhora a performance. Queries rodam mais rápido."

**7. Paralelismo negativo**
Sinais: "Não se trata apenas de X, mas de Y." "Mais do que X, é Y."
Fix: máximo 1 por texto.

**8. Regra de três forçada**
Sinais: três itens onde dois bastavam. "Inovação, eficiência e escalabilidade."
Fix: agrupar em quantidades irregulares.

**9. Sinônimos rotativos**
Sinais: "a plataforma... a ferramenta... a solução... o sistema..." (mesma coisa)
Fix: repetir a palavra ou usar pronome.

### PADRÕES DE ESTILO

**10. Em dash em excesso**
Mais de 2 por parágrafo → substituir por vírgula, ponto, ou reestruturar.

**11. Negrito mecânico**
Fix: negrito apenas em nomes de features/produtos. Não em adjetivos.

**12. Listas com header inline em toda linha**
Antes:
- **Velocidade:** A velocidade foi melhorada.
- **Qualidade:** A qualidade é superior.

Depois: "A atualização melhora velocidade e qualidade."

Exceção: listas com conteúdo substancial (2+ linhas por item) são válidas.

**13. Emoji decorativo**
Fix: remover emoji do corpo do texto. Zero.

### PADRÕES DE COMUNICAÇÃO

**14. Artefatos de chatbot**
Sinais: "Espero que seja útil", "Claro!", "Aqui está um resumo..."
Fix: remover completamente.

**15. Hedging excessivo**
Sinais: "potencialmente", "possivelmente", "em certa medida"
Fix: dizer "ainda não está claro" ou afirmar.

**16. Conclusão genérica positiva**
Sinais: "O futuro é promissor." "Tempos empolgantes estão por vir."
Fix: fechar com ação concreta ou não fechar.

**17. Conectivos de transição excessivos**
Sinais: "Nesse sentido", "Diante disso", "Sendo assim", "Dessa forma", "Em suma"
Fix: mudar de assunto com `---` e novo heading. Frases se conectam pelo conteúdo.

**18. Frases de preenchimento**
- "Com o objetivo de alcançar" → "Para"
- "Devido ao fato de que" → "Porque"
- "No momento atual" → "Agora"
- "É importante destacar que" → remover
- "O sistema possui a capacidade de" → "O sistema pode"
- "Tendo em vista que" → "Como" ou "Já que"

---

## PASSO 3: Reescrever

1. Preservar estrutura (headings, seções)
2. Manter fatos e dados — nunca alterar informações técnicas
3. Calibrar pelo tom das edições anteriores
4. Variar o ritmo — frases curtas seguidas de uma mais longa
5. Opiniões sutis: "merece atenção", "vale ficar de olho", "quem opera X vai querer saber"
6. Especificidade: trocar afirmações vagas por dados concretos

## PASSO 4: Auditoria anti-IA

Perguntar: "O que neste texto ainda parece gerado por IA?"

Listar pontos restantes e corrigir cada um.

## PASSO 5: Comparação final

Comparar 3 trechos do texto revisado com trechos das edições anteriores. O tom deve ser indistinguível.

## OUTPUT

1. Texto revisado completo
2. Lista de mudanças feitas (agrupadas por categoria)
3. Pontos que ainda parecem IA mas não foram resolvidos (com justificativa)

---

Esta skill aprende o tom lendo edições anteriores. Se o autor mudar o estilo, ela acompanha automaticamente.
