import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Equipo, Jugador, PartidoConfig } from '../types'
import { useConfigStore } from '../features/config/configSlice'
import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { Volleyball, Users, Clock, Calendar } from 'lucide-react'

const crearJugador = (numero: number): Jugador => ({
  id: crypto.randomUUID(),
  numero,
  nombre: '',
  puntos: 0,
  rebotes: 0,
  asistencias: 0,
  faltas: 0,
  tapones: 0,
  robos: 0,
  perdidas: 0,
  tirosLibres: 0,
  intentosTL: 0,
  intentos2PT: 0,
  encestado2PT: 0,
  intentos3PT: 0,
  encestado3PT: 0,
})

export default function Setup() {
  const [nombreA, setNombreA] = useState('')
  const [nombreB, setNombreB] = useState('')
  const [jugadoresA, setJugadoresA] = useState<Jugador[]>([])
  const [jugadoresB, setJugadoresB] = useState<Jugador[]>([])
  const [duracionPeriodo, setDuracionPeriodo] = useState<number>(600) // Default 10 minutos (600 segundos)
  const [maxPeriodos, setMaxPeriodos] = useState<number>(4) // Default 4 periodos
  const { setConfig } = useConfigStore()
  const history = useHistory()

  const handleAgregarJugador = (setJugadores: any) => {
    setJugadores((prev: Jugador[]) => [...prev, crearJugador(prev.length + 1)])
  }

  const handleEliminarJugador = (setJugadores: any, jugadorId: string) => {
    setJugadores((prev: Jugador[]) => prev.filter(j => j.id !== jugadorId))
  }

  const handleToggleTitular = (jugadores: Jugador[], setJugadores: any, jugadorId: string) => {
    const titularesCount = jugadores.filter(j => j.titular && j.id !== jugadorId).length
    
    setJugadores((prev: Jugador[]) => prev.map(j => {
      if (j.id === jugadorId) {
        // Si ya es titular, siempre permitir destildar
        if (j.titular) return { ...j, titular: false }
        // Si no es titular, verificar que no exceda el máximo
        return titularesCount < 5 ? { ...j, titular: true } : j
      }
      return j
    }))
  }

  const handleGuardar = async () => {
    // Validar que cada equipo tenga al menos 1 titular
    const titularesA = jugadoresA.filter(j => j.titular).length
    const titularesB = jugadoresB.filter(j => j.titular).length

    if (titularesA < 1 || titularesB < 1) {
      alert('Cada equipo debe tener al menos 1 jugador titular')
      return
    }

    const equipoA: Equipo = {
      id: crypto.randomUUID(),
      nombre: nombreA,
      jugadores: jugadoresA,
      faltasEquipo: 0,
    }

    const equipoB: Equipo = {
      id: crypto.randomUUID(),
      nombre: nombreB,
      jugadores: jugadoresB,
      faltasEquipo: 0,
    }

    const config: PartidoConfig = {
      id: crypto.randomUUID(),
      equipoA,
      equipoB,
      periodo: 1,
      duracionPeriodo: duracionPeriodo,
      maxPeriodos: maxPeriodos,
    }

    setConfig(config)
    await addDoc(collection(db, 'partidos'), config)
    history.push('/match')
  }

  const renderJugadores = (jugadores: Jugador[], setJugadores: any) => (
    jugadores.map((j, idx) => {
      const titularesCount = jugadores.filter(jug => jug.titular).length
      return (
        <div key={j.id} className="flex gap-2 mb-2 items-center">
          <input
            className="w-1/6 p-2 bg-white text-gray-800 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
            type="number"
            min="0"
            placeholder="#"
            value={j.numero}
            onChange={(e) => {
              const updated = [...jugadores]
              updated[idx].numero = parseInt(e.target.value) || 0
              setJugadores(updated)
            }}
          />
          <input
            className="w-2/4 p-2 bg-white text-gray-800 border border-gray-300 rounded shadow-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
            placeholder={`Jugador #${j.numero}`}
            value={j.nombre}
            onChange={(e) => {
              const updated = [...jugadores]
              updated[idx].nombre = e.target.value
              setJugadores(updated)
            }}
          />
          <div className="flex items-center gap-2 w-1/4">
            <input
              type="checkbox"
              checked={j.titular}
              onChange={() => handleToggleTitular(jugadores, setJugadores, j.id)}
              className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              title={!j.titular && titularesCount >= 5 ? "Máximo 5 titulares permitidos" : "Marcar como titular"}
            />
            <label className="text-sm text-gray-600">Titular</label>
          </div>
          <button
            onClick={() => handleEliminarJugador(setJugadores, j.id)}
            className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
            title="Eliminar jugador"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )
    })
  )

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center">
            <Volleyball className="w-10 h-10 text-orange-500 mr-3" />
            Configuración del Partido
          </h1>
          <p className="text-xl text-gray-600 mt-2">Completa la información para empezar a registrar estadísticas</p>
        </header>

        {/* Configuración del tiempo */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-6 h-6 text-orange-500 mr-2" />
            Configuración de tiempo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duracion" className="block mb-1 text-gray-700">Duración del Período (segundos)</label>
              <input
                id="duracion"
                type="number"
                className="p-2 w-full bg-gray-50 rounded border border-gray-300 text-gray-800 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
                value={duracionPeriodo}
                onChange={(e) => setDuracionPeriodo(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
            <div>
              <label htmlFor="maxPeriodos" className="block mb-1 text-gray-700">Máximo de Períodos</label>
              <input
                id="maxPeriodos"
                type="number"
                className="p-2 w-full bg-gray-50 rounded border border-gray-300 text-gray-800 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
                value={maxPeriodos}
                onChange={(e) => setMaxPeriodos(parseInt(e.target.value) || 0)}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Configuración de equipos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Equipo A */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 text-blue-500 mr-2" />
              Equipo Local
            </h2>
            <input
              className="mb-4 p-2 w-full bg-gray-50 rounded border border-gray-300 text-gray-800 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
              placeholder="Nombre Equipo A"
              value={nombreA}
              onChange={(e) => setNombreA(e.target.value)}
            />
            {renderJugadores(jugadoresA, setJugadoresA)}
            <button
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white shadow transition-colors"
              onClick={() => handleAgregarJugador(setJugadoresA)}
            >
              + Agregar Jugador
            </button>
          </div>

          {/* Equipo B */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 text-red-500 mr-2" />
              Equipo Visitante
            </h2>
            <input
              className="mb-4 p-2 w-full bg-gray-50 rounded border border-gray-300 text-gray-800 focus:ring-2 focus:ring-orange-300 focus:border-orange-300 focus:outline-none"
              placeholder="Nombre Equipo B"
              value={nombreB}
              onChange={(e) => setNombreB(e.target.value)}
            />
            {renderJugadores(jugadoresB, setJugadoresB)}
            <button
              className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white shadow transition-colors"
              onClick={() => handleAgregarJugador(setJugadoresB)}
            >
              + Agregar Jugador
            </button>
          </div>
        </div>

        <button
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-bold shadow-lg transition-colors text-xl"
          onClick={handleGuardar}
        >
          Iniciar Partido
        </button>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Stats Collector App. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}