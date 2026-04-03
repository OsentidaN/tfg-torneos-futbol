import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTournaments, getMatches } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faGlobe, faEarthEurope, faChartLine, faCodeCompare, faCalendarDays, faUsers } from '@fortawesome/free-solid-svg-icons';

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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '3rem', marginBottom: '2rem' }}>
                            <FontAwesomeIcon icon={faTrophy} style={{ fontSize: '2rem', color: 'var(--accent-gold)' }} />
                            <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, margin: 0 }}>TORNEOS DISPONIBLES</h2>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
                            {tournaments.map((t: any) => (
                                <Link to={`/torneos?tipo=${t.type}`} key={t.id} style={{ textDecoration: 'none', flex: '1 1 350px', maxWidth: '450px' }}>
                                    <div className="card card-link" style={{ padding: '2.5rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', marginBottom: '1rem', color: t.type === 'WORLD_CUP' ? 'var(--accent-gold)' : 'var(--accent)' }}>
                                            <FontAwesomeIcon icon={t.type === 'WORLD_CUP' ? faGlobe : faEarthEurope} />
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>{t.name}</div>
                                        <span className={`badge ${t.type === 'WORLD_CUP' ? 'badge-gold' : 'badge-green'}`} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                                            {t._count?.seasons} ediciones
                                        </span>
                                        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                            {t.type === 'WORLD_CUP'
                                                ? 'El torneo de fútbol más importante del mundo, celebrado cada 4 años.'
                                                : 'El campeonato continental de fútbol de la UEFA, celebrado cada 4 años.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                            {[
                                { to: '/estadisticas', icon: faChartLine, label: 'Estadísticas', desc: 'Clasificaciones y tops' },
                                { to: '/comparar', icon: faCodeCompare, label: 'Comparar equipos', desc: 'Enfrentamientos directos' },
                                { to: '/partidos', icon: faCalendarDays, label: 'Todos los partidos', desc: 'Historial completo' },
                                { to: '/equipos', icon: faUsers, label: 'Equipos', desc: 'Todos los participantes' },
                            ].map(item => (
                                <Link to={item.to} key={item.label} style={{ textDecoration: 'none', flex: '1 1 210px', maxWidth: '260px' }}>
                                    <div className="card card-link" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                                        <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--accent)' }}>
                                            <FontAwesomeIcon icon={item.icon} />
                                        </div>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem', fontFamily: 'Outfit' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
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
