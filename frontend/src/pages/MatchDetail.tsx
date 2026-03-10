import { useParams } from 'react-router-dom'
import { useMatch, useMatchEvents } from '@hooks/useMatches'
import Loader from '@components/common/Loader'
import Error from '@components/common/Error'
import { formatDate, formatScore } from '@utils/formatters'
import { STAGE_NAMES, EVENT_ICONS } from '@utils/constants'
import { Calendar, MapPin, User, Clock } from 'lucide-react'

const MatchDetail = () => {
    const { id } = useParams<{ id: string }>()
    const matchId = parseInt(id!)

    const { data: match, isLoading, error, refetch } = useMatch(matchId)
    const { data: events, isLoading: loadingEvents } = useMatchEvents(matchId)

    if (isLoading || loadingEvents) return <Loader text="Cargando partido..." />
    if (error) return <Error message="Error al cargar el partido" onRetry={refetch} />
    if (!match) return <Error message="Partido no encontrado" />

    return (
        <div className="container-custom py-12">
            {/* Match Header */}
            <div className="card mb-8">
                <div className="text-center mb-6">
                    <div className="text-sm text-gray-400 mb-2">{STAGE_NAMES[match.stage]}</div>
                    <div className="text-sm text-gray-500">{match.round}</div>
                </div>

                {/* Teams and Score */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex-1 text-center">
                        {match.homeTeam?.flagUrl && (
                            <img
                                src={match.homeTeam.flagUrl}
                                alt={match.homeTeam.name}
                                className="w-24 h-16 object-cover rounded mx-auto mb-4"
                            />
                        )}
                        <h2 className="text-2xl font-bold">{match.homeTeam?.name}</h2>
                    </div>

                    <div className="px-8">
                        <div className="text-6xl font-bold text-center">
                            {formatScore(match.homeGoals, match.awayGoals)}
                        </div>
                        {(match.homeGoalsPenalty !== null && match.awayGoalsPenalty !== null) && (
                            <div className="text-center text-gray-400 mt-2">
                                Penales: {match.homeGoalsPenalty} - {match.awayGoalsPenalty}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center">
                        {match.awayTeam?.flagUrl && (
                            <img
                                src={match.awayTeam.flagUrl}
                                alt={match.awayTeam.name}
                                className="w-24 h-16 object-cover rounded mx-auto mb-4"
                            />
                        )}
                        <h2 className="text-2xl font-bold">{match.awayTeam?.name}</h2>
                    </div>
                </div>

                {/* Match Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-field-gray">
                    <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <Calendar className="w-5 h-5" />
                        <span>{formatDate(match.date, "d 'de' MMMM 'de' yyyy")}</span>
                    </div>
                    {match.city && (
                        <div className="flex items-center justify-center space-x-2 text-gray-400">
                            <MapPin className="w-5 h-5" />
                            <span>{match.city}{match.venue && `, ${match.venue}`}</span>
                        </div>
                    )}
                    {match.referee && (
                        <div className="flex items-center justify-center space-x-2 text-gray-400">
                            <User className="w-5 h-5" />
                            <span>Árbitro: {match.referee}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Match Events */}
            {events && events.length > 0 && (
                <div className="card">
                    <h3 className="text-2xl font-bold mb-6">Eventos del Partido</h3>
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center space-x-4 p-3 bg-field-gray rounded-lg"
                            >
                                <div className="flex items-center space-x-2 min-w-20">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="font-semibold">
                                        {event.minute}'
                                        {event.extraMinute && `+${event.extraMinute}`}
                                    </span>
                                </div>

                                <div className="text-2xl">
                                    {EVENT_ICONS[event.type] || ''}
                                </div>

                                <div className="flex-1">
                                    <div className="font-semibold">
                                        {event.player
                                            ? `${event.player.firstName} ${event.player.lastName}`
                                            : 'Jugador desconocido'
                                        }
                                    </div>
                                    {event.detail && (
                                        <div className="text-sm text-gray-400">{event.detail}</div>
                                    )}
                                </div>

                                <div className="text-sm text-gray-400">
                                    {event.type.replace('_', ' ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(!events || events.length === 0) && (
                <div className="text-center py-8 card">
                    <p className="text-gray-400">No hay eventos registrados para este partido</p>
                </div>
            )}
        </div>
    )
}

export default MatchDetail