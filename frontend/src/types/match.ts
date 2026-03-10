import { MatchStage, MatchStatus, Position, EventType  } from './common'
import { Team } from './team'
import { Season } from './seasons'


export interface Match {
    id: number
    seasonId: number
    homeTeamId: number
    awayTeamId: number
    round: string
    stage: MatchStage
    matchday: number | null
    date: string
    venue: string | null
    city: string | null
    attendance: number | null
    referee: string | null
    homeGoals: number
    awayGoals: number
    homeGoalsPenalty: number | null
    awayGoalsPenalty: number | null
    status: MatchStatus
    homeTeam?: Team
    awayTeam?: Team
    season?: Season
    teamStats?: MatchTeamStats[]
    events?: MatchEvent[]
    lineups?: Lineup[]
    playerStats?: MatchPlayerStats[]
}

export interface MatchTeamStats {
    id: number
    matchId: number
    teamId: number
    possession: number | null
    shotsTotal: number | null
    shotsOnTarget: number | null
    shotsOffTarget: number | null
    shotsBlocked: number | null
    corners: number | null
    offsides: number | null
    fouls: number | null
    yellowCards: number | null
    redCards: number | null
    passes: number | null
    passesAccurate: number | null
    team?: Team
}

export interface MatchEvent {
    id: number
    matchId: number
    playerId: number | null
    teamId: number
    type: EventType
    minute: number
    extraMinute: number | null
    detail: string | null
    player?: {
        id: number
        firstName: string
        lastName: string
    }
}

export interface Lineup {
    id: number
    matchId: number
    teamId: number
    playerId: number
    starter: boolean
    position: string | null
    shirtNumber: number | null
    substituteIn: number | null
    substituteOut: number | null
    player?: {
        id: number
        firstName: string
        lastName: string
        position: Position
    }
    team?: {
        id: number
        name: string
        flagUrl: string | null
    }
}

export interface MatchPlayerStats {
    id: number
    matchId: number
    playerId: number
    minutesPlayed: number
    goals: number
    assists: number
    yellowCards: number
    redCards: number
    shotsTotal: number | null
    shotsOnTarget: number | null
    passes: number | null
    passesAccurate: string | null
    rating: number | null
    player?: {
        id: number
        firstName: string
        lastName: string
        position: Position
        team: {
            id: number
            name: string
        }
    }
}