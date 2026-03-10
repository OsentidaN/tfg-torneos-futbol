import { useMemo, ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { FavoriteType } from '../../types'
import { FavoritesContext, FavoritesContextType } from './favoritesContext'

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
        // TODO: Implementar llamada al backend cuando esté disponible
        console.log('Toggle favorite:', type, id)

        // Ejemplo de implementación futura:
        // try {
        //   if (isFavorite(type, id)) {
        //     await favoritesService.remove(type, id)
        //   } else {
        //     await favoritesService.add(type, id)
        //   }
        //   // Actualizar user en AuthContext
        //   await updateUser()
        // } catch (error) {
        //   console.error('Error toggling favorite:', error)
        //   throw error
        // }
    }

    const value: FavoritesContextType = {
        favorites,
        isFavorite,
        toggleFavorite,
    }

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}