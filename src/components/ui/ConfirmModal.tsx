'use client'

import { useEffect, useRef } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'default',
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstButtonRef = useRef<HTMLButtonElement>(null)

  // Фокус на первую кнопку при открытии
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstButtonRef.current?.focus()
      }, 100)
      
      // Блокируем скролл фона
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Обработка клавиши Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleClose = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full z-10 animate-scale-in"
      >
        <div className="p-6">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-blue-100 dark:bg-blue-900/30'
          }`}>
            <span className="text-2xl">
              {variant === 'danger' ? '⚠️' : 'ℹ️'}
            </span>
          </div>

          {/* Title */}
          <h3
            id="modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h3>

          {/* Description */}
          <p
            id="modal-description"
            className="text-gray-600 dark:text-gray-300 mb-6"
          >
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              style={{ minHeight: '44px' }}
            >
              {cancelText}
            </button>
            <button
              ref={firstButtonRef}
              onClick={handleConfirm}
              className={`px-4 py-2.5 rounded-xl text-white transition-colors font-medium shadow-lg ${
                variant === 'danger'
                  ? 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/30'
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-500/30'
              }`}
              style={{ minHeight: '44px' }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
