import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';

const Registro: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            const msg = 'La contraseña debe tener al menos 8 caracteres, números, minúsculas, mayúsculas y signos.';
            toast.error(msg);
            return;
        }

        setLoading(true);

        try {
            const res = await registerUser({ name, email, password });
            login(res.data.token, res.data.data.user);
            toast.success('¡Registro completado!');
            navigate('/');
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Error al registrar el usuario';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page glass-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h1 className="page-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Registro</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nombre</label>
                        <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                        <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Contraseña</label>
                        <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                            Al menos 8 caracteres, números, mayúsculas, minúsculas y signos.
                        </small>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)' }}>Inicia sesión aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Registro;
