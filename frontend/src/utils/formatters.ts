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

const COUNTRY_TRANSLATIONS: Record<string, string> = {
    // Top European Teams
    "Spain": "España",
    "Germany": "Alemania",
    "England": "Inglaterra",
    "Italy": "Italia",
    "France": "Francia",
    "Netherlands": "Países Bajos",
    "Belgium": "Bélgica",
    "Portugal": "Portugal",
    "Croatia": "Croacia",
    "Switzerland": "Suiza",
    "Denmark": "Dinamarca",
    "Sweden": "Suecia",
    "Poland": "Polonia",
    "Serbia": "Serbia",
    "Wales": "Gales",
    "Scotland": "Escocia",
    "Austria": "Austria",
    "Czech Republic": "República Checa",
    "Hungary": "Hungría",
    "Romania": "Rumanía",
    "Slovakia": "Eslovaquia",
    "Ukraine": "Ucrania",
    "Greece": "Grecia",
    "Turkey": "Turquía",
    "Republic of Ireland": "Irlanda",
    "Northern Ireland": "Irlanda del Norte",
    "Iceland": "Islandia",
    "Russia": "Rusia",
    "Soviet Union": "Unión Soviética",
    "Yugoslavia": "Yugoslavia",
    "Czechoslovakia": "Checoslovaquia",
    "Bosnia and Herzegovina": "Bosnia y Herzegovina",
    "Finland": "Finlandia",

    // Top American Teams
    "Brazil": "Brasil",
    "Argentina": "Argentina",
    "Uruguay": "Uruguay",
    "Colombia": "Colombia",
    "Chile": "Chile",
    "Ecuador": "Ecuador",
    "Peru": "Perú",
    "Paraguay": "Paraguay",
    "Bolivia": "Bolivia",
    "Venezuela": "Venezuela",
    "United States": "Estados Unidos",
    "Mexico": "México",
    "Canada": "Canadá",
    "Costa Rica": "Costa Rica",
    "Honduras": "Honduras",
    "Panama": "Panamá",
    "El Salvador": "El Salvador",
    "Jamaica": "Jamaica",
    
    // Top African Teams
    "Senegal": "Senegal",
    "Morocco": "Marruecos",
    "Cameroon": "Camerún",
    "Nigeria": "Nigeria",
    "Egypt": "Egipto",
    "Ghana": "Ghana",
    "Ivory Coast": "Costa de Marfil",
    "Algeria": "Argelia",
    "Tunisia": "Túnez",
    "South Africa": "Sudáfrica",
    
    // Top Asian/Oceania Teams
    "Japan": "Japón",
    "South Korea": "Corea del Sur",
    "Iran": "Irán",
    "Saudi Arabia": "Arabia Saudita",
    "Australia": "Australia",
    "New Zealand": "Nueva Zelanda",
    "Qatar": "Qatar",
    "World": "Mundial"
};

/**
 * Traduce el nombre de un país/equipo de inglés a español.
 * Si no encuentra traducción, devuelve el nombre original.
 * @param name Nombre en inglés
 * @returns Nombre en español
 */
export const translateCountryName = (name: string | null | undefined): string => {
    if (!name) return '';
    return COUNTRY_TRANSLATIONS[name] || name;
};
