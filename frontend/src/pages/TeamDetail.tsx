import { useParams } from 'react-router-dom'
import { useTeam, useTeamStats, useTeamMatches } from '@hooks/useTeams'
import Loader from '@components/common/Loader'
import Error from '@components/common/Error'
import StatCard from '@components/common/StatCard'
import { Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { formatScore } from '@utils/formatters'
import { Link } from 'react-router-dom'

const TeamDetail = () => {
    const { id } = useParams<{ id: string }>()
    const teamId = parseInt(id!)

    const { data: team, isLoading, error, refetch } = useTeam(teamId)
    const { data: stats, isLoading: loadingStats } = useTeamStats(teamId)
    const { data: matches, isLoading: loadingMatches } = useTeamMatches(teamId, { limit: 10 })

    if (isLoading || loadingStats || loadingMatches) {
        return <Loader text="Cargando equipo..." />
    }
    if (error) return <Error message="Error al cargar el equipo" onRetry={refetch} />
    if (!team) return <Error message="Equipo no encontrado" />

    return (
        <div className="container-custom py-12">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center space-x-6 mb-6">
                    {team.flagUrl ? (
                        <img
                            src={team.flagUrl}
                            alt={team.name}
                            className="w-32 h-24 object-cover rounded-2xl shadow-lg"
                        />
                    ) : (
                        <div className="w-32 h-24 bg-pitch-green bg-opacity-20 rounded-2xl flex items-center justify-center">
                            <Trophy className="w-12 h-12 text-pitch-green" />
                        </div>
                    )}

                    <div>
                        <h1 className="text-4xl font-display font-bold gradient-text mb-2">
                            {team.name}
                        </h1>
                        {team.code && (
                            <p className="text-gray-400 text-lg">{team.code}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        icon={Trophy}
                        label="Partidos Jugados"
                        value={stats.stats.matchesPlayed}
                        color="pitch-green"
                    />
                    <StatCard
                        icon={Target}
                        label="Victorias"
                        value={stats.stats.wins}
                        color="pitch-light"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Goles a Favor"
                        value={stats.stats.goalsFor}
                        color="pitch-green"
                    />
                    <StatCard
                        icon={TrendingDown}
                        label="Goles en Contra"
                        value={stats.stats.goalsAgainst}
                        color="pitch-light"
                    />
                </div>
            )}

            {/* Additional Stats */}
            {stats && (
                <div className="card mb-12">
                    <h2 className="text-2xl font-bold mb-6">Estadísticas Generales</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Empates</p>
                            <p className="text-2xl font-bold">{stats.stats.draws}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Derrotas</p>
                            <p className="text-2xl font-bold">{stats.stats.losses}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">Diferencia de Gol</p>
                            <p className="text-2xl font-bold">{stats.stats.goalDifference}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm mb-1">% Victorias</p>
                            <p className="text-2xl font-bold">{stats.stats.winPercentage.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Matches */}
            {matches && matches.length > 0 && (
                <div className="card">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Últimos Partidos</h2>
                    </div>
                    <div className="space-y-3">
                        {matches.map((match) => (
                            <Link
                                key={match.id}
                                to={`/partidos/${match.id}`}
                                className="block p-4 bg-field-gray rounded-lg hover:bg-field-charcoal transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className={match.homeTeamId === teamId ? 'font-bold' : ''}>
                                                {match.homeTeam?.name}
                                            </span>
                                            <span className="text-gray-600">vs</span>
                                            <span className={match.awayTeamId === teamId ? 'font-bold' : ''}>
                                                {match.awayTeam?.name}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-400">{match.round}</div>
                                    </div>
                                    <div className="text-xl font-bold">
                                        {formatScore(match.homeGoals, match.awayGoals)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default TeamDetail