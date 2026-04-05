import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';
import { parseId } from '../utils/parse';

// ============================================
// GET ALL MATCHES
// ============================================

export const getAllMatches = catchAsync(async (req: Request, res: Response) => {
    const { 
        seasonId, 
        teamId, 
        stage, 
        status,
        limit = '50',
        page = '1' 
    } = req.query;

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const where: any = {};
    if (seasonId) where.seasonId = parseInt(seasonId as string);
    if (stage) where.stage = stage;
    if (status) where.status = status;
    if (teamId) {
        const teamIdNum = parseInt(teamId as string);
        where.OR = [
            { homeTeamId: teamIdNum },
            { awayTeamId: teamIdNum }
        ];
    }

    const [matches, total] = await Promise.all([
        prisma.match.findMany({
            where,
            include: {
                homeTeam: {
                    select: { id: true, name: true, flagUrl: true }
                },
                awayTeam: {
                    select: { id: true, name: true, flagUrl: true }
                },
                season: {
                    include: {
                        tournament: true
                    }
                }
            },
            orderBy: { date: 'desc' },
            take,
            skip
        }),
        prisma.match.count({ where })
    ]);

    res.json({
        status: 'success',
        results: matches.length,
        total,
        page: parseInt(page as string),
        totalPages: Math.ceil(total / take),
        data: matches
    });
});

// ============================================
// GET MATCH BY ID
// ============================================

export const getMatchById = catchAsync(async (req: Request, res: Response) => {
    const matchId = parseId(req.params.id as string);

    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            homeTeam: true,
            awayTeam: true,
            season: {
                include: {
                    tournament: true
                }
            },
            teamStats: {
                include: {
                    team: {
                        select: { id: true, name: true, flagUrl: true }
                    }
                }
            }
        }
    });

    if (!match) {
        throw new AppError('Partido no encontrado', 404);
    }

    res.json({
        status: 'success',
        data: match
    });
});

// ============================================
// GET MATCH EVENTS
// ============================================

export const getMatchEvents = catchAsync(async (req: Request, res: Response) => {
    const matchId = parseId(req.params.id as string);

    const match = await prisma.match.findUnique({
        where: { id: matchId }
    });

    if (!match) {
        throw new AppError('Partido no encontrado', 404);
    }

    const events = await prisma.matchEvent.findMany({
        where: { matchId },  
        include: {
            player: {
                select: { 
                    id: true, 
                    firstName: true, 
                    lastName: true 
                }
            },
        },
        orderBy: { minute: 'asc' }
    });

    res.json({
        status: 'success',
        results: events.length,
        data: events
    });
});

// ============================================
// GET MATCH LINEUPS
// ============================================

export const getMatchLineups = catchAsync(async (req: Request, res: Response) => {
    const matchId = parseId(req.params.id as string);

    const match = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
            homeTeam: true,
            awayTeam: true
        }
    });

    if (!match) {
        throw new AppError('Partido no encontrado', 404);
    }

    const lineups = await prisma.lineup.findMany({
        where: { matchId: matchId },
        include: {
            player: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    position: true
                }
            }
        }
    });

    // Separar por equipo
    const homeLineup = lineups.filter((l: any) => l.teamId === match.homeTeamId);
    const awayLineup = lineups.filter((l: any) => l.teamId === match.awayTeamId);

    res.json({
        status: 'success',
        data: {
            homeTeam: {
                id: match.homeTeam.id,
                name: match.homeTeam.name,
                starters: homeLineup.filter((l: any)=> l.starter),
                substitutes: homeLineup.filter((l: any) => !l.starter)
            },
            awayTeam: {
                id: match.awayTeam.id,
                name: match.awayTeam.name,
                starters: awayLineup.filter((l: any) => l.starter),
                substitutes: awayLineup.filter((l: any) => !l.starter)
            }
        }
    });
});

// ============================================
// GET MATCH PLAYER STATS
// ============================================

export const getMatchPlayerStats = catchAsync(async (req: Request, res: Response) => {
    const matchId = parseId(req.params.id as string);

    const match = await prisma.match.findUnique({
        where: { id: matchId }
    });

    if (!match) {
        throw new AppError('Partido no encontrado', 404);
    }

    const playerStats = await prisma.matchPlayerStats.findMany({
        where: { matchId: matchId },
        include: {
            player: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    position: true,
                    team: {
                        select: { id: true, name: true }
                    }
                }
            }
        },
        orderBy: { rating: 'desc' }
    });

    res.json({
        status: 'success',
        results: playerStats.length,
        data: playerStats
    });
});