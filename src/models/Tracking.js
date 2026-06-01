const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema(
    {
        trackingNumber: {
            type: String,
            required: [true, 'trackingNumber es requerido'],
            unique: true,
            trim: true,
            minlength: [1, 'trackingNumber no puede estar vacío'],
            index: true,
        },
        estadoActual: {
            type: String,
            required: [true, 'estadoActual es requerido'],
            trim: true,
            index: true,
        },
        eventos: [
            {
                estado: {
                    type: String,
                    required: true,
                    trim: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                nota: {
                    type: String,
                    trim: true,
                },
            },
        ],
        metadata: {
            origen: {
                type: String,
                default: 'bodega',
            },
        },
    },
    {
        timestamps: true, // Agrega createdAt y updatedAt automáticamente
        collection: process.env.COLLECION || 'trackings',
    }
);

// Índices
trackingSchema.index({ trackingNumber: 1 }, { unique: true });
trackingSchema.index({ estadoActual: 1 });

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;
