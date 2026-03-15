import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';

// ============================================
// GET ALL TEAMS
// ============================================

export const getAllTeams = catchAsync(async (req: Request, res: Response) => {
    const { search, limit = '50' } = req.query;

    const where: any = {
        OR: [
            { matchesHome: { some: {} } },
            { matchesAway: { some: {} } }
        ]
    };
    if (search) {
        where.AND = [
            {
                name: {
                    contains: search as string,
                    mode: 'insensitive'
                }
            }
        ];
    }

    const teams = await prisma.team.findMany({
        where,
        include: {
            _count: {
                select: {
                    matchesHome: true,
                    matchesAway: true,
                    players: true
                }
            }
        },
        take: parseInt(limit as string),
        orderBy: { name: 'asc' }
    });

    const total = await prisma.team.count({ where });

    res.json({
        status: 'success',
        results: teams.length,
        total,
        data: teams
    });
});

// ============================================
// GET TEAM BY ID
// ============================================

export const getTeamById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);


    const team = await prisma.team.findUnique({
        where: { id: id },
        include: {
            seasonTeams: {
                include: {
                    season: {
                        include: {
                            tournament: true
                        }
                    }
                },
                orderBy: {
                    season: {
                        year: 'desc'
                    }
                }
            },
            _count: {
                select: {
                    matchesHome: true,
                    matchesAway: true,
                    players: true
                }
            }
        }
    });

    if (!team) {
        throw new AppError('Equipo no encontrado', 404);
    }

    res.json({
        status: 'success',
        data: team
    });
});

// ============================================
// GET TEAM MATCHES
// ============================================

export const getTeamMatches = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);

    const { seasonId, limit = '20' } = req.query;

    const where: any = {
        OR: [
            { homeTeamId: id },
            { awayTeamId: id }
        ]
    };

    if (seasonId) {
        where.seasonId = parseInt(seasonId as string);
    }

    const matches = await prisma.match.findMany({
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
        take: parseInt(limit as string)
    });

    res.json({
        status: 'success',
        results: matches.length,
        data: matches
    });
});

// ============================================
// GET TEAM STATS
// ============================================

export const getTeamStats = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);


    const team = await prisma.team.findUnique({
        where: { id: id }
    });

    if (!team) {
        throw new AppError('Equipo no encontrado', 404);
    }

    const { type } = req.query;

    const matchWhere: any = {
        OR: [
            { homeTeamId: id },
            { awayTeamId: id }
        ],
        status: 'FINISHED'
    };

    if (type) {
        matchWhere.season = {
            tournament: {
                type: type as string
            }
        };
    }

    // Obtener todos los partidos del equipo
    const matches = await prisma.match.findMany({
        where: matchWhere,
        select: {
            homeTeamId: true,
            awayTeamId: true,
            homeGoals: true,
            awayGoals: true,
            stage: true
        }
    });

    // Calcular estadísticas
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    matches.forEach((match: { homeTeamId: number; awayTeamId: number; homeGoals: number; awayGoals: number }) => {
        const isHome = match.homeTeamId === id;
        const teamGoals = isHome ? match.homeGoals : match.awayGoals;
        const opponentGoals = isHome ? match.awayGoals : match.homeGoals;

        goalsFor += teamGoals;
        goalsAgainst += opponentGoals;

        if (teamGoals > opponentGoals) wins++;
        else if (teamGoals === opponentGoals) draws++;
        else losses++;
    });

    const finalWhere: any = {
        OR: [
            { homeTeamId: id },
            { awayTeamId: id }
        ],
        stage: 'FINAL',
        status: 'FINISHED'
    };

    if (type) {
        finalWhere.season = {
            tournament: {
                type: type as string
            }
        };
    }

    // Títulos (finales ganadas)
    const finals = await prisma.match.findMany({
        where: finalWhere
    });

    const titles = finals.filter((final: { homeTeamId: number; awayTeamId: number; homeGoals: number; awayGoals: number; homeGoalsPenalty: number | null; awayGoalsPenalty: number | null }) => {
        const isHome = final.homeTeamId === id;

        // Comparar goles regulares
        if (final.homeGoals !== final.awayGoals) {
            return isHome
                ? final.homeGoals > final.awayGoals
                : final.awayGoals > final.homeGoals;
        }

        // Si hay empate, ver penaltis
        if (final.homeGoalsPenalty !== null) {
            return isHome
                ? final.homeGoalsPenalty! > final.awayGoalsPenalty!
                : final.awayGoalsPenalty! > final.homeGoalsPenalty!;
        }

        return false;
    }).length;

    res.json({
        status: 'success',
        data: {
            team: {
                id: team.id,
                name: team.name,
                flagUrl: team.flagUrl
            },
            stats: {
                matchesPlayed: matches.length,
                wins,
                draws,
                losses,
                goalsFor,
                goalsAgainst,
                goalDifference: goalsFor - goalsAgainst,
                winPercentage: matches.length > 0
                    ? parseFloat(((wins / matches.length) * 100).toFixed(2))
                    : 0,
                titles
            }
        }
    });
});

// ============================================
// COMPARE TWO TEAMS
// ============================================

export const compareTeams = catchAsync(async (req: Request, res: Response) => {
    const { team1, team2, type } = req.query;

    if (!team1 || !team2) {
        throw new AppError('Se requieren los IDs de dos equipos', 400);
    }

    const team1Id = parseInt(team1 as string);
    const team2Id = parseInt(team2 as string);

    // Obtener equipos
    const [teamA, teamB] = await Promise.all([
        prisma.team.findUnique({ where: { id: team1Id } }),
        prisma.team.findUnique({ where: { id: team2Id } })
    ]);

    if (!teamA || !teamB) {
        throw new AppError('Uno o ambos equipos no encontrados', 404);
    }

    // Filtro por tipo de torneo
    const matchWhere: any = {
        OR: [
            { homeTeamId: team1Id, awayTeamId: team2Id },
            { homeTeamId: team2Id, awayTeamId: team1Id }
        ],
        status: 'FINISHED'
    };

    if (type) {
        matchWhere.season = {
            tournament: {
                type: type as string
            }
        };
    }

    // Obtener enfrentamientos directos
    const headToHead = await prisma.match.findMany({
        where: matchWhere,
        include: {
            season: {
                include: {
                    tournament: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });

    // Calcular estadísticas H2H
    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;

    headToHead.forEach((match: { homeTeamId: number; awayTeamId: number; homeGoals: number; awayGoals: number }) => {
        const team1IsHome = match.homeTeamId === team1Id;
        const team1Goals = team1IsHome ? match.homeGoals : match.awayGoals;
        const team2Goals = team1IsHome ? match.awayGoals : match.homeGoals;

        if (team1Goals > team2Goals) team1Wins++;
        else if (team2Goals > team1Goals) team2Wins++;
        else draws++;
    });

    res.json({
        status: 'success',
        data: {
            team1: {
                id: teamA.id,
                name: teamA.name,
                flagUrl: teamA.flagUrl,
                wins: team1Wins
            },
            team2: {
                id: teamB.id,
                name: teamB.name,
                flagUrl: teamB.flagUrl,
                wins: team2Wins
            },
            headToHead: {
                totalMatches: headToHead.length,
                team1Wins,
                team2Wins,
                draws,
                matches: headToHead
            }
        }
    });
});