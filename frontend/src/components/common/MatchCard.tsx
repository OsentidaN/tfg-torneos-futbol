import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import { Match } from '@/types/match'
import { formatDate, formatScore } from '@utils/formatters'
import { STAGE_NAMES, STATUS_COLORS } from '@utils/constants'
import { motion } from 'framer-motion'

interface MatchCardProps {
    match: Match
}

const MatchCard = ({ match }: MatchCardProps) => {
    return (
        <Link to={`/partidos/${match.id}`}>
            <motion.div
                className="card-hover"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
            </motion.div>
        </Link>
    )
}

export default MatchCard