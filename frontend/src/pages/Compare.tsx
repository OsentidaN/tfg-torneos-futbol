import { useState } from 'react'
import { useTeams } from '@hooks/useTeams'
import { useCompare } from '@hooks/useCompare'
import Loader from '@components/common/Loader'
import SearchBar from '@components/common/SearchBar'
import { Trophy, X } from 'lucide-react'

const Compare = () => {
    const { data: teams } = useTeams()
    const {
        team1Id,
        team2Id,
        comparison,
        isLoading,
        selectTeam1,
        selectTeam2,
        clearTeam1,
        clearTeam2,
        canCompare,
    } = useCompare()

    const [search1, setSearch1] = useState('')
    const [search2, setSearch2] = useState('')

    const team1 = teams?.find(t => t.id === team1Id)
    const team2 = teams?.find(t => t.id === team2Id)

    const filteredTeams1 = teams?.filter(t =>
        t.name.toLowerCase().includes(search1.toLowerCase()) && t.id !== team2Id
    ) || []

    const filteredTeams2 = teams?.filter(t =>
        t.name.toLowerCase().includes(search2.toLowerCase()) && t.id !== team1Id
    ) || []

    return (
        <div className="container-custom py-12">
            <div className="mb-12">
                <h1 className="text-4xl font-display font-bold mb-4 gradient-text">
                    Comparar Equipos
                </h1>
                <p className="text-gray-400 text-lg">
                    Compara estadísticas y enfrentamientos directos entre selecciones
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Team 1 Selector */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Equipo 1</h3>
                    {team1 ? (
                        <div className="flex items-center justify-between p-4 bg-field-gray rounded-lg">
                            <div className="flex items-center space-x-3">
                                {team1.flagUrl && (
                                    <img src={team1.flagUrl} alt={team1.name} className="w-12 h-8 object-cover rounded" />
                                )}
                                <span className="font-semibold">{team1.name}</span>
                            </div>
                            <button onClick={clearTeam1} className="text-red-500 hover:text-red-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <SearchBar
                                value={search1}
                                onChange={setSearch1}
                                onClear={() => setSearch1('')}
                                placeholder="Buscar equipo..."
                            />
                            <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                                {filteredTeams1.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => selectTeam1(team.id)}
                                        className="w-full flex items-center space-x-3 p-3 bg-field-gray hover:bg-field-charcoal rounded-lg transition-colors"
                                    >
                                        {team.flagUrl && (
                                            <img src={team.flagUrl} alt={team.name} className="w-8 h-6 object-cover rounded" />
                                        )}
                                        <span>{team.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Team 2 Selector */}
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Equipo 2</h3>
                    {team2 ? (
                        <div className="flex items-center justify-between p-4 bg-field-gray rounded-lg">
                            <div className="flex items-center space-x-3">
                                {team2.flagUrl && (
                                    <img src={team2.flagUrl} alt={team2.name} className="w-12 h-8 object-cover rounded" />
                                )}
                                <span className="font-semibold">{team2.name}</span>
                            </div>
                            <button onClick={clearTeam2} className="text-red-500 hover:text-red-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <SearchBar
                                value={search2}
                                onChange={setSearch2}
                                onClear={() => setSearch2('')}
                                placeholder="Buscar equipo..."
                            />
                            <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                                {filteredTeams2.map(team => (
                                    <button
                                        key={team.id}
                                        onClick={() => selectTeam2(team.id)}
                                        className="w-full flex items-center space-x-3 p-3 bg-field-gray hover:bg-field-charcoal rounded-lg transition-colors"
                                    >
                                        {team.flagUrl && (
                                            <img src={team.flagUrl} alt={team.name} className="w-8 h-6 object-cover rounded" />
                                        )}
                                        <span>{team.name}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Comparison Results */}
            {isLoading && <Loader text="Cargando comparación..." />}

            {canCompare && comparison && (
                <div className="space-y-8">
                    {/* Head to Head Summary */}
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-6 text-center">Enfrentamientos Directos</h2>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-4xl font-bold text-pitch-green mb-2">
                                    {comparison.headToHead.team1Wins}
                                </div>
                                <div className="text-gray-400">Victorias {comparison.team1.name}</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-gray-400 mb-2">
                                    {comparison.headToHead.draws}
                                </div>
                                <div className="text-gray-400">Empates</div>
                            </div>
                            <div>
                                <div className="text-4xl font-bold text-pitch-green mb-2">
                                    {comparison.headToHead.team2Wins}
                                </div>
                                <div className="text-gray-400">Victorias {comparison.team2.name}</div>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-gray-400">
                            Total de enfrentamientos: {comparison.headToHead.totalMatches}
                        </div>
                    </div>

                    {/* Matches History */}
                    {comparison.headToHead.matches.length > 0 && (
                        <div className="card">
                            <h3 className="text-xl font-bold mb-4">Historial de Partidos</h3>
                            <div className="space-y-3">
                                {comparison.headToHead.matches.map(match => (
                                    <div key={match.id} className="p-4 bg-field-gray rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold">{match.homeTeam?.name} vs {match.awayTeam?.name}</div>
                                                <div className="text-sm text-gray-400">{match.round}</div>
                                            </div>
                                            <div className="text-xl font-bold">
                                                {match.homeGoals} - {match.awayGoals}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!canCompare && !isLoading && (
                <div className="text-center py-12 card">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Selecciona dos equipos para comparar</p>
                </div>
            )}
        </div>
    )
}

export default Compare