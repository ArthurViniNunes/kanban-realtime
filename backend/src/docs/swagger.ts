import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../env.js';

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
        url: env.API_PUBLIC_URL,
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
