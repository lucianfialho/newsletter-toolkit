import Parser from 'rss-parser';

export function getRssTools(config) {
  return [
    {
      name: "fetch_rss_feed",
      description: "Busca o conteúdo de um feed RSS. Retorna os itens mais recentes.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "The URL of the RSS feed"
          },
        },
        required: ["url"],
      },
      callback: async ({ url }, context) => {
        const { logger } = context;
        logger.log(`Buscando RSS feed: ${url}`, 'debug');

        try {
          const parser = new Parser();
          const feed = await parser.parseURL(url);

          const sortedItems = feed.items.sort((a, b) => {
            const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
            const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
            return dateB - dateA;
          });

          const maxItems = Math.min(config.maxResults || 10, 10);
          const recentItems = sortedItems.slice(0, maxItems);

          logger.log(`RSS processado: ${recentItems.length} itens retornados`, 'debug');

          return {
            content: [{
              type: "text",
              text: JSON.stringify(recentItems, null, 2),
            }],
          };
        } catch (error) {
          logger.log(`Erro ao processar RSS: ${error.message}`, 'error');
          return {
            content: [{
              type: "text",
              text: `Erro ao buscar RSS feed: ${error.message}`,
            }],
          };
        }
      },
    },
  ];
}
