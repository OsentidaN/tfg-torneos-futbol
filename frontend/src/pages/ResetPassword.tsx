import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

type Status = 'idle' | 'loading' | 'success' | 'error';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<Status>('idle');

    // Calcular fuerza de contraseña
    const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
        if (pwd.length === 0) return { label: '', color: 'transparent', width: '0%' };
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { label: 'Muy débil', color: '#fc8181', width: '20%' };
        if (score === 2) return { label: 'Débil', color: '#f6ad55', width: '40%' };
        if (score === 3) return { label: 'Regular', color: '#faf089', width: '60%' };
        if (score === 4) return { label: 'Fuerte', color: '#68d391', width: '80%' };
        return { label: 'Muy fuerte', color: '#38b2ac', width: '100%' };
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden.');
            return;
        }

        if (!token) {
            toast.error('Token inválido. Por favor solicita un nuevo enlace de recuperación.');
            return;
        }

        setStatus('loading');

        try {
            const res = await resetPassword(token, { password });
            setStatus('success');
            toast.success(res.data.message || 'Contraseña actualizada');

            // Login automático con el token recibido
            login(res.data.token, res.data.data.user);

            // Redirigir al inicio tras 2 segundos
            setTimeout(() => navigate('/'), 2000);
        } catch (err: any) {
            setStatus('idle');
            toast.error(err.response?.data?.message || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
        }
    };

    // Token no presente en la URL
    if (!token) {
        return (
            <div className="page glass-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
                <div className="glass-card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                    <h1 className="page-title">Enlace inválido</h1>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Este enlace de recuperación no es válido o ha expirado.
                    </p>
                    <Link to="/forgot-password" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div
            className="page glass-container"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 'calc(100vh - 64px)',
            }}
        >
            <div className="glass-card" style={{ maxWidth: '440px', width: '100%' }}>

                {/* Icon + título */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem', boxShadow: '0 8px 32px rgba(72,187,120,0.35)',
                        marginBottom: '1rem'
                    }}>
                        🔒
                    </div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
                        Nueva contraseña
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Elige una contraseña segura para tu cuenta.
                    </p>
                </div>

                {/* Éxito */}
                {status === 'success' && (
                    <div style={{
                        background: 'rgba(72, 187, 120, 0.1)',
                        border: '1px solid rgba(72, 187, 120, 0.35)',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                        <p style={{ color: '#68d391', fontWeight: 600, margin: '0 0 0.5rem' }}>
                            ¡Contraseña actualizada!
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                            Serás redirigido en unos instantes...
                        </p>
                    </div>
                )}

                {/* Formulario */}
                {status !== 'success' && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Nueva contraseña */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
                            }}>
                                Nueva contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="reset-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                    disabled={status === 'loading'}
                                    style={{ paddingRight: '3rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    style={{
                                        position: 'absolute', right: '0.75rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-secondary)', fontSize: '1.1rem', padding: '0',
                                    }}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Barra de fuerza */}
                            {password.length > 0 && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{
                                        height: '4px', borderRadius: '2px',
                                        background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                                    }}>
                                        <div style={{
                                            height: '100%', borderRadius: '2px',
                                            width: strength.width,
                                            background: strength.color,
                                            transition: 'width 0.3s ease, background 0.3s ease',
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem', display: 'block' }}>
                                        {strength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label style={{
                                display: 'block', marginBottom: '0.5rem',
                                color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
                            }}>
                                Confirmar contraseña
                            </label>
                            <input
                                id="reset-confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
                                required
                                disabled={status === 'loading'}
                                style={{
                                    borderColor: confirmPassword && confirmPassword !== password
                                        ? 'rgba(252, 129, 129, 0.6)'
                                        : confirmPassword && confirmPassword === password
                                            ? 'rgba(72, 187, 120, 0.6)'
                                            : undefined,
                                }}
                            />
                            {confirmPassword && confirmPassword !== password && (
                                <span style={{ fontSize: '0.75rem', color: '#fc8181', marginTop: '0.25rem', display: 'block' }}>
                                    Las contraseñas no coinciden
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            id="reset-submit"
                            style={{ justifyContent: 'center', marginTop: '0.25rem' }}
                            disabled={status === 'loading' || (!!confirmPassword && confirmPassword !== password)}
                        >
                            {status === 'loading' ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: '#fff',
                                        borderRadius: '50%',
                                        display: 'inline-block',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    Guardando...
                                </span>
                            ) : 'Restablecer contraseña'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--text-secondary)', fontSize: '0.875rem',
                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                        ← Volver al inicio de sesión
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
