import { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { db } from '../firebase'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { useMatchStore } from '../features/match/matchSlice'
import { exportToCSV } from '../utils/exportToCSV'
import { exportToPDF } from '../utils/exportToPDF'
import { exportToXLSX } from '../utils/exportToXLSX'
import { Jugador } from '../types'
import { ClipboardList, Download, Clock, Activity, Trophy, ArrowLeft } from 'lucide-react'

interface SummaryParams {
  id: string
}

interface ResumenFirestore {
  id: string;
  timestamp: number;
  equipoA: { 
    nombre: string, 
    puntos: number, 
    jugadores: Jugador[] 
  };
  equipoB: { 
    nombre: string, 
    puntos: number, 
    jugadores: Jugador[] 
  };
  duracionPeriodo: number;
  maxPeriodos: number;
  finalizado: boolean;
}

interface Evento {
  tiempo: string
  jugadorId: string
  tipo: string
}

export default function Summary() {
  const { id } = useParams<SummaryParams>()
  const history = useHistory()
  const { currentConfig } = useMatchStore()
  const [remoteResumen, setRemoteResumen] = useState<ResumenFirestore | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [jugadoresFromFirestore, setJugadoresFromFirestore] = useState<Jugador[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const loadResumenYEventos = async () => {
      setIsLoading(true)
      try {
        const resumenRef = doc(db, 'partidos', id)
        const resumenSnap = await getDoc(resumenRef)

        if (resumenSnap.exists()) {
          const resumenData = { ...resumenSnap.data(), id: resumenSnap.id } as ResumenFirestore
          setRemoteResumen(resumenData)
          
          // Extraer jugadores de ambos equipos desde Firestore
          const jugadoresA = resumenData.equipoA?.jugadores || []
          const jugadoresB = resumenData.equipoB?.jugadores || []
          setJugadoresFromFirestore([...jugadoresA, ...jugadoresB])
        } else {
          console.warn('❌ No se encontró resumen del partido en Firestore.')
        }

        const eventosRef = collection(db, 'partidos', id, 'eventos')
        const eventosSnap = await getDocs(eventosRef)

        const eventosData = eventosSnap.docs.map(doc => ({
          ...(doc.data() as Evento)
        }))

        console.log('✅ Eventos cargados desde Firestore:', eventosData)
        setEventos(eventosData)
      } catch (err) {
        console.error('🔥 Error cargando resumen/eventos:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadResumenYEventos()
  }, [id])

  // Determinar qué conjunto de jugadores usar
  // Preferimos los datos de Firestore, pero usamos currentConfig como respaldo
  const jugadores = jugadoresFromFirestore.length > 0 
    ? jugadoresFromFirestore 
    : [
        ...(currentConfig?.equipoA.jugadores || []),
        ...(currentConfig?.equipoB.jugadores || [])
      ]

  const handleExport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    // Usamos los jugadores de Firestore para exportar
    const jugadoresExport = jugadoresFromFirestore.length > 0 
      ? jugadoresFromFirestore 
      : jugadores
      
    switch (format) {
      case 'csv': exportToCSV(jugadoresExport); break
      case 'pdf': await exportToPDF(jugadoresExport); break
      case 'xlsx': await exportToXLSX(jugadoresExport); break
    }
  }

  const resumen = remoteResumen

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 text-gray-800">
          <Activity className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-pulse" />
          <p className="text-center text-lg">Cargando resumen...</p>
        </div>
      </div>
    )
  }

  if (!resumen && jugadores.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 text-gray-800">
          <Activity className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-center text-lg">No hay datos disponibles para este partido.</p>
          <div className="mt-6 text-center">
            <button 
              onClick={() => history.push('/')}
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded shadow transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Preparar los jugadores por ID para la sección de eventos
  const jugadoresPorId: { [id: string]: string } = {}
  jugadores.forEach(j => {
    jugadoresPorId[j.id] = j.nombre || ''
  })

  // Determinar a qué equipo pertenece cada jugador
  const getEquipo = (jugadorId: string) => {
    if (!resumen) return null
    
    const esEquipoA = resumen.equipoA.jugadores.some(j => j.id === jugadorId)
    if (esEquipoA) return { nombre: resumen.equipoA.nombre, esA: true }
    
    const esEquipoB = resumen.equipoB.jugadores.some(j => j.id === jugadorId)
    if (esEquipoB) return { nombre: resumen.equipoB.nombre, esA: false }
    
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center my-8">
          <div className="flex justify-center items-center">
            <button 
              onClick={() => history.push('/record')} 
              className="absolute left-4 md:left-8 flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </button>
            <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-orange-500 mr-3" />
              Resumen del Partido
            </h1>
          </div>
          <p className="text-xl text-gray-600 mt-2">Estadísticas detalladas del encuentro</p>
        </header>

        {/* Resumen de Marcador */}
        {resumen && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-xl font-semibold text-gray-800">Marcador Final</h2>
                <div className="flex items-center justify-center md:justify-start space-x-4 mt-2">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{resumen.equipoA.nombre}</p>
                    <p className="text-3xl font-bold text-orange-500">{resumen.equipoA.puntos}</p>
                  </div>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{resumen.equipoB.nombre}</p>
                    <p className="text-3xl font-bold text-blue-500">{resumen.equipoB.puntos}</p>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  <p className="text-sm">{new Date(resumen.timestamp).toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-600">
                  Duración por periodo: {resumen.duracionPeriodo}s | Periodos: {resumen.maxPeriodos}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Estadísticas */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Estadísticas por Jugador</h2>
          {jugadores.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay datos de jugadores disponibles.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left border-b border-gray-200 font-semibold">Equipo</th>
                  <th className="p-3 text-left border-b border-gray-200 font-semibold">#</th>
                  <th className="p-3 text-left border-b border-gray-200 font-semibold">Jugador</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">PTS</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">REB</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">ASI</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">FP</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">TL</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">2PT</th>
                  <th className="p-3 text-center border-b border-gray-200 font-semibold">3PT</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j, idx) => {
                  const equipo = getEquipo(j.id)
                  return (
                    <tr key={j.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border-b border-gray-200">
                        {equipo ? (
                          <span className={equipo.esA ? "text-orange-500 font-medium" : "text-blue-500 font-medium"}>
                            {equipo.nombre}
                          </span>
                        ) : (
                          <span className="text-gray-400">Sin equipo</span>
                        )}
                      </td>
                      <td className="p-3 border-b border-gray-200">{j.numero}</td>
                      <td className="p-3 border-b border-gray-200 font-medium">{j.nombre}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.puntos}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.rebotes}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.asistencias}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.faltas}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.tirosLibres} / {j.intentosTL}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.encestado2PT} / {j.intentos2PT}</td>
                      <td className="p-3 border-b border-gray-200 text-center">{j.encestado3PT} / {j.intentos3PT}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Botones de Exportación */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Download className="w-6 h-6 text-orange-500 mr-2" />
            Exportar Datos
          </h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleExport('csv')} 
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </button>
            <button 
              onClick={() => handleExport('pdf')} 
              className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded shadow transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </button>
            <button 
              onClick={() => handleExport('xlsx')} 
              className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar XLSX
            </button>
          </div>
        </div>

        {/* Timeline de Eventos */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-6 h-6 text-orange-500 mr-2" />
            Timeline de Eventos
          </h2>
          <div className="h-60 overflow-y-auto p-3 border border-gray-200 rounded bg-gray-50">
            {eventos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No se encontraron eventos para este partido.</p>
            ) : (
              eventos
                .sort((a, b) => a.tiempo.localeCompare(b.tiempo))
                .map((e, i) => (
                  <div key={i} className="border-b border-gray-200 py-2 flex items-start">
                    <span className="text-orange-500 font-medium mr-2">[{e.tiempo}]</span>
                    <span className="text-gray-800">{e.tipo}</span>
                    <span className="text-gray-500 ml-1">— {jugadoresPorId[e.jugadorId] || '[sin nombre]'}</span>
                  </div>
                ))
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Stats Collector App. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}