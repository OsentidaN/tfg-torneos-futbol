import { Router } from 'express';
import {
    getAllSeasons,
    getSeasonById,
    getSeasonMatches,
    getSeasonTopScorers
} from '../controllers/seasons.controller';

const router = Router();

// ============================================
// TEMPORADAS DE LA API (PUBLICAS)
// ============================================

router.get('/', getAllSeasons);
router.get('/:id', getSeasonById);
router.get('/:id/matches', getSeasonMatches);
router.get('/:id/top-scorers', getSeasonTopScorers);

export default router;