import api from './api'
import { STORAGE_KEYS } from '@utils/constants'
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth'

export const authService = {
    async register(userData: RegisterData): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/auth/register', userData)
        if (data.token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user))
        }
        return data
    },

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials)
        if (data.token) {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token)
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user))
        }
        return data
    },

    async getMe(): Promise<User> {
        const { data } = await api.get<{ status: string; data: { user: User } }>('/auth/me')
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.data.user))
        return data.data.user
    },

    async updatePassword(passwords: { currentPassword: string; newPassword: string }): Promise<void> {
        await api.patch('/auth/update-password', passwords)
    },

    logout(): void {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    },

    getToken(): string | null {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER_DATA)
        return userStr ? JSON.parse(userStr) : null
    },

    isAuthenticated(): boolean {
        return !!this.getToken()
    },
}