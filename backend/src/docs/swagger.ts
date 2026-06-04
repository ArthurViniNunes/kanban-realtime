import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kanban API',
      version: '1.0.0',
      description: 'API Kanban com ACL e realtime-ready',
    },
    tags: [
      { name: 'Auth' },
      { name: 'Boards' },
      { name: 'Columns' },
      { name: 'Cards' },
    ],
    servers: [
      {
        url: 'http://localhost:3333',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.ts'],
});
