// src/types/index.ts

export interface Evento {
  tiempo: string
  jugadorId: string
  tipo: string
}

export interface Jugador {
  id: string
  numero: number
  nombre: string
  puntos: number
  rebotes: number
  asistencias: number
  faltas: number
  tapones: number
  robos: number
  perdidas: number
  tirosLibres: number // TL convertidos
  intentosTL: number  // TL intentados
  intentos2PT: number
  encestado2PT: number
  intentos3PT: number
  encestado3PT: number
}

export interface Equipo {
  id: string
  nombre: string
  jugadores: Jugador[]
  faltasEquipo: number
}

export interface PartidoConfig {
  equipoA: Equipo
  equipoB: Equipo
  periodo: number         // ← periodo actual (1, 2, 3, 4)
  duracionPeriodo: number // ← duración en segundos (ej. 600 = 10:00)
  maxPeriodos: number     // ← total de periodos (2 o 4)
}


