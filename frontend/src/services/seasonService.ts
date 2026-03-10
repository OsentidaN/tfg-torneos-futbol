import api from './api'
import { Season } from '../types/seasons'
import { Match } from '../types/match'
import { TopScorer } from '../types/player'
import { ApiResponse } from '../types/common'

interface SeasonsParams {
    tournamentId?: number
    year?: number
    limit?: number
    page?: number
}

interface SeasonMatchesParams {
    stage?: string
    teamId?: number
    limit?: number
}

interface SeasonTopScorersParams {
    limit?: number
}

export const seasonService = {
    async getAll(params: SeasonsParams = {}): Promise<Season[]> {
        const { data } = await api.get<ApiResponse<Season[]>>('/seasons', { params })
        return data.data || []
    },

    async getById(id: number): Promise<Season> {
        const { data } = await api.get<ApiResponse<Season>>(`/seasons/${id}`)
        return data.data!
    },

    async getMatches(id: number, params: SeasonMatchesParams = {}): Promise<Match[]> {
        const { data } = await api.get<ApiResponse<Match[]>>(`/seasons/${id}/matches`, { params })
        return data.data || []
    },

    async getTopScorers(id: number, params: SeasonTopScorersParams = {}): Promise<TopScorer[]> {
        const { data } = await api.get<ApiResponse<TopScorer[]>>(
            `/seasons/${id}/top-scorers`,
            { params }
        )
        return data.data || []
    },
}