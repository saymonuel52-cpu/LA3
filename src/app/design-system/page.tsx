'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card/Card'
import { Input, Textarea } from '@/components/ui/Input/Input'
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/Modal/Modal'
import { Mail, Calendar, Check, AlertCircle, Search, User, Settings, Bell } from 'lucide-react'

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-display text-[var(--text-primary)] mb-2">
            LAD 2 Design System
          </h1>
          <p className="text-body text-[var(--text-secondary)]">
            Профессиональная дизайн-система для LAD 2. Просто. Безупречно.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Colors & Typography */}
          <div className="lg:col-span-2 space-y-8">
            {/* Colors */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Цветовая система</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-[var(--color-primary)]"></div>
                  <p className="text-caption text-[var(--text-secondary)]">Primary</p>
                  <code className="text-xs font-mono">#8B5CF6</code>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-[var(--color-success)]"></div>
                  <p className="text-caption text-[var(--text-secondary)]">Success</p>
                  <code className="text-xs font-mono">#10B981</code>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-[var(--color-error)]"></div>
                  <p className="text-caption text-[var(--text-secondary)]">Error</p>
                  <code className="text-xs font-mono">#EF4444</code>
                </div>
                <div className="space-y-2">
                  <div className="h-20 rounded-lg bg-[var(--color-warning)]"></div>
                  <p className="text-caption text-[var(--text-secondary)]">Warning</p>
                  <code className="text-xs font-mono">#F59E0B</code>
                </div>
              </div>
            </section>

            {/* Typography */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Типографика</h2>
              <div className="space-y-4">
                <div>
                  <h1 className="text-display text-[var(--text-primary)]">Display 32px/700</h1>
                  <p className="text-caption text-[var(--text-tertiary)]">Заголовки страниц</p>
                </div>
                <div>
                  <h1 className="text-h1 text-[var(--text-primary)]">H1 24px/600</h1>
                  <p className="text-caption text-[var(--text-tertiary)]">Крупные разделы</p>
                </div>
                <div>
                  <h2 className="text-h2 text-[var(--text-primary)]">H2 20px/600</h2>
                  <p className="text-caption text-[var(--text-tertiary)]">Подзаголовки</p>
                </div>
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">H3 18px/500</h3>
                  <p className="text-caption text-[var(--text-tertiary)]">Заголовки карточек</p>
                </div>
                <div>
                  <p className="text-body text-[var(--text-primary)]">Body 16px/400</p>
                  <p className="text-caption text-[var(--text-tertiary)]">Основной текст</p>
                </div>
              </div>
            </section>

            {/* Buttons */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Кнопки</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)] mb-4">Варианты</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)] mb-4">Размеры</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="large">Large</Button>
                    <Button size="medium">Medium</Button>
                    <Button size="small">Small</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)] mb-4">Состояния</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button leftIcon={<Mail className="h-4 w-4" />}>With Icon</Button>
                    <Button isLoading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button fullWidth>Full Width</Button>
                  </div>
                </div>
              </div>
            </section>

            {/* Inputs */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Поля ввода</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Имя пользователя"
                  placeholder="Введите ваше имя"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helperText="Используйте только буквы и цифры"
                />
                <Input
                  label="Пароль"
                  type="password"
                  placeholder="Введите пароль"
                  required
                />
                <Input
                  label="Поиск"
                  placeholder="Поиск..."
                  leftIcon={<Search className="h-4 w-4" />}
                  fullWidth
                />
                <Input
                  label="Email с ошибкой"
                  placeholder="email@example.com"
                  error="Неверный формат email"
                  value="invalid-email"
                />
              </div>
              <div className="mt-6">
                <Textarea
                  label="Описание"
                  placeholder="Введите подробное описание..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  rows={4}
                  helperText="Максимум 500 символов"
                />
              </div>
            </section>
          </div>

          {/* Right column - Cards & Components */}
          <div className="space-y-8">
            {/* Cards */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Карточки</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Базовая карточка" subtitle="Стандартный вариант" />
                  <CardContent>
                    <p className="text-body text-[var(--text-secondary)]">
                      Это пример базовой карточки с заголовком, подзаголовком и контентом.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="interactive">
                  <CardHeader 
                    title="Интерактивная карточка" 
                    subtitle="Нажмите для действия"
                    action={<Settings className="h-4 w-4 text-[var(--text-tertiary)]" />}
                  />
                  <CardContent>
                    <p className="text-body text-[var(--text-secondary)]">
                      При наведении появляется эффект hover. Идеально для списков.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="small" variant="ghost">Отмена</Button>
                    <Button size="small">Подтвердить</Button>
                  </CardFooter>
                </Card>

                <Card variant="elevated" shadow>
                  <CardHeader title="Карточка с тенью" />
                  <CardContent>
                    <p className="text-body text-[var(--text-secondary)]">
                      Используется для модальных окон и важных уведомлений.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Modal Demo */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Модальные окна</h2>
              <Button onClick={() => setIsModalOpen(true)}>
                Открыть модальное окно
              </Button>

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Пример модального окна"
                description="Это демонстрация модального окна согласно дизайн-системе LAD 2"
                size="medium"
              >
                <ModalContent>
                  <p className="text-body text-[var(--text-secondary)] mb-4">
                    Модальные окна используются для важных действий, которые требуют внимания пользователя.
                    Они блокируют взаимодействие с основным интерфейсом.
                  </p>
                  <Input
                    label="Название задачи"
                    placeholder="Введите название задачи"
                    fullWidth
                  />
                </ModalContent>
                <ModalFooter align="between">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Сохранить
                  </Button>
                </ModalFooter>
              </Modal>
            </section>

            {/* Utility Classes */}
            <section>
              <h2 className="text-h2 text-[var(--text-primary)] mb-6">Утилитарные классы</h2>
              <div className="space-y-4">
                <div className="p-4 bg-success rounded-lg">
                  <p className="text-body text-[var(--text-success)] font-medium">
                    .bg-success .text-success
                  </p>
                </div>
                <div className="p-4 bg-warning rounded-lg">
                  <p className="text-body text-[var(--color-warning)] font-medium">
                    .bg-warning .text-warning
                  </p>
                </div>
                <div className="p-4 bg-error rounded-lg">
                  <p className="text-body text-[var(--text-error)] font-medium">
                    .bg-error .text-error
                  </p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-surface rounded-lg">
                  <div className="p-2 bg-primary rounded">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-body text-[var(--text-primary)] font-medium">
                      .flex .items-center .gap-4
                    </p>
                    <p className="text-small text-[var(--text-secondary)]">
                      .p-4 .bg-surface .rounded-lg
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Principles */}
        <section className="mt-12 pt-8 border-t border-[var(--border-default)]">
          <h2 className="text-h2 text-[var(--text-primary)] mb-6">Дизайн-принципы LAD 2</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader 
                title="Ясность" 
                action={<Check className="h-5 w-5 text-[var(--color-success)]" />}
              />
              <CardContent>
                <p className="text-small text-[var(--text-secondary)]">
                  Пользователь сразу понимает, что можно нажать, а что нет.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader 
                title="Порядок" 
                action={<Calendar className="h-5 w-5 text-[var(--color-primary)]" />}
              />
              <CardContent>
                <p className="text-small text-[var(--text-secondary)]">
                  Всё выровнено по сетке, отступы кратны 4px, ничего не «прыгает».
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader 
                title="Фокус" 
                action={<Bell className="h-5 w-5 text-[var(--color-warning)]" />}
              />
              <CardContent>
                <p className="text-small text-[var(--text-secondary)]">
                  Важное выделено, второстепенное не мешает. Заголовок крупный, подсказки — мелкие.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader 
                title="Доступность" 
                action={<AlertCircle className="h-5 w-5 text-[var(--color-info)]" />}
              />
              <CardContent>
                <p className="text-small text-[var(--text-secondary)]">
                  Контраст текста ≥ 4.5:1, размер кнопок ≥ 44×44px, поддержка скринридеров.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[var(--border-default)]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-h3 text-[var(--text-primary)]">LAD 2 Design System v1.0</h3>
              <p className="text-small text-[var(--text-secondary)]">
                «Профессионально. Просто. Безупречно.»
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" size="small" className="mr-2">
                Документация
              </Button>
              <Button size="small">
                Использовать компоненты
              </Button>
            </div>
          </div>
          <p className="text-caption text-[var(--text-tertiary)] text-center mt-6">
            Все компоненты соответствуют спецификации дизайн-системы. Проверено на доступность и адаптивность.
          </p>
        </footer>
      </div>
    </div>
  )
}