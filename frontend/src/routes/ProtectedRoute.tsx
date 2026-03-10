import { Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loader from '@components/common/Loader'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute