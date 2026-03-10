// ============================================
// API
// ============================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ============================================
// APP INFO
// ============================================

export const APP_NAME = 'Fútbol en Datos'
export const APP_VERSION = '1.0.0'

// ============================================
// TOURNAMENT TYPES
// ============================================

export const TOURNAMENT_TYPES = {
    WORLD_CUP: 'WORLD_CUP',
    EURO_CUP: 'EURO_CUP',
} as const

export const TOURNAMENT_NAMES: Record<string, string> = {
    WORLD_CUP: 'Copa Mundial de la FIFA',
    EURO_CUP: 'Campeonato de Europa de la UEFA',
}

export const TOURNAMENT_DESCRIPTIONS: Record<string, string> = {
    WORLD_CUP: 'El torneo de fútbol más importante del mundo, celebrado cada 4 años.',
    EURO_CUP: 'El campeonato continental de fútbol de la UEFA, celebrado cada 4 años.',
}

// ============================================
// MATCH STAGES
// ============================================

export const MATCH_STAGES = {
    GROUP: 'GROUP',
    ROUND_OF_16: 'ROUND_OF_16',
    QUARTER_FINAL: 'QUARTER_FINAL',
    SEMI_FINAL: 'SEMI_FINAL',
    THIRD_PLACE: 'THIRD_PLACE',
    FINAL: 'FINAL',
} as const

export const STAGE_NAMES: Record<string, string> = {
    GROUP: 'Fase de Grupos',
    ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINAL: 'Cuartos de Final',
    SEMI_FINAL: 'Semifinales',
    THIRD_PLACE: 'Tercer Lugar',
    FINAL: 'Final',
}

// ============================================
// MATCH STATUS
// ============================================

export const MATCH_STATUS = {
    SCHEDULED: 'SCHEDULED',
    LIVE: 'LIVE',
    FINISHED: 'FINISHED',
    POSTPONED: 'POSTPONED',
    CANCELLED: 'CANCELLED',
} as const

export const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: 'text-blue-400',
    LIVE: 'text-green-400',
    FINISHED: 'text-gray-400',
    POSTPONED: 'text-yellow-400',
    CANCELLED: 'text-red-400',
}

// ============================================
// PLAYER POSITIONS
// ============================================

export const POSITIONS = {
    GOALKEEPER: 'GOALKEEPER',
    DEFENDER: 'DEFENDER',
    MIDFIELDER: 'MIDFIELDER',
    FORWARD: 'FORWARD',
} as const

export const POSITION_NAMES: Record<string, string> = {
    GOALKEEPER: 'Portero',
    DEFENDER: 'Defensa',
    MIDFIELDER: 'Centrocampista',
    FORWARD: 'Delantero',
}

export const POSITION_ABBREVIATIONS: Record<string, string> = {
    GOALKEEPER: 'POR',
    DEFENDER: 'DEF',
    MIDFIELDER: 'MED',
    FORWARD: 'DEL',
}

// ============================================
// EVENT TYPES
// ============================================
export const EVENT_TYPES = {
    GOAL: 'GOAL',
    OWN_GOAL: 'OWN_GOAL',
    PENALTY: 'PENALTY',
    PENALTY_MISSED: 'PENALTY_MISSED',
    YELLOW_CARD: 'YELLOW_CARD',
    RED_CARD: 'RED_CARD',
    SUBSTITUTION: 'SUBSTITUTION',
    FOUL: 'FOUL',
    OFFSIDE: 'OFFSIDE',
    CORNER: 'CORNER',
    GOAL_ASSIST: 'GOAL_ASSIST',
} as const

// ============================================
// EVENT ICONS
// ============================================
export const EVENT_ICONS: Record<keyof typeof EVENT_TYPES, string> = {
    GOAL: '⚽',             // Gol normal
    OWN_GOAL: '🥅❌',       // Gol en propia puerta
    PENALTY: '⚽🎯',        // Penalti convertido
    PENALTY_MISSED: '⚽❌',  // Penalti fallado
    YELLOW_CARD: '🟨',      // Tarjeta amarilla
    RED_CARD: '🟥',         // Tarjeta roja
    SUBSTITUTION: '🔄',     // Sustitución
    FOUL: '🚫',             // Falta
    OFFSIDE: '🚩',           // Fuera de juego
    CORNER: '⚡',            // Saque de esquina
    GOAL_ASSIST: '🅰️',     // Asistencia de gol
}

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// ============================================
// LOCAL STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME: 'theme',
    FAVORITES: 'favorites',
} as const

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
    HOME: '/',
    TOURNAMENTS: '/torneos',
    TOURNAMENT_DETAIL: '/torneos/:id',
    TOURNAMENT_MATCHES: '/torneos/:id/partidos',
    TOURNAMENT_SCORERS: '/torneos/:id/goleadores',
    TEAM_IN_TOURNAMENT: '/torneos/:tournamentId/equipos/:teamId',
    MATCHES: '/partidos',
    MATCH_DETAIL: '/partidos/:id',
    TEAMS: '/equipos',
    TEAM_DETAIL: '/equipos/:id',
    COMPARE: '/comparar',
    STATISTICS: '/estadisticas',
    STATISTICS_WORLD_CUP: '/estadisticas/mundial',
    STATISTICS_EURO: '/estadisticas/eurocopa',
    STATISTICS_CURIOSITIES: '/estadisticas/curiosidades',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FAVORITES: '/favoritos',
} as const

// ============================================
// FAVORITE TYPES
// ============================================

export const FAVORITE_TYPES = {
    SEASON: 'SEASON',
    MATCH: 'MATCH',
    TEAM: 'TEAM',
} as const