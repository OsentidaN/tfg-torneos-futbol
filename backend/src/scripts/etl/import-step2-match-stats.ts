import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

/**
 * 🚀 PASO 2: ESTADÍSTICAS DE PARTIDOS 
 * 
 * Optimizado para suscripción de pago:
 * - Sin límite de requests
 * - Delays mínimos (200ms)
 * - Procesa TODOS los partidos de una vez
 */

interface MatchStats {
    team: { id: number; name: string };
    statistics: Array<{ type: string; value: any }>;
}

const CONFIG = {
    DELAY: 200,  // 200ms en lugar de 1100ms
    MAX_RETRIES: 3
};

async function importMatchStats() {
    console.log('📊 ===== ESTADÍSTICAS DE PARTIDOS (PLAN DE PAGO) =====\n');
    
    const startTime = Date.now();
    let requestCount = 0;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    try {
        // Obtener TODOS los partidos sin stats
        const matches = await prisma.match.findMany({
            where: {
                status: 'FINISHED',
                teamStats: { none: {} }
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                season: { include: { tournament: true } }
            },
            orderBy: { date: 'desc' }
        });

        console.log(`✓ Encontrados ${matches.length} partidos\n`);
        
        if (matches.length === 0) {
            console.log('✅ Todos completados\n');
            return;
        }

        // Procesar todos
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            
            try {
                const progress = `[${i + 1}/${matches.length}]`;
                console.log(`${progress} ${match.homeTeam.name} vs ${match.awayTeam.name}`);

                const response = await axios.get(`${API_URL}/fixtures/statistics`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { fixture: match.apiId }
                });
                requestCount++;

                const statsData: MatchStats[] = response.data.response;

                if (!statsData || statsData.length === 0) {
                    console.log(`          ⚠️  Sin datos`);
                    skippedCount++;
                    await new Promise(r => setTimeout(r, CONFIG.DELAY));
                    continue;
                }

                // Procesar equipos
                for (const teamStats of statsData) {
                    const isHomeTeam = teamStats.team.id === match.homeTeam.apiId;
                    const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId;

                    const getStatValue = (type: string): number | null => {
                        const stat = teamStats.statistics.find(s => s.type === type);
                        if (!stat || stat.value === null) return null;
                        if (typeof stat.value === 'string' && stat.value.includes('%')) {
                            return parseInt(stat.value.replace('%', ''));
                        }
                        return typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || null;
                    };

                    await prisma.matchTeamStats.upsert({
                        where: { matchId_teamId: { matchId: match.id, teamId } },
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
                            teamId,
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

                console.log(`          ✅ Guardado`);
                processedCount++;

                // Delay mínimo
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
        console.log(`✅ Procesados: ${processedCount}`);
        console.log(`⚠️  Sin datos: ${skippedCount}`);
        console.log(`❌ Errores: ${errorCount}`);

        const remaining = await prisma.match.count({
            where: { status: 'FINISHED', teamStats: { none: {} } }
        });

        if (remaining === 0) {
            console.log('\n✅ COMPLETADO');
            console.log('💡 Siguiente: npm run etl:match-events\n');
        } else {
            console.log(`\n⚠️  Quedan ${remaining} partidos`);
            console.log('💡 Ejecuta de nuevo: npm run etl:match-stats\n');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles:', error.response?.data);
        }
    } finally {
        await prisma.$disconnect();
    }
}

importMatchStats();
