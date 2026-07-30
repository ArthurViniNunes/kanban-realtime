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
      { name: 'Board Members' },
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
      schemas: {
        BoardMemberUser: {
          type: 'object',
          required: ['id', 'name', 'email'],
          properties: {
            id: {
              type: 'string',
              example: 'user_01HZX8Q8Y3V7A1B2C3D4E5F6G7',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
          },
        },
        BoardMember: {
          type: 'object',
          required: ['id', 'role', 'user'],
          properties: {
            id: {
              type: 'string',
              example: 'membership_01HZG2ABCD3EF4GH5IJ6KL7MN8',
            },
            role: {
              type: 'string',
              enum: ['owner', 'admin', 'member'],
              example: 'member',
            },
            user: {
              $ref: '#/components/schemas/BoardMemberUser',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error'],
          properties: {
            error: {
              type: 'string',
              example: 'You do not have permission to perform this action',
            },
          },
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
