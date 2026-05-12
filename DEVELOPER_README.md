# README для разработчиков — Исправления багов

## 📌 Обзор изменений

В этой версии исправлены 5 критических багов интерфейса и реализована новая логика демо-режима согласно философии проекта:
- **Local-First** — идеальная работа без интернета
- **Простота для пользователя** — никаких сложных настроек
- **Демо-режим только ДО регистрации**, не в настройках

---

## 🎯 Что было исправлено

### 1. Мобильный гамбургер ✅
- Сайдбар теперь плавно выезжает слева
- Добавлен оверлей с затемнением
- Поддержка клавиши Esc
- Trap-focus внутри меню
- ARIA-атрибуты для доступности

### 2. Демо-режим ✅
- Убран переключатель режимов из настроек
- Демо показывается ТОЛЬКО при первом запуске
- После "авторизации" — автоматический переход на реальные данные

### 3. Секция "Управление данными" ✅
- Компонент теперь виден в настройках
- Только одна кнопка: "Сбросить все данные"

### 4. Переключение данных ✅
- Убран переключатель с дашборда
- Добавлен бейдж "🟡 Демо" в хедере
- Режим определяется автоматически

### 5. Модал подтверждения ✅
- Создан универсальный компонент `ConfirmModal`
- Поддержка вариантов: `danger` и `default`
- Анимации, доступность, закрытие по Esc

---

## 🏗️ Архитектура

### Хранилище (Zustand)

```typescript
// src/stores/dashboard-store.ts
interface DashboardState {
  dataMode: 'demo' | 'real'
  setDataMode: (mode: DataMode) => void
  isDemoMode: () => boolean
}
```

### Логика демо-режима

```typescript
// src/hooks/useDashboardData.ts
const isAuthenticated = false // TODO: из auth store
const hasCompletedOnboarding = false // TODO: из auth store

const shouldUseDemo = !isAuthenticated || !hasCompletedOnboarding

if (shouldUseDemo) {
  setDataMode('demo')
  return demoData
} else {
  return realDataFromDB
}
```

---

## 🧪 Как тестировать

### Запуск в режиме разработки

```bash
cd la3
npm install
npm run dev
```

Откройте: `http://localhost:3000`

### Тестирование мобильного меню

1. Откройте DevTools → Device Toolbar
2. Выберите мобильное устройство (iPhone 12 Pro)
3. Тапните по ☰ — должен открыться сайдбар
4. Проверьте:
   - Анимация плавная
   - Клик по ✕ закрывает
   - Клик по фону закрывает
   - Esc закрывает

### Тестирование демо-режима

1. При первом запуске (без изменений) — видите демо-данные
2. На дашборде — бейдж "🟡 Демо"
3. В настройках — нет переключателя, только "Сбросить"

### Тестирование сброса данных

1. Откройте `/settings`
2. Нажмите "🗑️ Сбросить все данные"
3. Подтвердите в модале
4. Проверьте уведомление об успехе

---

## 📁 Структура файлов

```
src/
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx          # Гамбургер, сайдбар, оверлей
│   ├── settings/
│   │   └── DataSettings.tsx       # Кнопка сброса + модал
│   └── ui/
│       └── ConfirmModal.tsx       # Универсальный модал
├── hooks/
│   └── useDashboardData.ts        # Логика демо/реальных данных
├── stores/
│   └── dashboard-store.ts         # Глобальный стейт dataMode
├── app/
│   ├── dashboard/page.tsx         # Дашборд с бейджем демо
│   └── settings/page.tsx          # Интеграция DataSettings
└── styles/
    └── global.css                 # Анимация scaleIn
```

---

## 🔧 Интеграция с Auth

Для полной реализации нужно интегрировать с вашей системой аутентификации:

### 1. Получить состояние авторизации

```typescript
// src/hooks/useDashboardData.ts
import { useAuthStore } from '@/stores/auth-store'

export function useDashboardData(): DashboardData {
  const { isAuthenticated } = useAuthStore()
  const { hasCompletedOnboarding } = useAuthStore()
  
  const shouldUseDemo = !isAuthenticated || !hasCompletedOnboarding
  // ...
}
```

### 2. Автопереключение при авторизации

```typescript
// В auth-store или при успешном логине
useEffect(() => {
  if (isAuthenticated && hasCompletedOnboarding) {
    useDashboardStore.setState({ dataMode: 'real' })
  }
}, [isAuthenticated, hasCompletedOnboarding])
```

---

## 🗄️ Миграция базы данных

Для оптимизации запросов добавьте индекс `isDemo`:

```typescript
// src/lib/db/database.ts
db.version(2).stores({
  tasks: 'id, isDemo, status, due_date, [user_id+workspace_id]',
  calendar_events: 'id, isDemo, start_time, [user_id+workspace_id]',
  transactions: 'id, isDemo, date, category, [user_id+workspace_id]',
  // ... другие таблицы
})
```

### Миграция для существующих данных

```typescript
db.version(2).upgrade(async (tx) => {
  const tasks = await tx.tasks.toArray()
  const events = await tx.calendarEvents.toArray()
  const transactions = await tx.transactions.toArray()
  
  await Promise.all([
    ...tasks.map(task => tx.tasks.update(task.id, { isDemo: false })),
    ...events.map(event => tx.calendarEvents.update(event.id, { isDemo: false })),
    ...transactions.map(tx => tx.transactions.update(tx.id, { isDemo: false }))
  ])
})
```

---

## 🎨 UI/UX Guidelines

### Анимации

```css
/* Гамбургер → Сайдбар */
transform: translateX(-100% → 0)
duration: 300ms
timing: ease-out

/* Оверлей */
opacity: 0 → 0.5
duration: 200ms
timing: ease-out

/* Модал */
transform: scale(0.95 → 1)
opacity: 0 → 1
duration: 200ms
timing: ease-out
```

### Доступность (A11y)

- Все интерактивные элементы: `min-height: 44px`
- Фокус: `outline: 3px solid var(--color-primary)`
- ARIA-атрибуты на всех кнопках и модалах
- Trap-focus в модалах и сайдбарах
- Поддержка клавиатуры (Tab, Enter, Esc)

---

## 🐛 Известные ограничения

1. **Поле `isDemo` не проиндексировано** — добавляем в следующей версии
2. **Миграция данных** — требуется ручная миграция для старых записей
3. **Multi-user** — демо-данные используют `user_id: 'demo-user'`
4. **Sync-engine** — нужно добавить фильтр `isDemo` при синхронизации

---

## 📦 Следующие улучшения

- [ ] Интеграция с auth store
- [ ] Миграция существующих данных
- [ ] Добавление индексов `isDemo`
- [ ] Unit-тесты для хуков и компонент
- [ ] E2E-тесты для мобильного меню
- [ ] Локализация всех текстов (i18n)
- [ ] Обработка ошибок при очистке данных
- [ ] PWA-уведомления при сбросе данных

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера
2. Проверьте `npm run build` на ошибки
3. Убедитесь, что все зависимости установлены: `npm install`
4. Очистите кэш: `rm -rf .next node_modules && npm install`

---

**Версия:** 1.0.0  
**Дата:** 2024-12-17  
**Автор:** AI Assistant (по промту пользователя)
