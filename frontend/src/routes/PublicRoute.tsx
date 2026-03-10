import { Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Loader from '@components/common/Loader'
import { ReactNode } from 'react'

interface PublicRouteProps {
    children: ReactNode
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

export default PublicRoute