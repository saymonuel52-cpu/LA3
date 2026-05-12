import { create } from 'zustand'

export type DataMode = 'demo' | 'real'

interface DashboardState {
  dataMode: DataMode
  setDataMode: (mode: DataMode) => void
  isDemoMode: () => boolean
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dataMode: 'real',
  
  setDataMode: (mode) => set({ dataMode: mode }),
  
  isDemoMode: () => get().dataMode === 'demo',
}))
