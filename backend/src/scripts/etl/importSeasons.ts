import axios from 'axios';
import prisma from '../../config/prisma';

const API_KEY = process.env.API_FOOTBALL_KEY!;
const API_URL = process.env.API_FOOTBALL_URL!;

interface APILeague {
    league: {
        id: number;
        name: string;
        type: string;
        logo: string;
    };
    country: {
        name: string;
        code: string;
        flag: string;
    };
    seasons: Array<{
        year: number;
        start: string;
        end: string;
        current: boolean;
    }>;
}

async function importWorldCups() {
    console.log('🌍 ===== IMPORTANDO COPAS DEL MUNDO =====');

    try {
        // 1. Crear o encontrar el torneo Copa del Mundo
        console.log('📝 Creando torneo Copa del Mundo...');
        const worldCupTournament = await prisma.tournament.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Copa Mundial de la FIFA',
                type: 'WORLD_CUP'
            }
        });
        console.log('✅ Torneo creado/encontrado');

        // 2. Obtener datos de la API
        console.log('📡 Consultando API-Football...');
        const response = await axios.get(`${API_URL}/leagues`, {
            headers: {
                'x-apisports-key': API_KEY
            },
            params: {
                name: 'World Cup'
            }
        });

        const leagues: APILeague[] = response.data.response;
        console.log(`📊 Encontradas ${leagues.length} ligas`);

        // 3. Procesar cada temporada
        for (const league of leagues) {
            console.log(`\n🏆 Procesando: ${league.league.name} (${league.country.name})`);

            for (const season of league.seasons) {
                // Solo importar desde 2014 en adelante
                if (season.year < 2014) {
                    console.log(`  ⏭️  Saltando Mundial ${season.year} (anterior a 2014)`);
                    continue;
                }

                console.log(`  📅 Importando Mundial ${season.year}...`);

                // ✨ FIX: Crear apiId único combinando league.id + year
                const uniqueApiId = parseInt(`${league.league.id}${season.year}`);

                await prisma.season.upsert({
                    where: {
                        tournamentId_year: {
                            tournamentId: worldCupTournament.id,
                            year: season.year
                        }
                    },
                    update: {
                        hostCountry: league.country.name,
                        startDate: new Date(season.start),
                        endDate: new Date(season.end),
                        imageUrl: league.league.logo,
                        apiId: uniqueApiId,  // ✨ Ahora es único
                        apiSource: 'api-football',
                        dataQuality: 'FULL'
                    },
                    create: {
                        tournamentId: worldCupTournament.id,
                        year: season.year,
                        hostCountry: league.country.name,
                        startDate: new Date(season.start),
                        endDate: new Date(season.end),
                        imageUrl: league.league.logo,
                        apiId: uniqueApiId,  // ✨ Ahora es único
                        apiSource: 'api-football',
                        dataQuality: 'FULL'
                    }
                });

                console.log(`  ✅ Mundial ${season.year} importado`);
            }
        }

        console.log('\n🎉 ===== IMPORTACIÓN DE MUNDIALES COMPLETADA =====\n');

    } catch (error) {
        console.error('❌ Error importando Copas del Mundo:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles del error:', error.response?.data);
        }
        throw error;
    }
}

async function importEuroCups() {
    console.log('🇪🇺 ===== IMPORTANDO EUROCOPAS =====');

    try {
        // Similar al anterior pero para Eurocopas
        console.log('📝 Creando torneo Eurocopa...');
        const euroCupTournament = await prisma.tournament.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: 'Campeonato de Europa de la UEFA',
                type: 'EURO_CUP'
            }
        });
        console.log('✅ Torneo creado/encontrado');

        console.log('📡 Consultando API-Football...');
        const response = await axios.get(`${API_URL}/leagues`, {
            headers: {
                'x-apisports-key': API_KEY
            },
            params: {
                name: 'Euro Championship'
            }
        });

        const leagues: APILeague[] = response.data.response;
        console.log(`📊 Encontradas ${leagues.length} ligas`);

        for (const league of leagues) {
            console.log(`\n🏆 Procesando: ${league.league.name}`);

            for (const season of league.seasons) {
                if (season.year < 2016) {
                    console.log(`  ⏭️  Saltando Euro ${season.year} (anterior a 2016)`);
                    continue;
                }

                console.log(`  📅 Importando Euro ${season.year}...`);

                // ✨ FIX: Crear apiId único combinando league.id + year
                const uniqueApiId = parseInt(`${league.league.id}${season.year}`);

                await prisma.season.upsert({
                    where: {
                        tournamentId_year: {
                            tournamentId: euroCupTournament.id,
                            year: season.year
                        }
                    },
                    update: {
                        hostCountry: league.country.name,
                        startDate: new Date(season.start),
                        endDate: new Date(season.end),
                        imageUrl: league.league.logo,
                        apiId: uniqueApiId,  // ✨ Ahora es único
                        apiSource: 'api-football',
                        dataQuality: 'FULL'
                    },
                    create: {
                        tournamentId: euroCupTournament.id,
                        year: season.year,
                        hostCountry: league.country.name,
                        startDate: new Date(season.start),
                        endDate: new Date(season.end),
                        imageUrl: league.league.logo,
                        apiId: uniqueApiId,  // ✨ Ahora es único
                        apiSource: 'api-football',
                        dataQuality: 'FULL'
                    }
                });

                console.log(`  ✅ Euro ${season.year} importado`);
            }
        }

        console.log('\n🎉 ===== IMPORTACIÓN DE EUROCOPAS COMPLETADA =====\n');

    } catch (error) {
        console.error('❌ Error importando Eurocopas:', error);
        if (axios.isAxiosError(error)) {
            console.error('Detalles del error:', error.response?.data);
        }
        throw error;
    }
}

// Ejecutar ambos
async function main() {
    try {
        await importWorldCups();
        await importEuroCups();

        // Mostrar resumen
        const seasons = await prisma.season.findMany({
            include: {
                tournament: true
            },
            orderBy: {
                year: 'desc'
            }
        });

        console.log('\n📊 ===== RESUMEN =====');
        console.log(`Total de temporadas importadas: ${seasons.length}`);
        
        // ✨ FIX: Usar for...of en lugar de forEach para evitar error de tipos
        for (const s of seasons) {
            console.log(`  • ${s.tournament.name} ${s.year} - ${s.hostCountry} [${s.dataQuality}]`);
        }
        
        console.log('======================\n');

    } catch (error) {
        console.error('Error en importación:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

main();