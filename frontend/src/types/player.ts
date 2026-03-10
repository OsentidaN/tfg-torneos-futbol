import { Position } from './common'
import { Team } from './team'
import { MatchPlayerStats } from './match'

export interface Player {
    id: number
    firstName: string
    lastName: string
    birthDate: string | null
    nationality: string | null
    position: Position
    photoUrl: string | null
    teamId: number | null
    apiId: number | null
    team?: Team
    playerStats?: MatchPlayerStats[]
}

export interface PlayerWithStats extends Player {
    careerStats: {
        matchesPlayed: number
        goals: number
        assists: number
        yellowCards: number
        redCards: number
        minutesPlayed: number
        averageRating: number | null
    }
}

export interface TopScorer {
    player: {
        id: number
        firstName: string
        lastName: string
        position: Position
        team: Team
    }
    stats: {
        goals: number
        assists: number
        matchesPlayed: number
    }
}

export interface PlayerSeasonStats {
    playerId: number
    seasonId: number
    matchesPlayed: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    minutesPlayed: number
    averageRating: number | null
}