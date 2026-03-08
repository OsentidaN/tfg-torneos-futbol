import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';

// ============================================
// GET ALL PLAYERS
// ============================================

export const getAllPlayers = catchAsync(async (req: Request, res: Response) => {
    const { search, teamId, position, limit = '50', page = '1' } = req.query;

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const where: any = {};
    
    if (search) {
        where.OR = [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } }
        ];
    }
    
    if (teamId) where.teamId = parseInt(teamId as string);
    if (position) where.position = position;

    const [players, total] = await Promise.all([
        prisma.player.findMany({
            where,
            include: {
                team: {
                    select: { id: true, name: true, flagUrl: true }
                }
            },
            take,
            skip,
            orderBy: [
                { lastName: 'asc' },
                { firstName: 'asc' }
            ]
        }),
        prisma.player.count({ where })
    ]);

    res.json({
        status: 'success',
        results: players.length,
        total,
        page: parseInt(page as string),
        totalPages: Math.ceil(total / take),
        data: players
    });
});

// ============================================
// GET PLAYER BY ID
// ============================================

export const getPlayerById = catchAsync(async (req: Request, res: Response) => {
    const id  = parseInt(req.params.id as string)

    const player = await prisma.player.findUnique({
        where: { id: id },
        include: {
            team: true,
            playerStats: {
                include: {
                    match: {
                        include: {
                            season: {
                                include: {
                                    tournament: true
                                }
                            },
                            homeTeam: {
                                select: { id: true, name: true }
                            },
                            awayTeam: {
                                select: { id: true, name: true }
                            }
                        }
                    }
                },
                orderBy: {
                    match: {
                        date: 'desc'
                    }
                }
            }
        }
    });

    if (!player) {
        throw new AppError('Jugador no encontrado', 404);
    }

    // Calcular estadísticas totales
    const totalGoals = player.playerStats.reduce((sum: number, stat: { goals?: number | null }) => sum + (stat.goals ?? 0), 0);
    const totalAssists = player.playerStats.reduce((sum: number, stat: { assists?: number | null }) => sum + (stat.assists ?? 0), 0);
    const totalYellowCards = player.playerStats.reduce((sum: number, stat: { yellowCards?: number | null }) => sum + (stat.yellowCards ?? 0), 0);
    const totalRedCards = player.playerStats.reduce((sum: number, stat: { redCards?: number | null }) => sum + (stat.redCards ?? 0), 0);
    const totalMinutes = player.playerStats.reduce((sum: number, stat: { minutesPlayed?: number | null }) => sum + (stat.minutesPlayed ?? 0), 0);
    
    const ratingValues = player.playerStats
        .map(s => s.rating)
        .filter((r): r is number => r !== null);

    const avgRating = ratingValues.length > 0
        ? parseFloat((ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length).toFixed(2))
        : null;

    res.json({
        status: 'success',
        data: {
            ...player,
            careerStats: {
                matchesPlayed: player.playerStats.length,
                goals: totalGoals,
                assists: totalAssists,
                yellowCards: totalYellowCards,
                redCards: totalRedCards,
                minutesPlayed: totalMinutes,
                averageRating: avgRating
            }
        }
    });
});

// ============================================
// GET TOP SCORERS
// ============================================

export const getTopScorers = catchAsync(async (req: Request, res: Response) => {
    const { seasonId, tournamentId, limit = '20' } = req.query;

    const where: any = {};
    
    if (seasonId) {
        where.match = { seasonId: parseInt(seasonId as string) };
    } else if (tournamentId) {
        where.match = {
            season: {
                tournamentId: parseInt(tournamentId as string)
            }
        };
    }

    const topScorers = await prisma.matchPlayerStats.groupBy({
        by: ['playerId'],
        where,
        _sum: {
            goals: true,
            assists: true
        },
        _count: {
            matchId: true
        },
        orderBy: {
            _sum: {
                goals: 'desc'
            }
        },
        take: parseInt(limit as string)
    });

    // Obtener información de los jugadores
    const scorersWithInfo = await Promise.all(
        topScorers.map(async (scorer: typeof topScorers[number]) => {
            const player = await prisma.player.findUnique({
                where: { id: scorer.playerId },
                include: {
                    team: {
                        select: { id: true, name: true, flagUrl: true }
                    }
                }
            });

            return {
                player: {
                    id: player?.id,
                    firstName: player?.firstName,
                    lastName: player?.lastName,
                    position: player?.position,
                    team: player?.team
                },
                stats: {
                    goals: scorer._sum.goals || 0,
                    assists: scorer._sum.assists || 0,
                    matchesPlayed: scorer._count.matchId
                }
            };
        })
    );

    res.json({
        status: 'success',
        results: scorersWithInfo.length,
        data: scorersWithInfo
    });
});

// ============================================
// GET TOP ASSISTS
// ============================================

export const getTopAssists = catchAsync(async (req: Request, res: Response) => {
    const { seasonId, tournamentId, limit = '20' } = req.query;

    const where: any = {};
    
    if (seasonId) {
        where.match = { seasonId: parseInt(seasonId as string) };
    } else if (tournamentId) {
        where.match = {
            season: {
                tournamentId: parseInt(tournamentId as string)
            }
        };
    }

    const topAssists = await prisma.matchPlayerStats.groupBy({
        by: ['playerId'],
        where,
        _sum: {
            goals: true,
            assists: true
        },
        _count: {
            matchId: true
        },
        orderBy: {
            _sum: {
                assists: 'desc'
            }
        },
        take: parseInt(limit as string)
    });

    const assistsWithInfo = await Promise.all(
        topAssists.map(async (assist: typeof topAssists[number]) => {
            const player = await prisma.player.findUnique({
                where: { id: assist.playerId },
                include: {
                    team: {
                        select: { id: true, name: true, flagUrl: true }
                    }
                }
            });

            return {
                player: {
                    id: player?.id,
                    firstName: player?.firstName,
                    lastName: player?.lastName,
                    position: player?.position,
                    team: player?.team
                },
                stats: {
                    assists: assist._sum.assists || 0,
                    goals: assist._sum.goals || 0,
                    matchesPlayed: assist._count.matchId
                }
            };
        })
    );

    res.json({
        status: 'success',
        results: assistsWithInfo.length,
        data: assistsWithInfo
    });
});

// ============================================
// GET PLAYER STATS BY SEASON
// ============================================

export const getPlayerStatsBySeason = catchAsync(async (req: Request, res: Response) => {
    const  id  = parseInt(req.params.id as string);
    const { seasonId } = req.query;

    if (!seasonId) {
        throw new AppError('Se requiere el ID de la temporada', 400);
    }

    const stats = await prisma.matchPlayerStats.findMany({
        where: {
            playerId: id,
            match: {
                seasonId: parseInt(seasonId as string)
            }
        },
        include: {
            match: {
                include: {
                    homeTeam: {
                        select: { id: true, name: true }
                    },
                    awayTeam: {
                        select: { id: true, name: true }
                    }
                }
            }
        },
        orderBy: {
            match: {
                date: 'desc'
            }
        }
    });

    const totalGoals = stats.reduce((sum: number, stat: { goals?: number | null }) => sum + (stat.goals ?? 0), 0);
    const totalAssists = stats.reduce((sum: number, stat: { assists?: number | null }) => sum + (stat.assists ?? 0), 0);

    res.json({
        status: 'success',
        results: stats.length,
        data: {
            stats,
            summary: {
                matchesPlayed: stats.length,
                goals: totalGoals,
                assists: totalAssists
            }
        }
    });
});