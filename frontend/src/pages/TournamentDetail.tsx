import { useParams, Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { useTournament, useTournamentWinners } from '@hooks/useTournament'
import Loader from '@components/common/Loader'
import Error from '@components/common/Error'
import { formatDate } from '@utils/formatters'
import { TOURNAMENT_NAMES } from '@utils/constants'

const TournamentDetail = () => {
    const { id } = useParams<{ id: string }>()
    const tournamentId = parseInt(id!)

    const { data: tournament, isLoading, error, refetch } = useTournament(tournamentId)
    const { data: winners, isLoading: loadingWinners } = useTournamentWinners(tournamentId)

    if (isLoading || loadingWinners) return <Loader text="Cargando torneo..." />
    if (error) return <Error message="Error al cargar el torneo" onRetry={refetch} />
    if (!tournament) return <Error message="Torneo no encontrado" />

    return (
        <div className="container-custom py-12">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-pitch-green bg-opacity-20 rounded-2xl flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-pitch-green" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-display font-bold gradient-text">
                            {TOURNAMENT_NAMES[tournament.type] || tournament.name}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {tournament._count?.seasons || 0} ediciones históricas
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-field-gray">
                <button className="px-6 py-3 border-b-2 border-pitch-green text-pitch-green font-semibold">
                    Campeones
                </button>
                <Link
                    to={`/torneos/${id}/estadisticas`}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                    Estadísticas
                </Link>
            </div>

            {/* Winners List */}
            {winners && winners.length > 0 ? (
                <div className="space-y-4">
                    {winners.map((winner) => (
                        <div key={winner.year} className="card-hover">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-pitch-green bg-opacity-20 rounded-full flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-pitch-green" />
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-3 mb-1">
                                            <span className="text-2xl font-bold text-pitch-green">{winner.year}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="font-semibold text-lg">{winner.winner.name}</span>
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Finalista: {winner.runnerUp.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold mb-1">
                                        {winner.result.regular}
                                        {winner.result.penalties && (
                                            <span className="text-sm text-gray-400 ml-2">
                                                (Penales {winner.result.penalties})
                                            </span>
                                        )}
                                    </div>
                                    {winner.city && (
                                        <div className="text-sm text-gray-400">
                                            {winner.city}, {winner.venue || ''}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(winner.date)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 card">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No hay datos de campeones disponibles</p>
                </div>
            )}
        </div>
    )
}

export default TournamentDetail