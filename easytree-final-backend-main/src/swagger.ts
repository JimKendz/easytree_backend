import swaggerJsdoc from "swagger-jsdoc"

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EasyTree API',
      version: '1.0.0',
      description: 'EasyTree API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    },
    apis: ['src/routes/*.ts'],
  };

const swaggerSpec = swaggerJsdoc(options);
console.log(swaggerSpec);

export default swaggerSpec;
