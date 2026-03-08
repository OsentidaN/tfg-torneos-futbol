import { Router } from 'express';
import {
    getAllTournaments,
    getTournamentById,
    getTournamentStats,
    getTournamentWinners
} from '../controllers/tournaments.controller';

const router = Router();

// ============================================
// TOURNAMENT ROUTES (PUBLIC)
// ============================================

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);
router.get('/:id/stats', getTournamentStats);
router.get('/:id/winners', getTournamentWinners);

export default router;