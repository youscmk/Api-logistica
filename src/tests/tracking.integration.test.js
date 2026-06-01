const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Tracking = require('../models/Tracking');

let mongoServer;
let token;

beforeAll(async () => {
    // Iniciar MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
        dbName: 'api_logistica_test',
    });
    // Obtener token de autenticación
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ username: 'profesor', password: 'secret' });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Limpiar colección antes de cada test
    await Tracking.deleteMany({});
});

describe('API Endpoints - Integration Tests', () => {
    describe('POST /api/trackings', () => {
        test('Debe crear un tracking exitosamente', async () => {
            const response = await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'TRACK001',
                    estadoInicial: 'Ingresado',
                    nota: 'Registro inicial del test',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.trackingNumber).toBe('TRACK001');
            expect(response.body.data.estadoActual).toBe('Ingresado');
            expect(response.body.data.eventos.length).toBe(1);
        });

        test('No debe crear tracking sin trackingNumber', async () => {
            const response = await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    estadoInicial: 'Ingresado',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('No debe crear tracking sin estadoInicial', async () => {
            const response = await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'TRACK002',
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Debe retornar 409 si trackingNumber ya existe', async () => {
            // Crear primer tracking
            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'DUPLICATE',
                    estadoInicial: 'Ingresado',
                });

            // Intentar crear duplicado
            const response = await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'DUPLICATE',
                    estadoInicial: 'En tránsito',
                });

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/trackings/:trackingNumber', () => {
        test('Debe obtener tracking existente', async () => {
            // Crear tracking
            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'GET001',
                    estadoInicial: 'Ingresado',
                });

            // Obtener tracking
            const response = await request(app)
                .get('/api/trackings/GET001')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.trackingNumber).toBe('GET001');
            expect(response.body.data.eventos).toBeDefined();
        });

        test('Debe retornar 404 si tracking no existe', async () => {
            const response = await request(app)
                .get('/api/trackings/NOEXISTE')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/trackings/:trackingNumber', () => {
        test('Debe actualizar estado exitosamente', async () => {
            // Crear tracking
            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'UPDATE001',
                    estadoInicial: 'Ingresado',
                });

            // Actualizar estado
            const response = await request(app)
                .put('/api/trackings/UPDATE001')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nuevoEstado: 'En tránsito',
                    nota: 'Enviado desde bodega',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.estadoActual).toBe('En tránsito');
            expect(response.body.data.eventos.length).toBe(2);
            expect(response.body.data.eventos[1].estado).toBe('En tránsito');
        });

        test('Debe retornar 400 si nuevoEstado falta', async () => {
            // Crear tracking
            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'UPDATE002',
                    estadoInicial: 'Ingresado',
                });

            // Intentar actualizar sin nuevoEstado
            const response = await request(app)
                .put('/api/trackings/UPDATE002')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('Debe retornar 404 si tracking no existe', async () => {
            const response = await request(app)
                .put('/api/trackings/NOEXISTE')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    nuevoEstado: 'En tránsito',
                });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/trackings', () => {
        test('Debe listar todos los trackings', async () => {
            // Crear algunos trackings
            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'LIST001',
                    estadoInicial: 'Ingresado',
                });

            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'LIST002',
                    estadoInicial: 'En tránsito',
                });

            const response = await request(app)
                .get('/api/trackings')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(2);
            expect(response.body.data.length).toBe(2);
        });

        test('Debe filtrar trackings por estado', async () => {
            // Crear trackings con diferente estado
            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'FILTER001',
                    estadoInicial: 'Ingresado',
                });

            await request(app)
                .post('/api/trackings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    trackingNumber: 'FILTER002',
                    estadoInicial: 'En tránsito',
                });

            // Filtrar por estado
            const response = await request(app)
                .get('/api/trackings?estado=Ingresado')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.data[0].estadoActual).toBe('Ingresado');
        });

        test('Debe retornar array vacío si no hay trackings', async () => {
            const response = await request(app)
                .get('/api/trackings')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(0);
            expect(response.body.data.length).toBe(0);
        });
    });

    describe('Health Check', () => {
        test('GET /health debe retornar OK', async () => {
            const response = await request(app).get('/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('OK');
        });
    });
});
