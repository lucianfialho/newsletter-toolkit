# Example: AI & LLM Models

Weekly newsletter covering the AI models and tools ecosystem:
OpenAI, Anthropic, Google AI (Gemini), Mistral, and Hugging Face.

## Platforms covered

| Agent file | Platform | Source |
|-----------|----------|--------|
| `openai-researcher.md` | OpenAI | https://platform.openai.com/docs/changelog |
| `anthropic-researcher.md` | Anthropic | https://docs.anthropic.com/en/docs/about-claude/models |
| `google-ai-researcher.md` | Google AI / Gemini | https://ai.google.dev/gemini-api/docs/changelog |
| `mistral-researcher.md` | Mistral AI | serper_news |
| `huggingface-researcher.md` | Hugging Face | serper_news |

## Setup

1. Copy the `agents/` files to your plugin's `agents/` directory:
   ```bash
   cp examples/ai-llm/agents/*.md agents/
   ```

2. Update `agents/digest-coordinator.md` — in FASE 1, replace the 5 Task calls with:
   ```
   Task(openai-researcher, ...)
   Task(anthropic-researcher, ...)
   Task(google-ai-researcher, ...)
   Task(mistral-researcher, ...)
   Task(huggingface-researcher, ...)
   ```
   And update `results.research` in state.json to:
   `{ "openai": null, "anthropic": null, "google-ai": null, "mistral": null, "huggingface": null }`

3. Configure the plugin:
   ```
   /plugin configure newsletter-toolkit
   → Newsletter Feed URL: https://YOUR-NEWSLETTER.substack.com/feed
   → Serper API Key: your-key (needed for Mistral and Hugging Face)
   ```

## Tone guidance

This niche moves fast. Good digest editions focus on:
- New model releases (context windows, capabilities, pricing)
- API changes that break existing integrations
- Benchmark results that change the competitive landscape
- New fine-tuning or deployment options

Avoid: hype ("revolutionary"), vague "AI progress" summaries, speculative roadmap items.

## Example output structure

```markdown
# AI Weekly #017

OpenAI lançou GPT-4o mini com janela de 128k. Anthropic atualizou os preços do Claude Haiku...

---

## O que rolou essa semana

- **OpenAI** lançou GPT-4o mini — contexto 128k, preço 15x menor que GPT-4o
- **Anthropic** reduziu preços do Claude Haiku em 50%
- **Mistral** lançou Mistral NeMo 12B com licença Apache 2.0
- **Google AI, Hugging Face**: sem atualizações relevantes
```
