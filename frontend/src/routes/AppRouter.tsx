import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@components/layouts/Layout'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

// Pages
import Home from '@pages/Home'
import Tournaments from '@pages/Tournaments'
import TournamentDetail from '@pages/TournamentDetail'
import Matches from '@pages/Matches'
import MatchDetail from '@pages/MatchDetail'
import Teams from '@pages/Teams'
import TeamDetail from '@pages/TeamDetail'
import Compare from '@pages/Compare'
import Statistics from '@pages/Statistics'
import Login from '@pages/Login'
import Register from '@pages/Register'
import Favorites from '@pages/Favorites'

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="torneos" element={<Tournaments />} />
                <Route path="torneos/:id" element={<TournamentDetail />} />
                <Route path="partidos" element={<Matches />} />
                <Route path="partidos/:id" element={<MatchDetail />} />
                <Route path="equipos" element={<Teams />} />
                <Route path="equipos/:id" element={<TeamDetail />} />
                <Route path="comparar" element={<Compare />} />
                <Route path="estadisticas" element={<Statistics />} />

                {/* Auth Routes */}
                <Route
                    path="auth/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
                <Route
                    path="auth/register"
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="favoritos"
                    element={
                        <ProtectedRoute>
                            <Favorites />
                        </ProtectedRoute>
                    }
                />

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    )
}

export default AppRouter