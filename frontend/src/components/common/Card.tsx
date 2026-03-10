import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    hover?: boolean
    onClick?: () => void
    className?: string
}

const Card = ({ children, hover = false, onClick, className = '' }: CardProps) => {
    const baseClass = hover ? 'card-hover' : 'card'

    if (hover) {
        return (
            <motion.div
                className={`${baseClass} ${className}`}
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {children}
            </motion.div>
        )
    }

    return <div className={`${baseClass} ${className}`}>{children}</div>
}

export default Card