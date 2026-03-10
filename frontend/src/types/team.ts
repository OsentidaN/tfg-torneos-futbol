import { Match } from './match'

export interface Team {
    id: number
    name: string
    code: string | null
    flagUrl: string | null
    confederation: string | null
    apiId: number | null
    _count?: {
        matchesHome: number
        matchesAway: number
        players: number
    }
}

export interface TeamStats {
    team: {
        id: number
        name: string
        flagUrl: string | null
    }
    stats: {
        matchesPlayed: number
        wins: number
        draws: number
        losses: number
        goalsFor: number
        goalsAgainst: number
        goalDifference: number
        winPercentage: number
        titles: number
    }
}

export interface TeamComparison {
    team1: {
        id: number
        name: string
        flagUrl: string | null
        wins: number
    }
    team2: {
        id: number
        name: string
        flagUrl: string | null
        wins: number
    }
    headToHead: {
        totalMatches: number
        team1Wins: number
        team2Wins: number
        draws: number
        matches: Match[]
    }
}