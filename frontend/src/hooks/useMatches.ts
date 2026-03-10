import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { matchService } from '@services/matchService'
import { Match, MatchEvent, MatchPlayerStats, Lineup } from '../types/match'

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

export const useMatches = (params: MatchesParams = {}): UseQueryResult<MatchesResponse, Error> => {
    return useQuery({
        queryKey: ['matches', params],
        queryFn: () => matchService.getAll(params),
    })
}

export const useMatch = (id: number | undefined): UseQueryResult<Match, Error> => {
    return useQuery({
        queryKey: ['match', id],
        queryFn: () => matchService.getById(id!),
        enabled: !!id,
    })
}

export const useMatchEvents = (id: number | undefined): UseQueryResult<MatchEvent[], Error> => {
    return useQuery({
        queryKey: ['match-events', id],
        queryFn: () => matchService.getEvents(id!),
        enabled: !!id,
    })
}

// Cambiado a Lineup[] según lo que devuelve el servicio
export const useMatchLineups = (id: number | undefined): UseQueryResult<Lineup[], Error> => {
    return useQuery({
        queryKey: ['match-lineups', id],
        queryFn: () => matchService.getLineups(id!),
        enabled: !!id,
    })
}

export const useMatchPlayerStats = (id: number | undefined): UseQueryResult<MatchPlayerStats[], Error> => {
    return useQuery({
        queryKey: ['match-player-stats', id],
        queryFn: () => matchService.getPlayerStats(id!),
        enabled: !!id,
    })
}