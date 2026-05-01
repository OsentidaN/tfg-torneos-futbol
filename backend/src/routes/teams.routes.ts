import { Router } from 'express';
import {
    getAllTeams,
    getTeamById,
    getTeamMatches,
    getTeamStats,
    compareTeams
} from '../controllers/teams.controller';

const router = Router();

// ============================================
// EQUIPOS DE LA API (PUBLICOS)
// ============================================

router.get('/', getAllTeams);
router.get('/compare', compareTeams);
router.get('/:id', getTeamById);
router.get('/:id/matches', getTeamMatches);
router.get('/:id/stats', getTeamStats);

export default router;