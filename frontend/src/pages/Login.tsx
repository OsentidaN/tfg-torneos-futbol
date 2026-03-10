import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import Input from '@components/common/Input'
import Button from '@components/common/Button'
import { validateEmail } from '@utils/validators'
import { LogIn } from 'lucide-react'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

        if (!formData.email) {
            newErrors.email = 'El email es obligatorio'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria'
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
            await login(formData)
            navigate('/')
        } catch (error: unknown) {
            if (error instanceof Error) {
                setApiError(error.message || 'Error al iniciar sesión')
            } else if (typeof error === 'object' && error !== null && 'response' in error) {
                const axiosError = error as { response?: { data?: { message?: string } } }
                setApiError(axiosError.response?.data?.message || 'Error al iniciar sesión')
            } else {
                setApiError('Error al iniciar sesión')
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
                        <LogIn className="w-8 h-8 text-pitch-green" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Iniciar Sesión</h1>
                    <p className="text-gray-400">Accede a tu cuenta para guardar favoritos</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {apiError && (
                            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 text-red-500 text-sm">
                                {apiError}
                            </div>
                        )}

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

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿No tienes cuenta?{' '}
                            <Link to="/auth/register" className="text-pitch-green hover:text-pitch-light">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login