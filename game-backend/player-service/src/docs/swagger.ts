import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Player Service API',
      version: '1.0.0',
      description: 'API documentation for managing player profiles',
    },
    components: {
      schemas: {
        Player: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PlayerInput: {
          type: 'object',
          required: ['username', 'email'],
          properties: {
            username: { type: 'string', example: 'admin' },
            email: { type: 'string', example: 'admin@admin.com' },
          },
        },
      },
    },
  },
  apis: ['src/routes/*.ts'],
});
