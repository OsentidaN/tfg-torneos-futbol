import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

// IDs conocidos de API-Football
const WORLD_CUP_LEAGUE_ID = 1; // ID de la World Cup en API-Football
const WORLD_CUP_2022_SEASON = 2022;

async function importWorldCup2022() {
    console.log('🏆 ===== IMPORTANDO MUNDIAL 2022 =====\n');
    
    try {
        // 1. Verificar que existe la temporada en nuestra BD
        const season = await prisma.season.findFirst({
            where: {
                year: WORLD_CUP_2022_SEASON,
                tournament: {
                    type: 'WORLD_CUP'
                }
            }
        });

        if (!season) {
            console.error('❌ Temporada 2022 no encontrada en la BD');
            console.log('   Ejecuta primero: npm run etl:seasons');
            return;
        }

        console.log(`✅ Temporada encontrada: Mundial ${season.year} (ID: ${season.id})\n`);

        // 2. Importar equipos
        console.log('📋 Importando equipos del Mundial 2022...');
        
        const teamsResponse = await axios.get(`${API_URL}/teams`, {
            headers: { 'x-apisports-key': API_KEY },
            params: {
                league: WORLD_CUP_LEAGUE_ID,
                season: WORLD_CUP_2022_SEASON
            }
        });

        console.log(`   ✓ API devolvió ${teamsResponse.data.response.length} equipos`);

        for (const teamData of teamsResponse.data.response) {
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

        console.log(`   ✅ ${teamsResponse.data.response.length} equipos importados\n`);

        // Esperar 1 segundo (rate limit)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Importar clasificaciones
        console.log('📊 Importando clasificaciones...');
        
        const standingsResponse = await axios.get(`${API_URL}/standings`, {
            headers: { 'x-apisports-key': API_KEY },
            params: {
                league: WORLD_CUP_LEAGUE_ID,
                season: WORLD_CUP_2022_SEASON
            }
        });

        const standings = standingsResponse.data.response[0]?.league?.standings;

        if (standings && standings.length > 0) {
            console.log(`   ✓ API devolvió ${standings.flat().length} clasificaciones`);
            
            let standingsCount = 0;

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
                            group: standing.group ? standing.group.replace('Group ', '') : null,
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
                            group: standing.group ? standing.group.replace('Group ', '') : null,
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

            console.log(`   ✅ ${standingsCount} clasificaciones importadas\n`);
        } else {
            console.log('   ⚠️  No hay clasificaciones disponibles\n');
        }

        // Esperar 1 segundo (rate limit)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Importar partidos
        console.log('⚽ Importando partidos...');
        
        const fixturesResponse = await axios.get(`${API_URL}/fixtures`, {
            headers: { 'x-apisports-key': API_KEY },
            params: {
                league: WORLD_CUP_LEAGUE_ID,
                season: WORLD_CUP_2022_SEASON
            }
        });

        const fixtures = fixturesResponse.data.response;
        console.log(`   ✓ API devolvió ${fixtures.length} partidos`);

        let matchesCount = 0;

        for (const fixture of fixtures) {
            const homeTeam = await prisma.team.findUnique({
                where: { apiId: fixture.teams.home.id }
            });

            const awayTeam = await prisma.team.findUnique({
                where: { apiId: fixture.teams.away.id }
            });

            if (!homeTeam || !awayTeam) continue;

            // Determinar fase
            const roundLower = fixture.league.round.toLowerCase();
            let stage = 'GROUP';
            
            if (roundLower.includes('final') && !roundLower.includes('semi')) {
                stage = 'FINAL';
            } else if (roundLower.includes('semi')) {
                stage = 'SEMI_FINAL';
            } else if (roundLower.includes('quarter')) {
                stage = 'QUARTER_FINAL';
            } else if (roundLower.includes('round of 16') || roundLower.includes('16')) {
                stage = 'ROUND_OF_16';
            } else if (roundLower.includes('3rd')) {
                stage = 'THIRD_PLACE';
            }

            // Determinar status
            let status = 'SCHEDULED';
            if (fixture.fixture.status.short === 'FT' || 
                fixture.fixture.status.short === 'AET' || 
                fixture.fixture.status.short === 'PEN') {
                status = 'FINISHED';
            }

            await prisma.match.upsert({
                where: { apiId: fixture.fixture.id },
                update: {
                    seasonId: season.id,
                    homeTeamId: homeTeam.id,
                    awayTeamId: awayTeam.id,
                    round: fixture.league.round,
                    stage: stage as any,
                    date: new Date(fixture.fixture.date),
                    venue: fixture.fixture.venue.name,
                    city: fixture.fixture.venue.city,
                    referee: fixture.fixture.referee,
                    homeGoals: fixture.goals.home || 0,
                    awayGoals: fixture.goals.away || 0,
                    homeGoalsPenalty: fixture.score.penalty.home,
                    awayGoalsPenalty: fixture.score.penalty.away,
                    status: status as any
                },
                create: {
                    seasonId: season.id,
                    homeTeamId: homeTeam.id,
                    awayTeamId: awayTeam.id,
                    round: fixture.league.round,
                    stage: stage as any,
                    date: new Date(fixture.fixture.date),
                    venue: fixture.fixture.venue.name,
                    city: fixture.fixture.venue.city,
                    referee: fixture.fixture.referee,
                    homeGoals: fixture.goals.home || 0,
                    awayGoals: fixture.goals.away || 0,
                    homeGoalsPenalty: fixture.score.penalty.home,
                    awayGoalsPenalty: fixture.score.penalty.away,
                    status: status as any,
                    apiId: fixture.fixture.id
                }
            });

            matchesCount++;
        }

        console.log(`   ✅ ${matchesCount}/${fixtures.length} partidos importados\n`);

        // Resumen final
        console.log('📊 ===== RESUMEN MUNDIAL 2022 =====');
        
        const [teams, seasonTeams, matches] = await Promise.all([
            prisma.team.count(),
            prisma.seasonTeam.count({ where: { seasonId: season.id } }),
            prisma.match.count({ where: { seasonId: season.id } })
        ]);

        console.log(`Total de equipos en BD: ${teams}`);
        console.log(`Equipos en Mundial 2022: ${seasonTeams}`);
        console.log(`Partidos en Mundial 2022: ${matches}`);
        
        console.log('\n✅ ===== IMPORTACIÓN COMPLETADA =====\n');

    } catch (error) {
        console.error('\n❌ Error en importación:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles de API:', error.response?.data);
        }
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

importWorldCup2022();