import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Score Service API',
      version: '1.0.0',
      description: 'API for submitting scores and retrieving top scores',
    },
    components: {
      schemas: {
        ScoreInput: {
          type: 'object',
          required: ['playerId', 'score'],
          properties: {
            playerId: { type: 'string', example: 'abc123' },
            score: { type: 'number', example: 1500 },
          },
        },
        Score: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            playerId: { type: 'string' },
            score: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        LeaderboardEntry: {
          type: 'object',
          properties: {
            playerId: { type: 'string' },
            score: { type: 'number' },
          },
        },
      },
    },    
  },
  apis: ['src/routes/*.ts'],
});
