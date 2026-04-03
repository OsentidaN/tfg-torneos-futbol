import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getMatches, getSeasons } from '../services/api';
import { translateCountryName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faEarthEurope, faCalendarAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const STAGES: Record<string, string> = {
    GROUP: 'Fase de Grupos', ROUND_OF_16: 'Octavos de Final', QUARTER_FINAL: 'Cuartos de Final',
    SEMI_FINAL: 'Semifinales', THIRD_PLACE: '3er Puesto', FINAL: 'Gran Final'
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    FINISHED: { label: 'Finalizado', cls: 'badge-green' },
    SCHEDULED: { label: 'Programado', cls: 'badge-blue' },
    LIVE: { label: '🔴 En Vivo', cls: 'badge-red' },
    CANCELLED: { label: 'Cancelado', cls: 'badge-red' },
};

export default function Partidos() {
    const [matches, setMatches] = useState<any[]>([]);
    const [seasons, setSeasons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize filters from URL
    const filters = {
        seasonId: searchParams.get('seasonId') || '',
        stage: searchParams.get('stage') || '',
        page: parseInt(searchParams.get('page') || '1', 10)
    };

    const setFilters = (updater: (prev: any) => any) => {
        const next = updater(filters);
        const newParams: any = {};
        if (next.seasonId) newParams.seasonId = next.seasonId;
        if (next.stage) newParams.stage = next.stage;
        if (next.page > 1) newParams.page = String(next.page);
        setSearchParams(newParams);
    };

    useEffect(() => {
        getSeasons().then(r => {
            const sorted = [...r.data.data].sort((a: any, b: any) => {
                const nameA = a.tournament?.name || '';
                const nameB = b.tournament?.name || '';
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return b.year - a.year;
            });
            setSeasons(sorted);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: any = { limit: 30, page: filters.page };
        if (filters.seasonId) params.seasonId = filters.seasonId;
        if (filters.stage) params.stage = filters.stage;
        getMatches(params).then(r => {
            setMatches(r.data.data);
            setTotal(r.data.total);
        }).catch(console.error).finally(() => setLoading(false));
    }, [filters.seasonId, filters.stage, filters.page]);

    const stageOrder = ['GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'];

    return (
        <div className="container page">
            <div style={{ marginBottom: '4rem' }}>
                <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <FontAwesomeIcon icon={faCalendarAlt} style={{ color: 'var(--accent)' }} /> 
                    Partidos
                </h1>
                <p className="page-subtitle" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Historial completo de competiciones mundiales y europeas · Total: {total.toLocaleString()}
                </p>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '4rem', flexWrap: 'wrap', padding: '2rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-accent)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Torneo y Edición</label>
                    <select className="select" style={{ width: 'auto', minWidth: 250, padding: '0.8rem 1.5rem' }}
                        value={filters.seasonId}
                        onChange={e => setFilters(f => ({ ...f, seasonId: e.target.value, page: 1 }))}>
                        <option value="">Todas las ediciones</option>
                        {seasons.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.tournament?.name} {s.year}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fase del Torneo</label>
                    <select className="select" style={{ width: 'auto', minWidth: 200, padding: '0.8rem 1.5rem' }}
                        value={filters.stage}
                        onChange={e => setFilters(f => ({ ...f, stage: e.target.value, page: 1 }))}>
                        <option value="">Todas las fases</option>
                        {Object.entries(STAGES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    {(filters.seasonId || filters.stage || filters.page > 1) && (
                        <button className="btn btn-ghost" style={{ padding: '0.8rem 1.5rem', fontWeight: 600 }} onClick={() => setSearchParams({})}>
                            ✕ Limpiar Filtros
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-state"><div className="spinner" /></div>
            ) : matches.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">⚽</span><p>No se encontraron partidos con estos filtros</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matches.map((m: any) => {
                        const isGroup = m.stage === 'GROUP';
                        const isFinished = m.status === 'FINISHED';
                        const st = STATUS_BADGE[m.status] || STATUS_BADGE.SCHEDULED;
                        
                        const homeGoals = m.homeGoals ?? 0;
                        const awayGoals = m.awayGoals ?? 0;
                        const homeWin = isFinished && homeGoals > awayGoals;
                        const awayWin = isFinished && awayGoals > homeGoals;
                        const isDraw = isFinished && homeGoals === awayGoals;
                        
                        const homePenaltyWin = isFinished && isDraw && (m.homeGoalsPenalty ?? 0) > (m.awayGoalsPenalty ?? 0);
                        const awayPenaltyWin = isFinished && isDraw && (m.awayGoalsPenalty ?? 0) > (m.homeGoalsPenalty ?? 0);

                        let homeColor = 'var(--text-primary)';
                        let awayColor = 'var(--text-primary)';
                        let homeWeight = 500;
                        let awayWeight = 500;

                        if (isGroup) {
                            if (isDraw) {
                                homeColor = 'var(--accent-2)';
                                awayColor = 'var(--accent-2)';
                                homeWeight = 900;
                                awayWeight = 900;
                            } else if (homeWin) {
                                homeColor = 'var(--accent-2)';
                                homeWeight = 900;
                                awayColor = 'var(--text-muted)';
                            } else if (awayWin) {
                                awayColor = 'var(--accent-2)';
                                awayWeight = 900;
                                homeColor = 'var(--text-muted)';
                            }
                        } else {
                            if (homeWin) {
                                homeColor = 'var(--accent-2)';
                                homeWeight = 900;
                                awayColor = 'var(--text-muted)';
                            } else if (awayWin) {
                                awayColor = 'var(--accent-2)';
                                awayWeight = 900;
                                homeColor = 'var(--text-muted)';
                            } else if (isDraw) {
                                // Knockout draw: Highlight penalty winner in WHITE, loser MUTED
                                if (homePenaltyWin) {
                                    homeColor = 'var(--accent-2)';
                                    homeWeight = 900;
                                    awayColor = 'var(--text-muted)';
                                } else if (awayPenaltyWin) {
                                    awayColor = 'var(--accent-2)';
                                    awayWeight = 900;
                                    homeColor = 'var(--text-muted)';
                                }
                                // If no penalty data yet, keep both white but normal weight
                            }
                        }

                        const tournamentName = m.season?.tournament?.name || '';
                        const isEuro = tournamentName.includes('Euro');

                        return (
                            <Link
                                to={`/partidos/${m.id}`}
                                state={{ from: location.pathname + location.search }}
                                key={m.id}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="match-card" style={{ padding: '1.8rem 2.5rem', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                    <div style={{ flex: 1.5, textAlign: 'right' }}>
                                        <div className="team-flag" style={{ justifyContent: 'flex-end', gap: '1.2rem' }}>
                                            <span className="team-name" style={{ fontSize: '1.2rem', color: homeColor, fontWeight: homeWeight }}>
                                                {translateCountryName(m.homeTeam?.name)}
                                            </span>
                                            {m.homeTeam?.flagUrl
                                                ? <img src={m.homeTeam.flagUrl} alt="" style={{ width: 36, height: 24, borderRadius: '4px' }} />
                                                : <div className="flag-placeholder">?</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', minWidth: '140px' }}>
                                        <div className="match-score" style={{ fontSize: '2rem', padding: '0.5rem 1.5rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-accent)' }}>
                                            {isFinished ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
                                        </div>
                                        <span className={`badge ${st.cls}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>{st.label}</span>
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <div className="team-flag" style={{ gap: '1.2rem' }}>
                                            {m.awayTeam?.flagUrl
                                                ? <img src={m.awayTeam.flagUrl} alt="" style={{ width: 36, height: 24, borderRadius: '4px' }} />
                                                : <div className="flag-placeholder">?</div>}
                                            <span className="team-name" style={{ fontSize: '1.2rem', color: awayColor, fontWeight: awayWeight }}>
                                                {translateCountryName(m.awayTeam?.name)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: 200, textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                                        <div style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.6rem' }}>
                                            <FontAwesomeIcon icon={isEuro ? faEarthEurope : faGlobe} style={{ color: isEuro ? 'var(--accent)' : 'var(--accent-gold)', fontSize: '0.9rem' }} />
                                            {m.season?.tournament?.name} {m.season?.year}
                                        </div>
                                        <div style={{ marginBottom: '0.2rem' }}>{STAGES[m.stage]}</div>
                                        <div>{new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && total > 30 && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '4rem', marginBottom: '2rem' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }} disabled={filters.page <= 1}
                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                        <FontAwesomeIcon icon={faChevronLeft} style={{ marginRight: '0.5rem' }} /> Anterior
                    </button>
                    <span style={{ padding: '0.8rem 1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        Página {filters.page} de {Math.ceil(total / 30)}
                    </span>
                    <button className="btn btn-ghost" style={{ padding: '0.8rem 1.5rem', fontSize: '1rem' }} disabled={filters.page * 30 >= total}
                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                        Siguiente <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: '0.5rem' }} />
                    </button>
                </div>
            )}
        </div>
    );
}

