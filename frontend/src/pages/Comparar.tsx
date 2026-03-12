import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { getTeams, compareTeams, getTeamStats } from '../services/api';
import { translateCountryName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faScaleBalanced, faGlobe, faEarthEurope } from '@fortawesome/free-solid-svg-icons';

export default function Comparar() {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [teams, setTeams] = useState<any[]>([]);
    const [team1Id, setTeam1Id] = useState<string>(searchParams.get('team1') || '');
    const [team2Id, setTeam2Id] = useState<string>(searchParams.get('team2') || '');
    const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'WORLD_CUP');
    const [result, setResult] = useState<any>(null);
    const [team1Stats, setTeam1Stats] = useState<any>(null);
    const [team2Stats, setTeam2Stats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const didAuto = useRef(false);

    useEffect(() => {
        getTeams({ limit: 200 }).then(r => {
            const sortedTeams = [...r.data.data].sort((a: any, b: any) => 
                translateCountryName(a.name).localeCompare(translateCountryName(b.name), 'es', { sensitivity: 'base' })
            );
            setTeams(sortedTeams);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (team1Id && team2Id && !didAuto.current) { didAuto.current = true; handleCompare(); }
    }, [teams]);

    useEffect(() => {
        if (team1Id && team2Id) {
            handleCompare();
            setSearchParams({ team1: team1Id, team2: team2Id, type: selectedType });
        }
    }, [selectedType]);

    const handleCompare = async () => {
        if (!team1Id || !team2Id) { setError('Selecciona dos equipos'); return; }
        if (team1Id === team2Id) { setError('Selecciona equipos diferentes'); return; }
        setError(''); setLoading(true);
        try {
            const [compareRes, stats1Res, stats2Res] = await Promise.all([
                compareTeams(Number(team1Id), Number(team2Id), selectedType || undefined),
                getTeamStats(Number(team1Id), selectedType ? { type: selectedType } : undefined),
                getTeamStats(Number(team2Id), selectedType ? { type: selectedType } : undefined),
            ]);
            setResult(compareRes.data.data);
            setTeam1Stats(stats1Res.data.data.stats);
            setTeam2Stats(stats2Res.data.data.stats);
        } catch {
            setError('Error al comparar equipos');
        } finally {
            setLoading(false);
        }
    };

    const t1 = result?.team1;
    const t2 = result?.team2;
    const h2h = result?.headToHead;

    const StatRow = ({ label, v1, v2, higherWins = true }: { label: string; v1: number; v2: number; higherWins?: boolean }) => {
        const win1 = higherWins ? v1 > v2 : v1 < v2;
        const win2 = higherWins ? v2 > v1 : v2 < v1;
        return (
            <div className="stat-row" style={{ padding: '0.8rem 0', display: 'flex', alignItems: 'center' }}>
                <span className={`value ${win1 ? 'win' : ''}`} style={{ fontSize: '1.2rem', minWidth: '60px', textAlign: 'right', fontWeight: 800 }}>{v1 ?? '-'}</span>
                <span className="label" style={{ textAlign: 'center', flex: 2, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                <span className={`value ${win2 ? 'win' : ''}`} style={{ fontSize: '1.2rem', minWidth: '60px', textAlign: 'left', fontWeight: 800 }}>{v2 ?? '-'}</span>
            </div>
        );
    };

    const NoParticipationMessage = ({ teamName }: { teamName: string }) => (
        <div style={{ 
            padding: '1.5rem', 
            background: 'rgba(247, 129, 102, 0.1)', 
            border: '1px solid var(--accent-warn)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            color: 'var(--accent-warn)',
            fontSize: '0.9rem',
            fontWeight: 500
        }}>
            ⚠️ {translateCountryName(teamName)} no ha participado en {selectedType === 'WORLD_CUP' ? 'la Copa del Mundo' : 'la Eurocopa'}.
        </div>
    );

    return (
        <div className="container page">
            <div style={{ marginBottom: '4rem' }}>
                <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <FontAwesomeIcon icon={faScaleBalanced} style={{ color: 'var(--accent)' }} /> 
                    Comparar Equipos
                </h1>
                <p className="page-subtitle" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Compara estadísticas históricas y enfrentamientos directos en Mundiales y Eurocopas
                </p>
            </div>

            {/* Selector Card */}
            <div className="card" style={{ padding: '3rem', marginBottom: '4rem', background: 'rgba(22, 33, 24, 0.4)', border: '1px solid var(--border-accent)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '2.5rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Selección 1</label>
                        <select className="select" style={{ padding: '1rem 1.5rem', fontSize: '1.1rem', height: 'auto' }} value={team1Id} onChange={e => setTeam1Id(e.target.value)}>
                            <option value="">Selecciona equipo…</option>
                            {teams.map((t: any) => <option key={t.id} value={t.id}>{translateCountryName(t.name)}</option>)}
                        </select>
                    </div>
                    
                    <div className="vs-divider" style={{ fontSize: '2rem', marginTop: '1.5rem', color: 'var(--accent-warn)' }}>VS</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Selección 2</label>
                        <select className="select" style={{ padding: '1rem 1.5rem', fontSize: '1.1rem', height: 'auto' }} value={team2Id} onChange={e => setTeam2Id(e.target.value)}>
                            <option value="">Selecciona equipo…</option>
                            {teams.map((t: any) => <option key={t.id} value={t.id}>{translateCountryName(t.name)}</option>)}
                        </select>
                    </div>
                </div>
                
                {error && <p style={{ color: 'var(--accent-warn)', textAlign: 'center', marginTop: '1.5rem', fontSize: '1rem', fontWeight: 600 }}>{error}</p>}
                
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }} onClick={handleCompare} disabled={loading}>
                        {loading
                            ? <><div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Comparando…</>
                            : <><FontAwesomeIcon icon={faScaleBalanced} /> Comparar Ahora</>}
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="tabs" style={{ justifyContent: 'center', marginBottom: '4rem', gap: '1rem', borderBottom: 'none' }}>
                <button 
                    className={`tab-btn ${selectedType === 'WORLD_CUP' ? 'active' : ''}`} 
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', border: selectedType === 'WORLD_CUP' ? '1px solid var(--accent)' : '1px solid transparent' }}
                    onClick={() => setSelectedType('WORLD_CUP')}
                >
                    <FontAwesomeIcon icon={faGlobe} style={{ marginRight: '0.5rem' }} /> Mundial
                </button>
                <button 
                    className={`tab-btn ${selectedType === 'EURO_CUP' ? 'active' : ''}`} 
                    style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '12px', border: selectedType === 'EURO_CUP' ? '1px solid var(--accent)' : '1px solid transparent' }}
                    onClick={() => setSelectedType('EURO_CUP')}
                >
                    <FontAwesomeIcon icon={faEarthEurope} style={{ marginRight: '0.5rem' }} /> Eurocopa
                </button>
            </div>

            {/* Results */}
            {result && t1 && t2 && (
                <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Team Headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '3rem', alignItems: 'center', marginBottom: '3rem', padding: '0 2rem' }}>
                        <Link to={`/equipos/${t1.id}`} state={{ from: location.pathname + location.search }} style={{ textDecoration: 'none' }}>
                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'flex-end' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{translateCountryName(t1.name)}</div>
                                </div>
                                {t1.flagUrl
                                    ? <img src={t1.flagUrl} alt="" style={{ width: 80, height: 54, borderRadius: 6, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
                                    : <div className="flag-placeholder" style={{ width: 80, height: 54 }}>?</div>}
                            </div>
                        </Link>
                        
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-muted)', opacity: 0.5 }}>VS</div>
                        
                        <Link to={`/equipos/${t2.id}`} state={{ from: location.pathname + location.search }} style={{ textDecoration: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                {t2.flagUrl
                                    ? <img src={t2.flagUrl} alt="" style={{ width: 80, height: 54, borderRadius: 6, objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
                                    : <div className="flag-placeholder" style={{ width: 80, height: 54 }}>?</div>}
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{translateCountryName(t2.name)}</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', marginBottom: '4rem', gap: '2rem' }}>
                        {/* Stats Section */}
                        <div className="card" style={{ padding: '2.5rem', background: 'rgba(22, 33, 24, 0.6)', border: '1px solid var(--border-accent)' }}>
                            <p className="section-title" style={{ fontSize: '1.4rem', marginBottom: '2rem' }}>📊 Estadísticas {selectedType === 'WORLD_CUP' ? 'Mundiales' : 'Eurocopa'}</p>
                            
                            {team1Stats?.matchesPlayed === 0 || team2Stats?.matchesPlayed === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem 0' }}>
                                    {team1Stats?.matchesPlayed === 0 && <NoParticipationMessage teamName={t1.name} />}
                                    {team2Stats?.matchesPlayed === 0 && <NoParticipationMessage teamName={t2.name} />}
                                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        Selecciona otro tipo de torneo para ver el duelo.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <StatRow label="Partidos Jugados" v1={team1Stats.matchesPlayed} v2={team2Stats.matchesPlayed} />
                                    <StatRow label="Victorias" v1={team1Stats.wins} v2={team2Stats.wins} />
                                    <StatRow label="Empates" v1={team1Stats.draws} v2={team2Stats.draws} />
                                    <StatRow label="Derrotas" v1={team1Stats.losses} v2={team2Stats.losses} higherWins={false} />
                                    <StatRow label="Goles a Favor" v1={team1Stats.goalsFor} v2={team2Stats.goalsFor} />
                                    <StatRow label="Goles en Contra" v1={team1Stats.goalsAgainst} v2={team2Stats.goalsAgainst} higherWins={false} />
                                    <StatRow label="% Victorias" v1={team1Stats.winPercentage} v2={team2Stats.winPercentage} />
                                    <StatRow label="Títulos" v1={team1Stats.titles} v2={team2Stats.titles} />
                                </div>
                            )}
                        </div>

                        {/* H2H */}
                        <div className="card" style={{ padding: '2.5rem', background: 'rgba(22, 33, 24, 0.6)', border: '1px solid var(--border-accent)' }}>
                            <p className="section-title" style={{ fontSize: '1.4rem', marginBottom: '2rem' }}>⚔️ Face-to-Face</p>
                            {h2h?.totalMatches === 0 ? (
                                <div className="empty-state" style={{ padding: '4rem 2rem' }}>
                                    <span className="empty-icon" style={{ fontSize: '3rem' }}>🤝</span>
                                    <p style={{ fontSize: '1.1rem' }}>Sin enfrentamientos registrados en este torneo</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px' }}>
                                        <div>
                                            <div style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-2)' }}>{h2h?.team1Wins}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{translateCountryName(t1.name)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-secondary)' }}>{h2h?.draws}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Empates</div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-purple)' }}>{h2h?.team2Wins}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{translateCountryName(t2.name)}</div>
                                        </div>
                                    </div>
                                    <p className="section-title" style={{ fontSize: '1.1rem', color: 'var(--accent-2)', marginBottom: '1.5rem' }}>Últimos Duelos</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {h2h?.matches?.map((m: any) => (
                                            <Link to={`/partidos/${m.id}`} key={m.id} style={{ textDecoration: 'none' }}>
                                                <div className="match-row-soft" style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between', 
                                                    alignItems: 'center', 
                                                    padding: '1rem 1.5rem', 
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '8px',
                                                    fontSize: '1rem',
                                                    transition: 'all 0.2s ease'
                                                }}>
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>{translateCountryName(m.homeTeam?.name)}</span>
                                                    <span style={{ fontWeight: 800, fontFamily: 'Outfit', fontSize: '1.1rem', padding: '0 1.5rem' }}>{m.homeGoals} – {m.awayGoals}</span>
                                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, flex: 1, textAlign: 'right' }}>{translateCountryName(m.awayTeam?.name)}</span>
                                                    <span style={{ color: 'var(--accent-2)', fontSize: '0.9rem', fontWeight: 700, marginLeft: '1.5rem', minWidth: '45px' }}>{m.season?.year}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
