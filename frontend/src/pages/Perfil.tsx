import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword, deleteAccount } from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, faPen, faLock, faTrashCan, faCheckCircle,
    faCircleExclamation
} from '@fortawesome/free-solid-svg-icons';

type Section = 'nombre' | 'password' | 'borrar';

export default function Perfil() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<Section | null>(null);

    // Name form
    const [newName, setNewName] = useState(user?.name || '');
    const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [nameLoading, setNameLoading] = useState(false);

    // Password form
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [pwdLoading, setPwdLoading] = useState(false);

    // Delete form
    const [deletePwd, setDeletePwd] = useState('');
    const [deleteMsg, setDeleteMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameLoading(true); setNameMsg(null);
        try {
            const res = await updateProfile({ name: newName });
            const updatedUser = res.data.data.user;
            // Update stored user info
            const token = localStorage.getItem('token');
            if (token) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setNameMsg({ text: '¡Nombre actualizado correctamente!', ok: true });
            // Force refresh via page reload to update AuthContext
            setTimeout(() => window.location.reload(), 800);
        } catch (err: any) {
            setNameMsg({ text: err.response?.data?.message || 'Error al actualizar el nombre', ok: false });
        } finally {
            setNameLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) { setPwdMsg({ text: 'Las contraseñas no coinciden', ok: false }); return; }
        if (newPwd.length < 6) { setPwdMsg({ text: 'La contraseña debe tener al menos 6 caracteres', ok: false }); return; }
        setPwdLoading(true); setPwdMsg(null);
        try {
            await updatePassword({ currentPassword: currentPwd, newPassword: newPwd });
            setPwdMsg({ text: '¡Contraseña actualizada correctamente!', ok: true });
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch (err: any) {
            setPwdMsg({ text: err.response?.data?.message || 'Error al actualizar la contraseña', ok: false });
        } finally {
            setPwdLoading(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleteLoading(true); setDeleteMsg(null);
        try {
            await deleteAccount({ password: deletePwd });
            logout();
            navigate('/');
        } catch (err: any) {
            setDeleteMsg({ text: err.response?.data?.message || 'Error al eliminar la cuenta', ok: false });
        } finally {
            setDeleteLoading(false);
        }
    };

    const cardStyle = {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '1.5rem',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.85rem 1rem',
        fontSize: '1rem',
        background: 'var(--bg-input)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        marginBottom: '1rem',
    };

    const Alert = ({ msg }: { msg: { text: string; ok: boolean } | null }) => msg ? (
        <div style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            background: msg.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(225, 29, 72, 0.1)',
            border: `1px solid ${msg.ok ? 'var(--accent-2)' : 'var(--accent-warn)'}`,
            color: msg.ok ? 'var(--accent)' : 'var(--accent-warn)',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
            <FontAwesomeIcon icon={msg.ok ? faCheckCircle : faCircleExclamation} />
            {msg.text}
        </div>
    ) : null;

    const sectionBtns = [
        { key: 'nombre' as Section, label: 'Cambiar Nombre', icon: faPen },
        { key: 'password' as Section, label: 'Cambiar Contraseña', icon: faLock },
        { key: 'borrar' as Section, label: 'Eliminar Cuenta', icon: faTrashCan, danger: true },
    ];

    return (
        <div className="container page">
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <FontAwesomeIcon icon={faUser} style={{ color: 'var(--accent)' }} />
                    Mi Perfil
                </h1>
                <p className="page-subtitle" style={{ fontSize: '1.2rem', opacity: 0.8 }}>
                    Gestiona tu cuenta y preferencias
                </p>
            </div>

            {/* User info card */}
            <div style={{ ...cardStyle, marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                    fontFamily: 'Outfit'
                }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700 }}>{user?.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.2rem' }}>{user?.email}</div>
                </div>
            </div>

            {/* Action selector */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {sectionBtns.map(btn => (
                    <button
                        key={btn.key}
                        onClick={() => setActiveSection(activeSection === btn.key ? null : btn.key)}
                        className={`btn ${activeSection === btn.key ? (btn.danger ? '' : 'btn-primary') : 'btn-secondary'}`}
                        style={{
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            ...(activeSection === btn.key && btn.danger ? {
                            background: 'rgba(225, 29, 72, 0.1)',
                            border: '1px solid var(--accent-warn)',
                            color: 'var(--accent-warn)'
                        } : {})
                        }}
                    >
                        <FontAwesomeIcon icon={btn.icon} />
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* ── Cambiar Nombre ── */}
            {activeSection === 'nombre' && (
                <div style={{ ...cardStyle, animation: 'fadeIn 0.3s ease' }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faPen} style={{ color: 'var(--accent)' }} /> Cambiar Nombre
                    </h2>
                    <Alert msg={nameMsg} />
                    <form onSubmit={handleUpdateName}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Nuevo nombre
                        </label>
                        <input
                            style={inputStyle as any}
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Tu nombre"
                            required
                            minLength={2}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} disabled={nameLoading}>
                            {nameLoading ? 'Guardando…' : 'Guardar Cambios'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Cambiar Contraseña ── */}
            {activeSection === 'password' && (
                <div style={{ ...cardStyle, animation: 'fadeIn 0.3s ease' }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                        <FontAwesomeIcon icon={faLock} style={{ color: 'var(--accent)' }} /> Cambiar Contraseña
                    </h2>
                    <Alert msg={pwdMsg} />
                    <form onSubmit={handleUpdatePassword}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Contraseña actual
                        </label>
                        <input style={inputStyle as any} type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" required />
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Nueva contraseña
                        </label>
                        <input style={inputStyle as any} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="••••••••" required minLength={6} />
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Confirmar nueva contraseña
                        </label>
                        <input style={inputStyle as any} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="••••••••" required />
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} disabled={pwdLoading}>
                            {pwdLoading ? 'Guardando…' : 'Actualizar Contraseña'}
                        </button>
                    </form>
                </div>
            )}

            {/* ── Eliminar Cuenta ── */}
            {activeSection === 'borrar' && (
                <div style={{ 
                    ...cardStyle, 
                    animation: 'fadeIn 0.3s ease',
                    border: '1px solid var(--accent-warn)',
                    background: 'rgba(225, 29, 72, 0.05)'
                }}>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '0.75rem', display: 'flex', gap: '0.6rem', alignItems: 'center', color: 'var(--accent-warn)' }}>
                        <FontAwesomeIcon icon={faTrashCan} /> Eliminar Cuenta
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        ⚠️ Esta acción es <strong>irreversible</strong>. Se eliminarán tu cuenta y todos tus favoritos. Confirma tu contraseña para continuar.
                    </p>
                    <Alert msg={deleteMsg} />
                    <form onSubmit={handleDeleteAccount}>
                        <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                            Tu contraseña
                        </label>
                        <input style={{ ...inputStyle, borderColor: 'var(--accent-warn)' } as any} type="password" value={deletePwd} onChange={e => setDeletePwd(e.target.value)} placeholder="••••••••" required />
                        <button type="submit" className="btn" style={{ 
                            padding: '0.75rem 2rem', fontSize: '1rem',
                            background: 'rgba(225, 29, 72, 0.1)',
                            border: '1px solid var(--accent-warn)',
                            color: 'var(--accent-warn)'
                        }} disabled={deleteLoading}>
                            {deleteLoading ? 'Eliminando…' : <><FontAwesomeIcon icon={faTrashCan} style={{ marginRight: '0.5rem' }} />Eliminar mi cuenta</>}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
