import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Heart } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
        setIsOpen(false)
    }

    const navLinks = [
        { to: '/', label: 'Inicio' },
        { to: '/torneos', label: 'Torneos' },
        { to: '/partidos', label: 'Partidos' },
        { to: '/equipos', label: 'Equipos' },
        { to: '/comparar', label: 'Comparar' },
        { to: '/estadisticas', label: 'Estadísticas' },
    ]

    return (
        <nav className="bg-field-charcoal border-b border-field-gray sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-linear-to-br from-pitch-green to-pitch-dark rounded-full flex items-center justify-center">
                            <span className="text-2xl">⚽</span>
                        </div>
                        <span className="text-xl font-display font-bold gradient-text hidden sm:block">
                            Fútbol en Datos
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-field-gray transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/favoritos"
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-field-gray transition-colors flex items-center space-x-2"
                                >
                                    <Heart className="w-4 h-4" />
                                    <span>Favoritos</span>
                                </Link>
                                <div className="flex items-center space-x-2 px-4 py-2 bg-field-gray rounded-lg">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm">{user?.name}</span>
                                </div>
                                <button onClick={handleLogout} className="btn-secondary flex items-center space-x-2">
                                    <LogOut className="w-4 h-4" />
                                    <span>Salir</span>
                                </button>
                            </>
                        ) : (
                            <Link to="/auth/login" className="btn-primary">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-field-gray"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-field-gray">
                        <div className="flex flex-col space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-field-gray transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/favoritos"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-field-gray transition-colors flex items-center space-x-2"
                                    >
                                        <Heart className="w-4 h-4" />
                                        <span>Favoritos</span>
                                    </Link>
                                    <div className="px-4 py-2 text-sm text-gray-400">{user?.name}</div>
                                    <button
                                        onClick={handleLogout}
                                        className="mx-4 btn-secondary flex items-center justify-center space-x-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Cerrar Sesión</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/auth/login"
                                    onClick={() => setIsOpen(false)}
                                    className="mx-4 btn-primary text-center"
                                >
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar