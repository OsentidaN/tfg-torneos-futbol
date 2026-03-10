import { Link } from 'react-router-dom'
import { Trophy, TrendingUp, Users, Calendar } from 'lucide-react'
import { useTournaments } from '@hooks/useTournament'
import { useMatches } from '@hooks/useMatches'
import Loader from '@components/common/Loader'
import StatCard from '@components/common/StatCard'
import { motion } from 'framer-motion'

const Home = () => {
    const { data: tournaments, isLoading: loadingTournaments } = useTournaments()
    const { data: matchesData, isLoading: loadingMatches } = useMatches({ limit: 6 })

    if (loadingTournaments || loadingMatches) return <Loader text="Cargando datos..." />

    const recentMatches = matchesData?.data || []

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-linear-to-br from-pitch-dark via-field-charcoal to-field-black py-20">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 gradient-text">
                            Fútbol en Datos
                        </h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Explora estadísticas históricas de la Copa Mundial y la Eurocopa.
                            Compara equipos, analiza enfrentamientos directos y descubre curiosidades.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link to="/torneos" className="btn-primary">
                                Explorar Torneos
                            </Link>
                            <Link to="/comparar" className="btn-outline">
                                Comparar Equipos
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Overview */}
            <section className="py-16 bg-field-black">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={Trophy}
                            label="Torneos"
                            value={tournaments?.length || 0}
                            color="pitch-green"
                        />
                        <StatCard
                            icon={Calendar}
                            label="Ediciones"
                            value="50+"
                            color="pitch-light"
                        />
                        <StatCard
                            icon={Users}
                            label="Equipos"
                            value="87"
                            color="pitch-green"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Partidos"
                            value="471"
                            color="pitch-light"
                        />
                    </div>
                </div>
            </section>

            {/* Tournaments Section */}
            <section className="py-16">
                <div className="container-custom">
                    <h2 className="text-3xl font-display font-bold mb-8">Torneos Disponibles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tournaments?.map((tournament) => (
                            <Link
                                key={tournament.id}
                                to={`/torneos/${tournament.id}`}
                                className="card-hover"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-pitch-green bg-opacity-20 rounded-full flex items-center justify-center">
                                        <Trophy className="w-8 h-8 text-pitch-green" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-1">{tournament.name}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {tournament._count?.seasons || 0} ediciones
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Matches */}
            {recentMatches.length > 0 && (
                <section className="py-16 bg-field-black">
                    <div className="container-custom">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-display font-bold">Partidos Recientes</h2>
                            <Link to="/partidos" className="btn-secondary">
                                Ver Todos
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentMatches.slice(0, 6).map((match) => (
                                <Link
                                    key={match.id}
                                    to={`/partidos/${match.id}`}
                                    className="card-hover"
                                >
                                    <div className="text-center">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex-1 text-right">
                                                <p className="font-semibold">{match.homeTeam?.name}</p>
                                            </div>
                                            <div className="px-4">
                                                <p className="text-2xl font-bold">
                                                    {match.homeGoals} - {match.awayGoals}
                                                </p>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold">{match.awayTeam?.name}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">{match.round}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-20 bg-linear-to-br from-pitch-green to-pitch-dark">
                <div className="container-custom text-center">
                    <h2 className="text-4xl font-display font-bold mb-4 text-white">
                        ¿Listo para explorar?
                    </h2>
                    <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                        Descubre estadísticas, compara equipos y revive los mejores momentos
                        de la historia del fútbol mundial.
                    </p>
                    <Link to="/torneos" className="btn-primary bg-white text-pitch-dark hover:bg-gray-100">
                        Comenzar Ahora
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default Home