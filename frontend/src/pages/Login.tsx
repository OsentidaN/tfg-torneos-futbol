import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await loginUser({ email, password });
            login(res.data.token, res.data.data.user);
            toast.success('Sesión iniciada correctamente');
            navigate('/');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al iniciar sesión';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page glass-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Iniciar Sesión</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Contraseña</label>
                            <Link
                                to="/forgot-password"
                                style={{ color: 'var(--accent)', fontSize: '0.8rem', textDecoration: 'none', opacity: 0.85 }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ¿No tienes sesión? <Link to="/registro" style={{ color: 'var(--accent)' }}>Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
