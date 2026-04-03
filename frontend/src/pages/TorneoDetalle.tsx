import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useSearchParams } from 'react-router-dom';
import { getSeasonById, getSeasonMatches, getSeasonTopScorers, getFavorites, toggleFavorite } from '../services/api';
import { formatPlayerName, translateCountryName } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { TournamentBracket } from '../components/TournamentBracket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid, faChevronLeft, faGlobe, faEarthEurope, faChartBar, faSitemap, faCalendarAlt, faFutbol, faMedal } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { Skeleton, SkeletonTable } from '../components/Skeleton';

const STAGES: Record<string, string> = {
    GROUP: 'Fase de Grupos', ROUND_OF_16: 'Octavos', QUARTER_FINAL: 'Cuartos',
    SEMI_FINAL: 'Semifinales', THIRD_PLACE: '3er Puesto', FINAL: 'Final'
};

export default function TorneoDetalle() {
    const { id } = useParams();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [season, setSeason] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [scorers, setScorers] = useState<any[]>([]);

    // Initialize from URL or defaults
    const activeTab = (searchParams.get('tab') as any) || 'clasificacion';
    const stageFilter = searchParams.get('fase') || '';

    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const { user } = useAuth();

    const setActiveTab = (tab: string) => {
        setSearchParams(prev => {
            prev.set('tab', tab);
            return prev;
        });
    };

    const setStageFilter = (fase: string) => {
        setSearchParams(prev => {
            if (fase) prev.set('fase', fase);
            else prev.delete('fase');
            return prev;
        });
    };

    useEffect(() => {
        if (!id) return;
        const numId = Number(id);
        
        const fetchData = async () => {
            try {
                const [s, m, sc] = await Promise.all([
                    getSeasonById(numId),
                    getSeasonMatches(numId),
                    getSeasonTopScorers(numId)
                ]);
                setSeason(s.data.data);
                setMatches(m.data.data);
                setScorers(sc.data.data);

                // Check if favorite
                if (user) {
                    const favs = await getFavorites();
                    const favList = favs.data.data.favorites;
                    const found = favList.some((f: any) => f.favoriteType === 'SEASON' && f.seasonId === numId);
                    setIsFavorite(found);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const handleToggleFavorite = async () => {
        if (!id || !user) return;
        try {
            const res = await toggleFavorite({ targetId: Number(id), type: 'SEASON' });
            setIsFavorite(res.data.data.isFavorite);
        } catch (err) {
            console.error('Error al cambiar favorito', err);
        }
    };

    if (loading) return (
        <div className="container page">
            <div style={{ marginBottom: '3.5rem' }}>
                <Skeleton type="title" width="40%" />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <Skeleton type="text" width="100px" />
                    <Skeleton type="text" width="150px" />
                </div>
            </div>
            <div className="tabs" style={{ marginBottom: '3.5rem', display: 'flex', gap: '1rem' }}>
                <Skeleton type="text" width="120px" height="40px" />
                <Skeleton type="text" width="120px" height="40px" />
                <Skeleton type="text" width="120px" height="40px" />
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}><SkeletonTable rows={6} /></div>
                <div style={{ flex: 1 }}><SkeletonTable rows={6} /></div>
            </div>
        </div>
    );
    
    if (!season) return <div className="container page"><div className="empty-state">Temporada no encontrada</div></div>;

    const groupedStandings = season.seasonTeams?.reduce((acc: any, st: any) => {
        const grp = st.group || 'A';
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(st);
        return acc;
    }, {});

    const filteredMatches = stageFilter ? matches.filter((m: any) => m.stage === stageFilter) : matches;
    const matchesByStage = filteredMatches.reduce((acc: any, m: any) => {
        if (!acc[m.stage]) acc[m.stage] = [];
        acc[m.stage].push(m);
        return acc;
    }, {});

    const stageOrder = ['GROUP', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'THIRD_PLACE', 'FINAL'];
    const tournamentType = season.tournament?.type;

    return (
        <div className="container page" id="torneo-detalle-content">
            {/* Header */}
            <div style={{ marginBottom: '3.5rem' }}>
                <Link
                    to={(location.state as any)?.from || (tournamentType ? `/torneos?tipo=${tournamentType}` : "/torneos")}
                    className="btn btn-ghost"
                    style={{ marginBottom: '2rem', display: 'inline-flex' }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} /> Volver
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <FontAwesomeIcon 
                            icon={tournamentType === 'WORLD_CUP' ? faGlobe : faEarthEurope} 
                            style={{ fontSize: '4rem', color: tournamentType === 'WORLD_CUP' ? 'var(--accent-gold)' : 'var(--accent)' }} 
                        />
                        <div>
                            <h1 className="page-title" style={{ marginBottom: '0.5rem', fontSize: '3rem', color: 'var(--text-primary)', fontWeight: 900 }}>
                                {season.tournament?.name} {season.year}
                            </h1>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                {season.hostCountry && <span className="badge badge-blue" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>📍 {translateCountryName(season.hostCountry)}</span>}
                                {season.winner && <span className="badge badge-gold" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>🏆 Campeón: {translateCountryName(season.winner)}</span>}
                                <span className="badge badge-green" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>{matches.length} partidos</span>
                            </div>
                        </div>
                    </div>

                    {user && (
                        <button 
                            onClick={handleToggleFavorite}
                            className={`btn ${isFavorite ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '0.8rem 1.6rem', fontSize: '1.1rem' }}
                        >
                            <FontAwesomeIcon 
                                icon={isFavorite ? faStarSolid : faStarRegular} 
                                style={{ color: isFavorite ? '#fff' : 'var(--accent)', marginRight: '0.6rem' }} 
                            />
                            {isFavorite ? 'En Favoritos' : 'Añadir a Favoritos'}
                        </button>
                    )}

                </div>
            </div>

            {/* Tabs */}
            <div className="tabs torneo-tabs" style={{ marginBottom: '3.5rem', borderBottom: '3px solid var(--border)' }}>
                {(['clasificacion', 'fase_final', 'partidos', 'goleadores'] as const).map(tab => (
                    <button 
                        key={tab} 
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
                        onClick={() => setActiveTab(tab)}
                        style={{ fontWeight: 700, color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)' }}
                    >
                        <FontAwesomeIcon icon={
                            tab === 'clasificacion' ? faChartBar : 
                            tab === 'fase_final' ? faSitemap : 
                            tab === 'partidos' ? faCalendarAlt : faFutbol
                        } style={{ marginRight: '0.8rem' }} />
                        {tab === 'clasificacion' ? 'Clasificación' : tab === 'fase_final' ? 'Fase Final' : tab === 'partidos' ? 'Partidos' : 'Goleadores'}
                    </button>
                ))}
            </div>

            {/* CLASIFICACIÓN */}
            {activeTab === 'clasificacion' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
                    {groupedStandings && Object.keys(groupedStandings).sort().map((grp: string) => (
                        <div key={grp} style={{ width: '100%', maxWidth: '650px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
                            <p className="section-title" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)', borderLeft: '5px solid var(--accent)', paddingLeft: '1.2rem' }}>GRUPO {grp}</p>
                            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-accent)', background: 'var(--bg-card)', borderRadius: '16px', minWidth: 'min-content' }}>
                                <div className="table-wrap">
                                    <table className="data-table" style={{ fontSize: '1.1rem' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '1.5rem 1rem' }}>#</th>
                                                <th>Equipo</th><th>PJ</th><th>G</th><th>E</th>
                                                <th>P</th><th>GF</th><th>GC</th><th>Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedStandings[grp]
                                                .sort((a: any, b: any) => (b.points - a.points) || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst))
                                                .map((st: any, i: number) => (
                                                    <tr key={st.teamId}>
                                                        <td style={{ color: i < 2 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: i < 2 ? 900 : 400, padding: '1.5rem 1rem' }}>{i + 1}</td>
                                                        <td>
                                                            <div className="team-flag" style={{ gap: '1.2rem' }}>
                                                                {st.team?.flagUrl
                                                                    ? <img src={st.team.flagUrl} alt={st.team.name} style={{ width: '40px', height: '28px', borderRadius: '4px' }} />
                                                                    : <div className="flag-placeholder">?</div>}
                                                                <Link 
                                                                    to={`/equipos/${st.teamId}`}
                                                                    state={{ from: location.pathname + location.search }}
                                                                    style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.2rem' }}
                                                                >
                                                                    {translateCountryName(st.team?.name)}
                                                                </Link>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>{st.played}</td><td style={{ fontWeight: 600 }}>{st.won}</td><td style={{ fontWeight: 600 }}>{st.drawn}</td>
                                                        <td style={{ fontWeight: 600 }}>{st.lost}</td><td style={{ fontWeight: 600 }}>{st.goalsFor}</td><td style={{ fontWeight: 600 }}>{st.goalsAgainst}</td>
                                                        <td style={{ fontWeight: 900, color: 'var(--accent)', fontSize: '1.4rem' }}>{st.points}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FASE FINAL */}
            {activeTab === 'fase_final' && (
                <div style={{ position: 'relative' }}>
                    {/* Indicador móvil */}
                    <div className="mobile-scroll-hint" style={{ 
                        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', display: 'none', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px'
                    }}>
                        ↔️ Desliza horizontalmente la tabla para ver todos los cruces
                    </div>
                    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '1.5rem' }}>
                        <div className="card" style={{ display: 'table', margin: '0 auto', minWidth: '100%', padding: '2rem', background: 'var(--bg-glass)', border: '1px solid var(--border-accent)', borderRadius: '20px' }}>
                            <TournamentBracket
                                matches={matches}
                                returnState={{ from: location.pathname + location.search }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* PARTIDOS */}
            {activeTab === 'partidos' && (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <select className="select" style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.1rem' }} value={stageFilter} onChange={e => setStageFilter(e.target.value)}>
                            <option value="">Todas las fases</option>
                            {stageOrder.map(s => <option key={s} value={s}>{STAGES[s]}</option>)}
                        </select>
                    </div>
                    {stageOrder.filter(s => matchesByStage[s]).map(stage => (
                        <div key={stage} style={{ marginBottom: '4rem' }}>
                            <p className="section-title" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem', borderLeft: '6px solid var(--accent)', paddingLeft: '1.5rem' }}>
                                {STAGES[stage]}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {matchesByStage[stage].map((m: any) => {
                                    const isGroup = stage === 'GROUP';
                                    const isFinished = m.status === 'FINISHED';
                                    const homeGoals = m.homeGoals ?? 0;
                                    const awayGoals = m.awayGoals ?? 0;
                                    
                                    const homeWin = isFinished && homeGoals > awayGoals;
                                    const awayWin = isFinished && awayGoals > homeGoals;
                                    const isDraw = isFinished && homeGoals === awayGoals;
                                    
                                    const homePenaltyWin = isFinished && isDraw && (m.homeGoalsPenalty ?? 0) > (m.awayGoalsPenalty ?? 0);
                                    const awayPenaltyWin = isFinished && isDraw && (m.awayGoalsPenalty ?? 0) > (m.homeGoalsPenalty ?? 0);

                                    let homeColor = 'var(--text-primary)';
                                    let awayColor = 'var(--text-primary)';
                                    let homeWeight: string | number = 500;
                                    let awayWeight: string | number = 500;

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
                                        // Knockout stages
                                        if (homeWin) {
                                            homeColor = 'var(--accent-2)';
                                            homeWeight = 900;
                                            awayColor = 'var(--text-muted)';
                                        } else if (awayWin) {
                                            awayColor = 'var(--accent-2)';
                                            awayWeight = 900;
                                            homeColor = 'var(--text-muted)';
                                        } else if (isDraw) {
                                            if (homePenaltyWin) {
                                                homeColor = 'var(--accent-2)'; 
                                                homeWeight = 900;
                                                awayColor = 'var(--text-muted)';
                                            } else if (awayPenaltyWin) {
                                                awayColor = 'var(--accent-2)';
                                                awayWeight = 900;
                                                homeColor = 'var(--text-muted)';
                                            }
                                        }
                                    }
                                    
                                    return (
                                        <Link
                                            to={`/partidos/${m.id}`}
                                            state={{ from: location.pathname + location.search }}
                                            key={m.id}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <div className="match-card" style={{ padding: '1.5rem 2rem', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                                                <div style={{ flex: 1, textAlign: 'right' }}>
                                                    <div className="team-flag" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                                                        <span className="team-name" style={{ 
                                                            fontSize: '1.1rem', 
                                                            color: homeColor,
                                                            fontWeight: homeWeight
                                                        }}>
                                                            {translateCountryName(m.homeTeam?.name)}
                                                        </span>
                                                        {m.homeTeam?.flagUrl ? <img src={m.homeTeam.flagUrl} alt="" style={{ width: 32, height: 22, borderRadius: '2px' }} /> : <div className="flag-placeholder">?</div>}
                                                    </div>
                                                </div>
                                                <div className="match-score" style={{ 
                                                    fontSize: '1.8rem', 
                                                    padding: '0.4rem 1.2rem', 
                                                    minWidth: '100px',
                                                    color: 'var(--text-primary)',
                                                    background: 'var(--bg-primary)',
                                                    border: '1px solid var(--border-accent)'
                                                }}>
                                                    {isFinished ? `${m.homeGoals} - ${m.awayGoals}` : 'vs'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div className="team-flag" style={{ gap: '1rem' }}>
                                                        {m.awayTeam?.flagUrl ? <img src={m.awayTeam.flagUrl} alt="" style={{ width: 32, height: 22, borderRadius: '2px' }} /> : <div className="flag-placeholder">?</div>}
                                                        <span className="team-name" style={{ 
                                                            fontSize: '1.1rem', 
                                                            color: awayColor,
                                                            fontWeight: awayWeight
                                                        }}>
                                                            {translateCountryName(m.awayTeam?.name)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', minWidth: 100, textAlign: 'right', fontWeight: 500 }}>
                                                    {new Date(m.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {Object.keys(matchesByStage).length === 0 && (
                        <div className="empty-state"><span className="empty-icon">⚽</span><p>Sin partidos encontrados</p></div>
                    )}
                </div>
            )}

            {/* GOLEADORES */}
            {activeTab === 'goleadores' && (
                <div style={{ maxWidth: '100%', margin: '0 auto', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '1rem' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-accent)', background: 'var(--bg-card)', minWidth: 'min-content' }}>
                        <div className="table-wrap">
                            <table className="data-table" style={{ fontSize: '1.1rem', minWidth: '600px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '1.5rem 1rem' }}>#</th>
                                        <th>Jugador</th>
                                        <th>Equipo</th>
                                        <th style={{ textAlign: 'center' }}>Goles</th>
                                        <th style={{ textAlign: 'center' }}>Asistencias</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scorers.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Sin datos de goleadores</td></tr>
                                    ) : scorers.map((sc: any, i: number) => (
                                        <tr key={sc.player?.id} style={{ background: i < 3 ? 'rgba(46, 160, 67, 0.05)' : 'transparent' }}>
                                            <td style={{ padding: '1.5rem 1rem' }}>
                                                {i === 0 ? <FontAwesomeIcon icon={faMedal} style={{ color: '#ffd700', fontSize: '1.5rem' }} /> : 
                                                 i === 1 ? <FontAwesomeIcon icon={faMedal} style={{ color: '#c0c0c0', fontSize: '1.4rem' }} /> : 
                                                 i === 2 ? <FontAwesomeIcon icon={faMedal} style={{ color: '#cd7f32', fontSize: '1.3rem' }} /> : 
                                                 <span style={{ color: 'var(--text-muted)', paddingLeft: '0.3rem' }}>{i + 1}</span>}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                {formatPlayerName(sc.player?.firstName, sc.player?.lastName)}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{translateCountryName(sc.player?.team)}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="badge badge-green" style={{ fontSize: '1.1rem', padding: '0.4rem 1rem', fontWeight: 800 }}>{sc.goals}</span>
                                            </td>
                                            <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{sc.assists}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

