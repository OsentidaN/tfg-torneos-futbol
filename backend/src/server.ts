import 'dotenv/config';
import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 4000;

// ============================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ============================================

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL', 'FRONTEND_URL'];
for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        console.error(`❌ Variable de entorno faltante: ${key}`);
        process.exit(1);
    }
}

// ============================================
// INICIAR SERVIDOR
// ============================================

const server = app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', '╔════════════════════════════════════════╗');
    console.log('\x1b[36m%s\x1b[0m', '║   TFG TORNEOS FUTBOL - API v1.0    ║');
    console.log('\x1b[36m%s\x1b[0m', '╚════════════════════════════════════════╝');
    console.log('');
    console.log(`Servidor iniciado en puerto ${PORT}`);
    console.log(`API disponible en: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Base de datos: Conectada`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
});

// ============================================
// DIAGNÓSTICO Y MANEJO DE ERRORES
// ============================================

// Detectar por qué se cierra el proceso
process.on('exit', (code) => {
    console.log(`PROCESO TERMINANDO CON CÓDIGO: ${code}`);
    if (code !== 0) {
        console.trace('Trace del cierre del proceso (no exitoso):');
    }
});

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
    console.error('ERROR NO CAPTURADO (uncaughtException):', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
    console.error('PROMESA NO MANEJADA (unhandledRejection):', reason);
});

// Errores en el servidor HTTP
server.on('error', (err: any) => {
    console.error('ERROR EN EL SERVIDOR HTTP:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`La puerta ${PORT} ya está en uso.`);
    }
});

// ============================================
// MANEJO GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    server.close(async () => {
        console.log('Servidor cerrado.');
        try {
            await prisma.$disconnect();
            console.log('Base de datos desconectada.');
        } catch (error) {
            console.error('Error al desconectar la base de datos:', error);
        }
        process.exit(0);
    });

    setTimeout(() => {
        console.error('No se pudo cerrar a tiempo, forzando salida.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));