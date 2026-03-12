import { Router } from 'express';
import { toggleFavorite, getMyFavorites } from '../controllers/favorites.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de favoritos requieren estar autenticado
router.use(protect);

router.get('/', getMyFavorites);
router.post('/toggle', toggleFavorite);

export default router;
