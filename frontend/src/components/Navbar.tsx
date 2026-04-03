import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHouse, 
    faTrophy, 
    faCalendarDays, 
    faUsers, 
    faChartLine, 
    faCodeCompare, 
    faRightToBracket, 
    faRightFromBracket,
    faStar,
    faBars,
    faXmark,
    faCircleUser,
    faSun,
    faMoon
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="container">
                <NavLink to="/" className="navbar-logo" style={{ marginRight: 'auto' }} onClick={closeMenu}>
                    ⚽ Fútbol en Datos
                </NavLink>

                {/* Desktop Menu */}
                <div className="desktop-menu">
                    <ul className="navbar-links">
                        <li><NavLink to="/" end><FontAwesomeIcon icon={faHouse} style={{ fontSize: '0.9rem' }} /> Inicio</NavLink></li>
                        <li><NavLink to="/torneos"><FontAwesomeIcon icon={faTrophy} style={{ fontSize: '0.9rem' }} /> Torneos</NavLink></li>
                        <li><NavLink to="/partidos"><FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: '0.9rem' }} /> Partidos</NavLink></li>
                        <li><NavLink to="/equipos"><FontAwesomeIcon icon={faUsers} style={{ fontSize: '0.9rem' }} /> Equipos</NavLink></li>
                        <li><NavLink to="/comparar"><FontAwesomeIcon icon={faCodeCompare} style={{ fontSize: '0.9rem' }} /> Comparar</NavLink></li>
                        <li><NavLink to="/estadisticas"><FontAwesomeIcon icon={faChartLine} style={{ fontSize: '0.9rem' }} /> Estadísticas</NavLink></li>
                        {user && (
                            <li><NavLink to="/favoritos"><FontAwesomeIcon icon={faStar} style={{ fontSize: '0.9rem' }} /> Favoritos</NavLink></li>
                        )}
                        {user && (
                            <li><NavLink to="/perfil"><FontAwesomeIcon icon={faCircleUser} style={{ fontSize: '0.9rem' }} /> Perfil</NavLink></li>
                        )}
                    </ul>

                    <div className="auth-group">
                        <button onClick={toggleTheme} className="btn btn-ghost" style={{ padding: '0.5rem', width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Cambiar tema">
                            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} style={{ fontSize: '1.1rem' }} />
                        </button>
                        {user ? (
                            <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>
                                <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '0.4rem' }} /> Cerrar Sesión
                            </button>
                        ) : (
                            <NavLink to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>
                                <FontAwesomeIcon icon={faRightToBracket} style={{ marginRight: '0.4rem' }} /> Iniciar Sesión
                            </NavLink>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <ul className="mobile-links">
                        <li><NavLink to="/" end onClick={closeMenu}><FontAwesomeIcon icon={faHouse} style={{ width: 24 }} /> Inicio</NavLink></li>
                        <li><NavLink to="/torneos" onClick={closeMenu}><FontAwesomeIcon icon={faTrophy} style={{ width: 24 }} /> Torneos</NavLink></li>
                        <li><NavLink to="/partidos" onClick={closeMenu}><FontAwesomeIcon icon={faCalendarDays} style={{ width: 24 }} /> Partidos</NavLink></li>
                        <li><NavLink to="/equipos" onClick={closeMenu}><FontAwesomeIcon icon={faUsers} style={{ width: 24 }} /> Equipos</NavLink></li>
                        <li><NavLink to="/comparar" onClick={closeMenu}><FontAwesomeIcon icon={faCodeCompare} style={{ width: 24 }} /> Comparar</NavLink></li>
                        <li><NavLink to="/estadisticas" onClick={closeMenu}><FontAwesomeIcon icon={faChartLine} style={{ width: 24 }} /> Estadísticas</NavLink></li>
                        {user && (
                            <li><NavLink to="/favoritos" onClick={closeMenu}><FontAwesomeIcon icon={faStar} style={{ width: 24 }} /> Favoritos</NavLink></li>
                        )}
                        {user && (
                            <li><NavLink to="/perfil" onClick={closeMenu}><FontAwesomeIcon icon={faCircleUser} style={{ width: 24 }} /> Perfil</NavLink></li>
                        )}
                    </ul>
                    <div className="mobile-auth">
                        <button onClick={toggleTheme} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem', marginBottom: '0.5rem', background: 'var(--bg-secondary)' }}>
                            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} style={{ marginRight: '0.4rem' }} /> Cambiar a Modo {theme === 'dark' ? 'Día' : 'Noche'}
                        </button>
                        {user ? (
                            <button onClick={handleLogout} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}>
                                <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '0.4rem' }} /> Cerrar Sesión
                            </button>
                        ) : (
                            <NavLink to="/login" className="btn btn-primary" onClick={closeMenu} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '1rem' }}>
                                <FontAwesomeIcon icon={faRightToBracket} style={{ marginRight: '0.4rem' }} /> Iniciar Sesión
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
