import axios from 'axios';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

// Validar que las variables estén cargadas
if (!API_KEY || !API_URL) {
    console.error('❌ ERROR: Variables de entorno no configuradas');
    console.error('API_KEY:', API_KEY ? '✅ Configurada' : '❌ Falta');
    console.error('API_URL:', API_URL ? '✅ Configurada' : '❌ Falta');
    console.error('\nAsegúrate de que tu archivo .env contenga:');
    console.error('API_FOOTBALL_KEY=tu_clave');
    console.error('API_FOOTBALL_URL=https://v3.football.api-sports.io');
    process.exit(1);
}

/**
 * SCRIPT DE DIAGNÓSTICO DE DATOS HISTÓRICOS
 * 
 * Este script verifica qué endpoints de la API devuelven datos
 * para cada temporada histórica (2008-2024)
 */

const LEAGUES = {
    WORLD_CUP: { id: 1, name: 'World Cup' },
    EURO: { id: 4, name: 'Euro Championship' }
};

const YEARS_TO_CHECK = {
    WORLD_CUP: [2006, 2010, 2014, 2018, 2022],
    EURO: [2004, 2008, 2012, 2016, 2020, 2024]
};

interface DiagnosticResult {
    year: number;
    fixtures: number;
    teams: number;
    standings: number;
    hasFixtureStats: boolean;
    hasFixtureEvents: boolean;
    hasFixtureLineups: boolean;
    hasFixturePlayerStats: boolean;
    sampleFixtureId: number | null;
}

