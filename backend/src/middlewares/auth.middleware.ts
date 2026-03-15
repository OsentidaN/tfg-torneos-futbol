import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { catchAsync, AppError } from './error.middleware';
import prisma from '../config/prisma';

// ============================================
// EXTENDER REQUEST TYPE
// ============================================

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                name: string;
            };
        }
    }
}

// ============================================
// PROTEGER RUTAS (REQUIRE AUTH)
// ============================================

export const protect = catchAsync(async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    // 1. Obtener token del header
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new AppError('No estás autenticado. Por favor inicia sesión', 401);
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
        iat: number;
        exp: number;
    };

    // 3. Verificar que el usuario aún existe
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true }
    });

    if (!user) {
        throw new AppError('El usuario ya no existe', 401);
    }

    // 4. Añadir usuario al request
    req.user = user;
    next();
});

