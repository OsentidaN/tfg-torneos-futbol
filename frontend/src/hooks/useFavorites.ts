import { useContext } from 'react'
import { FavoritesContext, FavoritesContextType } from '@context/favorites/favoritesContext'


export const useFavorites = (): FavoritesContextType => {
    const context = useContext(FavoritesContext)
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider')
    }
    return context
}