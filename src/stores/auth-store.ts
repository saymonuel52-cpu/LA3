import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AuthStatus = 'anonymous' | 'authenticating' | 'authenticated' | 'error'

interface AuthState {
  // Состояние авторизации
  status: AuthStatus
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  
  // Данные пользователя
  userId: string | null
  email: string | null
  
  // Методы
  setStatus: (status: AuthStatus) => void
  setAuthenticated: (userId: string, email: string) => void
  setLogout: () => void
  setCompletedOnboarding: (completed: boolean) => void
  setAuthError: (error: string) => void
  clearAuthError: () => void
  
  // Хелперы
  isDemoMode: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Инициализация
      status: 'anonymous',
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      userId: null,
      email: null,
      
      // Методы
      setStatus: (status) => set({ status }),
      
      setAuthenticated: (userId, email) => 
        set({ 
          status: 'authenticated', 
          isAuthenticated: true,
          userId,
          email
        }),
      
      setLogout: () => 
        set({ 
          status: 'anonymous', 
          isAuthenticated: false,
          userId: null,
          email: null,
          hasCompletedOnboarding: false
        }),
      
      setCompletedOnboarding: (completed) => 
        set({ hasCompletedOnboarding: completed }),
      
      setAuthError: (error) => 
        set({ status: 'error' }),
      
      clearAuthError: () => 
        set({ status: 'anonymous' }),
      
      // Хелпер: демо-режим включён если не авторизован ИЛИ не прошёл онбординг
      isDemoMode: () => {
        const { isAuthenticated, hasCompletedOnboarding } = get()
        return !isAuthenticated || !hasCompletedOnboarding
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        userId: state.userId,
        email: state.email
      })
    }
  )
)
