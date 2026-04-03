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
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip as RechartsTooltip, LabelList } from 'recharts';
import { Link } from 'react-router-dom';
import { formatPlayerName, translateCountryName } from '../utils/formatters';
import { Skeleton, SkeletonGrid, SkeletonTable } from '../components/Skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartBar, faTrophy, faSearch, faLightbulb,
    faGlobe, faEarthEurope, faShieldHalved, faCalendarDays,
    faFutbol, faSquare, faStar, faBolt, faHandshake
} from '@fortawesome/free-solid-svg-icons';

type ActiveTab = 'ranking' | 'detalle' | 'curiosos';

export default function Estadisticas() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null);
    const [winners, setWinners] = useState<any[]>([]);
    const [topScorers, setTopScorers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<ActiveTab>('ranking');

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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const torneosRes = await getTournaments();
                const allTorneos = torneosRes.data.data;
                setTournaments(allTorneos);

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
                });

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
                        { type: 'highest_scoring', titulo: 'Último Campeón', descripcion: `${translateCountryName(lastWinner?.winner?.name) || 'N/A'}`, detalle: `Ganó en ${lastWinner?.year || ''}` }
                    ];
                    if (recs.biggestWin) facts.push({ type: 'biggest_win', titulo: 'Mayor Goleada', descripcion: recs.biggestWin.score, detalle: `${translateCountryName(recs.biggestWin.homeTeam)} vs ${translateCountryName(recs.biggestWin.awayTeam)}`, torneo: 'Mundial', anio: recs.biggestWin.year });
                    if (recs.highestScoringSeason) facts.push({ type: 'total_goals', titulo: 'Torneo con más Goles', descripcion: `${recs.highestScoringSeason.goals} goles`, detalle: `Récord en una edición`, torneo: 'Mundial', anio: recs.highestScoringSeason.year });
                    if (recs.mostCardsSeason) facts.push({ type: 'most_cards', titulo: 'Torneo con más Tarjetas', descripcion: `${recs.mostCardsSeason.cards} tarjetas`, detalle: `Récord de sanciones`, torneo: 'Mundial', anio: recs.mostCardsSeason.year });
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
                        { type: 'highest_scoring', titulo: 'Último Campeón', descripcion: `${translateCountryName(lastWinner?.winner?.name) || 'N/A'}`, detalle: `Ganó en ${lastWinner?.year || ''}` }
                    ];
                    if (recs.biggestWin) facts.push({ type: 'biggest_win', titulo: 'Mayor Goleada', descripcion: recs.biggestWin.score, detalle: `${translateCountryName(recs.biggestWin.homeTeam)} vs ${translateCountryName(recs.biggestWin.awayTeam)}`, torneo: 'Eurocopa', anio: recs.biggestWin.year });
                    if (recs.highestScoringSeason) facts.push({ type: 'total_goals', titulo: 'Torneo con más Goles', descripcion: `${recs.highestScoringSeason.goals} goles`, detalle: `Récord en una edición`, torneo: 'Eurocopa', anio: recs.highestScoringSeason.year });
                    if (recs.mostCardsSeason) facts.push({ type: 'most_cards', titulo: 'Torneo con más Tarjetas', descripcion: `${recs.mostCardsSeason.cards} tarjetas`, detalle: `Récord de sanciones`, torneo: 'Eurocopa', anio: recs.mostCardsSeason.year });
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

    const fetchTopTeams = async (type: string) => {
        if (!type) { setTopTeams([]); return; }
        setLoadingRanking(true);
        try {
            const teamsRes = await getTeams({ limit: 100 });
            const allTeams = teamsRes.data.data;
            const statsPromises = allTeams.map((team: any) =>
                getTeamStats(team.id, type ? { type } : {}).then(res => ({
                    ...team,
                    stats: res.data.data.stats
                })).catch(() => null)
            );
            const teamsWithStats = (await Promise.all(statsPromises)).filter(Boolean);
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

    const FACT_ICONS: Record<string, any> = {
        highest_scoring: faStar,
        most_participations: faStar,
        total_goals: faFutbol,
        biggest_win: faBolt,
        most_cards: faSquare
    };

    const FactCard = ({ f }: { f: any }) => (
        <div style={{
            padding: '2rem 1.5rem',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-accent)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.2s ease'
        }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--accent)' }}>
                <FontAwesomeIcon icon={FACT_ICONS[f.type] || faLightbulb} />
            </div>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.titulo}</div>
            <div style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'Outfit' }}>{f.descripcion}</div>
            {f.detalle && <div style={{ fontSize: '0.95rem', color: 'var(--accent)', marginTop: '0.5rem', fontWeight: 600 }}>{f.detalle}</div>}
            {f.torneo && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '0.3rem' }} />{f.torneo} {f.anio}
            </div>}
        </div>
    );

    if (loadingMain) return (
        <div className="container page">
            <Skeleton type="title" width="50%" />
            <Skeleton type="text" width="30%" style={{ marginBottom: '2rem' }} />
            <div className="grid-4" style={{ marginBottom: '3rem' }}>
                <Skeleton type="card" height={120} />
                <Skeleton type="card" height={120} />
                <Skeleton type="card" height={120} />
                <Skeleton type="card" height={120} />
            </div>
            <SkeletonGrid count={3} />
        </div>
    );

    const maxWinPct = Math.max(...topTeams.map((t: any) => t.stats.winPercentage || 0), 1);

    // Tab definitions
    const tabs = [
        { key: 'ranking' as ActiveTab, label: 'Ranking de Equipos', icon: faTrophy },
        { key: 'detalle' as ActiveTab, label: 'Detalle por Torneo', icon: faSearch },
        { key: 'curiosos' as ActiveTab, label: 'Datos Curiosos', icon: faLightbulb },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="container page"
            id="estadisticas-content"
        >
            {/*Header */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <FontAwesomeIcon icon={faChartBar} style={{ color: 'var(--accent)' }} />
                        Estadísticas
                    </h1>
                    <p className="page-subtitle" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                        Análisis histórico de los campeonatos desde 2008
                    </p>
                </div>

            </div>

            {/* Dashboard Summary */}
            {summary && (
                <div className="grid-4" style={{ marginBottom: '3rem' }}>
                    <div className="stat-box">
                        <div className="value" style={{ display: 'flex', justifyContent: 'center', fontSize: '2rem' }}>
                            <FontAwesomeIcon icon={faShieldHalved} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="value" style={{ marginTop: '0.5rem' }}>{summary.equipos}</div>
                        <div className="label">Equipos</div>
                    </div>
                    <div className="stat-box">
                        <div className="value" style={{ display: 'flex', justifyContent: 'center', fontSize: '2rem' }}>
                            <FontAwesomeIcon icon={faCalendarDays} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="value" style={{ marginTop: '0.5rem' }}>{summary.ediciones}</div>
                        <div className="label">Ediciones</div>
                    </div>
                    <div className="stat-box">
                        <div className="value" style={{ display: 'flex', justifyContent: 'center', fontSize: '2rem' }}>
                            <FontAwesomeIcon icon={faHandshake} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="value" style={{ marginTop: '0.5rem' }}>{summary.partidos.toLocaleString()}</div>
                        <div className="label">Partidos</div>
                    </div>
                    <div className="stat-box">
                        <div className="value" style={{ display: 'flex', justifyContent: 'center', fontSize: '2rem' }}>
                            <FontAwesomeIcon icon={faFutbol} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="value" style={{ marginTop: '0.5rem' }}>{summary.goles.toLocaleString()}</div>
                        <div className="label">Goles</div>
                    </div>
                </div>
            )}

            {/* Tab navigation */}
            <div className="tabs" style={{ justifyContent: 'center', marginBottom: '3rem', gap: '0.5rem', borderBottom: 'none' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1.05rem',
                            borderRadius: '12px',
                            border: activeTab === tab.key ? '1px solid var(--accent)' : '1px solid transparent',
                            display: 'flex', alignItems: 'center', gap: '0.6rem'
                        }}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        <FontAwesomeIcon icon={tab.icon} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── TAB: Ranking de Equipos ── */}
            {activeTab === 'ranking' && (
                <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-accent)', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <p className="section-title" style={{ marginBottom: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                            <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '0.6rem', color: 'var(--accent-gold)' }} />
                            Ranking de Efectividad
                        </p>
                        <select className="select" style={{ width: 'auto', fontSize: '0.9rem', padding: '0.6rem 1rem' }}
                            value={topType}
                            onChange={e => { setTopType(e.target.value); fetchTopTeams(e.target.value); }}>
                            <option value="">Seleccione un campeonato...</option>
                            <option value="WORLD_CUP">Copa Mundial</option>
                            <option value="EURO_CUP">Eurocopa</option>
                        </select>
                    </div>

                    {loadingRanking ? (
                        <div style={{ marginTop: '2rem' }}><Skeleton type="card" height={300} /></div>
                    ) : !topType ? (
                        <div className="empty-state" style={{ padding: '3rem' }}>
                            <FontAwesomeIcon icon={faTrophy} style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <p>Selecciona un campeonato para ver el ranking de efectividad.</p>
                        </div>
                    ) : (
                        topTeams.map((team: any, i: number) => (
                            <div key={team.id} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700, minWidth: 24, fontSize: '1rem' }}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                        </span>
                                        <Link to={`/equipos/${team.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {team.flagUrl ? <img src={team.flagUrl} alt="" style={{ width: 28, height: 19, borderRadius: 3 }} /> : null}
                                            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{translateCountryName(team.name)}</span>
                                        </Link>
                                    </div>
                                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>
                                        {team.stats.winPercentage}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${(team.stats.winPercentage / maxWinPct) * 100}%` }} />
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {team.stats.wins}V · {team.stats.draws}E · {team.stats.losses}D · {team.stats.titles} Títulos
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── TAB: Detalle por Torneo ── */}
            {activeTab === 'detalle' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-accent)', marginBottom: '2rem' }}>
                        <p className="section-title" style={{ marginBottom: '1.5rem', fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '0.6rem' }} />
                            Selecciona un Torneo
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {tournaments.map((t: any) => (
                                <button
                                    key={t.id}
                                    className={`btn ${selectedTournamentId === t.id ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setSelectedTournamentId(t.id)}
                                    style={{ padding: '0.6rem 1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                    <FontAwesomeIcon icon={t.type === 'WORLD_CUP' ? faGlobe : faEarthEurope} />
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedTournamentId && (
                        loadingDetail ? (
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                                <div style={{ flex: 1 }}><SkeletonTable rows={4} columns={2} /></div>
                                <div style={{ flex: 1 }}><Skeleton type="card" height={350} /></div>
                                <div style={{ flex: 1 }}><SkeletonTable rows={4} columns={2} /></div>
                            </div>
                        ) : (
                            <div className="grid-3" style={{ alignItems: 'start', animation: 'fadeIn 0.4s ease' }}>
                                {/* Goleadores */}
                                <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
                                    <p className="section-title">
                                        <FontAwesomeIcon icon={faFutbol} style={{ marginRight: '0.5rem', color: 'var(--accent)' }} />
                                        Top Goleadores
                                    </p>
                                    {topScorers.length === 0 ? (
                                        <div className="empty-state" style={{ padding: '1.5rem' }}>
                                            <FontAwesomeIcon icon={faFutbol} style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                                            <p>Sin datos</p>
                                        </div>
                                    ) : topScorers.map((s: any, i: number) => (
                                        <div key={s.player?.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <span style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 700, minWidth: 20 }}>
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                </span>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{formatPlayerName(s.player?.firstName, s.player?.lastName)}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{translateCountryName(s.player?.team?.name)}</div>
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.stats?.goals ?? s.goals} <FontAwesomeIcon icon={faFutbol} /></span>
                                        </div>
                                    ))}
                                </div>

                                {/* Selecciones Goleadoras */}
                                <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
                                    <p className="section-title">
                                        <FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: '0.5rem', color: 'var(--accent)' }} />
                                        Selecciones Goleadoras
                                    </p>
                                    {teamGoals.length === 0 ? (
                                        <div className="empty-state" style={{ padding: '1.5rem' }}>
                                            <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                                            <p>Sin datos</p>
                                        </div>
                                    ) : (
                                        <div style={{ height: 350, width: '100%', marginTop: '1rem' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    layout="vertical"
                                                    data={teamGoals.slice(0, 10).map((tg: any) => ({ name: translateCountryName(tg.name), goals: tg.goals }))}
                                                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                                                >
                                                    <XAxis type="number" hide />
                                                    <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }} width={80} axisLine={false} tickLine={false} interval={0} />
                                                    <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                                    <Bar dataKey="goals" name="Goles" radius={[0, 4, 4, 0]}>
                                                        <LabelList dataKey="goals" position="right" fill="#fff" style={{ fontWeight: 800, fontSize: '0.85rem' }} />
                                                        {teamGoals.slice(0, 10).map((_: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={index < 3 ? 'var(--accent-gold)' : 'var(--accent)'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Campeones históricos */}
                                <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)' }}>
                                    <p className="section-title">
                                        <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '0.5rem', color: 'var(--accent-gold)' }} />
                                        Campeones – {selectedTournament?.name}
                                    </p>
                                    <div style={{ maxHeight: '430px', overflowY: 'auto' }}>
                                        {winners.map((w: any) => (
                                            <div key={w.year} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ fontWeight: 700 }}>{w.year}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {w.winner?.flagUrl && <img src={w.winner.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: 2 }} />}
                                                    <Link to={`/equipos/${w.winner?.id}`} style={{ fontWeight: 600 }}>{translateCountryName(w.winner?.name)}</Link>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{w.result.regular}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {!selectedTournamentId && (
                        <div className="empty-state" style={{ padding: '3rem' }}>
                            <FontAwesomeIcon icon={faSearch} style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <p>Selecciona un torneo arriba para ver sus estadísticas detalladas.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── TAB: Datos Curiosos ── */}
            {activeTab === 'curiosos' && (
                <div style={{ animation: 'fadeIn 0.4s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '3rem' }}>
                        <div>
                            <h3 style={{
                                textAlign: 'center', marginBottom: '2rem',
                                color: 'var(--accent-gold)', fontSize: '1.6rem',
                                fontFamily: 'Outfit', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.75rem'
                            }}>
                                <FontAwesomeIcon icon={faGlobe} /> Copa Mundial
                            </h3>
                            {factsWC.length > 0 ? factsWC.map((f: any, i: number) => <FactCard key={`wc-${i}`} f={f} />) : <div className="empty-state">No hay datos</div>}
                        </div>
                        <div>
                            <h3 style={{
                                textAlign: 'center', marginBottom: '2rem',
                                color: 'var(--accent-2)', fontSize: '1.6rem',
                                fontFamily: 'Outfit', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '0.75rem'
                            }}>
                                <FontAwesomeIcon icon={faEarthEurope} /> Eurocopa
                            </h3>
                            {factsEC.length > 0 ? factsEC.map((f: any, i: number) => <FactCard key={`ec-${i}`} f={f} />) : <div className="empty-state">No hay datos</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* CTA Comparar */}
            <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-accent)', marginTop: '4rem' }}>
                <p style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>¿Quieres comparar dos equipos?</p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Mira sus estadísticas cara a cara y descubre quién domina los enfrentamientos directos.
                </p>
                <Link to="/comparar" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
                    <FontAwesomeIcon icon={faChartBar} style={{ marginRight: '0.5rem' }} /> Ir al Comparador
                </Link>
            </div>
        </motion.div>
    );
}
