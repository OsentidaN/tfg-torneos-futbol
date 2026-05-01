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
// JUGADORES DE LA API (PUBLICOS)
// ============================================

router.get('/', getAllPlayers);
router.get('/top-scorers', getTopScorers);
router.get('/top-assists', getTopAssists);
router.get('/:id', getPlayerById);
router.get('/:id/stats/season', getPlayerStatsBySeason);

export default router;