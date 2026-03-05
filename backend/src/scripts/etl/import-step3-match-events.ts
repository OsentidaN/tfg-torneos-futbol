import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

/**
 * 🚀 PASO 3: EVENTOS DE PARTIDOS 
 * Importa eventos minuto a minuto:
 * - Goles, tarjetas, sustituciones
 * - Crea jugadores automáticamente
 * 
 * Optimizado: delay 200ms, sin límite de batch
 */

interface MatchEvent {
    time: { elapsed: number; extra: number | null };
    team: { id: number; name: string };
    player: { id: number; name: string };
    assist: { id: number | null; name: string | null };
    type: string;
    detail: string;
    comments: string | null;
}

const CONFIG = {
    DELAY: 200,  // 200ms en lugar de 1100ms
    MAX_RETRIES: 3
};

async function importMatchEvents() {
    console.log('🎯 ===== EVENTOS DE PARTIDOS (PLAN DE PAGO) =====\n');
    
    const startTime = Date.now();
    let requestCount = 0;
    let processedCount = 0;
    let totalEventsCreated = 0;
    let errorCount = 0;

    try {
        // Obtener TODOS los partidos sin eventos
        const matches = await prisma.match.findMany({
            where: {
                status: 'FINISHED',
                events: { none: {} }
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
                console.log(`${progress} ${match.homeTeam.name} ${match.homeGoals}-${match.awayGoals} ${match.awayTeam.name}`);

                const response = await axios.get(`${API_URL}/fixtures/events`, {
                    headers: { 'x-apisports-key': API_KEY },
                    params: { fixture: match.apiId }
                });
                requestCount++;

                const events: MatchEvent[] = response.data.response;

                if (!events || events.length === 0) {
                    console.log(`          ⚠️  Sin eventos`);
                    await new Promise(r => setTimeout(r, CONFIG.DELAY));
                    continue;
                }

                let eventsCreated = 0;

                for (const event of events) {
                    try {
                        const isHomeTeam = event.team.id === match.homeTeam.apiId;
                        const teamId = isHomeTeam ? match.homeTeamId : match.awayTeamId;

                        // Mapear tipo
                        let eventType: string;
                        if (event.type === 'Goal') {
                            eventType = 'GOAL';
                        } else if (event.type === 'Card') {
                            eventType = event.detail === 'Yellow Card' ? 'YELLOW_CARD' : 'RED_CARD';
                        } else if (event.type === 'subst') {
                            eventType = 'SUBSTITUTION';
                        } else {
                            continue;
                        }

                        // Crear/buscar jugador
                        let playerId: number | null = null;
                        if (event.player && event.player.id) {
                            const nameParts = event.player.name.split(' ');
                            const firstName = nameParts[0] || 'Unknown';
                            const lastName = nameParts.slice(1).join(' ') || 'Unknown';
                            
                            const player = await prisma.player.upsert({
                                where: { apiId: event.player.id },
                                update: { firstName, lastName },
                                create: {
                                    firstName,
                                    lastName,
                                    apiId: event.player.id,
                                    teamId: teamId,
                                    position: 'FORWARD'
                                }
                            });
                            playerId = player.id;
                        }

                        // Crear evento
                        await prisma.matchEvent.create({
                            data: {
                                matchId: match.id,
                                teamId: teamId,
                                playerId: playerId,
                                type: eventType as any,
                                minute: event.time.elapsed,
                                extraMinute: event.time.extra,
                                detail: event.detail
                            }
                        });

                        eventsCreated++;

                    } catch (eventError) {
                        // Silencioso, continuar
                    }
                }

                console.log(`          ✅ ${eventsCreated} eventos`);
                totalEventsCreated += eventsCreated;
                processedCount++;

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
        console.log(`✅ Partidos: ${processedCount}`);
        console.log(`🎯 Eventos: ${totalEventsCreated}`);
        console.log(`❌ Errores: ${errorCount}`);

        const remaining = await prisma.match.count({
            where: { status: 'FINISHED', events: { none: {} } }
        });

        if (remaining === 0) {
            console.log('\n✅ COMPLETADO');
            console.log('💡 Siguiente: npm run etl:players-lineups\n');
        } else {
            console.log(`\n⚠️  Quedan ${remaining} partidos`);
            console.log('💡 Ejecuta de nuevo: npm run etl:match-events\n');
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

importMatchEvents();
