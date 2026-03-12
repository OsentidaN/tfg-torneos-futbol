import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeams } from '../services/api';

export default function Equipos() {
    const [teams, setTeams] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTeams({ search, limit: 100 })
            .then(r => setTeams(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [search]);

    return (
        <div className="container page">
            <h1 className="page-title">🛡️ Equipos</h1>
            <p className="page-subtitle">Todos los equipos participantes en Mundiales y Eurocopas</p>

            <input
                className="input"
                style={{ maxWidth: 380, marginBottom: '2rem' }}
                placeholder="🔍 Buscar equipo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {loading ? (
                <div className="loading-state"><div className="spinner" /></div>
            ) : teams.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">🛡️</span><p>No se encontraron equipos</p></div>
            ) : (
                <div className="grid-3">
                    {teams.map((team: any) => (
                        <Link to={`/equipos/${team.id}`} key={team.id} style={{ textDecoration: 'none' }}>
                            <div className="card card-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                    {team.flagUrl
                                        ? <img src={team.flagUrl} alt={team.name} style={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                                        : <div className="flag-placeholder" style={{ width: 40, height: 28 }}>?</div>}
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{team.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{team.code}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {team._count?.matchesHome != null && (
                                        <span className="badge badge-blue">
                                            {team._count.matchesHome + team._count.matchesAway} partidos
                                        </span>
                                    )}
                                    {team.confederation && (
                                        <span className="badge badge-purple">{team.confederation}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
