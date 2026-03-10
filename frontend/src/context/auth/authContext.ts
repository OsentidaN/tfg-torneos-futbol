import { createContext } from 'react'
import { User, LoginCredentials, RegisterData } from '../../types/auth'

export interface AuthContextType {
  user: User | null
  loading: boolean         
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)