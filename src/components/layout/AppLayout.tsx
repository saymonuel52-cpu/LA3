'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/providers/app-provider'
import { contextEngine } from '@/core/context/context-engine'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { id: 'dashboard', name: 'Дашборд', icon: '📊', href: '/dashboard' },
  { id: 'tasks', name: 'Задачи', icon: '✅', href: '/tasks' },
  { id: 'calendar', name: 'Календарь', icon: '📅', href: '/calendar' },
  { id: 'finance', name: 'Финансы', icon: '💰', href: '/finance' },
  { id: 'crm', name: 'CRM', icon: '👥', href: '/crm' },
  { id: 'appointments', name: 'Записи', icon: '📋', href: '/appointments' },
  { id: 'notes', name: 'Заметки', icon: '📝', href: '/notes' },
  { id: 'health', name: 'Здоровье', icon: '❤️', href: '/health' },
  { id: 'mail', name: 'Почта', icon: '📧', href: '/mail' },
]

const mobileNavItems = ['dashboard', 'tasks', 'calendar', 'finance', 'appointments']

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentContext, setCurrentContext, user } = useApp()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) {
      setSwipeStartX(e.touches[0].clientX)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || swipeStartX === null) return
    
    const currentX = e.touches[0].clientX
    const diff = currentX - swipeStartX
    
    if (swipeStartX < 60 && diff > 100 && !sidebarOpen) {
      setSidebarOpen(true)
      if (navigator.vibrate) navigator.vibrate(50)
    }
    
    if (sidebarOpen && swipeStartX > 200 && diff < -100) {
      setSidebarOpen(false)
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }

  const handleTouchEnd = () => {
    setSwipeStartX(null)
  }

  const handleNavClick = () => {
    if (isMobile) setSidebarOpen(false)
  }

  const handleNavActive = (id: string) => {
    if (isMobile && navigator.vibrate) navigator.vibrate(10)
  }

  const contextConfig = contextEngine.getContextConfig(currentContext)
  const visibleModules = navigation.filter(mod => 
    contextConfig?.visibleModules.includes(mod.id)
  )

  const isActive = (path: string) => pathname === path

  return (
    <div 
      className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Desktop Sidebar - Modern */}
      <aside 
        ref={sidebarRef}
        className={`
          sidebar
          hidden md:flex flex-col
          ${sidebarOpen ? 'w-72' : 'w-20'}
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-700/50
          transition-all duration-300
          shadow-lg
        `}
      >
        {/* Logo with Gradient */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            {sidebarOpen && (
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  LAD 2
                </span>
                <p className="text-xs text-gray-500">Personal OS</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Context Selector - Modern */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <select
            value={currentContext}
            onChange={(e) => setCurrentContext(e.target.value as any)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors bg-white dark:bg-gray-800"
            style={{ fontSize: '16px', minHeight: '44px' }}
          >
            <option value="home">🏠 Дом</option>
            <option value="work">💼 Работа</option>
            <option value="study">📚 Учеба</option>
          </select>
        </div>

        {/* Navigation - Modern with Icons */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleModules.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleNavClick}
              className={`nav-item flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group`}
              style={{
                minHeight: '44px',
                backgroundColor: isActive(item.href) 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))' 
                  : 'transparent',
              }}
              onTouchStart={() => handleNavActive(item.id)}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {sidebarOpen && (
                <span className={`font-medium ${
                  isActive(item.href) 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {item.name}
                </span>
              )}
              {isActive(item.href) && sidebarOpen && (
                <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Info - Modern */}
        {user && (
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-lg">
                {user.name?.charAt(0) || 'U'}
              </div>
              {sidebarOpen && (
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                  <div className="text-sm text-gray-500 truncate">{user.email}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay - Modern */}
      {isMobile && (
        <div 
          className={`mobile-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <div 
            className="mobile-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  LAD 2
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <select
                value={currentContext}
                onChange={(e) => setCurrentContext(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl"
                style={{ fontSize: '16px', minHeight: '44px' }}
              >
                <option value="home">🏠 Дом</option>
                <option value="work">💼 Работа</option>
                <option value="study">📚 Учеба</option>
              </select>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {visibleModules.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all`}
                  style={{
                    minHeight: '44px',
                    backgroundColor: isActive(item.href) 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))' 
                      : 'transparent',
                  }}
                  onTouchStart={() => handleNavActive(item.id)}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`font-medium ${
                    isActive(item.href) 
                      ? 'text-purple-600 dark:text-purple-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.name}
                  </span>
                  {isActive(item.href) && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div ref={contentRef} className="flex-1 flex flex-col main-content overflow-hidden">
        {/* Header - Modern Glassmorphism */}
        <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between px-4 md:px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <span className="text-2xl">☰</span>
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {contextConfig?.name}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative transition-colors" style={{ minHeight: '44px', minWidth: '44px' }}>
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <button 
              className="hidden md:inline-flex px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all shadow-md"
              style={{ minHeight: '44px' }}
            >
              <span className="mr-2">+</span>
              Быстрое действие
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Modern */}
      <nav className="mobile-bottom-nav">
        {navigation.filter(item => mobileNavItems.includes(item.id)).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 h-full nav-item haptic-feedback transition-all"
            style={{
              color: isActive(item.href) ? '#8B5CF6' : '#64748B',
            }}
            onTouchStart={() => handleNavActive(item.id)}
          >
            <div className={`relative ${isActive(item.href) ? 'scale-110' : ''} transition-transform`}>
              <span className="text-2xl mb-1">{item.icon}</span>
              {isActive(item.href) && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-purple-600"></div>
              )}
            </div>
            <span className={`text-xs font-medium ${isActive(item.href) ? 'text-purple-600' : ''}`}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
