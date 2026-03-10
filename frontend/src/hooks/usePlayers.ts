import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { playerService } from '../services/playerService'
import { Player, PlayerWithStats, TopScorer, PlayerSeasonStats } from '../types/player'

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

export const usePlayers = (params: PlayersParams = {}): UseQueryResult<Player[], Error> => {
    return useQuery({
        queryKey: ['players', params],
        queryFn: () => playerService.getAll(params),
    })
}

export const usePlayer = (id: number | undefined): UseQueryResult<PlayerWithStats, Error> => {
    return useQuery({
        queryKey: ['player', id],
        queryFn: () => playerService.getById(id!),
        enabled: !!id,
    })
}

export const useTopScorers = (params: TopScorersParams = {}): UseQueryResult<TopScorer[], Error> => {
    return useQuery({
        queryKey: ['top-scorers', params],
        queryFn: () => playerService.getTopScorers(params),
    })
}

export const useTopAssists = (params: TopScorersParams = {}): UseQueryResult<TopScorer[], Error> => {
    return useQuery({
        queryKey: ['top-assists', params],
        queryFn: () => playerService.getTopAssists(params),
    })
}

export const usePlayerStatsBySeason = (
    playerId: number | undefined,
    seasonId: number | undefined
): UseQueryResult<PlayerSeasonStats, Error> => {
    return useQuery({
        queryKey: ['player-stats-season', playerId, seasonId],
        queryFn: () => playerService.getStatsBySeason(playerId!, seasonId!),
        enabled: !!playerId && !!seasonId,
    })
}