import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getMatchById, getMatchEvents, getMatchLineups } from '../services/api';
import { formatPlayerName } from '../utils/formatters';

const EVENT_ICONS: Record<string, string> = {
    GOAL: '⚽', OWN_GOAL: '🙈', PENALTY: '🎯', YELLOW_CARD: '🟨', RED_CARD: '🟥', SUBSTITUTION: '🔄'
};

export default function PartidoDetalle() {
    const { id } = useParams();
    const location = useLocation();
    const [match, setMatch] = useState<any>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [lineups, setLineups] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'resumen' | 'alineaciones' | 'estadisticas'>('resumen');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const numId = Number(id);
        Promise.all([
            getMatchById(numId),
            getMatchEvents(numId),
            getMatchLineups(numId)
        ]).then(([m, e, l]) => {
            setMatch(m.data.data);
            setEvents(e.data.data);
            setLineups(l.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="container page"><div className="loading-state"><div className="spinner" /></div></div>;
    if (!match) return <div className="container page"><div className="empty-state">Partido no encontrado</div></div>;

    const isFinished = match.status === 'FINISHED';

    return (
        <div className="container page">
            <Link 
                to={(location.state as any)?.from || "/partidos"} 
                className="btn btn-ghost" 
                style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
            >
                ← Volver
            </Link>

            {/* Match Header */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {match.season?.tournament?.name} {match.season?.year} · {match.round}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <Link to={`/equipos/${match.homeTeamId}`}>
                            {match.homeTeam?.flagUrl && <img src={match.homeTeam.flagUrl} alt="" style={{ width: 48, height: 34, marginBottom: '0.5rem', borderRadius: 4 }} />}
                            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem' }}>{match.homeTeam?.name}</div>
                        </Link>
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Outfit', fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
                            {isFinished ? `${match.homeGoals}–${match.awayGoals}` : 'vs'}
                        </div>
                        {match.homeGoalsPenalty != null && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                ({match.homeGoalsPenalty} – {match.awayGoalsPenalty} pen.)
                            </div>
                        )}
                        {match.venue && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                📍 {match.venue}, {match.city}
                            </div>
                        )}
                        {match.date && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                📅 {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        )}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <Link to={`/equipos/${match.awayTeamId}`}>
                            {match.awayTeam?.flagUrl && <img src={match.awayTeam.flagUrl} alt="" style={{ width: 48, height: 34, marginBottom: '0.5rem', borderRadius: 4 }} />}
                            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem' }}>{match.awayTeam?.name}</div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                {(['resumen', 'alineaciones', 'estadisticas'] as const).map(tab => (
                    <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab === 'resumen' ? '📋 Resumen' : tab === 'alineaciones' ? '👕 Alineaciones' : '📊 Estadísticas'}
                    </button>
                ))}
            </div>

            {/* RESUMEN */}
            {activeTab === 'resumen' && (
                <div>
                    {events.length === 0 ? (
                        <div className="empty-state"><span className="empty-icon">📋</span><p>Sin eventos disponibles</p></div>
                    ) : (
                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {events.map((ev: any) => (
                                <div key={ev.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1.25rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    flexDirection: ev.teamId === match.homeTeamId ? 'row' : 'row-reverse'
                                }}>
                                    <span style={{ fontSize: '1.2rem', minWidth: 24 }}>{EVENT_ICONS[ev.type] || '•'}</span>
                                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent)' }}>
                                        {ev.minute}'{ev.extraMinute ? `+${ev.extraMinute}` : ''}
                                    </span>
                                    <span style={{ fontWeight: 500 }}>
                                        {ev.player ? formatPlayerName(ev.player.firstName, ev.player.lastName) : '—'}
                                    </span>
                                    {ev.detail && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ev.detail}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ALINEACIONES */}
            {activeTab === 'alineaciones' && (
                lineups ? (
                    <div className="grid-2">
                        {[lineups.homeTeam, lineups.awayTeam].map((team: any) => (
                            <div className="card" key={team.id}>
                                <div className="team-flag" style={{ marginBottom: '1rem' }}>
                                    <Link to={`/equipos/${team.id}`} style={{ fontWeight: 700 }}>{team.name}</Link>
                                </div>
                                        {team.starters?.length > 0 && (
                                            <>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Titulares</p>
                                                {team.starters.map((p: any) => (
                                                    <div key={p.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem' }}>
                                                        <span style={{ color: 'var(--text-muted)', minWidth: 24 }}>{p.shirtNumber}</span>
                                                        <span>{formatPlayerName(p.player?.firstName, p.player?.lastName)}</span>
                                                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.position}</span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {team.substitutes?.length > 0 && (
                                            <>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suplentes</p>
                                                {team.substitutes.map((p: any) => (
                                                    <div key={p.id} style={{ padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', opacity: 0.7 }}>
                                                        <span style={{ color: 'var(--text-muted)', minWidth: 24 }}>{p.shirtNumber}</span>
                                                        <span>{formatPlayerName(p.player?.firstName, p.player?.lastName)}</span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state"><span className="empty-icon">👕</span><p>Sin alineaciones disponibles</p></div>
                )
            )}

            {/* ESTADÍSTICAS */}
            {activeTab === 'estadisticas' && (
                match.teamStats && match.teamStats.length > 0 ? (
                    <div className="card">
                        {(() => {
                            const home = match.teamStats.find((s: any) => s.teamId === match.homeTeamId);
                            const away = match.teamStats.find((s: any) => s.teamId === match.awayTeamId);
                            const stats = [
                                { label: 'Posesión (%)', h: home?.possession, a: away?.possession },
                                { label: 'Tiros Totales', h: home?.shotsTotal, a: away?.shotsTotal },
                                { label: 'Tiros a Puerta', h: home?.shotsOnTarget, a: away?.shotsOnTarget },
                                { label: 'Córners', h: home?.corners, a: away?.corners },
                                { label: 'Faltas', h: home?.fouls, a: away?.fouls },
                                { label: 'Tarjetas Amarillas', h: home?.yellowCards, a: away?.yellowCards },
                                { label: 'Tarjetas Rojas', h: home?.redCards, a: away?.redCards },
                                { label: 'Pases', h: home?.passes, a: away?.passes },
                            ];
                            return stats.map(({ label, h, a }) => h != null || a != null ? (
                                <div key={label} style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontWeight: 700 }}>{h ?? '-'}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                                        <span style={{ fontWeight: 700 }}>{a ?? '-'}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${h && a ? (h / (h + a)) * 100 : 50}%` }} />
                                        </div>
                                        <div className="progress-bar" style={{ transform: 'scaleX(-1)' }}>
                                            <div className="progress-fill" style={{ width: `${h && a ? (a / (h + a)) * 100 : 50}%`, background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-warn))' }} />
                                        </div>
                                    </div>
                                </div>
                            ) : null);
                        })()}
                    </div>
                ) : (
                    <div className="empty-state"><span className="empty-icon">📊</span><p>Sin estadísticas disponibles</p></div>
                )
            )}
        </div>
    );
}
