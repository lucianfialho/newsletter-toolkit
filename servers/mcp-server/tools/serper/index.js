const serperTool = async (q, endpoint, context) => {
  const { config, logger } = context;

  logger.log(`Executando busca Serper: ${q} (${endpoint})`, 'debug');

  const serperApiKey = config.serperApiKey;

  if (!serperApiKey) {
    return {
      content: [{
        type: 'text',
        text: `Erro: Serper API key não configurada. Configure via /plugin configure newsletter-toolkit e defina serper_api_key. Chave gratuita disponível em https://serper.dev`,
      }]
    };
  }

  try {
    const response = await fetch(`https://google.serper.dev/${endpoint}`, {
      method: "POST",
      headers: {
        "X-API-KEY": serperApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q,
        num: config.maxResults || 10
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API retornou erro: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    logger.log(`Busca concluída: ${result.organic?.length || result.news?.length || 0} resultados`, 'debug');

    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2),
      }],
    };

  } catch (error) {
    logger.log(`Erro na API Serper: ${error.message}`, 'error');
    return {
      content: [{
        type: "text",
        text: `Erro ao buscar com Serper API: ${error.message}`,
      }],
    };
  }
};

export function getSerperTools(config) {
  return [
    {
      name: "serper_search",
      description: "Busca na web usando a API Serper.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "The search query"
          },
        },
        required: ["q"],
      },
      callback: async ({ q }, context) => serperTool(q, "search", context),
    },
    {
      name: "serper_news",
      description: "Busca notícias recentes usando a API Serper.",
      inputSchema: {
        type: "object",
        properties: {
          q: {
            type: "string",
            description: "The search query"
          },
        },
        required: ["q"],
      },
      callback: async ({ q }, context) => serperTool(q, "news", context),
    },
  ];
}
