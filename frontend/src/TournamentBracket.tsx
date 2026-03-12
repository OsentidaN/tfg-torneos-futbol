import React from 'react';
import { Link } from 'react-router-dom';

interface Match {
    id: number;
    homeTeam: { name: string; flagUrl?: string };
    awayTeam: { name: string; flagUrl?: string };
    homeGoals?: number;
    awayGoals?: number;
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
        <div className="bracket-container" style={{ display: 'flex', gap: '2rem', padding: '1rem', minWidth: 'max-content' }}>
            {stages.map(stage => {
                const stageMatches = getMatchesByStage(stage);
                if (stageMatches.length === 0 && stage !== 'FINAL') return null;

                return (
                    <div key={stage} className="bracket-column" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '1rem' }}>
                        <p className="section-title" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            {STAGE_LABELS[stage]}
                        </p>
                        {stageMatches.map(match => (
                            <Link 
                                to={`/partidos/${match.id}`} 
                                state={returnState}
                                key={match.id} 
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="match-card" style={{ width: '260px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
                                    <div style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', minWidth: 0 }}>
                                        <span style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: match.status === 'FINISHED' && match.homeGoals! > match.awayGoals! ? 700 : 400,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {match.homeTeam.name}
                                        </span>
                                        {match.homeTeam.flagUrl && <img src={match.homeTeam.flagUrl} alt="" style={{ width: 16, height: 11, borderRadius: '1px' }} />}
                                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>
                                            {match.status === 'FINISHED' ? match.homeGoals : '-'}
                                        </span>
                                    </div>
                                    
                                    <span style={{ opacity: 0.3, fontWeight: 300 }}>-</span>
                                    
                                    <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                                        <span style={{ fontWeight: 800, color: 'var(--accent)' }}>
                                            {match.status === 'FINISHED' ? match.awayGoals : '-'}
                                        </span>
                                        {match.awayTeam.flagUrl && <img src={match.awayTeam.flagUrl} alt="" style={{ width: 16, height: 11, borderRadius: '1px' }} />}
                                        <span style={{ 
                                            fontSize: '0.8rem', 
                                            fontWeight: match.status === 'FINISHED' && match.awayGoals! > match.homeGoals! ? 700 : 400,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {match.awayTeam.name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
