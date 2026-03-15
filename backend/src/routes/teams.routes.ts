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
// TEAM ROUTES (PUBLIC)
// ============================================

router.get('/', getAllTeams);
router.get('/compare', compareTeams); // lo he puesto delante del /:id porque si no no funcionaba
router.get('/:id', getTeamById);
router.get('/:id/matches', getTeamMatches);
router.get('/:id/stats', getTeamStats);

export default router;