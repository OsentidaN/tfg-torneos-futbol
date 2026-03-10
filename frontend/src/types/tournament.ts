import { TournamentType } from './common'
import { Season } from './seasons'

export interface Tournament {
    id: number
    name: string
    type: TournamentType
    seasons?: Season[]
    _count?: {
        seasons: number
    }
}

export interface TournamentStats {
    tournament: {
        id: number
        name: string
        type: TournamentType
    }

    stats: {
        totalSeasons: number
        totalMatches: number
        finishedMatches: number
        totalGoals: number
        avgGoalsPerMatch: number
    }   
}

export interface TournamentWinner {
    year: number;
    winner: {
        id: number;
        name: string;
        flagUrl: string | null;
    };
    runnerUp: {          
        id: number;
        name: string;
        flagUrl: string | null;
    };
    result: {
        regular: string;
        penalties: string | null;
    };
    date: string;
    venue: string | null;
    city: string | null;
}

