import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

/**
 * PASO 2: IMPORTAR ESTADÍSTICAS DE PARTIDOS
 * 
 * Este script importa las estadísticas detalladas de cada partido:
 * - Posesión del balón
 * - Tiros (totales, a puerta, fuera, bloqueados)
 * - Corners
 * - Faltas
 * - Tarjetas
 * - Pases totales
 * 
 * Ejecutar: npm run etl:match-stats
 * 
 * IMPORTANTE: Este script hace ~1 request por partido
 * Con 115 partidos = ~115 requests
 * Dividir en 2 días (100 requests/día límite)
 */

interface MatchStats {
    team: {
        id: number;
        name: string;
    };
    statistics: Array<{
        type: string;
        value: any;
    }>;
}

// Configuración: cuántos partidos procesar por ejecución
const BATCH_SIZE = 90; // Dejar margen de 10 requests para otros endpoints

async function importMatchStats() {
    console.log('📊 ===== IMPORTANDO ESTADÍSTICAS DE PARTIDOS =====\n');
    
    let requestCount = 0;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    try {
        // 1. Obtener todos los partidos finalizados que no tienen estadísticas
        const matches = await prisma.match.findMany({
            where: {
                status: 'FINISHED',
                // Solo partidos que aún no tienen estadísticas importadas
                teamStats: {
                    none: {}
                }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                season: {
                    include: {
                        tournament: true
                    }
                }
            },
            orderBy: {
                date: 'desc' // Más recientes primero
            },
            take: BATCH_SIZE
        });

        console.log(`✓ Encontrados ${matches.length} partidos para procesar`);
        
        if (matches.length === 0) {
            console.log('✅ Todos los partidos ya tienen estadísticas importadas\n');
            return;
        }

        console.log(`📌 Procesando batch de ${Math.min(matches.length, BATCH_SIZE)} partidos\n`);

        // 2. Procesar cada partido
        for (const match of matches) {
            try {
                console.log(`\n⚽ Partido: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
                console.log(`   Fecha: ${match.date.toISOString().split('T')[0]}`);
                console.log(`   Torneo: ${match.season.tournament.name} ${match.season.year}`);

                // 3. Obtener estadísticas del partido desde la API
                const response = await axios.get(`${API_URL}/fixtures/statistics`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { fixture: match.apiId }
                });
                requestCount++;

                const statsData: MatchStats[] = response.data.response;

                if (!statsData || statsData.length === 0) {
                    console.log('   ⚠️  Sin estadísticas disponibles');
                    skippedCount++;
                    await new Promise(r => setTimeout(r, 1100)); // Rate limit
                    continue;
                }

                // 4. Procesar estadísticas de cada equipo
                for (const teamStats of statsData) {
                    const isHomeTeam = teamStats.team.id === match.homeTeam.apiId;
                    const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId;

                    // Extraer valores de las estadísticas
                    const getStatValue = (type: string): number | null => {
                        const stat = teamStats.statistics.find(s => s.type === type);
                        if (!stat || stat.value === null) return null;
                        
                        // Manejar porcentajes como "65%"
                        if (typeof stat.value === 'string' && stat.value.includes('%')) {
                            return parseInt(stat.value.replace('%', ''));
                        }
                        
                        return typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || null;
                    };

                    // 5. Guardar en base de datos
                    await prisma.matchTeamStats.upsert({
                        where: {
                            matchId_teamId: {
                                matchId: match.id,
                                teamId: teamId
                            }
                        },
                        update: {
                            possession: getStatValue('Ball Possession'),
                            shotsTotal: getStatValue('Total Shots'),
                            shotsOnTarget: getStatValue('Shots on Goal'),
                            shotsOffTarget: getStatValue('Shots off Goal'),
                            shotsBlocked: getStatValue('Blocked Shots'),
                            corners: getStatValue('Corner Kicks'),
                            offsides: getStatValue('Offsides'),
                            fouls: getStatValue('Fouls'),
                            yellowCards: getStatValue('Yellow Cards'),
                            redCards: getStatValue('Red Cards'),
                            passes: getStatValue('Total passes'),
                            passesAccurate: getStatValue('Passes accurate')
                        },
                        create: {
                            matchId: match.id,
                            teamId: teamId,
                            possession: getStatValue('Ball Possession'),
                            shotsTotal: getStatValue('Total Shots'),
                            shotsOnTarget: getStatValue('Shots on Goal'),
                            shotsOffTarget: getStatValue('Shots off Goal'),
                            shotsBlocked: getStatValue('Blocked Shots'),
                            corners: getStatValue('Corner Kicks'),
                            offsides: getStatValue('Offsides'),
                            fouls: getStatValue('Fouls'),
                            yellowCards: getStatValue('Yellow Cards'),
                            redCards: getStatValue('Red Cards'),
                            passes: getStatValue('Total passes'),
                            passesAccurate: getStatValue('Passes accurate')
                        }
                    });
                }

                console.log('   ✅ Estadísticas guardadas');
                processedCount++;

                // Rate limit: 1 segundo entre requests
                await new Promise(r => setTimeout(r, 1100));

            } catch (error) {
                console.error(`   ❌ Error procesando partido:`, error);
                errorCount++;
                
                // Si es error 429 (rate limit), esperar más tiempo
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    console.log('   ⏸️  Rate limit alcanzado, esperando 60 segundos...');
                    await new Promise(r => setTimeout(r, 60000));
                }
                
                continue;
            }
        }

        // 6. Resumen
        console.log('\n📊 ===== RESUMEN DE IMPORTACIÓN =====');
        console.log(`Requests realizados: ${requestCount}`);
        console.log(`Partidos procesados: ${processedCount}`);
        console.log(`Partidos sin datos: ${skippedCount}`);
        console.log(`Errores: ${errorCount}`);

        // Verificar cuántos partidos quedan
        const remainingMatches = await prisma.match.count({
            where: {
                status: 'FINISHED',
                teamStats: { none: {} }
            }
        });

        if (remainingMatches > 0) {
            console.log(`\n⚠️  Quedan ${remainingMatches} partidos por procesar`);
            console.log('💡 Ejecuta el script nuevamente mañana: npm run etl:match-stats');
        } else {
            console.log('\n✅ Todos los partidos tienen estadísticas completas');
            console.log('💡 Siguiente paso: npm run etl:match-events');
        }

        console.log('\n===================================\n');

    } catch (error) {
        console.error('\n❌ Error general:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles API:', error.response?.data);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar
importMatchStats();

