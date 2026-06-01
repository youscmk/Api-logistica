require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
    try {
        // Conectar a BD
        await connectDB();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`\n╔════════════════════════════════════════╗`);
            console.log(`║  API Seguimiento de Envíos - MVP       ║`);
            console.log(`║  Servidor corriendo en puerto ${PORT}       ║`);
            console.log(`║  http://localhost:${PORT}                ║`);
            console.log(`║  http://localhost:${PORT}/health         ║`);
            console.log(`╚════════════════════════════════════════╝\n`);
        });
    } catch (error) {
        console.error('Error iniciando servidor:', error);
        process.exit(1);
    }
};

startServer();
