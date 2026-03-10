
export interface ApiResponse <T>{

    status: 'success' | 'fail' | 'error'
    data?: T
    mesasge?: string
    results?: number
    total?: number
    page?: number
    totalPages?: number

}

export interface ApiError{

    status: 'fail' | 'error'
    message: string
    error?: Record<string, string[]> 
}

export type TournamentType = 'WORLD_CUP' | 'EURO_CUP'
export type MatchStage = 'GROUP' | 'ROUND_OF_16' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL'
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
export type Position = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD'
export type EventType = 'GOAL' | 'OWN_GOAL' | 'PENALTY' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION'
export type FavoriteType = 'SEASON' | 'MATCH' 