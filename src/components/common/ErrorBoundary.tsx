'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    
    // Log to error tracking service (Sentry, etc.)
    if (typeof window !== 'undefined') {
      const errorLog = {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }
      
      // Store locally for debugging
      localStorage.setItem('last_error', JSON.stringify(errorLog))
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full card text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2 dark:text-white">
              Ой! Что-то пошло не так
            </h2>
            <p className="text-secondary mb-6">
              Мы зафиксировали ошибку. Попробуйте обновить страницу или обратитесь в поддержку.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                <summary className="cursor-pointer font-semibold text-sm">
                  Показать детали ошибки
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-48">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary flex-1"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                }}
              >
                🔄 Обновить страницу
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('last_error')
                  window.location.href = '/'
                }}
                className="btn btn-secondary flex-1"
              >
                🏠 На главную
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
