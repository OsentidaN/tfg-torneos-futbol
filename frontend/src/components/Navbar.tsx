import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHouse, 
    faTrophy, 
    faCalendarDays, 
    faUsers, 
    faChartLine, 
    faCodeCompare, 
    faRightToBracket, 
    faRightFromBracket 
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <NavLink to="/" className="navbar-logo" style={{ marginRight: '2rem' }}>
                    ⚽ Fútbol en Datos
                </NavLink>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ul className="navbar-links">
                        <li><NavLink to="/" end><FontAwesomeIcon icon={faHouse} style={{ fontSize: '0.9rem' }} /> Inicio</NavLink></li>
                        <li><NavLink to="/torneos"><FontAwesomeIcon icon={faTrophy} style={{ fontSize: '0.9rem' }} /> Torneos</NavLink></li>
                        <li><NavLink to="/partidos"><FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: '0.9rem' }} /> Partidos</NavLink></li>
                        <li><NavLink to="/equipos"><FontAwesomeIcon icon={faUsers} style={{ fontSize: '0.9rem' }} /> Equipos</NavLink></li>
                        <li><NavLink to="/comparar"><FontAwesomeIcon icon={faCodeCompare} style={{ fontSize: '0.9rem' }} /> Comparar</NavLink></li>
                        <li><NavLink to="/estadisticas"><FontAwesomeIcon icon={faChartLine} style={{ fontSize: '0.9rem' }} /> Estadísticas</NavLink></li>
                    </ul>

                    <div className="auth-group">
                        {user ? (
                            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>
                                <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: '0.4rem' }} /> Cerrar Sesión
                            </button>
                        ) : (
                            <NavLink to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}>
                                <FontAwesomeIcon icon={faRightToBracket} style={{ marginRight: '0.4rem' }} /> Iniciar Sesión
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
