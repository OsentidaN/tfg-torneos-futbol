import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';
import { parseId } from '../utils/parse';

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
    const id = parseId(req.params.id as string);

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
    const id = parseId(req.params.id as string);

    const tournament = await prisma.tournament.findUnique({
        where: { id: id },
        select: { id: true, name: true, type: true, seasons: { select: { id: true } } }
    });

    if (!tournament) {
        throw new AppError('Torneo no encontrado', 404);
    }

    const seasonIds = tournament.seasons.map(s => s.id);

    // Agregaciones globales
    const aggregate = await prisma.match.aggregate({
        where: { seasonId: { in: seasonIds }, status: 'FINISHED' },
        _count: { id: true },
        _sum: { homeGoals: true, awayGoals: true }
    });

    const finishedMatches = aggregate._count.id;
    const totalGoals = (aggregate._sum.homeGoals || 0) + (aggregate._sum.awayGoals || 0);

    // Goles por equipo (Home)
    const homeGoals = await prisma.match.groupBy({
        by: ['homeTeamId'],
        where: { seasonId: { in: seasonIds }, status: 'FINISHED' },
        _sum: { homeGoals: true }
    });

    // Goles por equipo (Away)
    const awayGoals = await prisma.match.groupBy({
        by: ['awayTeamId'],
        where: { seasonId: { in: seasonIds }, status: 'FINISHED' },
        _sum: { awayGoals: true }
    });

    // Combinar en JS (sigue siendo mucho más ligero que traer todos los partidos)
    const teamGoalsMap: Record<number, number> = {};
    homeGoals.forEach(g => {
        teamGoalsMap[g.homeTeamId] = (teamGoalsMap[g.homeTeamId] || 0) + (g._sum.homeGoals || 0);
    });
    awayGoals.forEach(g => {
        teamGoalsMap[g.awayTeamId] = (teamGoalsMap[g.awayTeamId] || 0) + (g._sum.awayGoals || 0);
    });

    // Obtener info de los equipos más goleadores
    const sortedTeamIds = Object.entries(teamGoalsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    const teamsInfo = await prisma.team.findMany({
        where: { id: { in: sortedTeamIds.map(([id]) => parseInt(id)) } },
        select: { id: true, name: true, flagUrl: true }
    });

    const teamGoals = sortedTeamIds.map(([id, goals]) => {
        const team = teamsInfo.find(t => t.id === parseInt(id));
        return {
            id: team?.id,
            name: team?.name,
            flagUrl: team?.flagUrl,
            goals
        };
    });

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
                totalMatches: finishedMatches, // Solo partidos finalizados para coherencia
                finishedMatches,
                totalGoals,
                avgGoalsPerMatch: finishedMatches > 0 ? parseFloat((totalGoals / finishedMatches).toFixed(2)) : 0,
                teamGoals
            }
        }
    });
});

// ============================================
// GET TOURNAMENT WINNERS (ALL EDITIONS)
// ============================================

export const getTournamentWinners = catchAsync(async (req: Request, res: Response) => {
    const id = parseId(req.params.id as string);

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
            stage: 'FINAL',
            status: 'FINISHED'
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
            // Empate - determinado por penaltis
            // Validamos que existan datos de penaltis para evitar errores
            if (final.homeGoalsPenalty !== null && final.awayGoalsPenalty !== null) {
                if (final.homeGoalsPenalty > final.awayGoalsPenalty) {
                    winner = final.homeTeam;
                    runnerUp = final.awayTeam;
                } else {
                    winner = final.awayTeam;
                    runnerUp = final.homeTeam;
                }
            } else {
                // Fallback si no hay datos de penaltis (no debería pasar pero evita crash)
                winner = final.homeTeam;
                runnerUp = final.awayTeam;
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
    const id = parseId(req.params.id as string);

    // 1. Obtener IDs de temporadas
    const seasons = await prisma.season.findMany({
        where: { tournamentId: id },
        select: { id: true, year: true }
    });

    if (seasons.length === 0) {
        throw new AppError('Torneo no encontrado o sin temporadas', 404);
    }

    const seasonIds = seasons.map(s => s.id);

    // 2. Biggest Win (Mayor diferencia de goles)
    // Buscamos los top 100 partidos para encontrar la mayor diferencia en JS
    const candidates = await prisma.match.findMany({
        where: { seasonId: { in: seasonIds }, status: 'FINISHED' },
        take: 100,
        include: { homeTeam: true, awayTeam: true, season: true }
    });

    let biggestWinMatch = null;
    let maxDiff = -1;

    candidates.forEach(match => {
        const diff = Math.abs(match.homeGoals - match.awayGoals);
        if (diff > maxDiff) {
            maxDiff = diff;
            biggestWinMatch = match;
        }
    });

    // 3. Highest Scoring Season
    const seasonGoals = await prisma.match.groupBy({
        by: ['seasonId'],
        where: { seasonId: { in: seasonIds }, status: 'FINISHED' },
        _sum: { homeGoals: true, awayGoals: true },
        orderBy: { _sum: { homeGoals: 'desc' } } // No podemos ordenar por suma de ambos directamente en Prisma
    });

    // Recalcular suma total en JS para encontrar la verdadera máxima
    const sortedSeasonGoals = seasonGoals
        .map(s => ({ 
            id: s.seasonId, 
            goals: (s._sum.homeGoals || 0) + (s._sum.awayGoals || 0) 
        }))
        .sort((a, b) => b.goals - a.goals);
    
    const topSeasonGoals = sortedSeasonGoals[0];
    const topSeasonGoalsYear = seasons.find(s => s.id === topSeasonGoals?.id)?.year;

    // 4. Most Cards Season
    const cardsByMatch = await prisma.matchEvent.groupBy({
        by: ['matchId'],
        where: { 
            match: { seasonId: { in: seasonIds } },
            type: { in: ['YELLOW_CARD', 'RED_CARD'] }
        },
        _count: { id: true }
    });

    // Agrupar por temporada
    const matchesInfo = await prisma.match.findMany({
        where: { id: { in: cardsByMatch.map(c => c.matchId) } },
        select: { id: true, seasonId: true }
    });

    const cardsBySeason: Record<number, number> = {};
    cardsByMatch.forEach(c => {
        const seasonId = matchesInfo.find(m => m.id === c.matchId)?.seasonId;
        if (seasonId) {
            cardsBySeason[seasonId] = (cardsBySeason[seasonId] || 0) + c._count.id;
        }
    });

    const topCardsSeasonId = Object.entries(cardsBySeason)
        .sort((a, b) => b[1] - a[1])[0];
    
    const topCardsYear = seasons.find(s => s.id === (topCardsSeasonId ? parseInt(topCardsSeasonId[0]) : null))?.year;

    res.json({
        status: 'success',
        data: {
            biggestWin: biggestWinMatch ? {
                score: `${(biggestWinMatch as any).homeGoals}-${(biggestWinMatch as any).awayGoals}`,
                homeTeam: (biggestWinMatch as any).homeTeam.name,
                awayTeam: (biggestWinMatch as any).awayTeam.name,
                year: (biggestWinMatch as any).season.year,
                diff: maxDiff
            } : null,
            highestScoringSeason: topSeasonGoals ? {
                year: topSeasonGoalsYear,
                goals: topSeasonGoals.goals
            } : null,
            mostCardsSeason: topCardsSeasonId ? {
                year: topCardsYear,
                cards: topCardsSeasonId[1]
            } : null
        }
    });
});
;