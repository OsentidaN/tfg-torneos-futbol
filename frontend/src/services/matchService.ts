import api from './api'
import { Match, MatchEvent, Lineup, MatchPlayerStats } from '../types/match'
import { ApiResponse } from '../types/common'

interface MatchesParams {
    seasonId?: number
    teamId?: number
    stage?: string
    status?: string
    limit?: number
    page?: number
}

interface MatchesResponse {
    data: Match[]
    total: number
    page: number
    totalPages: number
}

export const matchService = {
    async getAll(params: MatchesParams = {}): Promise<MatchesResponse> {
        const { data } = await api.get<ApiResponse<Match[]>>('/matches', { params })
        return {
            data: data.data || [],
            total: data.total || 0,
            page: data.page || 1,
            totalPages: data.totalPages || 1,
        }
    },

    async getById(id: number): Promise<Match> {
        const { data } = await api.get<ApiResponse<Match>>(`/matches/${id}`)
        return data.data!
    },

    async getEvents(id: number): Promise<MatchEvent[]> {
        const { data } = await api.get<ApiResponse<MatchEvent[]>>(`/matches/${id}/events`)
        return data.data || []
    },

    async getLineups(id: number): Promise<Lineup[]> {
    const { data } = await api.get<ApiResponse<Lineup[]>>(`/matches/${id}/lineups`)
    return data.data || []
    },

    async getPlayerStats(id: number): Promise<MatchPlayerStats[]> {
        const { data } = await api.get<ApiResponse<MatchPlayerStats[]>>(`/matches/${id}/player-stats`)
        return data.data || []
    },
}