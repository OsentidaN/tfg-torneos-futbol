import { createContext } from 'react'
import { Favorite, FavoriteType } from '../../types'

export interface FavoritesContextType {
    favorites: {
        seasons: Favorite[]
        matches: Favorite[]
    }
    isFavorite: (type: FavoriteType, id: number) => boolean
    toggleFavorite: (type: FavoriteType, id: number) => Promise<void>
}

export const FavoritesContext = createContext<FavoritesContextType | null>(null)