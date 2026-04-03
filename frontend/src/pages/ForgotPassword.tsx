import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import toast from 'react-hot-toast';

type Status = 'idle' | 'loading' | 'success' | 'error';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await forgotPassword({ email });
            setStatus('success');
            toast.success(res.data.message || 'Email enviado');
        } catch (err: any) {
            setStatus('idle');
            toast.error(err.response?.data?.message || 'Error al procesar la solicitud.');
        }
    };

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

                {/* Icon */}
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #5a67d8 100%)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem', boxShadow: '0 8px 32px rgba(102,126,234,0.35)',
                        marginBottom: '1rem'
                    }}>
                        🔑
                    </div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
                        Recuperar contraseña
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                        Introduce tu email y te enviaremos un enlace seguro para restablecer tu contraseña.
                    </p>
                </div>

                {/* Success state simplificado ya que toast asume el texto */}
                {status === 'success' && (
                    <div style={{
                        background: 'rgba(72, 187, 120, 0.1)',
                        border: '1px solid rgba(72, 187, 120, 0.35)',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        textAlign: 'center',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
                        <p style={{ color: '#68d391', fontWeight: 600, margin: '0 0 0.5rem' }}>
                            ¡Email enviado!
                        </p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                            Revisa tu bandeja de entrada o la carpeta de spam.
                        </p>
                    </div>
                )}

                {/* Form — ocultar si ya fue enviado con éxito */}
                {status !== 'success' && (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}>
                                Correo electrónico
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                disabled={status === 'loading'}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                            disabled={status === 'loading'}
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
                                    Enviando...
                                </span>
                            ) : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                )}

                {/* Links */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
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

export default ForgotPassword;
