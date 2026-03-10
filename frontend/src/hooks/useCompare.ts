import { useState } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { teamService } from '../services/teamService'
import { TeamComparison } from '../types/team'

interface UseCompareReturn {
    team1Id: number | null
    team2Id: number | null
    comparison: TeamComparison | undefined
    isLoading: boolean
    error: Error | null
    selectTeam1: (id: number) => void
    selectTeam2: (id: number) => void
    clearTeam1: () => void
    clearTeam2: () => void
    clearBoth: () => void
    canCompare: boolean
}

export const useCompare = (): UseCompareReturn => {
    const [team1Id, setTeam1Id] = useState<number | null>(null)
    const [team2Id, setTeam2Id] = useState<number | null>(null)

    const {
        data: comparison,
        isLoading,
        error
    }: UseQueryResult<TeamComparison, Error> = useQuery({
        queryKey: ['team-comparison', team1Id, team2Id],
        queryFn: () => teamService.compare(team1Id!, team2Id!),
        enabled: !!team1Id && !!team2Id,
    })

    const selectTeam1 = (id: number) => setTeam1Id(id)
    const selectTeam2 = (id: number) => setTeam2Id(id)
    const clearTeam1 = () => setTeam1Id(null)
    const clearTeam2 = () => setTeam2Id(null)
    const clearBoth = () => {
        setTeam1Id(null)
        setTeam2Id(null)
    }

    return {
        team1Id,
        team2Id,
        comparison,
        isLoading,
        error,
        selectTeam1,
        selectTeam2,
        clearTeam1,
        clearTeam2,
        clearBoth,
        canCompare: !!team1Id && !!team2Id,
    }
}