import { useFavorites } from '@hooks/useFavorites'
import { Heart } from 'lucide-react'

const Favorites = () => {
    const { favorites } = useFavorites()

    const hasFavorites = favorites.seasons.length > 0 || favorites.matches.length > 0

    return (
        <div className="container-custom py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                    Mis Favoritos
                </h1>
                <p className="text-gray-400 text-lg">
                    Tus torneos y partidos guardados
                </p>
            </div>

            {hasFavorites ? (
                <div className="space-y-8">
                    {/* Favorite Seasons */}
                    {favorites.seasons.length > 0 && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4">Torneos Favoritos</h2>
                            <div className="space-y-3">
                                {favorites.seasons.map(fav => (
                                    <div key={fav.id} className="p-4 bg-field-gray rounded-lg">
                                        <p>Torneo ID: {fav.seasonId}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Favorite Matches */}
                    {favorites.matches.length > 0 && (
                        <div className="card">
                            <h2 className="text-2xl font-bold mb-4">Partidos Favoritos</h2>
                            <div className="space-y-3">
                                {favorites.matches.map(fav => (
                                    <div key={fav.id} className="p-4 bg-field-gray rounded-lg">
                                        <p>Partido ID: {fav.matchId}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16 card">
                    <Heart className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">No tienes favoritos aún</h3>
                    <p className="text-gray-400 mb-6">
                        Explora torneos y partidos para añadir a tus favoritos
                    </p>
                </div>
            )}
        </div>
    )
}

export default Favorites