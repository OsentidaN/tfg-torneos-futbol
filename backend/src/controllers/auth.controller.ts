import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';
import { sendPasswordResetEmail } from '../services/email.service';

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

// ============================================
// UPDATE PROFILE (name)
// ============================================

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        throw new AppError('El nombre debe tener al menos 2 caracteres', 400);
    }

    const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { name: name.trim() },
        select: { id: true, email: true, name: true }
    });

    res.json({
        status: 'success',
        message: 'Perfil actualizado correctamente',
        data: { user }
    });
});

// ============================================
// DELETE ACCOUNT
// ============================================

export const deleteAccount = catchAsync(async (req: Request, res: Response) => {
    const { password } = req.body;

    if (!password) {
        throw new AppError('Debes confirmar tu contraseña para eliminar la cuenta', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const isPasswordValid = await bcrypt.compare(password, user!.passwordHash);

    if (!isPasswordValid) {
        throw new AppError('Contraseña incorrecta', 401);
    }

    // Eliminar favoritos primero (cascada manual por si Prisma no la aplica)
    await prisma.favorite.deleteMany({ where: { userId: req.user!.id } });
    await prisma.user.delete({ where: { id: req.user!.id } });

    res.json({
        status: 'success',
        message: 'Cuenta eliminada correctamente'
    });
});

// ============================================
// FORGOT PASSWORD
// ============================================

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError('El email es obligatorio', 400);
    }

    // Buscar usuario 
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        // Enviar respuesta genérica directamente si no existe
        return res.json({
            status: 'success',
            message: 'Si ese email existe en nuestro sistema, recibirás un enlace de recuperación en breve.'
        });
    }

    // Generar token aleatorio criptográfico
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hashear el token antes de guardarlo en BD
    const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex');

    // Guardar hash en BD con expiración de 1 hora
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
        }
    });

    // Enviar email con el token SIN hashear
    try {
        await sendPasswordResetEmail(user.email, user.name, rawToken);
    } catch (err) {
        // Si el email falla, limpiar el token de la BD
        await prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: null, resetPasswordExpiry: null }
        });
        throw new AppError('Error interno al enviar el correo. Por favor, verifica la configuración del servidor de correo.', 500);
    }

    return res.json({
        status: 'success',
        message: 'Si ese email existe en nuestro sistema, recibirás un enlace de recuperación en breve.'
    });
});

// ============================================
// RESET PASSWORD
// ============================================

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = String(req.params.token);
    const { password } = req.body;

    if (!token || !password) {
        throw new AppError('Token y nueva contraseña son obligatorios', 400);
    }

    if (password.length < 6) {
        throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }

    // Hashear el token recibido para compararlo con el de la BD
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Buscar usuario con token válido y no expirado
    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpiry: { gt: new Date() } // Mayor que ahora
        }
    });

    if (!user) {
        throw new AppError('Token inválido o expirado. Solicita un nuevo enlace de recuperación.', 400);
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar contraseña y limpiar token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        }
    });

    // Generar nuevo JWT para login automático
    const jwtToken = signToken(user.id);

    res.json({
        status: 'success',
        message: 'Contraseña restablecida correctamente.',
        token: jwtToken,
        data: {
            user: { id: user.id, email: user.email, name: user.name }
        }
    });
});