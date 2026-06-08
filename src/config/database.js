const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        const DB_NAME = process.env.DB_NAME || 'api_logistica';
        const COLLECTION_NAME = process.env.COLLECION || 'trackings';

        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL no está definida en .env');
        }

        await mongoose.connect(DATABASE_URL, {
            dbName: DB_NAME,
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`✓ Conectado a MongoDB Atlas`);
        console.log(`✓ Base de datos: ${DB_NAME}`);
        console.log(`✓ Colección: ${COLLECTION_NAME}`);

        return mongoose.connection;
    } catch (error) {
        console.error('✗ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✓ Desconectado de MongoDB');
    } catch (error) {
        console.error('✗ Error desconectando de MongoDB:', error.message);
    }
};

module.exports = { connectDB, disconnectDB };
