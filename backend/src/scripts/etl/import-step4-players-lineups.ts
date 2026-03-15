import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

/**
 * 🚀 PASO 4: JUGADORES Y ALINEACIONES 
 * 
 * Importa:
 * - Jugadores completos
 * - Alineaciones (todos los años)
 * - Stats de jugadores (solo 2016+), más adelante intentar buscar de otras fuentes. 
 */

const CONFIG = {
    DELAY: 200,
    YEARS_WITH_PLAYER_STATS: {
        WORLD_CUP: [2018, 2022],
        EURO_CUP: [2016, 2020, 2024]
    }
};

async function importPlayersAndLineups() {
    console.log('👥 ===== JUGADORES Y ALINEACIONES (PLAN DE PAGO) =====\n');

    const startTime = Date.now();
    let requestCount = 0;
    let lineupsProcessed = 0;
    let playerStatsProcessed = 0;
    let errorCount = 0;

    try {
        // PARTE 1: LINEUPS (todos los partidos)
        console.log('📋 FASE 1: ALINEACIONES\n');

        const matchesForLineups = await prisma.match.findMany({
            where: {
                status: 'FINISHED',
                lineups: { none: {} }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                season: { include: { tournament: true } }
            },
            orderBy: { date: 'desc' }
        });

        console.log(`✓ ${matchesForLineups.length} partidos para lineups\n`);

        for (let i = 0; i < matchesForLineups.length; i++) {
            const match = matchesForLineups[i];

            try {
                const progress = `[${i + 1}/${matchesForLineups.length}]`;
                console.log(`${progress} ${match.homeTeam.name} vs ${match.awayTeam.name}`);

                const response = await axios.get(`${API_URL}/fixtures/lineups`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { fixture: match.apiId }
                });
                requestCount++;

                const lineups = response.data.response;

                if (!lineups || lineups.length === 0) {
                    console.log(`          ⚠️  Sin lineups`);
                    await new Promise(r => setTimeout(r, CONFIG.DELAY));
                    continue;
                }

                let count = 0;

                for (const teamLineup of lineups) {
                    const isHomeTeam = teamLineup.team.id === match.homeTeam.apiId;
                    const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId;

                    // Titulares
                    if (teamLineup.startXI) {
                        for (const playerData of teamLineup.startXI) {
                            const p = playerData.player;
                            if (!p || !p.id) continue;

                            const nameParts = p.name.split(' ');
                            const firstName = nameParts[0] || 'Unknown';
                            const lastName = nameParts.slice(1).join(' ') || 'Unknown';

                            // Posición
                            let positionEnum: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD' = 'FORWARD';
                            if (p.pos) {
                                if (p.pos.includes('G')) positionEnum = 'GOALKEEPER';
                                else if (p.pos.includes('D')) positionEnum = 'DEFENDER';
                                else if (p.pos.includes('M')) positionEnum = 'MIDFIELDER';
                            }

                            const player = await prisma.player.upsert({
                                where: { apiId: p.id },
                                update: { firstName, lastName, position: positionEnum },
                                create: {
                                    firstName,
                                    lastName,
                                    apiId: p.id,
                                    teamId: teamId,
                                    position: positionEnum
                                }
                            });

                            await prisma.lineup.upsert({
                                where: {
                                    matchId_playerId: {
                                        matchId: match.id,
                                        playerId: player.id
                                    }
                                },
                                update: {},
                                create: {
                                    matchId: match.id,
                                    teamId: teamId,
                                    playerId: player.id,
                                    starter: true,
                                    shirtNumber: p.number || null
                                }
                            });
                            count++;
                        }
                    }

                    // Suplentes
                    if (teamLineup.substitutes) {
                        for (const playerData of teamLineup.substitutes) {
                            const p = playerData.player;
                            if (!p || !p.id) continue;

                            const nameParts = p.name.split(' ');
                            const firstName = nameParts[0] || 'Unknown';
                            const lastName = nameParts.slice(1).join(' ') || 'Unknown';

                            let positionEnum: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD' = 'FORWARD';
                            if (p.pos) {
                                if (p.pos.includes('G')) positionEnum = 'GOALKEEPER';
                                else if (p.pos.includes('D')) positionEnum = 'DEFENDER';
                                else if (p.pos.includes('M')) positionEnum = 'MIDFIELDER';
                            }

                            const player = await prisma.player.upsert({
                                where: { apiId: p.id },
                                update: { firstName, lastName, position: positionEnum },
                                create: {
                                    firstName,
                                    lastName,
                                    apiId: p.id,
                                    teamId: teamId,
                                    position: positionEnum
                                }
                            });

                            await prisma.lineup.upsert({
                                where: {
                                    matchId_playerId: {
                                        matchId: match.id,
                                        playerId: player.id
                                    }
                                },
                                update: {},
                                create: {
                                    matchId: match.id,
                                    teamId: teamId,
                                    playerId: player.id,
                                    starter: false,
                                    shirtNumber: p.number || null
                                }
                            });
                            count++;
                        }
                    }
                }

                console.log(`          ✅ ${count} lineups`);
                lineupsProcessed++;

                await new Promise(r => setTimeout(r, CONFIG.DELAY));

            } catch (error) {
                console.error(`          ❌ Error`);
                errorCount++;
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    console.log('          ⏸️  Rate limit, esperando 30s...');
                    await new Promise(r => setTimeout(r, 30000));
                }
                continue;
            }
        }

        // PARTE 2: PLAYER STATS (solo 2016+)
        console.log('\n📊 FASE 2: ESTADÍSTICAS DE JUGADORES\n');

        const matchesForPlayerStats = await prisma.match.findMany({
            where: {
                status: 'FINISHED',
                playerStats: { none: {} },
                season: {
                    OR: [
                        {
                            year: { in: CONFIG.YEARS_WITH_PLAYER_STATS.WORLD_CUP },
                            tournament: { type: 'WORLD_CUP' }
                        },
                        {
                            year: { in: CONFIG.YEARS_WITH_PLAYER_STATS.EURO_CUP },
                            tournament: { type: 'EURO_CUP' }
                        }
                    ]
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                season: { include: { tournament: true } }
            },
            orderBy: { date: 'desc' }
        });

        console.log(`✓ ${matchesForPlayerStats.length} partidos para player stats\n`);

        for (let i = 0; i < matchesForPlayerStats.length; i++) {
            const match = matchesForPlayerStats[i];

            try {
                const progress = `[${i + 1}/${matchesForPlayerStats.length}]`;
                console.log(`${progress} ${match.homeTeam.name} vs ${match.awayTeam.name}`);

                const response = await axios.get(`${API_URL}/fixtures/players`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { fixture: match.apiId }
                });
                requestCount++;

                const playerData = response.data.response;

                if (!playerData || playerData.length === 0) {
                    console.log(`          ⚠️  Sin stats`);
                    await new Promise(r => setTimeout(r, CONFIG.DELAY));
                    continue;
                }

                let count = 0;

                for (const teamData of playerData) {
                    for (const playerInfo of teamData.players) {
                        const player = await prisma.player.findUnique({
                            where: { apiId: playerInfo.player.id }
                        });

                        if (!player) continue;

                        const stats = playerInfo.statistics[0];
                        if (!stats) continue;

                        await prisma.matchPlayerStats.upsert({
                            where: {
                                matchId_playerId: {
                                    matchId: match.id,
                                    playerId: player.id
                                }
                            },
                            update: {
                                minutesPlayed: stats.games?.minutes || null,
                                rating: stats.games?.rating ? parseFloat(stats.games.rating) : null,
                                goals: stats.goals?.total || 0,
                                assists: stats.goals?.assists || 0,
                                shotsTotal: stats.shots?.total || null,
                                shotsOnTarget: stats.shots?.on || null,
                                passes: stats.passes?.total || null,
                                passesAccurate: stats.passes?.accuracy ? String(stats.passes.accuracy) : null,
                                yellowCards: stats.cards?.yellow || 0,
                                redCards: stats.cards?.red || 0
                            },
                            create: {
                                matchId: match.id,    // ← Usa IDs directos
                                playerId: player.id,  // ← Usa IDs directos
                                minutesPlayed: stats.games?.minutes || null,
                                rating: stats.games?.rating ? parseFloat(stats.games.rating) : null,
                                goals: stats.goals?.total || 0,
                                assists: stats.goals?.assists || 0,
                                shotsTotal: stats.shots?.total || null,
                                shotsOnTarget: stats.shots?.on || null,
                                passes: stats.passes?.total || null,
                                passesAccurate: stats.passes?.accuracy ? String(stats.passes.accuracy) : null,
                                yellowCards: stats.cards?.yellow || 0,
                                redCards: stats.cards?.red || 0
                            }
                        });
                        count++;
                    }
                }

                console.log(`          ✅ ${count} player stats`);
                playerStatsProcessed++;

                await new Promise(r => setTimeout(r, CONFIG.DELAY));

            } catch (error) {
                console.error(`          ❌ Error`);
                errorCount++;
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    console.log('          ⏸️  Rate limit, esperando 30s...');
                    await new Promise(r => setTimeout(r, 30000));
                }
                continue;
            }
        }

        // Resumen
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        console.log('\n📊 ===== RESUMEN =====');
        console.log(`⚡ Tiempo: ${elapsed} min`);
        console.log(`📡 Requests: ${requestCount}`);
        console.log(`📋 Lineups: ${lineupsProcessed}`);
        console.log(`📊 Player Stats: ${playerStatsProcessed}`);
        console.log(`❌ Errores: ${errorCount}`);

        console.log('\n✅ IMPORTACIÓN COMPLETADA\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles:', error.response?.data);
        }
    } finally {
        await prisma.$disconnect();
    }
}

importPlayersAndLineups();
