import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Log API Service',
      version: '1.0.0',
      description: 'Receives client logs and queues them via Kafka',
    },
    components: {
      schemas: {
        LogInput: {
          type: 'object',
          required: ['playerId', 'logData'],
          properties: {
            playerId: {
              type: 'string',
              example: 'player123',
            },
            logData: {
              type: 'string',
              example: 'User clicked on settings page',
            },
          },
        },
      },
    },
  },
  apis: ['src/routes/*.ts'],
});
