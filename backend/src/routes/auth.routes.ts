import { Router } from 'express';
import rateLimit from 'express-rate-limit';
const { body } = require('express-validator');
import { validateRequest } from '../middlewares/validation.middleware';
import {
    register,
    login,
    getMe,
    updatePassword,
    updateProfile,
    deleteAccount,
    forgotPassword,
    resetPassword
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// ============================================
// RATE LIMITERS
// ============================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Limita a 10 peticiones cada 15 min por IP
    message: { status: 'error', message: 'Demasiados intentos. Por favor, inténtalo de nuevo más tarde.' }
});

const passwordRecoveryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // Solo 3 intentos de recuperación por hora
    message: { status: 'error', message: 'Demasiados intentos de recuperación. Inténtalo en 1 hora.' }
});

// ============================================
// PUBLIC ROUTES
// ============================================

router.post('/register', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('email').isEmail().withMessage('Debe ser un email válido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    validateRequest
], register);

router.post('/login', authLimiter, login);
router.post('/forgot-password', passwordRecoveryLimiter, forgotPassword);
router.post('/reset-password/:token', passwordRecoveryLimiter, resetPassword);

// ============================================
// PROTECTED ROUTES
// ============================================

router.use(protect);

router.get('/me', getMe);
router.patch('/update-password', updatePassword);
router.patch('/update-profile', [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    validateRequest
], updateProfile);
router.post('/delete-account', deleteAccount);

export default router;
