import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

prisma.$connect()
    .then(() => {
        console.log('✅ Conectado a PostgreSQL con Prisma');
    })
    .catch((error: Error) => {
        console.error('❌ Error conectando a la base de datos:', error);
        process.exit(1);
    });

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de PostgreSQL');
});

export default prisma;