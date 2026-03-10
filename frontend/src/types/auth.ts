import { Match} from './match'
import { FavoriteType } from './common'
export interface User {
    id: number
    email: string
    name: string
    createdAt: string
    favorites?: Favorite[]
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    email: string
    password: string
    name: string
}

export interface AuthResponse {
    status: 'success'
    token: string
    data: {
        user: User
    }
}

export interface Favorite {
    id: number
    userId: number
    favoriteType: FavoriteType
    seasonId?: number
    matchId?: number
    createdAt: string
    match?: Match
}

