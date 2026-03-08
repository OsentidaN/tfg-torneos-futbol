import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';

// ============================================
// GENERAR JWT TOKEN
// ============================================
const signToken = (id: number): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    
    return jwt.sign(
        { id }, 
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );
};

// ============================================
// REGISTER
// ============================================

export const register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    // Validación
    if (!email || !password || !name) {
        throw new AppError('Email, contraseña y nombre son obligatorios', 400);
    }

    if (password.length < 6) {
        throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new AppError('El email ya está registrado', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash: hashedPassword,
            name
        },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
        }
    });

    // Generar token
    const token = signToken(user.id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
});

// ============================================
// LOGIN
// ============================================

export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
        throw new AppError('Email y contraseña son obligatorios', 400);
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw new AppError('Email o contraseña incorrectos', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new AppError('Email o contraseña incorrectos', 401);
    }

    // Generar token
    const token = signToken(user.id);

    res.json({
        status: 'success',
        token,
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        }
    });
});

// ============================================
// GET CURRENT USER
// ============================================

export const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            favorites: {
                include: {
                    match: true
                }
            }
        }
    });

    res.json({
        status: 'success',
        data: {
            user
        }
    });
});

// ============================================
// UPDATE PASSWORD
// ============================================

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError('Contraseña actual y nueva son obligatorias', 400);
    }

    if (newPassword.length < 6) {
        throw new AppError('La nueva contraseña debe tener al menos 6 caracteres', 400);
    }

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id }
    });

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user!.passwordHash);

    if (!isPasswordValid) {
        throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña
    await prisma.user.update({
        where: { id: req.user!.id },
        data: { passwordHash: hashedPassword }
    });

    res.json({
        status: 'success',
        message: 'Contraseña actualizada correctamente'
    });
});