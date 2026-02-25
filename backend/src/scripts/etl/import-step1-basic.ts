import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

// IDs conocidos de API-Football
const LEAGUES = {
    WORLD_CUP: { id: 1, name: 'World Cup' },
    EURO: { id: 4, name: 'Euro Championship' }
};

const SEASONS_TO_IMPORT = {
    WORLD_CUP: [2022],
    EURO: [2024]
};

// ============================================
// PASO 1: IMPORTAR DATOS BÁSICOS
// Equipos + Clasificaciones + Partidos
// ============================================

async function importBasicData() {
    console.log('🚀 ===== IMPORTACIÓN BÁSICA DE TODOS LOS TORNEOS =====\n');
    console.log('📌 Esto incluye: Equipos, Clasificaciones, Partidos\n');

    let totalRequests = 0;

    try {
        // MUNDIALES
        for (const year of SEASONS_TO_IMPORT.WORLD_CUP) {
            console.log(`\n🌍 ===== MUNDIAL ${year} =====`);

            const season = await prisma.season.findFirst({
                where: {
                    year: year,
                    tournament: { type: 'WORLD_CUP' }
                }
            });

            if (!season) {
                console.log(`⚠️  Temporada ${year} no encontrada en BD`);
                continue;
            }

            // 1. Equipos
            console.log(`  📋 Importando equipos...`);
            const teamsResp = await axios.get(`${API_URL}/teams`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: LEAGUES.WORLD_CUP.id, season: year }
            });
            totalRequests++;

            for (const teamData of teamsResp.data.response) {
                const team = teamData.team;
                await prisma.team.upsert({
                    where: { apiId: team.id },
                    update: {
                        name: team.name,
                        code: team.code || team.name.substring(0, 3).toUpperCase(),
                        flagUrl: team.logo,
                        confederation: team.country || null
                    },
                    create: {
                        name: team.name,
                        code: team.code || team.name.substring(0, 3).toUpperCase(),
                        flagUrl: team.logo,
                        confederation: team.country || null,
                        apiId: team.id
                    }
                });
            }
            console.log(`    ✅ ${teamsResp.data.response.length} equipos`);

            await new Promise(r => setTimeout(r, 1000));

            // 2. Clasificaciones
            console.log(`  📊 Importando clasificaciones...`);
            const standingsResp = await axios.get(`${API_URL}/standings`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: LEAGUES.WORLD_CUP.id, season: year }
            });
            totalRequests++;

            const standings = standingsResp.data.response[0]?.league?.standings;
            let standingsCount = 0;

            if (standings) {
                for (const group of standings) {
                    for (const standing of group) {
                        const team = await prisma.team.findUnique({
                            where: { apiId: standing.team.id }
                        });
                        if (!team) continue;

                        await prisma.seasonTeam.upsert({
                            where: {
                                seasonId_teamId: {
                                    seasonId: season.id,
                                    teamId: team.id
                                }
                            },
                            update: {
                                group: standing.group ? standing.group.replace(/.*?Group\s*/i, '').trim().substring(0, 1).toUpperCase() : null,
                                position: standing.rank,
                                played: standing.all.played,
                                won: standing.all.win,
                                drawn: standing.all.draw,
                                lost: standing.all.lose,
                                goalsFor: standing.all.goals.for,
                                goalsAgainst: standing.all.goals.against,
                                points: standing.points
                            },
                            create: {
                                seasonId: season.id,
                                teamId: team.id,
                                group: standing.group ? standing.group.replace(/.*?Group\s*/i, '').trim().substring(0, 1).toUpperCase() : null,
                                position: standing.rank,
                                played: standing.all.played,
                                won: standing.all.win,
                                drawn: standing.all.draw,
                                lost: standing.all.lose,
                                goalsFor: standing.all.goals.for,
                                goalsAgainst: standing.all.goals.against,
                                points: standing.points
                            }
                        });
                        standingsCount++;
                    }
                }
            }
            console.log(`    ✅ ${standingsCount} clasificaciones`);

            await new Promise(r => setTimeout(r, 1000));

            // 3. Partidos
            console.log(`  ⚽ Importando partidos...`);
            const fixturesResp = await axios.get(`${API_URL}/fixtures`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: LEAGUES.WORLD_CUP.id, season: year }
            });
            totalRequests++;

            const fixtures = fixturesResp.data.response;

            // Si no se encontraron equipos en /teams, los extraemos de los partidos
            if (teamsResp.data.response.length === 0 && fixtures.length > 0) {
                console.log(`  ⚠️  Extrayendo equipos desde los partidos...`);
                const extractedTeams = new Map();
                for (const f of fixtures) {
                    extractedTeams.set(f.teams.home.id, f.teams.home);
                    extractedTeams.set(f.teams.away.id, f.teams.away);
                }

                for (const t of extractedTeams.values()) {
                    const savedTeam = await prisma.team.upsert({
                        where: { apiId: t.id },
                        update: {
                            name: t.name,
                            code: t.name.substring(0, 3).toUpperCase(),
                            flagUrl: t.logo
                        },
                        create: {
                            name: t.name,
                            code: t.name.substring(0, 3).toUpperCase(),
                            flagUrl: t.logo,
                            apiId: t.id
                        }
                    });

                    await prisma.seasonTeam.upsert({
                        where: { seasonId_teamId: { seasonId: season.id, teamId: savedTeam.id } },
                        update: {},
                        create: { seasonId: season.id, teamId: savedTeam.id }
                    });
                }
                console.log(`    ✅ ${extractedTeams.size} equipos extraídos e insertados (con participación en temporada)`);
            }

            let matchesCount = 0;
            for (const fixture of fixtures) {
                const homeTeam = await prisma.team.findUnique({
                    where: { apiId: fixture.teams.home.id }
                });
                const awayTeam = await prisma.team.findUnique({
                    where: { apiId: fixture.teams.away.id }
                });

                if (!homeTeam || !awayTeam) continue;

                const roundLower = fixture.league.round.toLowerCase();
                let stage = 'GROUP';
                if (roundLower.includes('final') && !roundLower.includes('semi')) stage = 'FINAL';
                else if (roundLower.includes('semi')) stage = 'SEMI_FINAL';
                else if (roundLower.includes('quarter')) stage = 'QUARTER_FINAL';
                else if (roundLower.includes('round of 16') || roundLower.includes('16')) stage = 'ROUND_OF_16';
                else if (roundLower.includes('3rd')) stage = 'THIRD_PLACE';

                let status = 'SCHEDULED';
                if (['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short)) status = 'FINISHED';

                await prisma.match.upsert({
                    where: { apiId: fixture.fixture.id },
                    update: {
                        seasonId: season.id,
                        homeTeamId: homeTeam.id,
                        awayTeamId: awayTeam.id,
                        round: fixture.league.round,
                        stage: stage as any,
                        date: new Date(fixture.fixture.date),
                        venue: fixture.fixture.venue?.name || null,
                        city: fixture.fixture.venue?.city || null,
                        referee: fixture.fixture.referee || null,
                        homeGoals: fixture.goals.home || 0,
                        awayGoals: fixture.goals.away || 0,
                        homeGoalsPenalty: fixture.score.penalty?.home || null,
                        awayGoalsPenalty: fixture.score.penalty?.away || null,
                        status: status as any
                    },
                    create: {
                        seasonId: season.id,
                        homeTeamId: homeTeam.id,
                        awayTeamId: awayTeam.id,
                        round: fixture.league.round,
                        stage: stage as any,
                        date: new Date(fixture.fixture.date),
                        venue: fixture.fixture.venue?.name || null,
                        city: fixture.fixture.venue?.city || null,
                        referee: fixture.fixture.referee || null,
                        homeGoals: fixture.goals.home || 0,
                        awayGoals: fixture.goals.away || 0,
                        homeGoalsPenalty: fixture.score.penalty?.home || null,
                        awayGoalsPenalty: fixture.score.penalty?.away || null,
                        status: status as any,
                        apiId: fixture.fixture.id
                    }
                });
                matchesCount++;
            }
            console.log(`    ✅ ${matchesCount} partidos`);

            await new Promise(r => setTimeout(r, 2000));
        }

        // EUROCOPAS
        for (const year of SEASONS_TO_IMPORT.EURO) {
            console.log(`\n🇪🇺 ===== EURO ${year} =====`);

            const season = await prisma.season.findFirst({
                where: {
                    year: year,
                    tournament: { type: 'EURO_CUP' }
                }
            });

            if (!season) {
                console.log(`⚠️  Temporada ${year} no encontrada en BD`);
                continue;
            }

            // Mismo proceso que mundiales
            console.log(`  📋 Importando equipos...`);
            const teamsResp = await axios.get(`${API_URL}/teams`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: LEAGUES.EURO.id, season: year }
            });
            totalRequests++;

            for (const teamData of teamsResp.data.response) {
                const team = teamData.team;
                await prisma.team.upsert({
                    where: { apiId: team.id },
                    update: {
                        name: team.name,
                        code: team.code || team.name.substring(0, 3).toUpperCase(),
                        flagUrl: team.logo,
                        confederation: team.country || null
                    },
                    create: {
                        name: team.name,
                        code: team.code || team.name.substring(0, 3).toUpperCase(),
                        flagUrl: team.logo,
                        confederation: team.country || null,
                        apiId: team.id
                    }
                });
            }
            console.log(`    ✅ ${teamsResp.data.response.length} equipos`);

            await new Promise(r => setTimeout(r, 1000));

            console.log(`  📊 Importando clasificaciones...`);
            const standingsResp = await axios.get(`${API_URL}/standings`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: LEAGUES.EURO.id, season: year }
            });
            totalRequests++;

            const standings = standingsResp.data.response[0]?.league?.standings;
            let standingsCount = 0;

            if (standings) {
                for (const group of standings) {
                    for (const standing of group) {
                        const team = await prisma.team.findUnique({
                            where: { apiId: standing.team.id }
                        });
                        if (!team) continue;

                        await prisma.seasonTeam.upsert({
                            where: {
                                seasonId_teamId: {
                                    seasonId: season.id,
                                    teamId: team.id
                                }
                            },
                            update: {
                                group: standing.group ? standing.group.replace(/.*?Group\s*/i, '').trim().substring(0, 1).toUpperCase() : null,
                                position: standing.rank,
                                played: standing.all.played,
                                won: standing.all.win,
                                drawn: standing.all.draw,
                                lost: standing.all.lose,
                                goalsFor: standing.all.goals.for,
                                goalsAgainst: standing.all.goals.against,
                                points: standing.points
                            },
                            create: {
                                seasonId: season.id,
                                teamId: team.id,
                                group: standing.group ? standing.group.replace(/.*?Group\s*/i, '').trim().substring(0, 1).toUpperCase() : null,
                                position: standing.rank,
                                played: standing.all.played,
                                won: standing.all.win,
                                drawn: standing.all.draw,
                                lost: standing.all.lose,
                                goalsFor: standing.all.goals.for,
                                goalsAgainst: standing.all.goals.against,
                                points: standing.points
                            }
                        });
                        standingsCount++;
                    }
                }
            }
            console.log(`    ✅ ${standingsCount} clasificaciones`);

            await new Promise(r => setTimeout(r, 1000));

            console.log(`  ⚽ Importando partidos...`);
            const fixturesResp = await axios.get(`${API_URL}/fixtures`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: LEAGUES.EURO.id, season: year }
            });
            totalRequests++;

            const fixtures = fixturesResp.data.response;

            // Si no se encontraron equipos en /teams, los extraemos de los partidos
            if (teamsResp.data.response.length === 0 && fixtures.length > 0) {
                console.log(`  ⚠️  Extrayendo equipos desde los partidos...`);
                const extractedTeams = new Map();
                for (const f of fixtures) {
                    extractedTeams.set(f.teams.home.id, f.teams.home);
                    extractedTeams.set(f.teams.away.id, f.teams.away);
                }

                for (const t of extractedTeams.values()) {
                    const savedTeam = await prisma.team.upsert({
                        where: { apiId: t.id },
                        update: {
                            name: t.name,
                            code: t.name.substring(0, 3).toUpperCase(),
                            flagUrl: t.logo
                        },
                        create: {
                            name: t.name,
                            code: t.name.substring(0, 3).toUpperCase(),
                            flagUrl: t.logo,
                            apiId: t.id
                        }
                    });

                    await prisma.seasonTeam.upsert({
                        where: { seasonId_teamId: { seasonId: season.id, teamId: savedTeam.id } },
                        update: {},
                        create: { seasonId: season.id, teamId: savedTeam.id }
                    });
                }
                console.log(`    ✅ ${extractedTeams.size} equipos extraídos e insertados (con participación en temporada)`);
            }

            let matchesCount = 0;
            for (const fixture of fixtures) {
                const homeTeam = await prisma.team.findUnique({
                    where: { apiId: fixture.teams.home.id }
                });
                const awayTeam = await prisma.team.findUnique({
                    where: { apiId: fixture.teams.away.id }
                });

                if (!homeTeam || !awayTeam) continue;

                const roundLower = fixture.league.round.toLowerCase();
                let stage = 'GROUP';
                if (roundLower.includes('final') && !roundLower.includes('semi')) stage = 'FINAL';
                else if (roundLower.includes('semi')) stage = 'SEMI_FINAL';
                else if (roundLower.includes('quarter')) stage = 'QUARTER_FINAL';
                else if (roundLower.includes('round of 16') || roundLower.includes('16')) stage = 'ROUND_OF_16';
                else if (roundLower.includes('3rd')) stage = 'THIRD_PLACE';

                let status = 'SCHEDULED';
                if (['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short)) status = 'FINISHED';

                await prisma.match.upsert({
                    where: { apiId: fixture.fixture.id },
                    update: {
                        seasonId: season.id,
                        homeTeamId: homeTeam.id,
                        awayTeamId: awayTeam.id,
                        round: fixture.league.round,
                        stage: stage as any,
                        date: new Date(fixture.fixture.date),
                        venue: fixture.fixture.venue?.name || null,
                        city: fixture.fixture.venue?.city || null,
                        referee: fixture.fixture.referee || null,
                        homeGoals: fixture.goals.home || 0,
                        awayGoals: fixture.goals.away || 0,
                        homeGoalsPenalty: fixture.score.penalty?.home || null,
                        awayGoalsPenalty: fixture.score.penalty?.away || null,
                        status: status as any
                    },
                    create: {
                        seasonId: season.id,
                        homeTeamId: homeTeam.id,
                        awayTeamId: awayTeam.id,
                        round: fixture.league.round,
                        stage: stage as any,
                        date: new Date(fixture.fixture.date),
                        venue: fixture.fixture.venue?.name || null,
                        city: fixture.fixture.venue?.city || null,
                        referee: fixture.fixture.referee || null,
                        homeGoals: fixture.goals.home || 0,
                        awayGoals: fixture.goals.away || 0,
                        homeGoalsPenalty: fixture.score.penalty?.home || null,
                        awayGoalsPenalty: fixture.score.penalty?.away || null,
                        status: status as any,
                        apiId: fixture.fixture.id
                    }
                });
                matchesCount++;
            }
            console.log(`    ✅ ${matchesCount} partidos`);

            await new Promise(r => setTimeout(r, 2000));
        }

        // RESUMEN
        console.log('\n📊 ===== RESUMEN FINAL =====');
        console.log(`Requests usados: ${totalRequests}/100`);

        const [teams, seasonTeams, matches] = await Promise.all([
            prisma.team.count(),
            prisma.seasonTeam.count(),
            prisma.match.count()
        ]);

        console.log(`\nTotal en BD:`);
        console.log(`  Equipos: ${teams}`);
        console.log(`  Participaciones: ${seasonTeams}`);
        console.log(`  Partidos: ${matches}`);

        console.log('\n✅ ===== IMPORTACIÓN BÁSICA COMPLETADA =====');
        console.log(`💡 Siguiente paso: npm run etl:match-stats\n`);

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (axios.isAxiosError(error)) {
            console.error('API Error:', error.response?.data);
        }
    } finally {
        await prisma.$disconnect();
    }
}

importBasicData();