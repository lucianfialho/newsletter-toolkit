export function getGeneralTools(config) {
  return [
    {
      name: "get_current_time",
      description: "Get the current computer time",
      inputSchema: {
        type: "object",
        properties: {},
      },
      callback: async (args, context) => {
        const { logger } = context;
        logger.log('Obtendo horário atual', 'debug');

        const now = new Date();
        const timeString = now.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        });

        return {
          content: [{
            type: "text",
            text: `The current time is: ${timeString}`,
          }],
        };
      },
    },
  ];
}
