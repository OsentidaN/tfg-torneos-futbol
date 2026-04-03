import React from 'react';
import { Link } from 'react-router-dom';
import { translateCountryName } from '../utils/formatters';

interface Match {
    id: number;
    homeTeam: { name: string; flagUrl?: string };
    awayTeam: { name: string; flagUrl?: string };
    homeGoals?: number;
    awayGoals?: number;
    homeGoalsPenalty?: number;
    awayGoalsPenalty?: number;
    status: string;
    stage: string;
}

export const TournamentBracket: React.FC<{ matches: Match[], returnState?: any }> = ({ matches, returnState }) => {
    const stages = ['ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
    
    const STAGE_LABELS: Record<string, string> = {
        'ROUND_OF_16': 'Octavos',
        'QUARTER_FINAL': 'Cuartos',
        'SEMI_FINAL': 'Semifinales',
        'FINAL': 'Final'
    };

    const getMatchesByStage = (stage: string) => {
        return matches.filter(m => m.stage === stage);
    };

    if (matches.filter(m => stages.includes(m.stage)).length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">🏆</span>
                <p>No hay datos de fase final disponibles para este torneo.</p>
            </div>
        );
    }

    return (
        <div className="bracket-container" style={{ display: 'flex', gap: '2rem', padding: '1rem', minWidth: 'max-content', justifyContent: 'center', alignItems: 'flex-start' }}>
            {stages.map(stage => {
                const stageMatches = getMatchesByStage(stage);
                if (stageMatches.length === 0 && stage !== 'FINAL') return null;

                return (
                    <div key={stage} className="bracket-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: '0 0 250px' }}>
                        <p className="section-title" style={{ 
                            textAlign: 'center', 
                            marginBottom: '1rem', 
                            fontSize: '1.1rem', 
                            color: 'var(--text-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            borderBottom: '2px solid var(--accent)',
                            paddingBottom: '0.5rem'
                        }}>
                            {STAGE_LABELS[stage]}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', gap: '1.5rem' }}>
                            {stageMatches.map(match => {
                                const isFinished = match.status === 'FINISHED';
                                const homeGoals = match.homeGoals ?? 0;
                                const awayGoals = match.awayGoals ?? 0;
                                
                                const homeWin = isFinished && homeGoals > awayGoals;
                                const awayWin = isFinished && awayGoals > homeGoals;
                                const isDraw = isFinished && homeGoals === awayGoals;
                                
                                const homePenaltyWin = isFinished && isDraw && (match.homeGoalsPenalty ?? 0) > (match.awayGoalsPenalty ?? 0);
                                const awayPenaltyWin = isFinished && isDraw && (match.awayGoalsPenalty ?? 0) > (match.homeGoalsPenalty ?? 0);

                                let homeColor = 'var(--text-primary)';
                                let awayColor = 'var(--text-primary)';
                                let homeWeight = 500;
                                let awayWeight = 500;

                                if (homeWin) {
                                    homeColor = 'var(--accent-2)';
                                    homeWeight = 800;
                                    awayColor = 'var(--text-muted)';
                                } else if (awayWin) {
                                    awayColor = 'var(--accent-2)';
                                    awayWeight = 800;
                                    homeColor = 'var(--text-muted)';
                                } else if (isDraw) {
                                    if (homePenaltyWin) {
                                        homeColor = 'var(--text-primary)';
                                        homeWeight = 800;
                                        awayColor = 'var(--text-muted)';
                                    } else if (awayPenaltyWin) {
                                        awayColor = 'var(--text-primary)';
                                        awayWeight = 800;
                                        homeColor = 'var(--text-muted)';
                                    }
                                }

                                return (
                                    <Link 
                                        to={`/partidos/${match.id}`} 
                                        state={returnState}
                                        key={match.id} 
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="match-card" style={{ 
                                            width: '250px', 
                                            padding: '1.25rem', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            gap: '0.8rem',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-accent)',
                                            borderRadius: '16px',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            {/* Home Team */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                                    {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: '2px' }} />}
                                                    <span style={{ 
                                                        fontSize: '1rem', 
                                                        fontWeight: homeWeight,
                                                        color: homeColor,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {translateCountryName(match.homeTeam.name)}
                                                    </span>
                                                </div>
                                                <span style={{ 
                                                    fontWeight: 900, 
                                                    fontSize: '1.2rem',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {isFinished ? match.homeGoals : '-'}
                                                </span>
                                            </div>
                                            
                                            <div style={{ height: '1px', background: 'var(--border)' }} />
                                            
                                            {/* Away Team */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                                                    {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt="" style={{ width: 20, height: 14, borderRadius: '2px' }} />}
                                                    <span style={{ 
                                                        fontSize: '1rem', 
                                                        fontWeight: awayWeight,
                                                        color: awayColor,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {translateCountryName(match.awayTeam.name)}
                                                    </span>
                                                </div>
                                                <span style={{ 
                                                    fontWeight: 900, 
                                                    fontSize: '1.2rem',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {isFinished ? match.awayGoals : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


