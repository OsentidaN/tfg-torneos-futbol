import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';

// ============================================
// GET ALL SEASONS
// ============================================

export const getAllSeasons = catchAsync(async (req: Request, res: Response) => {
    const { tournamentId, year } = req.query;

    const where: any = {};
    if (tournamentId) where.tournamentId = parseInt(tournamentId as string);
    if (year) where.year = parseInt(year as string);

    const seasons = await prisma.season.findMany({
        where,
        include: {
            tournament: true,
            _count: {
                select: {
                    matches: true,
                    seasonTeams: true
                }
            }
        },
        orderBy: { year: 'desc' }
    });

    res.json({
        status: 'success',
        results: seasons.length,
        data: seasons
    });
});

// ============================================
// GET SEASON BY ID
// ============================================

export const getSeasonById = catchAsync(async (req: Request, res: Response) => {
    const id  = parseInt(req.params.id as string)

    const season = await prisma.season.findUnique({
        where: { id: id},
        include: {
            tournament: true,
            seasonTeams: {
                include: {
                    team: true
                },
                orderBy: [
                    { points: 'desc' },
                    { goalsFor: 'desc' }
                ]
            },
            _count: {
                select: {
                    matches: true
                }
            }
        }
    });

    if (!season) {
        throw new AppError('Temporada no encontrada', 404);
    }

    res.json({
        status: 'success',
        data: season
    });
});

// ============================================
// GET SEASON MATCHES
// ============================================

export const getSeasonMatches = catchAsync(async (req: Request, res: Response) => {
    const  id  = parseInt(req.params.id as string)
    const { stage, limit } = req.query;

    const where: any = { seasonId: id };
    if (stage) where.stage = stage;

    const matches = await prisma.match.findMany({
        where,
        include: {
            homeTeam: true,
            awayTeam: true,
            season: {
                include: {
                    tournament: true
                }
            }
        },
        orderBy: { date: 'desc' },
        take: limit ? parseInt(limit as string) : undefined
    });

    res.json({
        status: 'success',
        results: matches.length,
        data: matches
    });
});

// ============================================
// GET SEASON TOP SCORERS
// ============================================

export const getSeasonTopScorers = catchAsync(async (req: Request, res: Response) => {
    const  id  = parseInt(req.params.id as string)
    const limit = parseInt(req.query.limit as string) || 10;

    const topScorers = await prisma.matchPlayerStats.groupBy({
        by: ['playerId'],
        where: {
            match: {
                seasonId: id
            }
        },
        _sum: {
            goals: true,
            assists: true
        },
        orderBy: {
            _sum: {
                goals: 'desc'
            }
        },
        take: limit
    });

    // Obtener información de los jugadores
    const scorersWithInfo = await Promise.all(
        topScorers.map(async (scorer: typeof topScorers[number]) => {
            const player = await prisma.player.findUnique({
                where: { id: scorer.playerId },
                include: {
                    team: true
                }
            });

            return {
                player: {
                    id: player?.id,
                    firstName: player?.firstName,
                    lastName: player?.lastName,
                    team: player?.team?.name
                },
                goals: scorer._sum.goals || 0,
                assists: scorer._sum.assists || 0
            };
        })
    );

    res.json({
        status: 'success',
        results: scorersWithInfo.length,
        data: scorersWithInfo
    });
});