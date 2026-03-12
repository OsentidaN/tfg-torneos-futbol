import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { getTeams, compareTeams, getTeamStats } from '../services/api';

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
        getTeams({ limit: 200 }).then(r => setTeams(r.data.data)).catch(console.error);
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
            <div className="stat-row">
                <span className={`value ${win1 ? 'win' : ''}`}>{v1 ?? '-'}</span>
                <span className="label" style={{ textAlign: 'center', flex: 2 }}>{label}</span>
                <span className={`value ${win2 ? 'win' : ''}`} style={{ textAlign: 'left' }}>{v2 ?? '-'}</span>
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
            ⚠️ {teamName} no ha participado en {selectedType === 'WORLD_CUP' ? 'la Copa del Mundo' : 'la Eurocopa'}.
        </div>
    );

    return (
        <div className="container page">
            <h1 className="page-title">⚖️ Comparar Equipos</h1>
            <p className="page-subtitle">Compara estadísticas históricas y enfrentamientos directos</p>

            {/* Selector */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="compare-layout" style={{ alignItems: 'center' }}>
                    <select className="select" value={team1Id} onChange={e => setTeam1Id(e.target.value)}>
                        <option value="">Equipo 1…</option>
                        {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="vs-divider">VS</div>
                    <select className="select" value={team2Id} onChange={e => setTeam2Id(e.target.value)}>
                        <option value="">Equipo 2…</option>
                        {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                {error && <p style={{ color: 'var(--accent-warn)', textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}
                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                    <button className="btn btn-primary" onClick={handleCompare} disabled={loading}>
                        {loading
                            ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Comparando…</>
                            : '⚖️ Comparar'}
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="tabs" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
                <button 
                    className={`tab-btn ${selectedType === 'WORLD_CUP' ? 'active' : ''}`} 
                    onClick={() => setSelectedType('WORLD_CUP')}
                >🌎 Mundial</button>
                <button 
                    className={`tab-btn ${selectedType === 'EURO_CUP' ? 'active' : ''}`} 
                    onClick={() => setSelectedType('EURO_CUP')}
                >🇪🇺 Eurocopa</button>
            </div>

            {/* Results */}
            {result && t1 && t2 && (
                <div>
                    {/* Team Headers */}
                    <div className="compare-layout" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                        <Link to={`/equipos/${t1.id}`} state={{ from: location.pathname + location.search }}>
                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <div>
                                    <div style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 800 }}>{t1.name}</div>
                                </div>
                                {t1.flagUrl
                                    ? <img src={t1.flagUrl} alt="" style={{ width: 48, height: 34, borderRadius: 4 }} />
                                    : <div className="flag-placeholder" style={{ width: 48, height: 34 }}>?</div>}
                            </div>
                        </Link>
                        <div />
                        <Link to={`/equipos/${t2.id}`} state={{ from: location.pathname + location.search }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {t2.flagUrl
                                    ? <img src={t2.flagUrl} alt="" style={{ width: 48, height: 34, borderRadius: 4 }} />
                                    : <div className="flag-placeholder" style={{ width: 48, height: 34 }}>?</div>}
                                <div>
                                    <div style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 800 }}>{t2.name}</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="grid-2" style={{ marginBottom: '2rem', alignItems: 'stretch' }}>
                        {/* Stats Section */}
                        <div className="card">
                            <p className="section-title">📊 Estadísticas</p>
                            
                            {team1Stats?.matchesPlayed === 0 || team2Stats?.matchesPlayed === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {team1Stats?.matchesPlayed === 0 && <NoParticipationMessage teamName={t1.name} />}
                                    {team2Stats?.matchesPlayed === 0 && <NoParticipationMessage teamName={t2.name} />}
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                                        Selecciona otro tipo de torneo para ver estadísticas.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <StatRow label="Partidos Jugados" v1={team1Stats.matchesPlayed} v2={team2Stats.matchesPlayed} />
                                    <StatRow label="Victorias" v1={team1Stats.wins} v2={team2Stats.wins} />
                                    <StatRow label="Empates" v1={team1Stats.draws} v2={team2Stats.draws} />
                                    <StatRow label="Derrotas" v1={team1Stats.losses} v2={team2Stats.losses} higherWins={false} />
                                    <StatRow label="Goles a Favor" v1={team1Stats.goalsFor} v2={team2Stats.goalsFor} />
                                    <StatRow label="Goles en Contra" v1={team1Stats.goalsAgainst} v2={team2Stats.goalsAgainst} higherWins={false} />
                                    <StatRow label="% Victorias" v1={team1Stats.winPercentage} v2={team2Stats.winPercentage} />
                                    <StatRow label="Títulos" v1={team1Stats.titles} v2={team2Stats.titles} />
                                </>
                            )}
                        </div>

                        {/* H2H */}
                        <div className="card">
                            <p className="section-title">⚔️ Enfrentamientos Directos</p>
                            {h2h?.totalMatches === 0 ? (
                                <div className="empty-state" style={{ padding: '2rem' }}>
                                    <span className="empty-icon">🤝</span>
                                    <p>Sin enfrentamientos registrados en este torneo</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.25rem', textAlign: 'center' }}>
                                        <div>
                                            <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-2)' }}>{h2h?.team1Wins}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Victorias {t1.name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{h2h?.draws}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Empates</div>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)' }}>{h2h?.team2Wins}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Victorias {t2.name}</div>
                                        </div>
                                    </div>
                                    <p className="section-title">Últimos partidos</p>
                                    {h2h?.matches?.map((m: any) => (
                                        <Link to={`/partidos/${m.id}`} key={m.id} style={{ textDecoration: 'none' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-secondary)' }}>{m.homeTeam?.name}</span>
                                                <span style={{ fontWeight: 700, fontFamily: 'Outfit' }}>{m.homeGoals} – {m.awayGoals}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}>{m.awayTeam?.name}</span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.season?.year}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
