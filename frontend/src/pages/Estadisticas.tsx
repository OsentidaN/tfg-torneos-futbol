import { useEffect, useState } from 'react';
import { 
    getTournaments, 
    getTournamentStats, 
    getTournamentWinners, 
    getTournamentRecords,
    getTopScorers, 
    getTopAssists, 
    getTeams, 
    getTeamStats 
} from '../services/api';
import { Link } from 'react-router-dom';
import { formatPlayerName } from '../utils/formatters';

export default function Estadisticas() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
    const [winners, setWinners] = useState<any[]>([]);
    const [topScorers, setTopScorers] = useState<any[]>([]);
    
    // Recovery states
    const [summary, setSummary] = useState<any>(null);
    const [topTeams, setTopTeams] = useState<any[]>([]);
    const [topType, setTopType] = useState<string>('');
    const [factsWC, setFactsWC] = useState<any[]>([]);
    const [factsEC, setFactsEC] = useState<any[]>([]);
    const [teamGoals, setTeamGoals] = useState<any[]>([]);

    const [loadingMain, setLoadingMain] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [loadingRanking, setLoadingRanking] = useState(false);

    // Initial load: Torneos and Dashboard Summary
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const torneosRes = await getTournaments();
                const allTorneos = torneosRes.data.data;
                setTournaments(allTorneos);

                // Dashboard Summary aggregation
                const statsPromises = allTorneos.map((t: any) => getTournamentStats(t.id));
                const allStats = await Promise.all(statsPromises);
                
                const totalSummary = allStats.reduce((acc, curr) => {
                    const s = curr.data.data.stats;
                    acc.ediciones += s.totalSeasons;
                    acc.partidos += s.finishedMatches;
                    acc.goles += s.totalGoals;
                    return acc;
                }, { ediciones: 0, partidos: 0, goles: 0 });

                const teamsRes = await getTeams({ limit: 1 });
                setSummary({
                    ...totalSummary,
                    equipos: teamsRes.data.total || teamsRes.data.results || 0,
                    golesPromedio: totalSummary.partidos > 0 ? (totalSummary.goles / totalSummary.partidos).toFixed(2) : '0'
                });

                // Interesting Facts (simulated from tournament types)
                const wc = allTorneos.filter((t: any) => t.type === 'WORLD_CUP')[0];
                const ec = allTorneos.filter((t: any) => t.type === 'EURO_CUP')[0];

                if (wc) {
                    const [wcWins, wcRecs] = await Promise.all([
                        getTournamentWinners(wc.id),
                        getTournamentRecords(wc.id)
                    ]);
                    const lastWinner = wcWins.data.data[0];
                    const recs = wcRecs.data.data;
                    
                    const facts: any[] = [
                        { type: 'total_goals', titulo: 'Goles Totales', descripcion: `${allStats.find(s => s.data.data.tournament.id === wc.id)?.data.data.stats.totalGoals}`, detalle: 'En toda la historia' },
                        { type: 'highest_scoring', titulo: 'Último Campeón', descripcion: `${lastWinner?.winner?.name || 'N/A'}`, detalle: `Ganó en ${lastWinner?.year || ''}` }
                    ];

                    if (recs.biggestWin) {
                        facts.push({ 
                            type: 'biggest_win', 
                            titulo: 'Mayor Goleada', 
                            descripcion: recs.biggestWin.score, 
                            detalle: `${recs.biggestWin.homeTeam} vs ${recs.biggestWin.awayTeam}`,
                            torneo: 'Mundial', anio: recs.biggestWin.year 
                        });
                    }
                    if (recs.highestScoringSeason) {
                        facts.push({ 
                            type: 'total_goals', 
                            titulo: 'Torneo con más Goles', 
                            descripcion: `${recs.highestScoringSeason.goals} goles`, 
                            detalle: `Récord en una edición`,
                            torneo: 'Mundial', anio: recs.highestScoringSeason.year 
                        });
                    }
                    if (recs.mostCardsSeason) {
                        facts.push({ 
                            type: 'most_cards', 
                            titulo: 'Torneo con más Tarjetas', 
                            descripcion: `${recs.mostCardsSeason.cards} tarjetas`, 
                            detalle: `Récord de sanciones`,
                            torneo: 'Mundial', anio: recs.mostCardsSeason.year 
                        });
                    }
                    setFactsWC(facts);
                }

                if (ec) {
                    const [ecWins, ecRecs] = await Promise.all([
                        getTournamentWinners(ec.id),
                        getTournamentRecords(ec.id)
                    ]);
                    const lastWinner = ecWins.data.data[0];
                    const recs = ecRecs.data.data;

                    const facts: any[] = [
                        { type: 'total_goals', titulo: 'Goles Totales', descripcion: `${allStats.find(s => s.data.data.tournament.id === ec.id)?.data.data.stats.totalGoals}`, detalle: 'En toda la historia' },
                        { type: 'highest_scoring', titulo: 'Último Campeón', descripcion: `${lastWinner?.winner?.name || 'N/A'}`, detalle: `Ganó en ${lastWinner?.year || ''}` }
                    ];

                    if (recs.biggestWin) {
                        facts.push({ 
                            type: 'biggest_win', 
                            titulo: 'Mayor Goleada', 
                            descripcion: recs.biggestWin.score, 
                            detalle: `${recs.biggestWin.homeTeam} vs ${recs.biggestWin.awayTeam}`,
                            torneo: 'Eurocopa', anio: recs.biggestWin.year 
                        });
                    }
                    if (recs.highestScoringSeason) {
                        facts.push({ 
                            type: 'total_goals', 
                            titulo: 'Torneo con más Goles', 
                            descripcion: `${recs.highestScoringSeason.goals} goles`, 
                            detalle: `Récord en una edición`,
                            torneo: 'Eurocopa', anio: recs.highestScoringSeason.year 
                        });
                    }
                    if (recs.mostCardsSeason) {
                        facts.push({ 
                            type: 'most_cards', 
                            titulo: 'Torneo con más Tarjetas', 
                            descripcion: `${recs.mostCardsSeason.cards} tarjetas`, 
                            detalle: `Récord de sanciones`,
                            torneo: 'Eurocopa', anio: recs.mostCardsSeason.year 
                        });
                    }
                    setFactsEC(facts);
                }

            } catch (error) {
                console.error("Error loading statistics:", error);
            } finally {
                setLoadingMain(false);
            }
        };

        loadInitialData();
    }, []);

    // Fetch Top Teams Ranking
    const fetchTopTeams = async (type: string) => {
        if (!type) {
            setTopTeams([]);
            return;
        }
        setLoadingRanking(true);
        try {
            // Obtenemos equipos y filtramos por los que tienen más partidos/historia (limitado para rendimiento)
            const teamsRes = await getTeams({ limit: 100 });
            const allTeams = teamsRes.data.data;
            
            // Obtenemos stats de cada equipo (en paralelo) filtrando por tipo si se especifica
            const statsPromises = allTeams.map((team: any) => 
                getTeamStats(team.id, type ? { type } : {}).then(res => ({
                    ...team,
                    stats: res.data.data.stats
                })).catch(() => null)
            );
            
            const teamsWithStats = (await Promise.all(statsPromises)).filter(Boolean);
            
            // Ordenar por porcentaje de victorias
            const sorted = (teamsWithStats as any[])
                .sort((a, b) => b.stats.winPercentage - a.stats.winPercentage)
                .slice(0, 15);
                
            setTopTeams(sorted);
        } catch (error) {
            console.error("Error fetching ranking:", error);
        } finally {
            setLoadingRanking(false);
        }
    };

    // Load detail when a tournament is selected
    useEffect(() => {
        if (!selectedTournamentId) return;
        setLoadingDetail(true);
        Promise.all([
            getTournamentStats(selectedTournamentId),
            getTournamentWinners(selectedTournamentId),
            getTopScorers({ tournamentId: selectedTournamentId, limit: 10 }),
            getTopAssists({ tournamentId: selectedTournamentId, limit: 10 }),
        ]).then(([stats, wins, scorers]) => {
            setWinners(wins.data.data);
            setTopScorers(scorers.data.data);
            setTeamGoals(stats.data.data.stats.teamGoals || []);
        }).catch(console.error)
        .finally(() => setLoadingDetail(false));
    }, [selectedTournamentId]);

    const selectedTournament = tournaments.find(t => t.id === selectedTournamentId);

    const FACT_ICONS: Record<string, string> = {
        highest_scoring: '🥅', most_participations: '🌟', total_goals: '⚽', biggest_win: '💪', most_cards: '🟨'
    };

    const FactCard = ({ f }: { f: any }) => (
        <div style={{ padding: '2rem 1.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--border)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{FACT_ICONS[f.type] || '📌'}</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{f.titulo}</div>
            <div style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'Outfit' }}>{f.descripcion}</div>
            {f.detalle && <div style={{ fontSize: '1rem', color: 'var(--accent)', marginTop: '0.5rem', fontWeight: 600 }}>{f.detalle}</div>}
            {f.torneo && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>📅 {f.torneo} {f.anio}</div>}
        </div>
    );

    if (loadingMain) return <div className="container page"><div className="loading-state"><div className="spinner" /></div></div>;

    const maxTeamGoals = Math.max(...topTeams.map((t: any) => t.stats.winPercentage || 0), 1);

    return (
        <div className="container page">
            <h1 className="page-title">📊 Estadísticas</h1>
            <p className="page-subtitle">Análisis histórico de todos los torneos</p>

            {/* Dashboard Summary */}
            {summary && (
                <div className="grid-4" style={{ marginBottom: '3rem' }}>
                    <div className="stat-box"><div className="value">{summary.equipos}</div><div className="label">🛡️ Equipos</div></div>
                    <div className="stat-box"><div className="value">{summary.ediciones}</div><div className="label">📅 Ediciones</div></div>
                    <div className="stat-box"><div className="value">{summary.partidos.toLocaleString()}</div><div className="label">⚽ Partidos</div></div>
                    <div className="stat-box"><div className="value">{summary.goles.toLocaleString()}</div><div className="label">🥅 Goles</div></div>
                </div>
            )}

            <div className="grid-2" style={{ marginBottom: '3rem', alignItems: 'start' }}>
                {/* Ranking de Equipos */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <p className="section-title" style={{ marginBottom: 0 }}>🏆 Ranking de Equipos</p>
                        <select className="select" style={{ width: 'auto', fontSize: '0.8rem' }}
                            value={topType}
                            onChange={e => { setTopType(e.target.value); fetchTopTeams(e.target.value); }}>
                            <option value="">Seleccione un campeonato...</option>
                            <option value="WORLD_CUP">Copa Mundial</option>
                            <option value="EURO_CUP">Eurocopa</option>
                        </select>
                    </div>

                    {loadingRanking ? (
                        <div className="loading-state"><div className="spinner" /></div>
                    ) : !topType ? (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <span className="empty-icon" style={{ fontSize: '2rem' }}>🏆</span>
                            <p style={{ fontSize: '0.9rem' }}>Seleccione el histórico para ver el ranking de efectividad.</p>
                        </div>
                    ) : (
                        topTeams.map((team: any, i: number) => (
                            <div key={team.id} style={{ marginBottom: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700, minWidth: 20, fontSize: '0.85rem' }}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                        </span>
                                        <Link to={`/equipos/${team.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {team.flagUrl ? <img src={team.flagUrl} alt="" style={{ width: 24, height: 17, borderRadius: 2 }} /> : null}
                                            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{team.name}</span>
                                        </Link>
                                    </div>
                                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.875rem' }}>
                                        {team.stats.winPercentage}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${(team.stats.winPercentage / maxTeamGoals) * 100}%` }} />
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                    {team.stats.wins}V · {team.stats.draws}E · {team.stats.losses}D · {team.stats.titles} Títulos
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Selector de torneo para detalles específicos */}
                <div className="card">
                    <p className="section-title" style={{ marginBottom: '1rem' }}>🔎 Detalle por Torneo</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {tournaments.map((t: any) => (
                            <button
                                key={t.id}
                                className={`btn ${selectedTournamentId === t.id ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setSelectedTournamentId(t.id)}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                                {t.type === 'WORLD_CUP' ? '🌍' : '🇪🇺'} {t.name}
                            </button>
                        ))}
                    </div>
                    {selectedTournamentId && !loadingDetail && (
                         <div style={{ marginTop: '1.5rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Viendo datos de: <strong>{selectedTournament?.name}</strong>
                            </p>
                         </div>
                    )}
                </div>
            </div>

            {/* Stats del torneo seleccionado */}
            {selectedTournamentId && (
                loadingDetail ? (
                    <div className="loading-state"><div className="spinner" /></div>
                ) : (
                    <>
                        <div className="grid-3" style={{ marginBottom: '3rem', alignItems: 'start' }}>
                            {/* Goleadores */}
                            <div className="card">
                                <p className="section-title">⚽ Top Goleadores</p>
                                {topScorers.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                                        <span className="empty-icon">⚽</span><p>Sin datos</p>
                                    </div>
                                ) : topScorers.map((s: any, i: number) => (
                                    <div key={s.player?.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <span style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700, minWidth: 20, fontSize: '0.85rem' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{formatPlayerName(s.player?.firstName, s.player?.lastName)}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.player?.team?.name}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.goals} ⚽</span>
                                    </div>
                                ))}
                            </div>

                            {/* Selecciones Goleadoras */}
                            <div className="card">
                                <p className="section-title">🛡️ Selecciones Goleadoras</p>
                                {teamGoals.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '1.5rem' }}>
                                        <span className="empty-icon">🛡️</span><p>Sin datos</p>
                                    </div>
                                ) : teamGoals.slice(0, 10).map((tg: any, i: number) => (
                                    <div key={tg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <span style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700, minWidth: 20, fontSize: '0.85rem' }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {tg.flagUrl && <img src={tg.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: 2 }} />}
                                                <Link to={`/equipos/${tg.id}`} style={{ fontWeight: 500, fontSize: '0.875rem' }}>{tg.name}</Link>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{tg.goals} 🥅</span>
                                    </div>
                                ))}
                            </div>

                            {/* Campeones históricos */}
                            <div className="card">
                                <p className="section-title">🏆 Campeones – {selectedTournament?.name}</p>
                                <div style={{ maxHeight: '430px', overflowY: 'auto' }}>
                                    {winners.map((w: any) => (
                                        <div key={w.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ fontWeight: 700 }}>{w.year}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {w.winner?.flagUrl && <img src={w.winner.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: 2 }} />}
                                                <Link to={`/equipos/${w.winner?.id}`} style={{ fontWeight: 600 }}>{w.winner?.name}</Link>
                                            </div>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.result.regular}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )
            )}

            {/* Datos Curiosos Históricos */}
            <div className="card" style={{ marginBottom: '4rem', padding: '3rem 2rem' }}>
                <p className="section-title" style={{ textAlign: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '3rem' }}>💡 Datos Curiosos Históricos</p>
                <div className="grid-2" style={{ gap: '3rem' }}>
                    {/* Columna Mundial */}
                    <div>
                        <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--accent-gold)', fontSize: '1.6rem', fontFamily: 'Outfit' }}>🌍 Copa Mundial</h3>
                        {factsWC.length > 0 ? factsWC.map((f: any, i: number) => <FactCard key={`wc-${i}`} f={f} />) : <div className="empty-state">No hay datos</div>}
                    </div>

                    {/* Columna Eurocopa */}
                    <div>
                        <h3 style={{ textAlign: 'center', marginBottom: '2rem', color: '#58a6ff', fontSize: '1.6rem', fontFamily: 'Outfit' }}>🇪🇺 Eurocopa</h3>
                        {factsEC.length > 0 ? factsEC.map((f: any, i: number) => <FactCard key={`ec-${i}`} f={f} />) : <div className="empty-state">No hay datos</div>}
                    </div>
                </div>
            </div>

            {/* CTA Comparar */}
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <p style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>¿Quieres comparar dos equipos?</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                    Mira sus estadísticas cara a cara y descubre quién domina los enfrentamientos directos.
                </p>
                <Link to="/comparar" className="btn btn-primary">⚖️ Ir al Comparador</Link>
            </div>
        </div>
    );
}
