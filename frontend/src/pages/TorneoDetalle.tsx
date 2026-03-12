import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { getSeasonById, getSeasonMatches, getSeasonTopScorers } from '../services/api';
import { formatPlayerName } from '../utils/formatters';
import { TournamentBracket } from '../TournamentBracket';

const STAGES: Record<string, string> = {
    GROUP: 'Fase de Grupos', ROUND_OF_16: 'Octavos', QUARTER_FINAL: 'Cuartos',
    SEMI_FINAL: 'Semifinales', THIRD_PLACE: '3er Puesto', FINAL: 'Final'
};

export default function TorneoDetalle() {
    const { id } = useParams();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [season, setSeason] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [scorers, setScorers] = useState<any[]>([]);

    // Initialize from URL or defaults
    const activeTab = (searchParams.get('tab') as any) || 'clasificacion';
    const stageFilter = searchParams.get('fase') || '';

    const [loading, setLoading] = useState(true);

    const setActiveTab = (tab: string) => {
        setSearchParams(prev => {
            prev.set('tab', tab);
            return prev;
        });
    };

    const setStageFilter = (fase: string) => {
        setSearchParams(prev => {
            if (fase) prev.set('fase', fase);
            else prev.delete('fase');
            return prev;
        });
    };

    useEffect(() => {
        if (!id) return;
        const numId = Number(id);
        Promise.all([
            getSeasonById(numId),
            getSeasonMatches(numId),
            getSeasonTopScorers(numId)
        ]).then(([s, m, sc]) => {
            setSeason(s.data.data);
            setMatches(m.data.data);
            setScorers(sc.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="container page"><div className="loading-state"><div className="spinner" /></div></div>;
    if (!season) return <div className="container page"><div className="empty-state">Temporada no encontrada</div></div>;

    const groupedStandings = season.seasonTeams?.reduce((acc: any, st: any) => {
        const grp = st.group || 'A';
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(st);
        return acc;
    }, {});

    const filteredMatches = stageFilter ? matches.filter((m: any) => m.stage === stageFilter) : matches;
    const matchesByStage = filteredMatches.reduce((acc: any, m: any) => {
        if (!acc[m.stage]) acc[m.stage] = [];
        acc[m.stage].push(m);
        return acc;
    }, {});

    const stageOrder = ['GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'];
    const tournamentType = season.tournament?.type;

    return (
        <div className="container page">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link
                    to={(location.state as any)?.from || (tournamentType ? `/torneos?tipo=${tournamentType}` : "/torneos")}
                    className="btn btn-ghost"
                    style={{ marginBottom: '1rem', display: 'inline-flex' }}
                >
                    ← Volver
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '3rem' }}>{tournamentType === 'WORLD_CUP' ? '🌍' : '🇪🇺'}</span>
                    <div>
                        <h1 className="page-title" style={{ marginBottom: 0 }}>
                            {season.tournament?.name} {season.year}
                        </h1>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            {season.hostCountry && <span className="badge badge-blue">📍 {season.hostCountry}</span>}
                            {season.winner && <span className="badge badge-gold">🏆 Campeón: {season.winner}</span>}
                            <span className="badge badge-green">{matches.length} partidos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {(['clasificacion', 'fase_final', 'partidos', 'goleadores'] as const).map(tab => (
                    <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab === 'clasificacion' ? '📊 Clasificación' : tab === 'fase_final' ? '🏆 Fase Final' : tab === 'partidos' ? '⚽ Partidos' : '🥇 Goleadores'}
                    </button>
                ))}
            </div>

            {/* CLASIFICACIÓN */}
            {activeTab === 'clasificacion' && (
                <div>
                    {groupedStandings && Object.keys(groupedStandings).sort().map((grp: string) => (
                        <div key={grp} style={{ marginBottom: '2rem' }}>
                            <p className="section-title">Grupo {grp}</p>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div className="table-wrap">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th>
                                                <th>P</th><th>GF</th><th>GC</th><th>Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedStandings[grp]
                                                .sort((a: any, b: any) => (b.points - a.points) || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
                                                .map((st: any, i: number) => (
                                                    <tr key={st.teamId}>
                                                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                                        <td>
                                                            <div className="team-flag">
                                                                {st.team?.flagUrl
                                                                    ? <img src={st.team.flagUrl} alt={st.team.name} />
                                                                    : <div className="flag-placeholder">?</div>}
                                                                <Link 
                                                                    to={`/equipos/${st.teamId}`}
                                                                    state={{ from: location.pathname + location.search }}
                                                                >
                                                                    {st.team?.name}
                                                                </Link>
                                                            </div>
                                                        </td>
                                                        <td>{st.played}</td><td>{st.won}</td><td>{st.drawn}</td>
                                                        <td>{st.lost}</td><td>{st.goalsFor}</td><td>{st.goalsAgainst}</td>
                                                        <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{st.points}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!groupedStandings || Object.keys(groupedStandings).length === 0) && (
                        <div className="empty-state"><span className="empty-icon">📋</span><p>Sin datos de clasificación disponibles</p></div>
                    )}
                </div>
            )}

            {/* FASE FINAL */}
            {activeTab === 'fase_final' && (
                <div className="card" style={{ padding: '2rem 1.5rem', overflowX: 'auto' }}>
                    <TournamentBracket
                        matches={matches}
                        returnState={{ from: location.pathname + location.search }}
                    />
                </div>
            )}

            {/* PARTIDOS */}
            {activeTab === 'partidos' && (
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <select className="select" style={{ width: 'auto' }} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
                            <option value="">Todas las fases</option>
                            {stageOrder.map(s => <option key={s} value={s}>{STAGES[s]}</option>)}
                        </select>
                    </div>
                    {stageOrder.filter(s => matchesByStage[s]).map(stage => (
                        <div key={stage} style={{ marginBottom: '2rem' }}>
                            <p className="section-title">{STAGES[stage]}</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {matchesByStage[stage].map((m: any) => (
                                    <Link
                                        to={`/partidos/${m.id}`}
                                        state={{ from: location.pathname + location.search }}
                                        key={m.id}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="match-card">
                                            <div style={{ flex: 1, textAlign: 'right' }}>
                                                <div className="team-flag" style={{ justifyContent: 'flex-end' }}>
                                                    <span className="team-name">{m.homeTeam?.name}</span>
                                                    {m.homeTeam?.flagUrl ? <img src={m.homeTeam.flagUrl} alt="" style={{ width: 24, height: 17 }} /> : <div className="flag-placeholder">?</div>}
                                                </div>
                                            </div>
                                            <div className="match-score">
                                                {m.status === 'FINISHED' ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div className="team-flag">
                                                    {m.awayTeam?.flagUrl ? <img src={m.awayTeam.flagUrl} alt="" style={{ width: 24, height: 17 }} /> : <div className="flag-placeholder">?</div>}
                                                    <span className="team-name">{m.awayTeam?.name}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 80, textAlign: 'right' }}>
                                                {new Date(m.date).toLocaleDateString('es-ES')}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    {Object.keys(matchesByStage).length === 0 && (
                        <div className="empty-state"><span className="empty-icon">⚽</span><p>Sin partidos encontrados</p></div>
                    )}
                </div>
            )}

            {/* GOLEADORES */}
            {activeTab === 'goleadores' && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>#</th><th>Jugador</th><th>Equipo</th><th>Goles</th><th>Asistencias</th></tr></thead>
                            <tbody>
                                {scorers.length === 0 ? (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sin datos de goleadores</td></tr>
                                ) : scorers.map((sc: any, i: number) => (
                                    <tr key={sc.player?.id}>
                                        <td style={{ color: i < 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{formatPlayerName(sc.player?.firstName, sc.player?.lastName)}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{sc.player?.team}</td>
                                        <td><span className="badge badge-green">{sc.goals}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{sc.assists}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
