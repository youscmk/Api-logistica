const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            error: messages.join(', '),
        });
    }

    // Error de duplicado (índice unique)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        const value = err.keyValue[field];
        return res.status(409).json({
            success: false,
            error: `El ${field} "${value}" ya existe`,
        });
    }

    // Error de Cast (ej: ObjectId inválido)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: `Formato inválido: ${err.path}`,
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor',
    });
};

module.exports = errorHandler;
