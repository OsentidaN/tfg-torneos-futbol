import { Router } from 'express';
import {
    register,
    login,
    getMe,
    updatePassword
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

router.post('/register', register);
router.post('/login', login);

// ============================================
// PROTECTED ROUTES
// ============================================

router.use(protect); // Todas las rutas después de esta línea requieren autenticación

router.get('/me', getMe);
router.patch('/update-password', updatePassword);

export default router;