import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Team } from '@/types/team'
import { motion } from 'framer-motion'

interface TeamCardProps {
    team: Team
}

const TeamCard = ({ team }: TeamCardProps) => {
    const totalMatches = (team._count?.matchesHome || 0) + (team._count?.matchesAway || 0)

    return (
        <Link to={`/equipos/${team.id}`}>
            <motion.div
                className="card-hover group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                            {totalMatches} partidos
                        </p>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

export default TeamCard