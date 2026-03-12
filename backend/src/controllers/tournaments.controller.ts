import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';

// ============================================
// GET ALL TOURNAMENTS
// ============================================

export const getAllTournaments = catchAsync(async (_req: Request, res: Response) => {
    const tournaments = await prisma.tournament.findMany({
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
                        where: { status: 'FINISHED' },
                        include: {
                            homeTeam: true,
                            awayTeam: true
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
    const teamGoalsMap: Record<number, { id: number, name: string, flagUrl: string | null, goals: number }> = {};

    tournament.seasons.forEach(season => {
        season.matches.forEach(match => {
            finishedMatches++;
            totalGoals += match.homeGoals + match.awayGoals;
            totalMatches++;

            // Aggregate team goals
            if (match.homeTeam) {
                if (!teamGoalsMap[match.homeTeam.id]) {
                    teamGoalsMap[match.homeTeam.id] = { id: match.homeTeam.id, name: match.homeTeam.name, flagUrl: match.homeTeam.flagUrl, goals: 0 };
                }
                teamGoalsMap[match.homeTeam.id].goals += match.homeGoals;
            }
            if (match.awayTeam) {
                if (!teamGoalsMap[match.awayTeam.id]) {
                    teamGoalsMap[match.awayTeam.id] = { id: match.awayTeam.id, name: match.awayTeam.name, flagUrl: match.awayTeam.flagUrl, goals: 0 };
                }
                teamGoalsMap[match.awayTeam.id].goals += match.awayGoals;
            }
        });
    });

    const teamGoals = Object.values(teamGoalsMap)
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 20); // Top 20 teams

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
                avgGoalsPerMatch,
                teamGoals
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
    const winners = finals.map((final: any) => {
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

// ============================================
// GET TOURNAMENT RECORDS (HISTORICAL)
// ============================================
export const getTournamentRecords = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);

    const tournament = await prisma.tournament.findUnique({
        where: { id },
        include: {
            seasons: {
                include: {
                    matches: {
                        where: { status: 'FINISHED' },
                        include: {
                            homeTeam: true,
                            awayTeam: true,
                            events: {
                                where: {
                                    type: { in: ['YELLOW_CARD', 'RED_CARD'] }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!tournament) {
        throw new AppError('Torneo no encontrado', 404);
    }

    let biggestWinMatch = null;
    let maxDiff = -1;

    let highestScoringSeason = { season: null as any, goals: -1 };
    let mostCardsSeason = { season: null as any, cards: -1 };

    tournament.seasons.forEach(season => {
        let seasonGoals = 0;
        let seasonCards = 0;

        season.matches.forEach(match => {
            // Biggest Win
            const diff = Math.abs(match.homeGoals - match.awayGoals);
            if (diff > maxDiff) {
                maxDiff = diff;
                biggestWinMatch = {
                    ...match,
                    seasonYear: season.year
                };
            }

            // Season Aggregates
            seasonGoals += match.homeGoals + match.awayGoals;
            seasonCards += match.events.length;
        });

        if (seasonGoals > highestScoringSeason.goals) {
            highestScoringSeason = { season, goals: seasonGoals };
        }
        if (seasonCards > mostCardsSeason.cards) {
            mostCardsSeason = { season, cards: seasonCards };
        }
    });

    res.json({
        status: 'success',
        data: {
            biggestWin: biggestWinMatch ? {
                score: `${(biggestWinMatch as any).homeGoals}-${(biggestWinMatch as any).awayGoals}`,
                homeTeam: (biggestWinMatch as any).homeTeam.name,
                awayTeam: (biggestWinMatch as any).awayTeam.name,
                year: (biggestWinMatch as any).seasonYear,
                diff: maxDiff
            } : null,
            highestScoringSeason: highestScoringSeason.season ? {
                year: highestScoringSeason.season.year,
                goals: highestScoringSeason.goals
            } : null,
            mostCardsSeason: mostCardsSeason.season ? {
                year: mostCardsSeason.season.year,
                cards: mostCardsSeason.cards
            } : null
        }
    });
});
;