import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DataMode = 'demo' | 'real'

interface DashboardState {
  dataMode: DataMode
  setDataMode: (mode: DataMode) => void
  isDemoMode: () => boolean
  // Методы для синхронизации с auth
  switchToRealMode: () => void
  switchToDemoMode: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      dataMode: 'real',
      
      setDataMode: (mode) => set({ dataMode: mode }),
      
      isDemoMode: () => get().dataMode === 'demo',
      
      // Переключение на реальный режим (при регистрации/онбординге)
      switchToRealMode: () => set({ dataMode: 'real' }),
      
      // Переключение на демо-режим (при первом запуске)
      switchToDemoMode: () => set({ dataMode: 'demo' })
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({ dataMode: state.dataMode })
    }
  )
)
