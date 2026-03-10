import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { MatchStage } from '../types/common'

// ============================================
// DATE FORMATTERS
// ============================================

export const formatDate = (date: string | Date | null, formatStr = 'dd/MM/yyyy'): string => {
    if (!date) return '-'
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr, { locale: es })
}

export const formatDateTime = (date: string | Date | null): string => {
    return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export const formatTimeAgo = (date: string | Date | null): string => {
    if (!date) return '-'
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
}

export const formatMatchDate = (date: string | Date | null): string => {
    return formatDate(date, "d 'de' MMMM 'de' yyyy")
}

// ============================================
// NUMBER FORMATTERS
// ============================================

export const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '-'
    return new Intl.NumberFormat('es-ES').format(num)
}

export const formatPercentage = (num: number | null | undefined, decimals = 1): string => {
    if (num === null || num === undefined) return '-'
    return `${num.toFixed(decimals)}%`
}

export const formatDecimal = (num: number | null | undefined, decimals = 2): string => {
    if (num === null || num === undefined) return '-'
    return num.toFixed(decimals)
}

// ============================================
// TEXT FORMATTERS
// ============================================

export const capitalize = (str: string | null | undefined): string => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncate = (str: string | null | undefined, maxLength = 50): string => {
    if (!str || str.length <= maxLength) return str || ''
    return str.substring(0, maxLength) + '...'
}

export const formatPlayerName = (firstName: string | null, lastName: string | null): string => {
    if (!firstName && !lastName) return 'Desconocido'
    if (!firstName) return lastName || ''
    if (!lastName) return firstName || ''
    return `${firstName} ${lastName}`
}

export const formatTeamName = (name: string | null): string => {
    return name || 'Equipo Desconocido'
}

// ============================================
// SCORE FORMATTERS
// ============================================

export const formatScore = (homeGoals: number | null, awayGoals: number | null): string => {
    if (homeGoals === null || homeGoals === undefined) return '-'
    if (awayGoals === null || awayGoals === undefined) return '-'
    return `${homeGoals} - ${awayGoals}`
}

export const formatPenaltyScore = (homePen: number | null, awayPen: number | null): string | null => {
    if (homePen === null || homePen === undefined) return null
    if (awayPen === null || awayPen === undefined) return null
    return `(${homePen} - ${awayPen})`
}

interface MatchScore {
    homeGoals: number
    awayGoals: number
    homeGoalsPenalty: number | null
    awayGoalsPenalty: number | null
}

export const formatFullScore = (match: MatchScore): string => {
    const regular = formatScore(match.homeGoals, match.awayGoals)
    const penalty = formatPenaltyScore(match.homeGoalsPenalty, match.awayGoalsPenalty)
    return penalty ? `${regular} ${penalty}` : regular
}

// ============================================
// STAT FORMATTERS
// ============================================

export const formatPossession = (possession: number | null): string => {
    if (possession === null || possession === undefined) return '-'
    return `${possession}%`
}

export const formatRating = (rating: number | null): string => {
    if (rating === null || rating === undefined) return '-'
    return rating.toFixed(1)
}

export const formatMinutes = (minutes: number | null): string => {
    if (minutes === null || minutes === undefined) return '-'
    return `${minutes}'`
}

// ============================================
// STAGE FORMATTERS
// ============================================

export const getStageOrder = (stage: MatchStage): number => {
    const order: Record<MatchStage, number> = {
        GROUP: 1,
        ROUND_OF_16: 2,
        QUARTER_FINAL: 3,
        SEMI_FINAL: 4,
        THIRD_PLACE: 5,
        FINAL: 6,
    }
    return order[stage] || 0
}

interface MatchWithStage {
    stage: MatchStage
    date: string
}

export const sortByStage = <T extends MatchWithStage>(matches: T[]): T[] => {
    return [...matches].sort((a, b) => {
        const orderDiff = getStageOrder(a.stage) - getStageOrder(b.stage)
        if (orderDiff !== 0) return orderDiff
        return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
}