const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middleware/errorHandler');
const trackingRoutes = require('./routes/trackings');
const authRoutes = require('./routes/auth');

const app = express();

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de Seguimiento de Envíos',
        version: '1.0.0',
        description: 'API REST para crear, consultar y actualizar trackings de envíos.',
    },
    servers: [
        {
            url: 'http://localhost:8080',
            description: 'Servidor local',
        },
        {
            url: 'https://api-logistica-h3bd.onrender.com',
            description: 'Producción (Render)',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Autenticación usando JWT. Usar: `Bearer <token>`',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        '/api/v1/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Obtener JWT',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' },
                                },
                                required: ['username', 'password'],
                            },
                            examples: {
                                credentials: {
                                    summary: 'Credenciales de ejemplo',
                                    value: { username: 'profesor', password: 'secret' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Token JWT devuelto',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                    },
                                },
                                examples: {
                                    success: {
                                        summary: 'Respuesta ejemplo',
                                        value: { token: 'eyJhbGciOiJI...ejemplo' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { description: 'Credenciales inválidas' },
                },
            },
        },
    },
};

const swaggerOptions = {
    swaggerDefinition,
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI (lowercase and uppercase paths)
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/Swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Servidor activo' });
});

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api', trackingRoutes);

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada',
    });
});

// Manejo de errores
app.use(errorHandler);

module.exports = app;
