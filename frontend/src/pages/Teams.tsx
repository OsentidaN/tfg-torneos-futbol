import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeams } from '@hooks/useTeams'
import Loader from '@components/common/Loader'
import Error from '@components/common/Error'
import SearchBar from '@components/common/SearchBar'
import { Trophy } from 'lucide-react'

const Teams = () => {
    const [search, setSearch] = useState('')
    const { data: teams, isLoading, error, refetch } = useTeams()

    if (isLoading) return <Loader text="Cargando equipos..." />
    if (error) return <Error message="Error al cargar equipos" onRetry={refetch} />

    const filteredTeams =
        teams?.filter((team) =>
            team.name.toLowerCase().includes(search.toLowerCase())
        ) || []

    return (
        <div className="container-custom py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                    Selecciones Nacionales
                </h1>
                <p className="text-gray-400 text-lg">
                    Explora las estadísticas de las selecciones que han participado en Copa Mundial y Eurocopa
                </p>
            </div>

            <div className="mb-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onClear={() => setSearch('')}
                    placeholder="Buscar selección..."
                />
            </div>

            {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.map((team) => (
                        <Link
                            key={team.id}
                            to={`/equipos/${team.id}`}
                            className="card-hover group"
                        >
                            <div className="flex items-center space-x-4">
                                {team.flagUrl ? (
                                    <img
                                        src={team.flagUrl}
                                        alt={team.name}
                                        className="w-16 h-12 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-12 bg-pitch-green bg-opacity-20 rounded-lg flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-pitch-green" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold group-hover:text-pitch-light transition-colors">
                                        {team.name}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {(team._count?.matchesHome ?? 0) +
                                            (team._count?.matchesAway ?? 0)} partidos
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 card">
                    <p className="text-gray-400">
                        {search
                            ? 'No se encontraron equipos'
                            : 'No hay equipos disponibles'}
                    </p>
                </div>
            )}
        </div>
    )
}

export default Teams