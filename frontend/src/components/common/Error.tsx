import { AlertCircle } from 'lucide-react'

interface ErrorProps {
    message?: string
    onRetry?: () => void
}

const Error = ({ message = 'Ha ocurrido un error', onRetry }: ErrorProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Oops!</h3>
            <p className="text-gray-400 mb-4">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn-primary">
                    Reintentar
                </button>
            )}
        </div>
    )
}

export default Error