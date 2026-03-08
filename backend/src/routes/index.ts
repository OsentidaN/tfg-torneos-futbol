import { Router } from 'express';
import authRoutes from './auth.routes';
import tournamentsRoutes from './tournaments.routes';
import seasonsRoutes from './seasons.routes';
import matchesRoutes from './matches.routes';
import teamsRoutes from './teams.routes';
import playersRoutes from './players.routes';

const router = Router();

// ============================================
// API ROUTES
// ============================================

router.use('/auth', authRoutes);
router.use('/tournaments', tournamentsRoutes);
router.use('/seasons', seasonsRoutes);
router.use('/matches', matchesRoutes);
router.use('/teams', teamsRoutes);
router.use('/players', playersRoutes);

// ============================================
// API INFO
// ============================================

router.get('/', (_req, res) => {
    res.json({
        status: 'success',
        message: 'TFG Torneos de Fútbol - API v1.0',
        endpoints: {
            auth: '/api/auth',
            tournaments: '/api/tournaments',
            seasons: '/api/seasons',
            matches: '/api/matches',
            teams: '/api/teams',
            players: '/api/players'
        },
        documentation: 'https://github.com/tu-repo/api-docs'
    });
});

export default router;