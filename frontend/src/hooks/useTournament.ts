import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { tournamentService } from '../services/tournamentService'
import { Tournament, TournamentStats, TournamentWinner } from '../types/tournament'

export const useTournaments = (): UseQueryResult<Tournament[], Error> => {
    return useQuery({
        queryKey: ['tournaments'],
        queryFn: () => tournamentService.getAll(),
    })
}

export const useTournament = (id: number | undefined): UseQueryResult<Tournament, Error> => {
    return useQuery({
        queryKey: ['tournament', id],
        queryFn: () => tournamentService.getById(id!),
        enabled: !!id,
    })
}

export const useTournamentStats = (id: number | undefined): UseQueryResult<TournamentStats, Error> => {
    return useQuery({
        queryKey: ['tournament-stats', id],
        queryFn: () => tournamentService.getStats(id!),
        enabled: !!id,
    })
}

export const useTournamentWinners = (id: number | undefined): UseQueryResult<TournamentWinner[], Error> => {
    return useQuery({
        queryKey: ['tournament-winners', id],
        queryFn: () => tournamentService.getWinners(id!),
        enabled: !!id,
    })
}