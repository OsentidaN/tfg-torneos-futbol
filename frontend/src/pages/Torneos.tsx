import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { getTournaments } from '../services/api';
import { translateCountryName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faGlobe, faEarthEurope } from '@fortawesome/free-solid-svg-icons';
import { SkeletonGrid } from '../components/Skeleton';

export default function Torneos() {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const filterType = searchParams.get('tipo');
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTournaments()
            .then(r => setTournaments(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const seasonsByTournament = (seasons: any[]) =>
        [...seasons].sort((a, b) => b.year - a.year);

    return (
        <div className="container page">
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <FontAwesomeIcon icon={faTrophy} style={{ fontSize: '2.5rem', color: 'var(--accent-gold)' }} />
                    <h1 className="page-title" style={{ margin: 0 }}>TORNEOS</h1>
                </div>
                <p className="page-subtitle">Explora todas las ediciones históricas y sus campeones</p>
            </div>

            {loading ? (
                <div style={{ marginTop: '2rem' }}>
                    <SkeletonGrid count={6} />
                </div>
            ) : (
                tournaments
                    .filter(t => !filterType || t.type === filterType)
                    .map((t: any) => (
                        <section key={t.id} style={{ marginBottom: '5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginBottom: '2.5rem' }}>
                                <FontAwesomeIcon
                                    icon={t.type === 'WORLD_CUP' ? faGlobe : faEarthEurope}
                                    style={{ fontSize: '2.2rem', color: t.type === 'WORLD_CUP' ? 'var(--accent-gold)' : 'var(--accent)' }}
                                />
                                <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                                    {t.name}
                                </h2>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem' }}>
                                {(t.seasons ? seasonsByTournament(t.seasons) : []).map((s: any) => (
                                    <Link
                                        to={`/torneos/${s.id}`}
                                        state={{ from: location.pathname + location.search }}
                                        key={s.id}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="card card-link" style={{ padding: '2rem', width: '350px', flex: '0 0 350px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                                                <span style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.year}</span>
                                                <span className={`badge ${t.type === 'WORLD_CUP' ? 'badge-gold' : 'badge-green'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                                    {t.type === 'WORLD_CUP' ? 'Mundial' : 'Eurocopa'}
                                                </span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                                {s.hostCountry && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-secondary)' }}>
                                                        <FontAwesomeIcon
                                                            icon={t.type === 'WORLD_CUP' ? faGlobe : faEarthEurope}
                                                            style={{ width: '16px', color: 'var(--accent)' }}
                                                        />
                                                        <span style={{ fontSize: '1rem' }}>
                                                            {s.hostCountry === 'World' 
                                                                ? (t.type === 'WORLD_CUP' ? 'Mundial' : 'Europa')
                                                                : translateCountryName(s.hostCountry)}
                                                        </span>
                                                    </div>
                                                )}

                                                {s.winner && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(46, 160, 67, 0.08)', padding: '0.6rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                                                        <FontAwesomeIcon icon={faTrophy} style={{ color: 'var(--accent-gold)', width: '18px' }} />
                                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{translateCountryName(s.winner)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                                {s._count?.matches != null && (
                                                    <span className="badge badge-green" style={{ opacity: 0.8 }}>{s._count.matches} partidos</span>
                                                )}
                                                {s._count?.seasonTeams != null && (
                                                    <span className="badge badge-purple" style={{ opacity: 0.8 }}>{s._count.seasonTeams} equipos</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))
            )}
        </div>
    );
}
