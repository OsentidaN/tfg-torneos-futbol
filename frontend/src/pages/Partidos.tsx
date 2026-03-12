import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getMatches, getSeasons } from '../services/api';

const STAGES: Record<string, string> = {
    GROUP: 'Grupos', ROUND_OF_16: 'Octavos', QUARTER_FINAL: 'Cuartos',
    SEMI_FINAL: 'Semifinales', THIRD_PLACE: '3er Puesto', FINAL: 'Final'
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
                // Primero por nombre de torneo
                const nameA = a.tournament?.name || '';
                const nameB = b.tournament?.name || '';
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                
                // Luego por año descendente
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

    return (
        <div className="container page">
            <h1 className="page-title">⚽ Partidos</h1>
            <p className="page-subtitle">Historial completo de partidos · Total: {total.toLocaleString()}</p>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <select className="select" style={{ width: 'auto', minWidth: 180 }}
                    value={filters.seasonId}
                    onChange={e => setFilters(f => ({ ...f, seasonId: e.target.value, page: 1 }))}>
                    <option value="">Todas las ediciones</option>
                    {seasons.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.tournament?.name} {s.year}</option>
                    ))}
                </select>
                <select className="select" style={{ width: 'auto', minWidth: 160 }}
                    value={filters.stage}
                    onChange={e => setFilters(f => ({ ...f, stage: e.target.value, page: 1 }))}>
                    <option value="">Todas las fases</option>
                    {Object.entries(STAGES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                {(filters.seasonId || filters.stage || filters.page > 1) && (
                    <button className="btn btn-ghost" onClick={() => setSearchParams({})}>
                        ✕ Limpiar
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading-state"><div className="spinner" /></div>
            ) : matches.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">⚽</span><p>No se encontraron partidos</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {matches.map((m: any) => {
                        const st = STATUS_BADGE[m.status] || STATUS_BADGE.SCHEDULED;
                        return (
                            <Link
                                to={`/partidos/${m.id}`}
                                state={{ from: location.pathname + location.search }}
                                key={m.id}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="match-card">
                                    <div style={{ flex: 1.5, textAlign: 'right' }}>
                                        <div className="team-flag" style={{ justifyContent: 'flex-end' }}>
                                            <span className="team-name">{m.homeTeam?.name}</span>
                                            {m.homeTeam?.flagUrl
                                                ? <img src={m.homeTeam.flagUrl} alt="" style={{ width: 24, height: 17 }} />
                                                : <div className="flag-placeholder">?</div>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                                        <div className="match-score">
                                            {m.status === 'FINISHED' ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
                                        </div>
                                        <span className={`badge ${st.cls}`} style={{ fontSize: '0.65rem' }}>{st.label}</span>
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <div className="team-flag">
                                            {m.awayTeam?.flagUrl
                                                ? <img src={m.awayTeam.flagUrl} alt="" style={{ width: 24, height: 17 }} />
                                                : <div className="flag-placeholder">?</div>}
                                            <span className="team-name">{m.awayTeam?.name}</span>
                                        </div>
                                    </div>
                                    <div style={{ minWidth: 120, textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <div>{m.season?.tournament?.name} {m.season?.year}</div>
                                        <div style={{ marginTop: 2 }}>{STAGES[m.stage]}</div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && total > 30 && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <button className="btn btn-ghost" disabled={filters.page <= 1}
                        onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Anterior</button>
                    <span style={{ padding: '0.55rem 1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Página {filters.page} / {Math.ceil(total / 30)}
                    </span>
                    <button className="btn btn-ghost" disabled={filters.page * 30 >= total}
                        onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Siguiente →</button>
                </div>
            )}
        </div>
    );
}
