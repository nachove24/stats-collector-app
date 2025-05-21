import  create  from 'zustand'
import { Jugador, PartidoConfig, Evento } from '../../types'


interface MatchState {
  currentConfig: PartidoConfig | null
  eventos: Evento[]         
  partidoId: string | null            
  agregarEvento: (e: Evento) => void   
  deshacerEvento: () => void
  setConfig: (cfg: PartidoConfig) => void
  setPartidoId: (id: string) => void
}

export const useMatchStore = create<MatchState>((set, get) => ({
  currentConfig: null,
  eventos: [],
  partidoId: null,
  agregarEvento: (e) => set((s) => ({ eventos: [...s.eventos, e] })),
  deshacerEvento: () => {
    const eventos = [...get().eventos]
    eventos.pop()
    set({ eventos })
  },
  setConfig: (cfg) => set({ currentConfig: cfg }),
  setPartidoId: (id) => set({ partidoId: id }),
}))
