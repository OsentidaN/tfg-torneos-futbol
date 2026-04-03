import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeams } from '../services/api';
import { translateCountryName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';

export default function Equipos() {
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all teams once to allow local searching by translated names
        getTeams({ limit: 500 })
            .then(r => setAllTeams(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Filter teams locally by both English and Spanish names
    const filteredTeams = allTeams.filter(team => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        const translatedName = translateCountryName(team.name).toLowerCase();
        const originalName = team.name.toLowerCase();
        
        return translatedName.includes(searchLower) || originalName.includes(searchLower);
    });

    return (
        <div className="container page">
            <div style={{ marginBottom: '4rem' }}>
                <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <FontAwesomeIcon icon={faShieldHalved} style={{ color: 'var(--accent)' }} /> 
                    Equipos
                </h1>
                <p className="page-subtitle" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Todos los equipos participantes en Mundiales y Eurocopas · Total: {filteredTeams.length}
                </p>
            </div>

            {/* Buscador */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '4rem', padding: '2rem', background: 'var(--bg-glass)', borderRadius: '16px', border: '1px solid var(--border-accent)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '450px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Buscar Selección</label>
                    <input
                        className="input"
                        style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }}
                        placeholder="Ej: España, Brasil, Alemania..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state"><div className="spinner" /></div>
            ) : filteredTeams.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">🛡️</span><p>No se encontraron equipos</p></div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', 
                    gap: '2rem' 
                }}>
                    {filteredTeams.map((team: any) => (
                        <Link to={`/equipos/${team.id}`} key={team.id} style={{ textDecoration: 'none' }}>
                            <div className="card card-link" style={{ padding: '2.5rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-accent)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', minWidth: 0 }}>
                                    {team.flagUrl
                                        ? <img src={team.flagUrl} alt={team.name} style={{ width: 80, height: 54, flexShrink: 0, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                                        : <div className="flag-placeholder" style={{ width: 80, height: 54, flexShrink: 0, fontSize: '2rem' }}>?</div>}
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ 
                                            fontWeight: 800, 
                                            fontSize: '1.6rem', 
                                            color: 'var(--text-primary)', 
                                            marginBottom: '0.4rem',
                                            lineHeight: 1.2,
                                            wordBreak: 'normal',
                                            overflowWrap: 'break-word'
                                        }}>
                                            {translateCountryName(team.name)}
                                        </div>
                                        <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>{team.code}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                                    {team._count?.matchesHome != null && (
                                        <span className="badge badge-green" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                            {team._count.matchesHome + team._count.matchesAway} partidos
                                        </span>
                                    )}
                                    {team.confederation && (
                                        <span className="badge badge-purple" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>{team.confederation}</span>
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
