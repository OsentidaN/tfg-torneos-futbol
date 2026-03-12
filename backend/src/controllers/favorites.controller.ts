import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { catchAsync, AppError } from '../middlewares/error.middleware';
import { FavoriteType } from '@prisma/client';

// ============================================
// TOGGLE FAVORITE
// ============================================
export const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { targetId, type } = req.body; // targetId is matchId or seasonId, type is 'MATCH' or 'SEASON'

    if (!targetId || !type) {
        throw new AppError('targetId y type son obligatorios', 400);
    }

    if (!['MATCH', 'SEASON'].includes(type)) {
        throw new AppError('Tipo de favorito no válido', 400);
    }

    const favoriteType = type as FavoriteType;
    const whereClause: any = {
        userId,
        favoriteType,
    };

    if (favoriteType === 'MATCH') {
        whereClause.matchId = targetId;
    } else {
        whereClause.seasonId = targetId;
    }

    // Buscar si ya existe
    const existingFavorite = await prisma.favorite.findFirst({
        where: whereClause
    });

    if (existingFavorite) {
        // Eliminar
        await prisma.favorite.delete({
            where: { id: existingFavorite.id }
        });

        res.json({
            status: 'success',
            message: 'Eliminado de favoritos',
            data: { isFavorite: false }
        });
    } else {
        // Añadir
        const newFavorite = await prisma.favorite.create({
            data: {
                userId,
                favoriteType,
                matchId: favoriteType === 'MATCH' ? targetId : null,
                seasonId: favoriteType === 'SEASON' ? targetId : null
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Añadido a favoritos',
            data: { 
                favorite: newFavorite,
                isFavorite: true 
            }
        });
    }
});

// ============================================
// GET MY FAVORITES
// ============================================
export const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
            match: {
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    season: {
                        include: {
                            tournament: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Para las temporadas, como no tienen relación directa en el esquema mas allá de seasonId, 
    // tenemos que traer los datos manualmente o ajustar el esquema. 
    // Dado que seasonId está en favorite, podemos mapear y traer las temporadas.
    
    const favoritesWithDetails = await Promise.all(favorites.map(async (fav) => {
        if (fav.favoriteType === 'SEASON' && fav.seasonId) {
            const season = await prisma.season.findUnique({
                where: { id: fav.seasonId },
                include: { tournament: true }
            });
            return { ...fav, season };
        }
        return fav;
    }));

    res.json({
        status: 'success',
        results: favoritesWithDetails.length,
        data: {
            favorites: favoritesWithDetails
        }
    });
});
