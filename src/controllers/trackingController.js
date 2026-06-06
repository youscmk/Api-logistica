const Tracking = require('../models/Tracking');

const VALID_STATUSES = ['Ingresado', 'En tránsito', 'Entregado', 'No entregado'];

const isValidEstado = (value) => {
    return typeof value === 'string' && VALID_STATUSES.includes(value.trim());
};

// POST /trackings - Crear nuevo tracking
const createTracking = async (req, res, next) => {
    try {
        const { trackingNumber, estadoInicial, nota } = req.body;

        // Validación básica
        if (!trackingNumber || !estadoInicial) {
            return res.status(400).json({
                success: false,
                error: 'trackingNumber y estadoInicial son requeridos',
            });
        }

        const estado = estadoInicial.trim();
        if (!isValidEstado(estado)) {
            return res.status(400).json({
                success: false,
                error: `estadoInicial inválido. Valores válidos: ${VALID_STATUSES.join(', ')}`,
            });
        }

        // Crear documento
        const nuevoTracking = new Tracking({
            trackingNumber: trackingNumber.trim(),
            estadoActual: estadoInicial.trim(),
            eventos: [
                {
                    estado: estadoInicial.trim(),
                    timestamp: new Date(),
                    nota: nota || 'Registro inicial',
                },
            ],
        });

        const tracking = await nuevoTracking.save();

        res.status(201).json({
            success: true,
            data: tracking,
        });
    } catch (error) {
        next(error);
    }
};

// GET /trackings/:trackingNumber - Obtener tracking por número
const getTrackingById = async (req, res, next) => {
    try {
        const { trackingNumber } = req.params;

        const tracking = await Tracking.findOne({ trackingNumber });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                error: `Tracking con número "${trackingNumber}" no encontrado`,
            });
        }

        res.status(200).json({
            success: true,
            data: tracking,
        });
    } catch (error) {
        next(error);
    }
};

// PUT /trackings/:trackingNumber - Actualizar estado
const updateTracking = async (req, res, next) => {
    try {
        const { trackingNumber } = req.params;
        const { nuevoEstado, nota } = req.body;

        // Validación
        if (!nuevoEstado) {
            return res.status(400).json({
                success: false,
                error: 'nuevoEstado es requerido',
            });
        }

        const estado = nuevoEstado.trim();
        if (!isValidEstado(estado)) {
            return res.status(400).json({
                success: false,
                error: `nuevoEstado inválido. Valores válidos: ${VALID_STATUSES.join(', ')}`,
            });
        }

        // Buscar y actualizar
        const tracking = await Tracking.findOneAndUpdate(
            { trackingNumber },
            {
                $set: { estadoActual: nuevoEstado.trim() },
                $push: {
                    eventos: {
                        estado: nuevoEstado.trim(),
                        timestamp: new Date(),
                        nota: nota || '',
                    },
                },
            },
            { new: true, runValidators: true }
        );

        if (!tracking) {
            return res.status(404).json({
                success: false,
                error: `Tracking con número "${trackingNumber}" no encontrado`,
            });
        }

        res.status(200).json({
            success: true,
            data: tracking,
        });
    } catch (error) {
        next(error);
    }
};

// GET /trackings - Listar todos (con filtro opcional por estado)
const listTrackings = async (req, res, next) => {
    try {
        const { estado } = req.query;

        let filter = {};
        if (estado) {
            const normalizedEstado = estado.trim();
            filter.estadoActual = new RegExp(`^${normalizedEstado}$`, 'i');
        }

        const trackings = await Tracking.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: trackings.length,
            data: trackings,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTracking,
    getTrackingById,
    updateTracking,
    listTrackings,
};
