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
    const id = parseInt(req.params.id as string)

    const season = await prisma.season.findUnique({
        where: { id: id },
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
    const id = parseInt(req.params.id as string)
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
    const id = parseInt(req.params.id as string);
    const limit = parseInt(req.query.limit as string) || 12;
    // 1. Get goals from MatchEvent 
    const goalsData = await prisma.matchEvent.groupBy({
        by: ['playerId'],
        where: {
            match: { seasonId: id },
            type: { in: ['GOAL', 'PENALTY'] },
            playerId: { not: null }
        },
        _count: { id: true },
    });

    // 2. Get assists from MatchPlayerStats (siempre que sea posible)
    const assistsData = await prisma.matchPlayerStats.groupBy({
        by: ['playerId'],
        where: {
            match: { seasonId: id },
            assists: { gt: 0 }
        },
        _sum: { assists: true }
    });

    // 3. Merge data
    const playerMap = new Map<number, { goals: number; assists: number }>();

    goalsData.forEach(item => {
        if (item.playerId) {
            playerMap.set(item.playerId, { goals: item._count.id, assists: 0 });
        }
    });

    assistsData.forEach(item => {
        const stats = playerMap.get(item.playerId) || { goals: 0, assists: 0 };
        stats.assists = item._sum.assists || 0;
        playerMap.set(item.playerId, stats);
    });

    // 4. Sort and take top N
    const sortedIds = Array.from(playerMap.entries())
        .sort((a, b) => b[1].goals - a[1].goals || b[1].assists - a[1].assists)
        .slice(0, limit);

    // 5. Fetch player info and format
    const scorersWithInfo = await Promise.all(
        sortedIds.map(async ([playerId, stats]) => {
            const player = await prisma.player.findUnique({
                where: { id: playerId },
                include: { team: true }
            });

            return {
                player: {
                    id: player?.id,
                    firstName: player?.firstName,
                    lastName: player?.lastName,
                    team: player?.team?.name,
                    teamFlag: player?.team?.flagUrl
                },
                goals: stats.goals,
                assists: stats.assists
            };
        })
    );

    res.json({
        status: 'success',
        results: scorersWithInfo.length,
        data: scorersWithInfo
    });
});