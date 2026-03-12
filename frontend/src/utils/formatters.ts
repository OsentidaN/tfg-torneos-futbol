/**
 * Formatea el nombre de un jugador eliminando términos como "Unknown", "desconocido", etc.
 * @param firstName Nombre del jugador
 * @param lastName Apellido del jugador
 * @returns Nombre completo formateado y limpio
 */
export const formatPlayerName = (firstName: string | null | undefined, lastName: string | null | undefined): string => {
    const clean = (name: string | null | undefined): string => {
        if (!name) return '';
        const lower = name.toLowerCase().trim();
        if (lower === 'unknown' || lower === 'desconocido') return '';
        return name.trim();
    };

    const first = clean(firstName);
    const last = clean(lastName);

    return `${first} ${last}`.trim();
};
