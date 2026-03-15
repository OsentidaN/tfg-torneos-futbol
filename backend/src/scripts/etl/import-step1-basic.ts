import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

// IDs de API-Football
const LEAGUES = {
    WORLD_CUP: { id: 1, name: 'World Cup' },
    EURO: { id: 4, name: 'Euro Championship' }
};

// Importar todos los años disponibles
const SEASONS_TO_IMPORT = {
    WORLD_CUP: [2010, 2014, 2018, 2022],
    EURO: [2008, 2012, 2016, 2020, 2024]
};

// ⚡ Configuración pensada con el mes de suscripción que he contratado
const CONFIG = {
    DELAY_BETWEEN_REQUESTS: 200, // Reducido de 2000ms a 200ms
    ENABLE_PARALLEL: false        // Cambiar a true si en algún momento necesito procesamiento paralelo
};

async function importBasicData() {
    console.log('🚀 ===== IMPORTACIÓN BÁSICA =====\n');
    console.log('⚡ Delays reducidos - Procesamiento acelerado\n');

    let totalRequests = 0;
    const startTime = Date.now();

    try {
        async function processSeason(leagueKey: keyof typeof LEAGUES, year: number, tournamentType: string) {
            const league = LEAGUES[leagueKey];

            const season = await prisma.season.findFirst({
                where: { year, tournament: { type: tournamentType as 'WORLD_CUP' | 'EURO_CUP' } }
            });
            if (!season) {
                console.log(`⚠️  Temporada ${year} no encontrada en BD`);
                return;
            }

            console.log(`\n📌 ${league.name} ${year} - INICIANDO...`);

            // 1️⃣ Fixtures
            const fixturesResp = await axios.get(`${API_URL}/fixtures`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: league.id, season: year }
            });
            totalRequests++;
            const fixtures = fixturesResp.data.response;

            if (fixtures.length === 0) {
                console.log('   ⚠️  Sin partidos');
                return;
            }

            // 2️⃣ Equipos
            const extractedTeams = new Map<number, any>();
            for (const f of fixtures) {
                extractedTeams.set(f.teams.home.id, f.teams.home);
                extractedTeams.set(f.teams.away.id, f.teams.away);
            }

            let teamsInserted = 0;
            for (const t of extractedTeams.values()) {
                const savedTeam = await prisma.team.upsert({
                    where: { apiId: t.id },
                    update: {
                        name: t.name,
                        code: t.code || t.name.substring(0, 3).toUpperCase(),
                        flagUrl: t.logo,
                        confederation: t.country || null
                    },
                    create: {
                        name: t.name,
                        code: t.code || t.name.substring(0, 3).toUpperCase(),
                        flagUrl: t.logo,
                        confederation: t.country || null,
                        apiId: t.id
                    }
                });

                await prisma.seasonTeam.upsert({
                    where: { seasonId_teamId: { seasonId: season.id, teamId: savedTeam.id } },
                    update: {},
                    create: { seasonId: season.id, teamId: savedTeam.id }
                });
                teamsInserted++;
            }
            console.log(`   ✅ ${teamsInserted} equipos`);

            // 3️⃣ Clasificaciones
            const standingsResp = await axios.get(`${API_URL}/standings`, {
                headers: { 'x-apisports-key': API_KEY },
                params: { league: league.id, season: year }
            });
            totalRequests++;

            const standingsData = standingsResp.data.response[0]?.league?.standings;
            let standingsInserted = 0;

            if (standingsData) {
                for (const group of standingsData) {
                    for (const standing of group) {
                        const team = await prisma.team.findUnique({ where: { apiId: standing.team.id } });
                        if (!team) continue;

                        await prisma.seasonTeam.upsert({
                            where: { seasonId_teamId: { seasonId: season.id, teamId: team.id } },
                            update: {
                                group: standing.group?.replace(/.*?Group\s*/i, '').trim().substring(0, 1).toUpperCase() || null,
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
                                group: standing.group?.replace(/.*?Group\s*/i, '').trim().substring(0, 1).toUpperCase() || null,
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
                        standingsInserted++;
                    }
                }
                console.log(`   ✅ ${standingsInserted} clasificaciones`);
            }

            // 4️⃣ Partidos
            let matchesInserted = 0;
            for (const fixture of fixtures) {
                const homeTeam = await prisma.team.findUnique({ where: { apiId: fixture.teams.home.id } });
                const awayTeam = await prisma.team.findUnique({ where: { apiId: fixture.teams.away.id } });
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
                matchesInserted++;
            }
            console.log(`   ✅ ${matchesInserted} partidos`);

            // 5️⃣ Calcular stats si no había standings
            if (standingsInserted === 0 && matchesInserted > 0) {
                console.log(`   🔄 Calculando stats...`);

                const seasonMatches = await prisma.match.findMany({
                    where: { seasonId: season.id, status: 'FINISHED' }
                });

                const teamStats = new Map<number, {
                    played: number, won: number, drawn: number, lost: number,
                    goalsFor: number, goalsAgainst: number, points: number
                }>();

                for (const match of seasonMatches) {
                    if (!teamStats.has(match.homeTeamId)) {
                        teamStats.set(match.homeTeamId, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
                    }
                    if (!teamStats.has(match.awayTeamId)) {
                        teamStats.set(match.awayTeamId, { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 });
                    }

                    const homeStats = teamStats.get(match.homeTeamId)!;
                    const awayStats = teamStats.get(match.awayTeamId)!;

                    homeStats.played++;
                    awayStats.played++;
                    homeStats.goalsFor += match.homeGoals;
                    homeStats.goalsAgainst += match.awayGoals;
                    awayStats.goalsFor += match.awayGoals;
                    awayStats.goalsAgainst += match.homeGoals;

                    if (match.homeGoals > match.awayGoals) {
                        homeStats.won++;
                        homeStats.points += 3;
                        awayStats.lost++;
                    } else if (match.homeGoals < match.awayGoals) {
                        awayStats.won++;
                        awayStats.points += 3;
                        homeStats.lost++;
                    } else {
                        homeStats.drawn++;
                        awayStats.drawn++;
                        homeStats.points++;
                        awayStats.points++;
                    }
                }

                for (const [teamId, stats] of teamStats.entries()) {
                    await prisma.seasonTeam.update({
                        where: { seasonId_teamId: { seasonId: season.id, teamId } },
                        data: stats
                    });
                }
                console.log(`   ✅ ${teamStats.size} stats calculadas`);
            }

            // ⚡ Delay reducido (200ms en lugar de 2000ms)
            await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_REQUESTS));
            console.log(`   ⚡ ${league.name} ${year} COMPLETADO`);
        }

        // Procesar todos los torneos
        for (const year of SEASONS_TO_IMPORT.WORLD_CUP) {
            await processSeason('WORLD_CUP', year, 'WORLD_CUP');
        }

        for (const year of SEASONS_TO_IMPORT.EURO) {
            await processSeason('EURO', year, 'EURO_CUP');
        }

        // Resumen final
        const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
        console.log('\n📊 ===== RESUMEN FINAL =====');
        console.log(`⚡ Tiempo total: ${elapsed} minutos`);
        console.log(`📡 Requests: ${totalRequests}`);

        const [teams, seasonTeams, matches] = await Promise.all([
            prisma.team.count(),
            prisma.seasonTeam.count(),
            prisma.match.count()
        ]);

        console.log(`\nDatos en BD:`);
        console.log(`  Equipos: ${teams}`);
        console.log(`  Participaciones: ${seasonTeams}`);
        console.log(`  Partidos: ${matches}`);
        console.log('\n✅ ===== IMPORTACIÓN COMPLETADA =====');
        console.log('💡 Siguiente: npm run etl:match-stats\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (axios.isAxiosError(error)) console.error('API Error:', error.response?.data);
    } finally {
        await prisma.$disconnect();
    }
}

importBasicData();
