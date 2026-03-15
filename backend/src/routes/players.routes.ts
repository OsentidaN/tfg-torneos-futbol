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
router.get('/top-scorers', getTopScorers); // Lo he puesto antes del /:id porque si no no funcionaba
router.get('/top-assists', getTopAssists);  // Lo he puesto antes del /:id porque si no no funcionaba
router.get('/:id', getPlayerById);
router.get('/:id/stats/season', getPlayerStatsBySeason);

export default router;