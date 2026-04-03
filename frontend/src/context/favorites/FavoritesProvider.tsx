import { useMemo, ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { FavoriteType } from '../../types'
import { FavoritesContext, FavoritesContextType } from './favoritesContext'
import * as api from '../../services/api'

interface FavoritesProviderProps {
    children: ReactNode
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
    const { user, isAuthenticated } = useAuth()

    // Derived state con useMemo - dependencias correctas para React Compiler
    const favorites = useMemo(() => {
        if (!isAuthenticated || !user?.favorites) {
            return { seasons: [], matches: [] }
        }

        const seasonFavs = user.favorites.filter((f) => f.favoriteType === 'SEASON')
        const matchFavs = user.favorites.filter((f) => f.favoriteType === 'MATCH')

        return {
            seasons: seasonFavs,
            matches: matchFavs,
        }
    }, [user, isAuthenticated]) // Cambiado: usar 'user' completo

    const isFavorite = (type: FavoriteType, id: number): boolean => {
        if (type === 'SEASON') {
            return favorites.seasons.some((f) => f.seasonId === id)
        }
        if (type === 'MATCH') {
            return favorites.matches.some((f) => f.matchId === id)
        }
        return false
    }

    const toggleFavorite = async (type: FavoriteType, id: number): Promise<void> => {
        try {
            await api.toggleFavorite({ targetId: id, type })
            // Nota: Para una actualización en tiempo real perfecta, 
            // este Context debería solicitar al AuthContext que vuelva a buscar al usuario.
            // Actualmente recargar la página o volver a la vista actualiza el estado.
        } catch (error) {
            console.error('Error toggling favorite:', error)
            throw error
        }
    }

    const value: FavoritesContextType = {
        favorites,
        isFavorite,
        toggleFavorite,
    }

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}