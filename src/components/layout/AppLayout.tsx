'use client'

import { useState } from 'react'
import { useApp } from '@/providers/app-provider'
import { contextEngine } from '@/core/context/context-engine'
import { moduleRegistry } from '@/core/module-registry/module-registry'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', href: '/dashboard' },
  { id: 'tasks', name: 'Tasks', icon: '✅', href: '/tasks' },
  { id: 'calendar', name: 'Calendar', icon: '📅', href: '/calendar' },
  { id: 'finance', name: 'Finance', icon: '💰', href: '/finance' },
  { id: 'crm', name: 'CRM', icon: '👥', href: '/crm' },
  { id: 'notes', name: 'Notes', icon: '📝', href: '/notes' },
  { id: 'health', name: 'Health', icon: '❤️', href: '/health' },
  { id: 'mail', name: 'Mail', icon: '📧', href: '/mail' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentContext, setCurrentContext, user } = useApp()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const contextConfig = contextEngine.getContextConfig(currentContext)
  const visibleModules = navigation.filter(mod => 
    contextConfig?.visibleModules.includes(mod.id)
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <span className="text-xl font-bold text-blue-600">LAD 2</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Context Selector */}
        <div className="p-4 border-b border-gray-200">
          <select
            value={currentContext}
            onChange={(e) => setCurrentContext(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="home">🏠 Дом</option>
            <option value="work">💼 Работа</option>
            <option value="study">📚 Учеба</option>
          </select>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {visibleModules.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user.name?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {contextConfig?.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + Быстрое действие
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