async function diagnoseApiData() {
    console.log('🔍 ===== DIAGNÓSTICO DE DATOS HISTÓRICOS API-FOOTBALL =====\n');
    console.log('⏱️  Este proceso tomará varios minutos...\n');

    let totalRequests = 0;
    const results: { [key: string]: DiagnosticResult[] } = {
        'World Cup': [],
        'Euro Championship': []
    };

    try {
        // Función para verificar una temporada
        async function checkSeason(leagueId: number, leagueName: string, year: number) {
            console.log(`\n📅 Verificando: ${leagueName} ${year}`);

            const result: DiagnosticResult = {
                year,
                fixtures: 0,
                teams: 0,
                standings: 0,
                hasFixtureStats: false,
                hasFixtureEvents: false,
                hasFixtureLineups: false,
                hasFixturePlayerStats: false,
                sampleFixtureId: null
            };

            try {
                // 1. Verificar Fixtures
                console.log('   🔸 Verificando fixtures...');
                const fixturesResp = await axios.get(`${API_URL}/fixtures`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { league: leagueId, season: year }
                });
                totalRequests++;
                result.fixtures = fixturesResp.data.response?.length || 0;

                if (result.fixtures > 0) {
                    result.sampleFixtureId = fixturesResp.data.response[0]?.fixture?.id;
                    console.log(`      ✅ ${result.fixtures} partidos encontrados`);
                } else {
                    console.log(`      ❌ No se encontraron partidos`);
                }

                await new Promise(r => setTimeout(r, 1100)); // Rate limit

                // 2. Verificar Teams
                console.log('   🔸 Verificando equipos...');
                const teamsResp = await axios.get(`${API_URL}/teams`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { league: leagueId, season: year }
                });
                totalRequests++;
                result.teams = teamsResp.data.response?.length || 0;
                console.log(`      ${result.teams > 0 ? '✅' : '❌'} ${result.teams} equipos`);

                await new Promise(r => setTimeout(r, 1100));

                // 3. Verificar Standings
                console.log('   🔸 Verificando clasificaciones...');
                const standingsResp = await axios.get(`${API_URL}/standings`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { league: leagueId, season: year }
                });
                totalRequests++;

                const standings = standingsResp.data.response[0]?.league?.standings;
                if (standings && standings.length > 0) {
                    result.standings = standings.flat().length;
                    console.log(`      ✅ ${result.standings} clasificaciones`);
                } else {
                    console.log(`      ❌ No hay clasificaciones`);
                }

                await new Promise(r => setTimeout(r, 1100));

                // 4. Verificar Fixture Stats (solo si hay partidos)
                if (result.sampleFixtureId) {
                    console.log('   🔸 Verificando estadísticas de partido...');
                    try {
                        const statsResp = await axios.get(`${API_URL}/fixtures/statistics`, {
                            headers: { 'x-apisports-key': API_KEY },
                            params: { fixture: result.sampleFixtureId }
                        });
                        totalRequests++;
                        result.hasFixtureStats = statsResp.data.response?.length > 0;
                        console.log(`      ${result.hasFixtureStats ? '✅' : '❌'} ${result.hasFixtureStats ? 'Disponibles' : 'No disponibles'}`);
                    } catch (err) {
                        console.log(`      ❌ Error al obtener stats`);
                    }

                    await new Promise(r => setTimeout(r, 1100));

                    // 5. Verificar Events
                    console.log('   🔸 Verificando eventos...');
                    try {
                        const eventsResp = await axios.get(`${API_URL}/fixtures/events`, {
                            headers: { 'x-apisports-key': API_KEY },
                            params: { fixture: result.sampleFixtureId }
                        });
                        totalRequests++;
                        result.hasFixtureEvents = eventsResp.data.response?.length > 0;
                        console.log(`      ${result.hasFixtureEvents ? '✅' : '❌'} ${result.hasFixtureEvents ? 'Disponibles' : 'No disponibles'}`);
                    } catch (err) {
                        console.log(`      ❌ Error al obtener eventos`);
                    }

                    await new Promise(r => setTimeout(r, 1100));

                    // 6. Verificar Lineups
                    console.log('   🔸 Verificando alineaciones...');
                    try {
                        const lineupsResp = await axios.get(`${API_URL}/fixtures/lineups`, {
                            headers: { 'x-apisports-key': API_KEY },
                            params: { fixture: result.sampleFixtureId }
                        });
                        totalRequests++;
                        result.hasFixtureLineups = lineupsResp.data.response?.length > 0;
                        console.log(`      ${result.hasFixtureLineups ? '✅' : '❌'} ${result.hasFixtureLineups ? 'Disponibles' : 'No disponibles'}`);
                    } catch (err) {
                        console.log(`      ❌ Error al obtener lineups`);
                    }

                    await new Promise(r => setTimeout(r, 1100));

                    // 7. Verificar Player Stats
                    console.log('   🔸 Verificando estadísticas de jugadores...');
                    try {
                        const playerStatsResp = await axios.get(`${API_URL}/fixtures/players`, {
                            headers: { 'x-apisports-key': API_KEY },
                            params: { fixture: result.sampleFixtureId }
                        });
                        totalRequests++;
                        result.hasFixturePlayerStats = playerStatsResp.data.response?.length > 0;
                        console.log(`      ${result.hasFixturePlayerStats ? '✅' : '❌'} ${result.hasFixturePlayerStats ? 'Disponibles' : 'No disponibles'}`);
                    } catch (err) {
                        console.log(`      ❌ Error al obtener player stats`);
                    }

                    await new Promise(r => setTimeout(r, 1100));
                }

            } catch (error) {
                console.error(`   ❌ Error verificando ${year}:`, error);
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    console.log('   ⏸️  Rate limit alcanzado. Esperando 60 segundos...');
                    await new Promise(r => setTimeout(r, 60000));
                }
            }

            return result;
        }

        // Verificar Mundiales
        console.log('\n🌍 ===== COPA MUNDIAL =====');
        for (const year of YEARS_TO_CHECK.WORLD_CUP) {
            const result = await checkSeason(LEAGUES.WORLD_CUP.id, LEAGUES.WORLD_CUP.name, year);
            results['World Cup'].push(result);
        }

        // Verificar Eurocopas
        console.log('\n\n🇪🇺 ===== EUROCOPA =====');
        for (const year of YEARS_TO_CHECK.EURO) {
            const result = await checkSeason(LEAGUES.EURO.id, LEAGUES.EURO.name, year);
            results['Euro Championship'].push(result);
        }

        // Mostrar resumen
        console.log('\n\n📊 ===== RESUMEN DE DISPONIBILIDAD =====\n');

        for (const [league, data] of Object.entries(results)) {
            console.log(`\n🏆 ${league.toUpperCase()}`);
            console.log('─'.repeat(80));
            console.log('Año   | Partidos | Teams | Standings | Stats | Events | Lineups | Player Stats');
            console.log('─'.repeat(80));

            for (const r of data) {
                const check = (val: boolean | number) =>
                    typeof val === 'boolean' ? (val ? '✅' : '❌') : val.toString().padStart(3);

                console.log(
                    `${r.year} | ${check(r.fixtures).padStart(8)} | ` +
                    `${check(r.teams).padStart(5)} | ${check(r.standings).padStart(9)} | ` +
                    `${check(r.hasFixtureStats).padStart(5)} | ${check(r.hasFixtureEvents).padStart(6)} | ` +
                    `${check(r.hasFixtureLineups).padStart(7)} | ${check(r.hasFixturePlayerStats).padStart(12)}`
                );
            }
        }

        console.log('\n─'.repeat(80));
        console.log(`\n💡 Total de requests utilizados: ${totalRequests}`);
        console.log('\n📌 INTERPRETACIÓN:');
        console.log('   ✅ = Datos disponibles');
        console.log('   ❌ = Datos NO disponibles');
        console.log('   Número = Cantidad de registros encontrados\n');

        console.log('💡 RECOMENDACIÓN:');
        console.log('   • Importa SOLO los años con ✅ en los endpoints que necesites');
        console.log('   • Para años antiguos, es posible que solo tengas partidos básicos');
        console.log('   • Ajusta SEASONS_TO_IMPORT en tus scripts según esta tabla\n');

    } catch (error) {
        console.error('\n❌ Error general:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles:', error.response?.data);
        }
    }
}

diagnoseApiData();