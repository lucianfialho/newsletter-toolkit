import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { getGeneralTools } from "./tools/general/index.js";
import { getRssTools } from "./tools/rss/index.js";
import { getWebScrapeTools } from "./tools/web_scrape/index.js";
import { getSerperTools } from "./tools/serper/index.js";

class ConfigManager {
  constructor() {
    this.config = this.loadConfiguration();
    this.validateConfig();
  }

  loadConfiguration() {
    return {
      serperApiKey: process.env.SERPER_API_KEY || null,
      debugMode: process.env.DEBUG || 'info',
      verbose: this.parseArg('--verbose') === 'true',
      maxResults: parseInt(this.parseArg('--max-results') || '10'),
      nodeEnv: process.env.NODE_ENV || 'production'
    };
  }

  parseArg(argName) {
    const arg = process.argv.find(arg => arg.startsWith(argName));
    return arg ? arg.split('=')[1] : null;
  }

  validateConfig() {
    if (!this.config.serperApiKey) {
      this.log('Serper API Key não configurada — busca de notícias indisponível', 'warn');
    }
  }

  log(message, level = 'info') {
    const shouldLog = this.config?.debugMode === 'debug' ||
                     level === 'error' ||
                     level === 'warn' ||
                     level === 'info';
    if (shouldLog) {
      const emoji = { debug: '🟡', info: '🔵', error: '🔴', warn: '🟠' }[level] || '⚪';
      console.error(`${emoji} [${level.toUpperCase()}] ${message}`);
    }
  }

  get() {
    return this.config;
  }
}

try {
  const configManager = new ConfigManager();
  const config = configManager.get();

  const server = new Server(
    {
      name: "newsletter-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const tools = [
    ...getGeneralTools(config),
    ...getRssTools(config),
    ...getWebScrapeTools(config),
    ...getSerperTools(config),
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Ferramenta desconhecida: ${name}`);
    }

    const context = { config, logger: configManager };

    if (tool.callback.length > 1) {
      return await tool.callback(args, context);
    } else {
      return await tool.callback(args);
    }
  });

  const transport = new StdioServerTransport();
  server.connect(transport);

  console.error('newsletter-mcp server running');
} catch (error) {
  console.error("FATAL ERROR during server startup:", error);
  process.exit(1);
}
