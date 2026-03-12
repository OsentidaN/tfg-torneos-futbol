import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

// Interceptor para inyectar token de autenticación
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- AUTH ---
export const registerUser = (data: { name: string; email: string; password: string }) => 
    api.post('/auth/register', data);

export const loginUser = (data: { email: string; password: string }) => 
    api.post('/auth/login', data);

export const getMe = () => api.get('/auth/me');

// --- TOURNAMENTS ---
export const getTournaments = () => api.get('/tournaments');
export const getTournamentById = (id: number) => api.get(`/tournaments/${id}`);
export const getTournamentStats = (id: number) => api.get(`/tournaments/${id}/stats`);
export const getTournamentWinners = (id: number) => api.get(`/tournaments/${id}/winners`);
export const getTournamentRecords = (id: number) => api.get(`/tournaments/${id}/records`);

// --- SEASONS ---
export const getSeasons = (params?: object) => api.get('/seasons', { params });
export const getSeasonById = (id: number) => api.get(`/seasons/${id}`);
export const getSeasonMatches = (id: number, params?: object) => api.get(`/seasons/${id}/matches`, { params });
export const getSeasonTopScorers = (id: number) => api.get(`/seasons/${id}/top-scorers`);

// --- TEAMS ---
export const getTeams = (params?: object) => api.get('/teams', { params });
export const getTeamById = (id: number) => api.get(`/teams/${id}`);
export const getTeamMatches = (id: number, params?: object) => api.get(`/teams/${id}/matches`, { params });
export const getTeamStats = (id: number, params?: object) => api.get(`/teams/${id}/stats`, { params });
export const compareTeams = (team1: number, team2: number, type?: string) =>
    api.get('/teams/compare', { params: { team1, team2, type } });

// --- MATCHES ---
export const getMatches = (params?: object) => api.get('/matches', { params });
export const getMatchById = (id: number) => api.get(`/matches/${id}`);
export const getMatchEvents = (id: number) => api.get(`/matches/${id}/events`);
export const getMatchLineups = (id: number) => api.get(`/matches/${id}/lineups`);
export const getMatchPlayerStats = (id: number) => api.get(`/matches/${id}/player-stats`);

// --- PLAYERS ---
export const getPlayers = (params?: object) => api.get('/players', { params });
export const getPlayerById = (id: number) => api.get(`/players/${id}`);
export const getTopScorers = (params?: object) => api.get('/players/top-scorers', { params });
export const getTopAssists = (params?: object) => api.get('/players/top-assists', { params });

// --- FAVORITES ---
export const getFavorites = () => api.get('/favorites');
export const toggleFavorite = (data: { targetId: number; type: 'MATCH' | 'SEASON' }) =>
    api.post('/favorites/toggle', data);

// --- USER PROFILE ---
export const updateProfile = (data: { name: string }) => api.patch('/auth/update-profile', data);
export const updatePassword = (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/update-password', data);
export const deleteAccount = (data: { password: string }) =>
    api.delete('/auth/delete-account', { data });

export default api;
