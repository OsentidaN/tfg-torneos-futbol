import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTournaments, getMatches } from '../services/api';

export default function Home() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [totalMatches, setTotalMatches] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getTournaments(),
            getMatches({ limit: 1, page: 1 })
        ])
            .then(([t, m]) => {
                setTournaments(t.data.data);
                setTotalMatches(m.data.total ?? 0);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Calcular totales a partir de los torneos
    const totalEdiciones = tournaments.reduce((acc: number, t: any) => acc + (t._count?.seasons ?? 0), 0);

    return (
        <div>
            {/* HERO */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title" style={{ textTransform: 'uppercase' }}>
                        Fútbol en <span className="gradient-text">Datos</span>
                    </h1>
                    <p className="hero-subtitle">
                        Explora estadísticas históricas de la Copa Mundial y la Eurocopa. Compara equipos, analiza enfrentamientos y descubre curiosidades de los grandes torneos.
                    </p>
                </div>
            </section>

            {/* STATS */}
            <div className="container page" style={{ paddingTop: 0 }}>
                {loading ? (
                    <div className="loading-state"><div className="spinner" /></div>
                ) : (
                    <>
                        {/* Summary boxes */}
                        <div className="grid-4" style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div className="stat-box" style={{ flex: '1 1 200px', maxWidth: '250px' }}>
                                <div className="value">{tournaments.length}</div>
                                <div className="label">Torneos</div>
                            </div>
                            <div className="stat-box" style={{ flex: '1 1 200px', maxWidth: '250px' }}>
                                <div className="value">{totalEdiciones}</div>
                                <div className="label">Ediciones</div>
                            </div>
                            <div className="stat-box" style={{ flex: '1 1 200px', maxWidth: '250px' }}>
                                <div className="value">{totalMatches.toLocaleString()}</div>
                                <div className="label">Partidos</div>
                            </div>
                        </div>

                        {/* Torneos Cards */}
                        <p className="section-title">🏆 Torneos Disponibles</p>
                        <div className="grid-2">
                            {tournaments.map((t: any) => (
                                <Link to={`/torneos?tipo=${t.type}`} key={t.id} style={{ textDecoration: 'none' }}>
                                    <div className="card card-link">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{ fontSize: '2.5rem' }}>
                                                {t.type === 'WORLD_CUP' ? '🌍' : '🇪🇺'}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t.name}</div>
                                                <span className={`badge ${t.type === 'WORLD_CUP' ? 'badge-gold' : 'badge-blue'}`}>
                                                    {t._count?.seasons} ediciones
                                                </span>
                                            </div>
                                        </div>
                                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {t.type === 'WORLD_CUP'
                                                ? 'El torneo de fútbol más importante del mundo, celebrado cada 4 años.'
                                                : 'El campeonato continental de fútbol de la UEFA, celebrado cada 4 años.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {[
                                { to: '/estadisticas', icon: '📊', label: 'Rankings', desc: 'Clasificaciones y tops' },
                                { to: '/comparar', icon: '⚖️', label: 'Comparar equipos', desc: 'Enfrentamientos directos' },
                                { to: '/partidos', icon: '📋', label: 'Todos los partidos', desc: 'Historial completo' },
                                { to: '/equipos', icon: '🛡️', label: 'Equipos', desc: 'Todos los participantes' },
                            ].map(item => (
                                <Link to={item.to} key={item.label} style={{ textDecoration: 'none' }}>
                                    <div className="card card-link" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
