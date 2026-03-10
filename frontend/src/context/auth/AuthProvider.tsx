import { useState, useEffect, ReactNode } from 'react'
import { authService } from '@services/authService'
import { LoginCredentials, RegisterData, User } from '../../types/auth'
import { AuthContext, AuthContextType } from './authContext'

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Cargar usuario actual al montar
    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await authService.getCurrentUser()
            if (currentUser) setUser(currentUser)
            setLoading(false)
        }
        fetchUser()
    }, [])

    const login = async (credentials: LoginCredentials) => {
        const data = await authService.login(credentials)
        setUser(data.data.user)
    }

    const register = async (userData: RegisterData) => {
        const data = await authService.register(userData)
        setUser(data.data.user)
    }

    const logout = () => {
        authService.logout()
        setUser(null)
    }

    const updateUser = async () => {
        const updatedUser = await authService.getMe()
        setUser(updatedUser)
    }

    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}