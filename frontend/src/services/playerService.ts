import api from './api'
import { Player, PlayerWithStats, TopScorer, PlayerSeasonStats } from '../types/player'
import { ApiResponse } from '../types/common'

interface PlayersParams {
    search?: string
    position?: string
    teamId?: number
    limit?: number
    page?: number
}

interface TopScorersParams {
    seasonId?: number
    tournamentId?: number
    limit?: number
}

export const playerService = {
    async getAll(params: PlayersParams = {}): Promise<Player[]> {
        const { data } = await api.get<ApiResponse<Player[]>>('/players', { params })
        return data.data || []
    },

    async getById(id: number): Promise<PlayerWithStats> {
        const { data } = await api.get<ApiResponse<PlayerWithStats>>(`/players/${id}`)
        return data.data!
    },

    async getTopScorers(params: TopScorersParams = {}): Promise<TopScorer[]> {
        const { data } = await api.get<ApiResponse<TopScorer[]>>('/players/top-scorers', { params })
        return data.data || []
    },

    async getTopAssists(params: TopScorersParams = {}): Promise<TopScorer[]> {
        const { data } = await api.get<ApiResponse<TopScorer[]>>('/players/top-assists', { params })
        return data.data || []
    },

    async getStatsBySeason(playerId: number, seasonId: number): Promise<PlayerSeasonStats> {
        const { data } = await api.get<ApiResponse<PlayerSeasonStats>>(
            `/players/${playerId}/stats/season`,
            { params: { seasonId } }
        )
        return data.data!
    },
}