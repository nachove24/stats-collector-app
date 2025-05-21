// src/features/config/configSlice.ts
import  create  from 'zustand'
import { Equipo, PartidoConfig } from '../../types'

interface ConfigState {
  config: PartidoConfig | null
  setConfig: (config: PartidoConfig) => void
  resetConfig: () => void
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  resetConfig: () => set({ config: null }),
}))
