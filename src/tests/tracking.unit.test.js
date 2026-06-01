const Tracking = require('../models/Tracking');

describe('Tracking Model - Unit Tests', () => {
    describe('Validación de campos', () => {
        test('Debe crear un tracking con campos válidos', () => {
            const tracking = new Tracking({
                trackingNumber: 'ABC123',
                estadoActual: 'Ingresado',
                eventos: [
                    {
                        estado: 'Ingresado',
                        nota: 'Registro inicial',
                    },
                ],
            });

            expect(tracking.trackingNumber).toBe('ABC123');
            expect(tracking.estadoActual).toBe('Ingresado');
            expect(tracking.eventos.length).toBe(1);
        });

        test('trackingNumber no debe permitir vacío', async () => {
            const tracking = new Tracking({
                trackingNumber: '',
                estadoActual: 'Ingresado',
            });

            let error;
            try {
                await tracking.validate();
            } catch (e) {
                error = e;
            }

            expect(error).toBeDefined();
        });

        test('estadoActual es requerido', async () => {
            const tracking = new Tracking({
                trackingNumber: 'ABC123',
            });

            let error;
            try {
                await tracking.validate();
            } catch (e) {
                error = e;
            }

            expect(error).toBeDefined();
        });
    });

    describe('Timestamps y metadata', () => {
        test('Debe incluir createdAt y updatedAt', () => {
            const tracking = new Tracking({
                trackingNumber: 'XYZ789',
                estadoActual: 'En tránsito',
            });

            expect(tracking).toHaveProperty('createdAt');
            expect(tracking).toHaveProperty('updatedAt');
        });

        test('Debe tener metadata con origen por defecto', () => {
            const tracking = new Tracking({
                trackingNumber: 'TEST001',
                estadoActual: 'Ingresado',
            });

            expect(tracking.metadata.origen).toBe('bodega');
        });
    });

    describe('Array de eventos', () => {
        test('Debe agregar evento con timestamp', () => {
            const tracking = new Tracking({
                trackingNumber: 'EVENT001',
                estadoActual: 'Ingresado',
                eventos: [
                    {
                        estado: 'Ingresado',
                        timestamp: new Date(),
                        nota: 'Test evento',
                    },
                ],
            });

            expect(tracking.eventos[0].estado).toBe('Ingresado');
            expect(tracking.eventos[0].nota).toBe('Test evento');
            expect(tracking.eventos[0].timestamp).toBeDefined();
        });
    });
});
