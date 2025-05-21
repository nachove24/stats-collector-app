import { Evento } from '../types'
import { PartidoConfig } from '../types'

export function aplicarEvento(config: PartidoConfig, evento: Evento): PartidoConfig {
  const allJugadores = [...config.equipoA.jugadores, ...config.equipoB.jugadores]
  const jugador = allJugadores.find(j => j.id === evento.jugadorId)
  if (!jugador) return config

  switch (evento.tipo) {
    case '2PT':
      jugador.puntos += 2
      jugador.intentos2PT += 1
      jugador.encestado2PT += 1
      break
    case '3PT':
      jugador.puntos += 3
      jugador.intentos3PT += 1
      jugador.encestado3PT += 1
      break
    case 'TL':
      jugador.puntos += 1
      jugador.tirosLibres += 1
      jugador.intentosTL += 1
      break
    case 'REB': jugador.rebotes += 1; break
    case 'ASI': jugador.asistencias += 1; break
    case 'FP': jugador.faltas += 1; break
    case 'TAP': jugador.tapones += 1; break
    case 'ROB': jugador.robos += 1; break
    case 'PER': jugador.perdidas += 1; break
  }

  return {
    ...config,
    equipoA: { ...config.equipoA, jugadores: [...config.equipoA.jugadores] },
    equipoB: { ...config.equipoB, jugadores: [...config.equipoB.jugadores] },
  }
}
