import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Intentando conectar a la DB...');
        await prisma.$connect();
        console.log('Conexión exitosa');
        const count = await prisma.user.count();
        console.log(`Número de usuarios: ${count}`);
    } catch (error) {
        console.error('Error de conexión:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
