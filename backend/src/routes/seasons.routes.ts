import { Router } from 'express';
import {
    getAllSeasons,
    getSeasonById,
    getSeasonMatches,
    getSeasonTopScorers
} from '../controllers/seasons.controller';

const router = Router();

// ============================================
// SEASON ROUTES (PUBLIC)
// ============================================

router.get('/', getAllSeasons);
router.get('/:id', getSeasonById);
router.get('/:id/matches', getSeasonMatches);
router.get('/:id/top-scorers', getSeasonTopScorers);

export default router;