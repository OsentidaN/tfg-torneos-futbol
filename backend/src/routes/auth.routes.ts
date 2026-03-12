import { Router } from 'express';
import {
    register,
    login,
    getMe,
    updatePassword,
    updateProfile,
    deleteAccount
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

router.use(protect);

router.get('/me', getMe);
router.patch('/update-password', updatePassword);
router.patch('/update-profile', updateProfile);
router.delete('/delete-account', deleteAccount);

export default router;