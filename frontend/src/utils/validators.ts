export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
}

export const validatePassword = (password: string): boolean => {
    // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return regex.test(password)
}

export const getPasswordErrors = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) errors.push('Mínimo 8 caracteres')
    if (!/[a-z]/.test(password)) errors.push('Al menos una minúscula')
    if (!/[A-Z]/.test(password)) errors.push('Al menos una mayúscula')
    if (!/\d/.test(password)) errors.push('Al menos un número')
    if (!/[@$!%*?&]/.test(password)) errors.push('Al menos un carácter especial (@$!%*?&)')
    return errors
}

export const validateRequired = (value: unknown): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    return true
}