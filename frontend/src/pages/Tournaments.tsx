import { Link } from 'react-router-dom'
import { Trophy, Calendar, Medal } from 'lucide-react'
import { useTournaments } from '@hooks/useTournament'
import Loader from '@components/common/Loader'
import Error from '@components/common/Error'
import { TOURNAMENT_NAMES, TOURNAMENT_DESCRIPTIONS } from '@utils/constants'

const Tournaments = () => {
    const { data: tournaments, isLoading, error, refetch } = useTournaments()

    if (isLoading) return <Loader text="Cargando torneos..." />
    if (error) return <Error message="Error al cargar torneos" onRetry={refetch} />

    return (
        <div className="container-custom py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                    Torneos Internacionales
                </h1>
                <p className="text-gray-400 text-lg">
                    Explora la historia de los torneos más importantes del fútbol mundial
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {tournaments?.map((tournament) => (
                    <Link
                        key={tournament.id}
                        to={`/torneos/${tournament.id}`}
                        className="card-hover group"
                    >
                        <div className="flex items-start space-x-6">
                            <div className="w-20 h-20 bg-linear-to-br from-pitch-green to-pitch-dark rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Trophy className="w-10 h-10 text-white" />
                            </div>

                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2 group-hover:text-pitch-light transition-colors">
                                    {TOURNAMENT_NAMES[tournament.type] || tournament.name}
                                </h2>
                                <p className="text-gray-400 mb-4">
                                    {TOURNAMENT_DESCRIPTIONS[tournament.type] || ''}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-pitch-green" />
                                        <span className="text-sm text-gray-300">
                                            {tournament._count?.seasons || 0} ediciones
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Medal className="w-4 h-4 text-pitch-green" />
                                        <span className="text-sm text-gray-300">
                                            Ver campeones
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {tournaments && tournaments.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-400">No hay torneos disponibles</p>
                </div>
            )}
        </div>
    )
}

export default Tournaments