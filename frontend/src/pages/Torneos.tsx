import { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { getTournaments } from '../services/api';

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
            <h1 className="page-title">🏆 Torneos</h1>
            <p className="page-subtitle">Todas las ediciones de la Copa Mundial y la Eurocopa</p>

            {loading ? (
                <div className="loading-state"><div className="spinner" /></div>
            ) : (
                tournaments
                    .filter(t => !filterType || t.type === filterType)
                    .map((t: any) => (
                        <section key={t.id} style={{ marginBottom: '3rem' }}>
                            <p className="section-title">
                                {t.type === 'WORLD_CUP' ? '🌍' : '🇪🇺'} {t.name}
                            </p>
                            <div className="grid-3">
                                {(t.seasons ? seasonsByTournament(t.seasons) : []).map((s: any) => (
                                    <Link 
                                        to={`/torneos/${s.id}`} 
                                        state={{ from: location.pathname + location.search }}
                                        key={s.id} 
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="card card-link">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                <span style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800 }}>{s.year}</span>
                                                <span className={`badge ${t.type === 'WORLD_CUP' ? 'badge-gold' : 'badge-blue'}`}>
                                                    {t.type === 'WORLD_CUP' ? 'Mundial' : 'Eurocopa'}
                                                </span>
                                            </div>
                                            {s.hostCountry && (
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                                    📍 {s.hostCountry}
                                                </p>
                                            )}
                                            {s.winner && (
                                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>🏆 {s.winner}</p>
                                            )}
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                                {s._count?.matches != null && (
                                                    <span className="badge badge-green">{s._count.matches} partidos</span>
                                                )}
                                                {s._count?.seasonTeams != null && (
                                                    <span className="badge badge-purple">{s._count.seasonTeams} equipos</span>
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
