import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Input from '@components/common/Input'
import Button from '@components/common/Button'
import { validateEmail, validatePassword, getPasswordErrors } from '@utils/validators'
import { UserPlus } from 'lucide-react'

const Register = () => {
    const navigate = useNavigate()
    const { register } = useAuth()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres'
        }

        if (!formData.email) {
            newErrors.email = 'El email es obligatorio'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria'
        } else if (!validatePassword(formData.password)) {
            const passwordErrors = getPasswordErrors(formData.password)
            newErrors.password = passwordErrors.join(', ')
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setApiError('')

        if (!validate()) return

        setLoading(true)
        try {
            await register({
                name: formData.name.trim(),
                email: formData.email,
                password: formData.password,
            })
            navigate('/')
        } catch (error: unknown) {
        if (error instanceof Error) {
            setApiError(error.message || 'Error al crear la cuenta')
        } else if (typeof error === 'object' && error !== null && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } }
            setApiError(axiosError.response?.data?.message || 'Error al crear la cuenta')
        } else {
            setApiError('Error al crear la cuenta')
        }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pitch-green bg-opacity-20 rounded-full mb-4">
                        <UserPlus className="w-8 h-8 text-pitch-green" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Crear Cuenta</h1>
                    <p className="text-gray-400">Regístrate para guardar tus favoritos</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {apiError && (
                            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 text-red-500 text-sm">
                                {apiError}
                            </div>
                        )}

                        <Input
                            label="Nombre completo"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            error={errors.email}
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirmar contraseña"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={errors.confirmPassword}
                            required
                        />

                        <div className="text-xs text-gray-400">
                            La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas,
                            minúsculas, números y caracteres especiales (@$!%*?&)
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/auth/login" className="text-pitch-green hover:text-pitch-light">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register