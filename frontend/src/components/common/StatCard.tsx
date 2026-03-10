import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon?: LucideIcon
    label: string
    value: string | number
    color?: string
}

const StatCard = ({ icon: Icon, label, value, color = 'pitch-green' }: StatCardProps) => {
    return (
        <motion.div className="card text-center" whileHover={{ scale: 1.05 }}>
            {Icon && (
                <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-${color} bg-opacity-20 mb-3`}
                >
                    <Icon className={`w-6 h-6 text-${color}`} />
                </div>
            )}
            <div className="text-3xl font-display font-bold mb-1">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </motion.div>
    )
}

export default StatCard