import { Request, Response, NextFunction } from 'express';

// ============================================
// CUSTOM ERROR CLASS
// ============================================

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// ============================================
// ERROR MIDDLEWARE
// ============================================

export const errorMiddleware = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log en desarrollo
    if (process.env.NODE_ENV !== 'production') {
        console.error('❌ ERROR:', {
            message: err.message,
            stack: err.stack,
            code: err.code
        });
    }

    // Errores de Prisma
    if (err.code === 'P2002') {
        return res.status(409).json({
            status: 'fail',
            message: 'Ya existe un registro con esos datos únicos'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            status: 'fail',
            message: 'Registro no encontrado'
        });
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            status: 'fail',
            message: 'Error de relación en la base de datos'
        });
    }

    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Error de validación',
            errors: err.errors
        });
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Token expirado'
        });
    }

    // Cast errors
    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'fail',
            message: 'ID inválido'
        });
    }

    // Respuesta genérica
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        ...(process.env.NODE_ENV !== 'production' && { 
            stack: err.stack,
            error: err 
        })
    });
};

// ============================================
// ASYNC ERROR CATCHER
// ============================================

export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};