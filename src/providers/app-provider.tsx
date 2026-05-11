'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { contextEngine, type ContextType } from '@/core/context/context-engine'
import { moduleRegistry } from '@/core/module-registry/module-registry'
import { authCore } from '@/core/auth/auth-core'
import { db, initializeDatabase } from '@/lib/db/database'

interface AppContextType {
  currentContext: ContextType
  setCurrentContext: (context: ContextType) => void
  user: any
  isLoading: boolean
  isReady: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentContext, setCurrentContextState] = useState<ContextType>('home')
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function initializeApp() {
      try {
        // Restore context
        contextEngine.restoreContext()
        setCurrentContextState(contextEngine.getCurrentContext())

        // Restore auth
        authCore.restoreSession()
        const authState = authCore.getState()
        setUser(authState.user)

        // Initialize database if user exists
        if (authState.user) {
          await initializeDatabase(authState.user.id)
        }

        // Load modules
        moduleRegistry.restoreEnabledModules()

        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const setCurrentContext = (context: ContextType) => {
    contextEngine.switchContext(context)
    setCurrentContextState(context)
  }

  const value = {
    currentContext,
    setCurrentContext,
    user,
    isLoading,
    isReady,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
