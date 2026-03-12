import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getTeamById, getTeamStats, getTeamMatches } from '../services/api';

export default function EquipoDetalle() {
    const { id } = useParams();
    const location = useLocation();
    const [team, setTeam] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'torneos' | 'partidos' | 'estadisticas'>('torneos');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const numId = Number(id);
        Promise.all([
            getTeamById(numId),
            getTeamStats(numId),
            getTeamMatches(numId, { limit: 20 })
        ]).then(([t, s, m]) => {
            setTeam(t.data.data);
            setStats(s.data.data);
            setMatches(m.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="container page"><div className="loading-state"><div className="spinner" /></div></div>;
    if (!team) return <div className="container page"><div className="empty-state">Equipo no encontrado</div></div>;

    const backPath = location.state?.from || '/equipos';

    return (
        <div className="container page">
            <Link to={backPath} className="btn btn-ghost" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>← Volver</Link>

            {/* Team Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {team.flagUrl
                    ? <img src={team.flagUrl} alt={team.name} style={{ width: 80, height: 57, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)', boxShadow: 'var(--shadow-md)' }} />
                    : <div className="flag-placeholder" style={{ width: 80, height: 57, fontSize: '1.5rem' }}>?</div>}
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>{team.name}</h1>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {team.code && <span className="badge badge-blue">{team.code}</span>}
                        {team.confederation && <span className="badge badge-purple">{team.confederation}</span>}
                        <span className="badge badge-green">{team.seasonTeams?.length} torneos</span>
                    </div>
                </div>
                <Link to={`/comparar?team1=${id}`} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>⚖️ Comparar</Link>
            </div>

            {/* Quick Stats - from /teams/:id/stats */}
            {stats && (
                <div className="grid-4" style={{ marginBottom: '2rem' }}>
                    <div className="stat-box"><div className="value">{stats.stats.titles}</div><div className="label">🏆 Títulos</div></div>
                    <div className="stat-box"><div className="value">{stats.stats.matchesPlayed}</div><div className="label">⚽ Partidos</div></div>
                    <div className="stat-box"><div className="value">{stats.stats.wins}</div><div className="label">✅ Victorias</div></div>
                    <div className="stat-box"><div className="value">{stats.stats.winPercentage}%</div><div className="label">📈 % Victoria</div></div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                {(['torneos', 'partidos', 'estadisticas'] as const).map(tab => (
                    <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab === 'torneos' ? '📅 Participaciones' : tab === 'partidos' ? '⚽ Últimos Partidos' : '📊 Estadísticas'}
                    </button>
                ))}
            </div>

            {/* PARTICIPACIONES */}
            {activeTab === 'torneos' && (
                <div className="grid-3">
                    {team.seasonTeams?.sort((a: any, b: any) => b.season.year - a.season.year).map((st: any) => (
                        <Link to={`/torneos/${st.seasonId}`} key={st.id} style={{ textDecoration: 'none' }}>
                            <div className="card card-link">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800 }}>{st.season.year}</span>
                                    <span className={`badge ${st.season.tournament.type === 'WORLD_CUP' ? 'badge-gold' : 'badge-blue'}`}>
                                        {st.season.tournament.type === 'WORLD_CUP' ? '🌍' : '🇪🇺'}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{st.season.tournament.name}</div>
                                {st.group && <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Grupo {st.group}</div>}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center', gap: '0.25rem' }}>
                                    {[['PJ', st.played], ['G', st.won], ['E', st.drawn], ['P', st.lost]].map(([l, v]) => (
                                        <div key={l as string}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l}</div>
                                            <div style={{ fontWeight: 700 }}>{v}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                                    {st.points} pts · GD {st.goalsFor - st.goalsAgainst > 0 ? '+' : ''}{st.goalsFor - st.goalsAgainst}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* ÚLTIMOS PARTIDOS */}
            {activeTab === 'partidos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {matches.length === 0
                        ? <div className="empty-state"><span className="empty-icon">⚽</span><p>Sin partidos registrados</p></div>
                        : matches.map((m: any) => (
                            <Link to={`/partidos/${m.id}`} key={m.id} style={{ textDecoration: 'none' }}>
                                <div className="match-card">
                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                        <div className="team-flag" style={{ justifyContent: 'flex-end' }}>
                                            <span className="team-name" style={{ fontWeight: m.homeTeamId === Number(id) ? 700 : 400 }}>{m.homeTeam?.name}</span>
                                            {m.homeTeam?.flagUrl ? <img src={m.homeTeam.flagUrl} alt="" style={{ width: 24, height: 17 }} /> : <div className="flag-placeholder">?</div>}
                                        </div>
                                    </div>
                                    <div className="match-score">{m.status === 'FINISHED' ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}</div>
                                    <div style={{ flex: 1 }}>
                                        <div className="team-flag">
                                            {m.awayTeam?.flagUrl ? <img src={m.awayTeam.flagUrl} alt="" style={{ width: 24, height: 17 }} /> : <div className="flag-placeholder">?</div>}
                                            <span className="team-name" style={{ fontWeight: m.awayTeamId === Number(id) ? 700 : 400 }}>{m.awayTeam?.name}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                                        {m.season?.tournament?.type === 'WORLD_CUP' ? '🌍' : '🇪🇺'} {m.season?.year}
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
            )}

            {/* ESTADÍSTICAS */}
            {activeTab === 'estadisticas' && stats && (
                <div className="grid-2">
                    <div className="card">
                        <p className="section-title">Resultados</p>
                        {[
                            ['Partidos Jugados', stats.stats.matchesPlayed],
                            ['Victorias', stats.stats.wins],
                            ['Empates', stats.stats.draws],
                            ['Derrotas', stats.stats.losses],
                            ['Títulos', stats.stats.titles],
                        ].map(([l, v]) => (
                            <div key={l as string} className="stat-row">
                                <span className="label">{l}</span>
                                <span className="value">{v}</span>
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <p className="section-title">Goles</p>
                        {[
                            ['Goles a Favor', stats.stats.goalsFor],
                            ['Goles en Contra', stats.stats.goalsAgainst],
                            ['Diferencia de Goles', stats.stats.goalDifference],
                            ['% de Victorias', `${stats.stats.winPercentage}%`],
                        ].map(([l, v]) => (
                            <div key={l as string} className="stat-row">
                                <span className="label">{l}</span>
                                <span className={`value ${typeof v === 'number' && v > 0 ? 'win' : ''}`}>{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
