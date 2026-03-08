import { Router } from 'express';
import {
    getAllPlayers,
    getPlayerById,
    getTopScorers,
    getTopAssists,
    getPlayerStatsBySeason
} from '../controllers/players.controller';

const router = Router();

// ============================================
// PLAYER ROUTES (PUBLIC)
// ============================================

router.get('/', getAllPlayers);
router.get('/top-scorers', getTopScorers); // Debe ir antes de /:id
router.get('/top-assists', getTopAssists);  // Debe ir antes de /:id
router.get('/:id', getPlayerById);
router.get('/:id/stats/season', getPlayerStatsBySeason);

export default router;