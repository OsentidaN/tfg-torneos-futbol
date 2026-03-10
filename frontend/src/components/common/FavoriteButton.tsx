import { Heart } from 'lucide-react'
import { useFavorites } from '@hooks/useFavorites'
import { FavoriteType } from '../../types'
import { motion } from 'framer-motion'

interface FavoriteButtonProps {
    type: FavoriteType
    id: number
    className?: string
}

const FavoriteButton = ({ type, id, className = '' }: FavoriteButtonProps) => {
    const { isFavorite, toggleFavorite } = useFavorites()
    const favorite = isFavorite(type, id)

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        await toggleFavorite(type, id)
    }

    return (
        <motion.button
            onClick={handleClick}
            className={`p-2 rounded-full hover:bg-field-gray transition-colors ${className}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <Heart
                className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                    }`}
            />
        </motion.button>
    )
}

export default FavoriteButton