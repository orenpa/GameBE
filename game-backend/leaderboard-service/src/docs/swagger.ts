import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Leaderboard Service API',
      version: '1.0.0',
      description: 'API for retrieving aggregated leaderboard data',
    },
    components: {
      schemas: {
        LeaderboardEntry: {
          type: 'object',
          properties: {
            playerId: {
              type: 'string',
              example: 'player123',
            },
            totalScore: {
              type: 'number',
              example: 4500,
            },
          },
        },
      },
    },
  },
  apis: ['src/routes/*.ts'],
});
