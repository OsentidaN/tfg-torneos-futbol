import { Search, X } from 'lucide-react'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onClear: () => void
    placeholder?: string
}

const SearchBar = ({ value, onChange, onClear, placeholder = 'Buscar...' }: SearchBarProps) => {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="input pl-10 pr-10"
            />
            {value && (
                <button
                    onClick={onClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

export default SearchBar