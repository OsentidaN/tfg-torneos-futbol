import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'production'
        ? ['warn', 'error']
        : ['query', 'info', 'warn', 'error']
})

process.on('beforeExit', async () => {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de PostgreSQL');
});

export default prisma;