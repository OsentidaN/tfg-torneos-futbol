import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { teamService } from '../services/teamService'
import { Team, TeamStats } from '../types/team'
import { Match } from '../types//match'

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

export const useTeams = (params: TeamsParams = {}): UseQueryResult<Team[], Error> => {
    return useQuery({
        queryKey: ['teams', params],
        queryFn: () => teamService.getAll(params),
    })
}

export const useTeam = (id: number | undefined): UseQueryResult<Team, Error> => {
    return useQuery({
        queryKey: ['team', id],
        queryFn: () => teamService.getById(id!),
        enabled: !!id,
    })
}

export const useTeamMatches = (
    id: number | undefined,
    params: TeamMatchesParams = {}
): UseQueryResult<Match[], Error> => {
    return useQuery({
        queryKey: ['team-matches', id, params],
        queryFn: () => teamService.getMatches(id!, params),
        enabled: !!id,
    })
}

export const useTeamStats = (id: number | undefined): UseQueryResult<TeamStats, Error> => {
    return useQuery({
        queryKey: ['team-stats', id],
        queryFn: () => teamService.getStats(id!),
        enabled: !!id,
    })
}