import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';

// ============================================
// GET ALL TOURNAMENTS
// ============================================

export const getAllTournaments = catchAsync(async (_req: Request, res: Response) => {
    const tournaments = await prisma.tournament.findMany({
        include: {
            _count: {
                select: {
                    seasons: true
                }
            }
        },
        orderBy: { id: 'asc' }
    });

    res.json({
        status: 'success',
        results: tournaments.length,
        data: tournaments
    });
});

// ============================================
// GET TOURNAMENT BY ID
// ============================================

export const getTournamentById = catchAsync(async (req: Request, res: Response) => {
    const  id = parseInt(req.params.id as string, 10);

    const tournament = await prisma.tournament.findUnique({
        where: { id: id },
        include: {
            seasons: {
                orderBy: { year: 'desc' },
                include: {
                    _count: {
                        select: {
                            matches: true,
                            seasonTeams: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    seasons: true
                }
            }
        }
    });

    if (!tournament) {
        throw new AppError('Torneo no encontrado', 404);
    }

    res.json({
        status: 'success',
        data: tournament
    });
});

// ============================================
// GET TOURNAMENT STATS
// ============================================

export const getTournamentStats = catchAsync(async (req: Request, res: Response) => {
    const  id  = parseInt(req.params.id as string);

    const tournament = await prisma.tournament.findUnique({
        where: { id: id },
        include: {
            seasons: {
                include: {
                    matches: {
                        select: {
                            homeGoals: true,
                            awayGoals: true,
                            status: true
                        }
                    }
                }
            }
        }
    });

    if (!tournament) {
        throw new AppError('Torneo no encontrado', 404);
    }

    // Calcular estadísticas
    let totalMatches = 0;
    let totalGoals = 0;
    let finishedMatches = 0;

    tournament.seasons.forEach((season: { matches: Array<{ status: string; homeGoals: number; awayGoals: number }> }) => {
        season.matches.forEach(match => {
            if (match.status === 'FINISHED') {
                finishedMatches++;
                totalGoals += match.homeGoals + match.awayGoals;
            }
            totalMatches++;
        });
    });

    const avgGoalsPerMatch = finishedMatches > 0 
        ? parseFloat((totalGoals / finishedMatches).toFixed(2))
        : 0;

    res.json({
        status: 'success',
        data: {
            tournament: {
                id: tournament.id,
                name: tournament.name,
                type: tournament.type
            },
            stats: {
                totalSeasons: tournament.seasons.length,
                totalMatches,
                finishedMatches,
                totalGoals,
                avgGoalsPerMatch
            }
        }
    });
});

// ============================================
// GET TOURNAMENT WINNERS (ALL EDITIONS)
// ============================================

export const getTournamentWinners = catchAsync(async (req: Request, res: Response) => {
    const  id  = parseInt(req.params.id as string);

    // Verificar que existe el torneo
    const tournament = await prisma.tournament.findUnique({
        where: { id: id }
    });

    if (!tournament) {
        throw new AppError('Torneo no encontrado', 404);
    }

    // Obtener finales
    const finals = await prisma.match.findMany({
        where: {
            season: {
                tournamentId: id
            },
            stage: 'FINAL'
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            season: true
        },
        orderBy: {
            date: 'desc'
        }
    });

    // Determinar ganador de cada final
    const winners = finals.map((final: {
        homeGoals: number;
        awayGoals: number;
        homeGoalsPenalty: number | null;
        awayGoalsPenalty: number | null;
        homeTeam: { id: number; name: string; flagUrl: string | null };
        awayTeam: { id: number; name: string; flagUrl: string | null };
        season: { year: number };
        date: Date;
        venue: string | null;
        city: string | null;
    }) => {
        let winner = null;
        let runnerUp = null;

        if (final.homeGoals > final.awayGoals) {
            winner = final.homeTeam;
            runnerUp = final.awayTeam;
        } else if (final.awayGoals > final.homeGoals) {
            winner = final.awayTeam;
            runnerUp = final.homeTeam;
        } else {
            // Empate - determinado por penales
            if (final.homeGoalsPenalty! > final.awayGoalsPenalty!) {
                winner = final.homeTeam;
                runnerUp = final.awayTeam;
            } else {
                winner = final.awayTeam;
                runnerUp = final.homeTeam;
            }
        }

        return {
            year: final.season.year,
            winner: {
                id: winner.id,
                name: winner.name,
                flagUrl: winner.flagUrl
            },
            runnerUp: {
                id: runnerUp.id,
                name: runnerUp.name,
                flagUrl: runnerUp.flagUrl
            },
            result: {
                regular: `${final.homeGoals}-${final.awayGoals}`,
                penalties: final.homeGoalsPenalty !== null 
                    ? `${final.homeGoalsPenalty}-${final.awayGoalsPenalty}` 
                    : null
            },
            date: final.date,
            venue: final.venue,
            city: final.city
        };
    });

    res.json({
        status: 'success',
        results: winners.length,
        data: winners
    });
});