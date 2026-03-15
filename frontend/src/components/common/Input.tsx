import type { ChangeEvent } from 'react'

interface InputProps {
    label?: string
    type?: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    error?: string
    required?: boolean
    name?: string
    disabled?: boolean
}

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    error = '',
    required = false,
    name,
    disabled = false,
}: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                name={name}
                disabled={disabled}
                className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    )
}

export default Input