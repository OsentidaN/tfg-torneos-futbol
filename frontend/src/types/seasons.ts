import { Tournament } from './tournament'
import { Match } from './match'

export interface Season {
    id: number
    tournamentId: number
    year: number
    hostCountry: string | null
    startDate: string | null
    endDate: string | null
    winner: string | null
    imageUrl: string | null
    apiId: number | null
    tournament?: Tournament
    matches?: Match[]
    seasonTeams?: SeasonTeam[]
    _count?: {
        matches: number
        seasonTeams: number
    }
}

export interface SeasonTeam {
    id: number
    seasonId: number
    teamId: number
    group: string | null
    played: number
    won: number
    drawn: number
    lost: number
    goalsFor: number
    goalsAgainst: number
    points: number
    position: number | null
    team: {
        id: number
        name: string
        code: string | null
        flagUrl: string | null
    }
}