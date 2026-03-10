import api from './api'
import { Team, TeamStats, TeamComparison } from '../types/team'
import { Match } from '../types/match'
import { ApiResponse } from '../types/common'

interface TeamsParams {
    search?: string
    confederation?: string
    limit?: number
    page?: number
}

interface TeamMatchesParams {
    seasonId?: number
    stage?: string
    limit?: number
}

export const teamService = {
    async getAll(params: TeamsParams = {}): Promise<Team[]> {
        const { data } = await api.get<ApiResponse<Team[]>>('/teams', { params })
        return data.data || []
    },

    async getById(id: number): Promise<Team> {
        const { data } = await api.get<ApiResponse<Team>>(`/teams/${id}`)
        return data.data!
    },

    async getMatches(id: number, params: TeamMatchesParams = {}): Promise<Match[]> {
        const { data } = await api.get<ApiResponse<Match[]>>(`/teams/${id}/matches`, { params })
        return data.data || []
    },

    async getStats(id: number): Promise<TeamStats> {
        const { data } = await api.get<ApiResponse<TeamStats>>(`/teams/${id}/stats`)
        return data.data!
    },

    async compare(team1Id: number, team2Id: number): Promise<TeamComparison> {
        const { data } = await api.get<ApiResponse<TeamComparison>>(
            `/teams/compare?team1=${team1Id}&team2=${team2Id}`
        )
        return data.data!
    },
}