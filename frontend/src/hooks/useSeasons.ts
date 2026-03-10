import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { seasonService } from '@services/seasonService'
import { Season } from '../types/seasons'
import { Match } from '../types/match'
import { TopScorer } from '../types/player'

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

export const useSeasons = (params: SeasonsParams = {}): UseQueryResult<Season[], Error> => {
    return useQuery({
        queryKey: ['seasons', params],
        queryFn: () => seasonService.getAll(params),
    })
}

export const useSeason = (id: number | undefined): UseQueryResult<Season, Error> => {
    return useQuery({
        queryKey: ['season', id],
        queryFn: () => seasonService.getById(id!),
        enabled: !!id,
    })
}

export const useSeasonMatches = (
    id: number | undefined,
    params: SeasonMatchesParams = {}
): UseQueryResult<Match[], Error> => {
    return useQuery({
        queryKey: ['season-matches', id, params],
        queryFn: () => seasonService.getMatches(id!, params),
        enabled: !!id,
    })
}

export const useSeasonTopScorers = (
    id: number | undefined,
    params: SeasonTopScorersParams = {}
): UseQueryResult<TopScorer[], Error> => {
    return useQuery({
        queryKey: ['season-top-scorers', id, params],
        queryFn: () => seasonService.getTopScorers(id!, params),
        enabled: !!id,
    })
}