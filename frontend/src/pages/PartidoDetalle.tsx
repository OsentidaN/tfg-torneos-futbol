import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getMatchById, getMatchEvents, getMatchLineups, getFavorites, toggleFavorite } from '../services/api';
import { formatPlayerName, translateCountryName } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStar as faStarSolid, faClipboardList, faUsers, faChartBar,
    faLocationDot, faCalendarDays, faArrowLeft, faShirt
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

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
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (!id) return;
        const numId = Number(id);
        const fetchData = async () => {
            try {
                const [m, e, l] = await Promise.all([
                    getMatchById(numId),
                    getMatchEvents(numId),
                    getMatchLineups(numId)
                ]);
                setMatch(m.data.data);
                setEvents(e.data.data);
                setLineups(l.data.data);
                if (user) {
                    const favs = await getFavorites();
                    const favList = favs.data.data.favorites;
                    setIsFavorite(favList.some((f: any) => f.favoriteType === 'MATCH' && f.matchId === numId));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleToggleFavorite = async () => {
        if (!id || !user) return;
        try {
            const res = await toggleFavorite({ targetId: Number(id), type: 'MATCH' });
            setIsFavorite(res.data.data.isFavorite);
        } catch (err) {
            console.error('Error al cambiar favorito', err);
        }
    };

    if (loading) return <div className="container page"><div className="loading-state"><div className="spinner" /></div></div>;
    if (!match) return <div className="container page"><div className="empty-state">Partido no encontrado</div></div>;

    const isFinished = match.status === 'FINISHED';

    const tabs = [
        { key: 'resumen' as const, label: 'Resumen', icon: faClipboardList },
        { key: 'alineaciones' as const, label: 'Alineaciones', icon: faUsers },
        { key: 'estadisticas' as const, label: 'Estadísticas', icon: faChartBar },
    ];

    return (
        <div className="container page">
            {/* Back + Favorite row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <Link
                    to={(location.state as any)?.from || "/partidos"}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.75rem', fontSize: '1rem' }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </Link>
                {user && (
                    <button
                        onClick={handleToggleFavorite}
                        className={`btn ${isFavorite ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.95rem', gap: '0.5rem' }}
                        title={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                    >
                        <FontAwesomeIcon icon={isFavorite ? faStarSolid : faStarRegular} />
                        {isFavorite ? ' Guardado' : ' Favorito'}
                    </button>
                )}
            </div>

            {/* Match Header Card */}
            <div style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-accent)', 
                borderRadius: 'var(--radius-xl)', 
                padding: '2.5rem 2rem', 
                marginBottom: '2rem', 
                textAlign: 'center' 
            }}>
                {/* Tournament + Round */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ 
                        fontSize: '1rem', 
                        color: 'var(--text-secondary)', 
                        fontWeight: 600,
                        background: 'rgba(46, 160, 67, 0.1)',
                        padding: '0.3rem 1rem',
                        borderRadius: '99px',
                        border: '1px solid var(--border-accent)'
                    }}>
                        {match.season?.tournament?.name} {match.season?.year}
                    </span>
                    {match.round && (
                        <span style={{ 
                            marginLeft: '0.75rem',
                            fontSize: '0.9rem', 
                            color: 'var(--text-secondary)', 
                            fontWeight: 500
                        }}>
                            · {match.round}
                        </span>
                    )}
                </div>

                {/* Teams + Score */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <Link to={`/equipos/${match.homeTeamId}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            {match.homeTeam?.flagUrl && (
                                <img src={match.homeTeam.flagUrl} alt="" style={{ width: 80, height: 54, marginBottom: '0.75rem', borderRadius: 6, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
                            )}
                            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                                {translateCountryName(match.homeTeam?.name)}
                            </div>
                        </Link>
                    </div>

                    <div>
                        <div style={{ fontFamily: 'Outfit', fontSize: '4rem', fontWeight: 900, lineHeight: 1, color: 'var(--text-primary)' }}>
                            {isFinished ? `${match.homeGoals}–${match.awayGoals}` : 'vs'}
                        </div>
                        {match.homeGoalsPenalty != null && (
                            <div style={{ fontSize: '1rem', color: 'var(--accent)', marginTop: '0.4rem', fontWeight: 600 }}>
                                ({match.homeGoalsPenalty} – {match.awayGoalsPenalty} pen.)
                            </div>
                        )}
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
                            {match.venue && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: '0.4rem', color: 'var(--accent)' }} />
                                    {match.venue}{match.city ? `, ${translateCountryName(match.city)}` : ''}
                                </div>
                            )}
                            {match.date && (
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                    <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '0.4rem', color: 'var(--accent)' }} />
                                    {new Date(match.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <Link to={`/equipos/${match.awayTeamId}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            {match.awayTeam?.flagUrl && (
                                <img src={match.awayTeam.flagUrl} alt="" style={{ width: 80, height: 54, marginBottom: '0.75rem', borderRadius: 6, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
                            )}
                            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                                {translateCountryName(match.awayTeam?.name)}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem', borderBottom: 'none' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '0.75rem 1.75rem',
                            fontSize: '1rem',
                            borderRadius: '10px',
                            border: activeTab === tab.key ? '1px solid var(--accent)' : '1px solid transparent',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                    >
                        <FontAwesomeIcon icon={tab.icon} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* RESUMEN */}
            {activeTab === 'resumen' && (
                <div>
                    {events.length === 0 ? (
                        <div className="empty-state">
                            <FontAwesomeIcon icon={faClipboardList} style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-muted)' }} />
                            <p>Sin eventos disponibles</p>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                            {events.map((ev: any) => (
                                <div key={ev.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '0.9rem 1.5rem',
                                    borderBottom: '1px solid var(--border)',
                                    flexDirection: ev.teamId === match.homeTeamId ? 'row' : 'row-reverse'
                                }}>
                                    <span style={{ fontSize: '1.3rem', minWidth: 26 }}>{EVENT_ICONS[ev.type] || '•'}</span>
                                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--accent)', fontSize: '1rem' }}>
                                        {ev.minute}'{ev.extraMinute ? `+${ev.extraMinute}` : ''}
                                    </span>
                                    <span style={{ fontWeight: 500, fontSize: '1rem' }}>
                                        {ev.player ? formatPlayerName(ev.player.firstName, ev.player.lastName) : '—'}
                                    </span>
                                    {ev.detail && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ev.detail}</span>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ALINEACIONES */}
            {activeTab === 'alineaciones' && (
                lineups ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {[lineups.homeTeam, lineups.awayTeam].map((team: any) => (
                            <div key={team.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <FontAwesomeIcon icon={faShirt} style={{ color: 'var(--accent)', fontSize: '1.2rem' }} />
                                    <Link to={`/equipos/${team.id}`} style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                                        {translateCountryName(team.name)}
                                    </Link>
                                </div>

                                {team.starters?.length > 0 && (
                                    <>
                                        <p style={{ 
                                            fontSize: '0.78rem', color: 'var(--accent)', marginBottom: '0.75rem', 
                                            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700
                                        }}>
                                            Titulares
                                        </p>
                                        {team.starters.map((p: any) => (
                                            <div key={p.id} style={{ 
                                                padding: '0.5rem 0', 
                                                borderBottom: '1px solid var(--border)', 
                                                fontSize: '0.9rem', display: 'flex', gap: '0.75rem', 
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ 
                                                    color: 'var(--text-primary)', fontWeight: 700, 
                                                    minWidth: 28, fontSize: '0.85rem',
                                                    background: 'rgba(46,160,67,0.15)', 
                                                    borderRadius: 4, padding: '0.1rem 0.4rem',
                                                    textAlign: 'center'
                                                }}>{p.shirtNumber}</span>
                                                <span style={{ flex: 1, color: 'var(--text-primary)' }}>
                                                    {formatPlayerName(p.player?.firstName, p.player?.lastName)}
                                                </span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>
                                                    {p.position}
                                                </span>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {team.substitutes?.length > 0 && (
                                    <>
                                        <p style={{ 
                                            fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '1.25rem', marginBottom: '0.75rem', 
                                            textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700
                                        }}>
                                            Suplentes
                                        </p>
                                        {team.substitutes.map((p: any) => (
                                            <div key={p.id} style={{ 
                                                padding: '0.5rem 0', 
                                                borderBottom: '1px solid var(--border)', 
                                                fontSize: '0.9rem', display: 'flex', gap: '0.75rem',
                                                alignItems: 'center', opacity: 0.75
                                            }}>
                                                <span style={{ 
                                                    color: 'var(--text-secondary)', fontWeight: 600, 
                                                    minWidth: 28, fontSize: '0.85rem',
                                                    background: 'var(--bg-secondary)', 
                                                    border: '1px solid var(--border)',
                                                    textAlign: 'center'
                                                }}>{p.shirtNumber}</span>
                                                <span style={{ flex: 1, color: 'var(--text-primary)' }}>
                                                    {formatPlayerName(p.player?.firstName, p.player?.lastName)}
                                                </span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <FontAwesomeIcon icon={faUsers} style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-muted)' }} />
                        <p>Sin alineaciones disponibles</p>
                    </div>
                )
            )}

            {/* ESTADÍSTICAS */}
            {activeTab === 'estadisticas' && (
                match.teamStats && match.teamStats.length > 0 ? (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
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
                                <div key={label} style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{h ?? '-'}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
                                        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{a ?? '-'}</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
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
                    <div className="empty-state">
                        <FontAwesomeIcon icon={faChartBar} style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-muted)' }} />
                        <p>Sin estadísticas disponibles</p>
                    </div>
                )
            )}
        </div>
    );
}
