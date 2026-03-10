import api from './api'
import { Tournament, TournamentStats, TournamentWinner } from '../types/tournament'
import { ApiResponse } from '../types/common'

export const tournamentService = {
    async getAll(): Promise<Tournament[]> {
        const { data } = await api.get<ApiResponse<Tournament[]>>('/tournaments')
        return data.data || []
    },

    async getById(id: number): Promise<Tournament> {
        const { data } = await api.get<ApiResponse<Tournament>>(`/tournaments/${id}`)
        return data.data!
    },

    async getStats(id: number): Promise<TournamentStats> {
        const { data } = await api.get<ApiResponse<TournamentStats>>(`/tournaments/${id}/stats`)
        return data.data!
    },

    async getWinners(id: number): Promise<TournamentWinner[]> {
        const { data } = await api.get<ApiResponse<TournamentWinner[]>>(`/tournaments/${id}/winners`)
        return data.data || []
    },
}