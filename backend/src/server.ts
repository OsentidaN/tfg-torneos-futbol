import 'dotenv/config';
import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 4000;

// ============================================
// INICIAR SERVIDOR
// ============================================

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 TFG TORNEOS FUTBOL - API v1.0    ║
╚════════════════════════════════════════╝

✅ Servidor iniciado en puerto ${PORT}
📡 API disponible en: http://localhost:${PORT}/api
🏥 Health check: http://localhost:${PORT}/health
🔗 Base de datos: Conectada
⏰ Timestamp: ${new Date().toISOString()}
    `);
});

// ============================================
// MANEJO GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', async () => {
    console.log('⚠️  SIGTERM recibido, cerrando servidor...');
    
    server.close(async () => {
        console.log('✅ Servidor cerrado');
        await prisma.$disconnect();
        console.log('✅ Base de datos desconectada');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT recibido, cerrando servidor...');
    
    server.close(async () => {
        console.log('✅ Servidor cerrado');
        await prisma.$disconnect();
        console.log('✅ Base de datos desconectada');
        process.exit(0);
    });
});

// Errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    server.close(() => process.exit(1));
});