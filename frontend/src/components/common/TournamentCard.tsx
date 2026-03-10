import { Link } from 'react-router-dom'
import { Trophy, Calendar } from 'lucide-react'
import { Tournament } from '@/types/tournament'
import { motion } from 'framer-motion'

interface TournamentCardProps {
    tournament: Tournament
}

const TournamentCard = ({ tournament }: TournamentCardProps) => {
    return (
        <Link to={`/torneos/${tournament.id}`}>
            <motion.div
                className="card-hover group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 bg-linear-to-br from-pitch-green to-pitch-dark rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 group-hover:text-pitch-light transition-colors">
                            {tournament.name}
                        </h2>

                        <div className="flex items-center space-x-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                                {tournament._count?.seasons || 0} ediciones
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

export default TournamentCard