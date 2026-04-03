import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getFavorites } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faStar, faTrophy, faFutbol, faClock, 
    faGlobe, faEarthEurope, faHeartCrack, faCalendarDays
} from '@fortawesome/free-solid-svg-icons';
import { translateCountryName } from '../utils/formatters';

export default function Favoritos() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        getFavorites()
            .then(res => setFavorites(res.data.data.favorites))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container page"><div className="loading-state"><div className="spinner" /></div></div>;

    const favoriteSeasons = favorites.filter(f => f.favoriteType === 'SEASON');
    const favoriteMatches = favorites.filter(f => f.favoriteType === 'MATCH');

    return (
        <div className="container page">
            {/* Premium Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <FontAwesomeIcon icon={faStar} style={{ color: 'var(--accent-gold)' }} />
                    Mis Favoritos
                </h1>
                <p className="page-subtitle" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Tus campeonatos y partidos guardados
                </p>
            </div>

            {favorites.length === 0 ? (
                <div className="empty-state" style={{ padding: '5rem 2rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-accent)' }}>
                    <FontAwesomeIcon icon={faHeartCrack} style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'block' }} />
                    <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 600 }}>Aún no tienes favoritos</p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Guarda torneos y partidos para acceder a ellos rápidamente.</p>
                    <Link to="/torneos" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                        <FontAwesomeIcon icon={faTrophy} style={{ marginRight: '0.5rem' }} />
                        Explorar Torneos
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

                    {/* SEASONS */}
                    {favoriteSeasons.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }} />
                                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 700 }}>
                                    Campeonatos Favoritos
                                </h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                {favoriteSeasons.map(fav => (
                                    <Link
                                        key={fav.id}
                                        to={`/torneos/${fav.seasonId}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="card" style={{ 
                                            padding: '1.75rem', 
                                            background: 'var(--bg-card)', 
                                            border: '1px solid var(--border-accent)',
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '1.25rem',
                                            transition: 'all 0.25s ease'
                                        }}>
                                            <div style={{ 
                                                width: 48, height: 48,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.4rem', flexShrink: 0
                                            }}>
                                                <FontAwesomeIcon 
                                                    icon={fav.season?.tournament?.type === 'WORLD_CUP' ? faGlobe : faEarthEurope}
                                                    style={{ color: fav.season?.tournament?.type === 'WORLD_CUP' ? 'var(--accent-gold)' : '#58a6ff' }}
                                                />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.2rem', wordBreak: 'break-word' }}>
                                                    {fav.season?.tournament?.name}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
                                                    <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '0.4rem', opacity: 0.7 }} />
                                                    Edición {fav.season?.year}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* MATCHES */}
                    {favoriteMatches.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <FontAwesomeIcon icon={faFutbol} style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
                                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 700 }}>
                                    Partidos Guardados
                                </h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {favoriteMatches.map(fav => (
                                    <Link
                                        key={fav.id}
                                        to={`/partidos/${fav.matchId}`}
                                        state={{ from: location.pathname }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1.25rem 1.75rem',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-accent)',
                                            borderRadius: 'var(--radius-lg)',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-accent)')}
                                        >
                                            {/* Home Team */}
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', textAlign: 'right' }}>
                                                    {translateCountryName(fav.match?.homeTeam?.name)}
                                                </span>
                                                {fav.match?.homeTeam?.flagUrl && (
                                                    <img src={fav.match.homeTeam.flagUrl} alt="" style={{ width: 32, height: 22, borderRadius: 4, objectFit: 'cover' }} />
                                                )}
                                            </div>

                                            {/* Score */}
                                            <div style={{
                                                fontFamily: 'Outfit',
                                                fontWeight: 900,
                                                fontSize: '1.4rem',
                                                color: 'var(--text-primary)',
                                                background: 'var(--bg-primary)',
                                                padding: '0.4rem 1rem',
                                                borderRadius: 'var(--radius-md)',
                                                minWidth: '80px',
                                                textAlign: 'center',
                                                border: '1px solid var(--border-accent)'
                                            }}>
                                                {fav.match?.homeGoals} – {fav.match?.awayGoals}
                                            </div>

                                            {/* Away Team */}
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                {fav.match?.awayTeam?.flagUrl && (
                                                    <img src={fav.match.awayTeam.flagUrl} alt="" style={{ width: 32, height: 22, borderRadius: 4, objectFit: 'cover' }} />
                                                )}
                                                <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>
                                                    {translateCountryName(fav.match?.awayTeam?.name)}
                                                </span>
                                            </div>

                                            {/* Date */}
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: 90, textAlign: 'right', flexShrink: 0 }}>
                                                <FontAwesomeIcon icon={faClock} style={{ marginRight: '0.35rem', opacity: 0.6 }} />
                                                {new Date(fav.match?.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
