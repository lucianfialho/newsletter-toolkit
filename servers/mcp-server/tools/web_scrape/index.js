import * as cheerio from 'cheerio';

export function getWebScrapeTools(config) {
  return [
    {
      name: "scrape_web_page",
      description: "Extrai o conteúdo principal de uma página da web usando seletores (article, main, body).",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            format: "uri",
            description: "The URL of the web page to scrape"
          },
        },
        required: ["url"],
      },
      callback: async ({ url }, context) => {
        const { logger } = context;
        logger.log(`Fazendo scraping de: ${url}`, 'debug');

        try {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const html = await response.text();
          const $ = cheerio.load(html);

          const content = $("article").text() || $("main").text() || $("body").text();

          const maxLength = config.verbose ? 10000 : 5000;
          const truncatedContent = content.length > maxLength
            ? content.substring(0, maxLength) + '\n\n[CONTEÚDO TRUNCADO...]'
            : content;

          logger.log(`Scraping concluído: ${content.length} caracteres extraídos`, 'debug');

          return {
            content: [{
              type: "text",
              text: truncatedContent.trim(),
            }],
          };
        } catch (error) {
          logger.log(`Erro no scraping: ${error.message}`, 'error');
          return {
            content: [{
              type: "text",
              text: `Erro ao fazer scraping da página: ${error.message}`,
            }],
          };
        }
      },
    },
  ];
}
