const express = require('express');
const router = express.Router();
const {
    createTracking,
    getTrackingById,
    updateTracking,
    listTrackings,
} = require('../controllers/trackingController');
const authenticate = require('../middleware/auth');

/**
 * @swagger
 * /api/trackings:
 *   post:
 *     summary: Crear nuevo tracking
 *     description: Registra un nuevo número de guía con estado inicial
 *     tags:
 *       - Trackings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingNumber:
 *                 type: string
 *                 description: Número único de guía
 *                 example: "GUIDE001"
 *               estadoInicial:
 *                 type: string
 *                 description: Estado inicial del envío
 *                 example: "Ingresado"
 *               nota:
 *                 type: string
 *                 description: Nota descriptiva (opcional)
 *                 example: "Recibido en bodega"
 *             required:
 *               - trackingNumber
 *               - estadoInicial
 *     responses:
 *       201:
 *         description: Tracking creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trackingNumber:
 *                       type: string
 *                       example: "GUIDE001"
 *                     estadoActual:
 *                       type: string
 *                       example: "Ingresado"
 *                     eventos:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Tracking ya existe (duplicado)
 */
router.post('/trackings', authenticate, createTracking);

/**
 * @swagger
 * /api/trackings/{trackingNumber}:
 *   get:
 *     summary: Obtener tracking por número
 *     description: Retorna el estado actual y el historial de eventos
 *     tags:
 *       - Trackings
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: "GUIDE001"
 *         description: Número de guía a consultar
 *     responses:
 *       200:
 *         description: Tracking encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trackingNumber:
 *                       type: string
 *                       example: "GUIDE001"
 *                     estadoActual:
 *                       type: string
 *                       example: "En tránsito"
 *                     eventos:
 *                       type: array
 *                       example:
 *                         - estado: "Ingresado"
 *                           timestamp: "2026-06-01T10:00:00Z"
 *                           nota: "Registro inicial"
 *       404:
 *         description: Tracking no encontrado
 */
router.get('/trackings/:trackingNumber', authenticate, getTrackingById);

/**
 * @swagger
 * /api/trackings/{trackingNumber}:
 *   put:
 *     summary: Actualizar estado del tracking
 *     description: Cambia el estado actual y agrega un nuevo evento
 *     tags:
 *       - Trackings
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *           example: "GUIDE001"
 *         description: Número de guía a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nuevoEstado:
 *                 type: string
 *                 description: Nuevo estado del envío
 *                 example: "En tránsito"
 *               nota:
 *                 type: string
 *                 description: Nota descriptiva (opcional)
 *                 example: "Salió desde bodega"
 *             required:
 *               - nuevoEstado
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tracking no encontrado
 */
router.put('/trackings/:trackingNumber', authenticate, updateTracking);

/**
 * @swagger
 * /api/trackings:
 *   get:
 *     summary: Listar todos los trackings
 *     description: Retorna listado de trackings, con opción de filtrar por estado
 *     tags:
 *       - Trackings
 *     parameters:
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           example: "En tránsito"
 *         description: Filtrar por estado actual (opcional)
 *     responses:
 *       200:
 *         description: Listado de trackings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/trackings', authenticate, listTrackings);

module.exports = router;
