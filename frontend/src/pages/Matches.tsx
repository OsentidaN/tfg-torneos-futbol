import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMatches } from '@hooks/useMatches'
import Loader from '../components/common/Loader'
import Error from '@components/common/Error'
import SearchBar from '@components/common/SearchBar'
import { formatDate, formatScore } from '@utils/formatters'
import { STAGE_NAMES, STATUS_COLORS } from '@utils/constants'
import { Calendar, MapPin } from 'lucide-react'

const Matches = () => {
    const [search, setSearch] = useState('')
    const [selectedStage, setSelectedStage] = useState<string>('')

    const { data: matchesData, isLoading, error, refetch } = useMatches({
        limit: 50,
        stage: selectedStage || undefined,
    })

    if (isLoading) return <Loader text="Cargando partidos..." />
    if (error) return <Error message="Error al cargar partidos" onRetry={refetch} />

    const matches = matchesData?.data || []

    // Filter by search
    const filteredMatches = matches.filter((match) => {
        const searchLower = search.toLowerCase()
        return (
            match.homeTeam?.name.toLowerCase().includes(searchLower) ||
            match.awayTeam?.name.toLowerCase().includes(searchLower) ||
            match.round.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="container-custom py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                    Partidos
                </h1>
                <p className="text-gray-400 text-lg">
                    Explora los partidos de la historia del fútbol mundial
                </p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    onClear={() => setSearch('')}
                    placeholder="Buscar por equipo o ronda..."
                />

                <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="input"
                >
                    <option value="">Todas las fases</option>
                    {Object.entries(STAGE_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                    ))}
                </select>
            </div>

            {/* Matches List */}
            {filteredMatches.length > 0 ? (
                <div className="space-y-4">
                    {filteredMatches.map((match) => (
                        <Link
                            key={match.id}
                            to={`/partidos/${match.id}`}
                            className="card-hover"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                                {/* Teams */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3 flex-1">
                                            {match.homeTeam?.flagUrl && (
                                                <img
                                                    src={match.homeTeam.flagUrl}
                                                    alt={match.homeTeam.name}
                                                    className="w-8 h-6 object-cover rounded"
                                                />
                                            )}
                                            <span className="font-semibold">{match.homeTeam?.name}</span>
                                        </div>
                                        <span className="text-2xl font-bold px-4">
                                            {formatScore(match.homeGoals, match.awayGoals)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 flex-1">
                                            {match.awayTeam?.flagUrl && (
                                                <img
                                                    src={match.awayTeam.flagUrl}
                                                    alt={match.awayTeam.name}
                                                    className="w-8 h-6 object-cover rounded"
                                                />
                                            )}
                                            <span className="font-semibold">{match.awayTeam?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="text-sm text-gray-400 md:text-right md:min-w-50">
                                    <div className="flex items-center md:justify-end space-x-2 mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(match.date)}</span>
                                    </div>
                                    <div className="mb-1">{STAGE_NAMES[match.stage]}</div>
                                    {match.city && (
                                        <div className="flex items-center md:justify-end space-x-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{match.city}</span>
                                        </div>
                                    )}
                                    <div className={`mt-2 ${STATUS_COLORS[match.status]}`}>
                                        {match.status}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 card">
                    <p className="text-gray-400">No se encontraron partidos</p>
                </div>
            )}
        </div>
    )
}

export default Matches