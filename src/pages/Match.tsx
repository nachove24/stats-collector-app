import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useTimer } from '../hooks/useTimer'
import { useMatchStore } from '../features/match/matchSlice'
import { useConfigStore } from '../features/config/configSlice'
import { aplicarEvento } from '../collectors'
import { guardarEvento } from '../services'
import { Jugador, PartidoConfig, Equipo } from '../types'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { v4 as uuidv4 } from 'uuid'
import { 
  Timer, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Flag, 
  Play, 
  Pause, 
  Edit, 
  FileText,
  Clock,
  SkipBack,
  SkipForward
} from 'lucide-react'

const formatTime = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const calcularPuntosEquipo = (jugadores: Jugador[]) =>
  jugadores.reduce((sum, j) => sum + j.puntos, 0)

export default function Match() {
  const history = useHistory()
  const { currentConfig, eventos, agregarEvento, deshacerEvento } = useMatchStore()
  const { config } = useConfigStore()

  const { seconds, toggle, reset, running } = useTimer(config?.duracionPeriodo || 600)

  // 🔁 Generar ID único si no existe
  useEffect(() => {
    if (!config) {
      history.push('/')
    }
  }, [config, history])

  if (!config || !currentConfig) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando configuración...</div>
      </div>
    )
  }

  const handleEvento = async (jugadorId: string, tipo: string) => {
    const tiempo = formatTime(seconds)
    const evento = { tiempo, jugadorId, tipo }

    agregarEvento(evento)
    const nuevoConfig = aplicarEvento(currentConfig!, evento)
    useMatchStore.setState({ currentConfig: nuevoConfig })
  }

  const handleFinalizarPartido = async () => {
    const confirmEnd = window.confirm("¿Deseas finalizar el partido? Podrás ver el resumen luego.")
    if (confirmEnd) {
      // 🧠 Parar el reloj si está corriendo
      if (running) toggle()

      // 📦 Opcional: podrías guardar estado final o actualizar Firestore
      if (!config) {
        alert("Configuración no cargada, no se puede finalizar el partido.")
        return
      }
      
      if (!currentConfig) {
        alert("Configuración interna no cargada, no se puede finalizar el partido.")
        return
      }

      const partidoId = crypto.randomUUID()
      const resumen = {
        id: partidoId,
        timestamp: Date.now(),
        equipoA: {
          nombre: config.equipoA.nombre,
          puntos: calcularPuntosEquipo(currentConfig!.equipoA.jugadores), 
          jugadores: config.equipoA.jugadores
        },
        equipoB: {
          nombre: config.equipoB.nombre,
          puntos: calcularPuntosEquipo(currentConfig!.equipoB.jugadores),
          jugadores: config.equipoB.jugadores
        },
        duracionPeriodo: config.duracionPeriodo,
        maxPeriodos: config.maxPeriodos,
        finalizado: true,
      };
      
      try {
        await setDoc(doc(db, 'partidos', partidoId), resumen);
        console.log("Resumen del partido guardado con ID:", partidoId);
      } catch (error) {
        console.error("Error al guardar el resumen del partido:", error);
        alert("Hubo un error al guardar el partido.");
        return;
      }

      history.push(`/summary/${partidoId}`)
    }  
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con navegación y acciones principales */}
      <header className="bg-white shadow-md py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => history.goBack()} 
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white shadow transition-colors flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              VOLVER
            </button>
            
            <button
              onClick={deshacerEvento}
              className="px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded text-white shadow transition-colors flex items-center ml-2"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Deshacer
            </button>
          </div>
          
          {/* Cronómetro y controles integrados en el header */}
          <div className="flex items-center gap-4">
            {/* Periodo */}
            <div className="flex items-center">
              <span className="text-sm font-semibold text-gray-600 mr-2">Periodo</span>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    if (config && config.periodo > 1)
                      useMatchStore.setState({
                        currentConfig: { ...config, periodo: config.periodo - 1 }
                      })
                  }}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded-l"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-800" />
                </button>
                
                <div className="font-bold bg-gray-800 text-white px-3 py-1 text-lg">
                  {config ? config.periodo : 1}
                </div>
                
                <button
                  onClick={() => {
                    if (config && config.periodo < config.maxPeriodos)
                      useMatchStore.setState({
                        currentConfig: { ...config, periodo: config.periodo + 1 }
                      })
                  }}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded-r"
                >
                  <ChevronRight className="w-4 h-4 text-gray-800" />
                </button>
              </div>
            </div>
            
            {/* Cronómetro */}
            <div className="flex items-center">
              <div className="text-3xl font-mono bg-black text-yellow-400 px-4 py-1 rounded shadow-inner">
                {formatTime(seconds)}
              </div>
              <button 
                onClick={toggle} 
                className={`px-3 py-1 rounded text-white shadow transition-colors flex items-center ml-2 ${running ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => history.push('/edit')} 
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white shadow transition-colors flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </button>
            
            <button 
              onClick={() => history.push('/summary')} 
              className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-white shadow transition-colors flex items-center"
            >
              <FileText className="w-4 h-4 mr-1" />
              Resumen
            </button>
            
            <button 
              onClick={handleFinalizarPartido} 
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white shadow transition-colors flex items-center"
            >
              <Flag className="w-4 h-4 mr-1" />
              Finalizar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Sección de equipos y marcador */}
        <div className="grid grid-cols-2 gap-6">
          {config && [config.equipoA, config.equipoB].map((equipo, idx) => {
            const esPrimerEquipo = idx === 0;
            const bgColor = esPrimerEquipo ? 'bg-blue-50' : 'bg-red-50';
            const accentColor = esPrimerEquipo ? 'bg-blue-600' : 'bg-red-600';
            const accentBorderColor = esPrimerEquipo ? 'border-blue-200' : 'border-red-200';
            
            return (
              <div key={equipo.id} className={`${bgColor} rounded-lg shadow-lg overflow-hidden`}>
                {/* Encabezado del equipo más compacto */}
                <div className={`${accentColor} py-1 px-3 text-white flex justify-between items-center`}>
                  <h2 className="text-lg font-bold">{equipo.nombre}</h2>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">Faltas: 0</span>
                    <div className="text-2xl font-bold bg-black px-3 py-0.5 rounded">
                      {calcularPuntosEquipo(equipo.jugadores)}
                    </div>
                  </div>
                </div>
                
                {/* Lista de jugadores */}
                <div className="p-4">
                  {equipo.jugadores.map((jugador: Jugador) => (
                    <div 
                      key={jugador.id} 
                      className={`mb-3 border ${accentBorderColor} rounded-lg bg-white overflow-hidden`}
                    >
                      <div className="flex justify-between items-center p-2 border-b border-gray-200">
                        <div className="flex items-center">
                          <div className="bg-gray-800 text-white font-bold px-2 py-1 rounded mr-2 text-sm">
                            #{jugador.numero}
                          </div>
                          <span className="font-medium">{jugador.nombre}</span>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="text-xs text-gray-500">PT</div>
                            <div className="font-bold">{jugador.puntos}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">REB</div>
                            <div className="font-bold">{jugador.rebotes || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">ASI</div>
                            <div className="font-bold">{jugador.asistencias || 0}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500">FP</div>
                            <div className="font-bold">{jugador.faltas || 0}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Botones de acciones */}
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-1 p-2 bg-gray-50">
                        <button 
                          onClick={() => handleEvento(jugador.id, '2PT')} 
                          className="py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                        >
                          2PT
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, '3PT')} 
                          className="py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium"
                        >
                          3PT
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'TL')} 
                          className="py-1 px-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium"
                        >
                          TL
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'FP')} 
                          className="py-1 px-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium"
                        >
                          FP
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'REB')} 
                          className="py-1 px-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-sm font-medium"
                        >
                          REB
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'ASI')} 
                          className="py-1 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-sm font-medium"
                        >
                          ASI
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'ROB')} 
                          className="py-1 px-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                        >
                          ROB
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'TAP')} 
                          className="py-1 px-2 bg-pink-500 hover:bg-pink-600 text-white rounded text-sm font-medium"
                        >
                          TAP
                        </button>
                        <button 
                          onClick={() => handleEvento(jugador.id, 'PER')} 
                          className="py-1 px-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                        >
                          PER
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline de eventos */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="w-6 h-6 text-orange-500 mr-2" />
            Eventos del Partido
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 h-40 overflow-y-auto">
            {eventos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay eventos registrados aún</p>
            ) : (
              eventos.map((evento, i) => {
                // Encontrar jugador y equipo
                let nombreJugador = "Jugador desconocido";
                let equipoNombre = "";
                let tipo = evento.tipo;
                
                // Mapear tipos de eventos a descripciones más amigables
                const tiposEventos = {
                  '2PT': 'Canasta de 2 puntos',
                  '3PT': 'Triple',
                  'TL': 'Tiro libre',
                  'ASI': 'Asistencia',
                  'FP': 'Falta personal',
                  'REB': 'Rebote',
                  'ROB': 'Robo',
                  'PER': 'Pérdida',
                  'TAP': 'Tapón'
                };
                
                // Buscar jugador en ambos equipos
                if (currentConfig.equipoA.jugadores) {
                  const jugador = currentConfig.equipoA.jugadores.find(j => j.id === evento.jugadorId);
                  if (jugador) {
                    nombreJugador = jugador.nombre;
                    equipoNombre = currentConfig.equipoA.nombre;
                  }
                }
                
                if (nombreJugador === "Jugador desconocido" && currentConfig.equipoB.jugadores) {
                  const jugador = currentConfig.equipoB.jugadores.find(j => j.id === evento.jugadorId);
                  if (jugador) {
                    nombreJugador = jugador.nombre;
                    equipoNombre = currentConfig.equipoB.nombre;
                  }
                }
                
                const descripcionEvento = tiposEventos[tipo as keyof typeof tiposEventos] || tipo;
                
                return (
                  <div key={i} className="flex items-center border-b border-gray-200 py-2 text-sm">
                    <div className="bg-gray-200 rounded px-2 py-1 font-mono mr-3">
                      {evento.tiempo}
                    </div>
                    <div className="font-medium">{descripcionEvento}</div>
                    <div className="mx-2">-</div>
                    <div>{nombreJugador}</div>
                    <div className="ml-auto text-gray-500 text-xs">
                      {equipoNombre}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}