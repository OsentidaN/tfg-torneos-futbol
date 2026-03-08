import { Router } from 'express';
import {
    getAllMatches,
    getMatchById,
    getMatchEvents,
    getMatchLineups,
    getMatchPlayerStats
} from '../controllers/matches.controller';

const router = Router();

// ============================================
// MATCH ROUTES (PUBLIC)
// ============================================

router.get('/', getAllMatches);
router.get('/:id', getMatchById);
router.get('/:id/events', getMatchEvents);
router.get('/:id/lineups', getMatchLineups);
router.get('/:id/player-stats', getMatchPlayerStats);

export default router;