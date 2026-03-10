import { Link } from 'react-router-dom'
import { Github, Mail } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-field-charcoal border-t border-field-gray mt-auto">
            <div className="container-custom py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    <div>
                        <h3 className="font-display font-bold text-lg mb-3">Fútbol en Datos</h3>
                        <p className="text-gray-400 text-sm">
                            Explora estadísticas históricas de la Copa Mundial y la Eurocopa.
                            Compara equipos, analiza enfrentamientos y descubre curiosidades.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-3">Enlaces</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    to="/torneos"
                                    className="text-gray-400 hover:text-pitch-light transition-colors"
                                >
                                    Torneos
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/equipos"
                                    className="text-gray-400 hover:text-pitch-light transition-colors"
                                >
                                    Equipos
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/estadisticas"
                                    className="text-gray-400 hover:text-pitch-light transition-colors"
                                >
                                    Estadísticas
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/comparar"
                                    className="text-gray-400 hover:text-pitch-light transition-colors"
                                >
                                    Comparar
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display font-bold text-lg mb-3">Contacto</h3>

                        <div className="flex space-x-4">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-pitch-light transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </a>

                            <a
                                href="mailto:contacto@futbolendatos.com"
                                className="text-gray-400 hover:text-pitch-light transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                </div>

                <div className="border-t border-field-gray mt-8 pt-6 text-center text-sm text-gray-400">
                    <p>
                        © {new Date().getFullYear()} Fútbol en Datos. TFG - Proyecto Intermodular DAW
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer