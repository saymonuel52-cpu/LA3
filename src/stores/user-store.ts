import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ModuleAccessStatus = 
  | 'available'      // Модуль доступен
  | 'demo'           // Демо-режим (до регистрации)
  | 'locked-reg'     // Заблокировано до регистрации
  | 'locked-paid'    // Заблокировано, требуется покупка
  | 'locked-request' // Заблокировано, требуется заявка
  | 'unavailable'    // Модуль недоступен

export interface ModuleRequest {
  id: string
  moduleId: string
  moduleName: string
  budget?: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt?: string
}

interface UserState {
  // Разблокированные модули
  unlockedModules: string[]
  
  // Заявки на модули
  pendingRequests: ModuleRequest[]
  
  // Методы для модулей
  addUnlockedModule: (moduleId: string) => void
  removeUnlockedModule: (moduleId: string) => void
  isModuleUnlocked: (moduleId: string) => boolean
  getUnlockedModules: () => string[]
  
  // Методы для заявок
  addRequest: (request: Omit<ModuleRequest, 'id' | 'status' | 'createdAt'>) => void
  updateRequestStatus: (requestId: string, status: ModuleRequest['status']) => void
  getRequestsForModule: (moduleId: string) => ModuleRequest[]
  getRequestById: (requestId: string) => ModuleRequest | undefined
  
  // Очистка демо-режима
  clearDemoMode: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Инициализация
      unlockedModules: [],
      pendingRequests: [],
      
      // Методы для модулей
      addUnlockedModule: (moduleId) => {
        const { unlockedModules } = get()
        if (!unlockedModules.includes(moduleId)) {
          set({ unlockedModules: [...unlockedModules, moduleId] })
        }
      },
      
      removeUnlockedModule: (moduleId) => {
        const { unlockedModules } = get()
        set({ unlockedModules: unlockedModules.filter(id => id !== moduleId) })
      },
      
      isModuleUnlocked: (moduleId) => {
        return get().unlockedModules.includes(moduleId)
      },
      
      getUnlockedModules: () => {
        return get().unlockedModules
      },
      
      // Методы для заявок
      addRequest: (request) => {
        const { pendingRequests } = get()
        const newRequest: ModuleRequest = {
          ...request,
          id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        set({ pendingRequests: [...pendingRequests, newRequest] })
      },
      
      updateRequestStatus: (requestId, status) => {
        const { pendingRequests } = get()
        set({
          pendingRequests: pendingRequests.map(req =>
            req.id === requestId
              ? { ...req, status, updatedAt: new Date().toISOString() }
              : req
          )
        })
      },
      
      getRequestsForModule: (moduleId) => {
        return get().pendingRequests.filter(req => req.moduleId === moduleId)
      },
      
      getRequestById: (requestId) => {
        return get().pendingRequests.find(req => req.id === requestId)
      },
      
      // Очистка демо-режима
      clearDemoMode: () => {
        // Удаляем все демо-модули из разблокированных
        const { unlockedModules } = get()
        const nonDemoModules = unlockedModules.filter(id => !id.startsWith('demo-'))
        set({ unlockedModules: nonDemoModules })
      }
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        unlockedModules: state.unlockedModules,
        pendingRequests: state.pendingRequests
      })
    }
  )
)
