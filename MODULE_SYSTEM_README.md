# Модульная система — Руководство для разработчиков

## 📖 Архитектура

### Типы доступа к модулям

```typescript
type ModuleAccessType = 'free' | 'registration' | 'paid' | 'request' | 'demo'
```

| Тип | Описание | Пример |
|-----|----------|--------|
| `free` | Всегда доступен | Core-модули |
| `registration` | Доступен после регистрации | Заметки |
| `paid` | Требуется покупка | Финансы, CRM |
| `request` | Требуется заявка | Здоровье, Почта |
| `demo` | Демо-версия до регистрации | Все модули |

### Статусы доступа (UI)

```typescript
type ModuleAccessStatus = 
  | 'available'       // Модуль доступен
  | 'demo'            // Демо-режим
  | 'locked-reg'      // Заблокировано до регистрации
  | 'locked-paid'     // Заблокировано, нужна покупка
  | 'locked-request'  // Заблокировано, нужна заявка
  | 'unavailable'     // Модуль не найден
```

---

## 🔧 Использование

### 1. Проверка доступа к модулю

```typescript
import { useModuleAccess } from '@/hooks/useModuleAccess'

function MyComponent() {
  const { status, price, hasRequested } = useModuleAccess('finance')
  
  if (status === 'available') {
    return <FinanceModule />
  }
  
  if (status === 'locked-paid') {
    return <PurchaseCard price={price} />
  }
  
  if (status === 'locked-request') {
    return <RequestModule hasRequested={hasRequested} />
  }
  
  return null
}
```

### 2. Разблокировка модуля при регистрации

```typescript
import { useUserStore } from '@/stores/user-store'
import { getBonusModulesOnRegistration } from '@/lib/module-catalog'

function onRegistrationComplete() {
  const { addUnlockedModule } = useUserStore()
  
  // Получить бонусные модули
  const bonusModules = getBonusModulesOnRegistration()
  const bonusModule = bonusModules[0]
  
  // Разблокировать
  addUnlockedModule(bonusModule.id)
  
  // Показать тост
  showToast(`🎁 Разблокирован модуль: ${bonusModule.name}`)
}
```

### 3. Отправка заявки на модуль

```typescript
import { useUserStore } from '@/stores/user-store'

function submitModuleRequest(moduleId: string, comment: string, budget?: number) {
  const { addRequest } = useUserStore()
  
  const moduleName = getModuleById(moduleId)?.name || 'Unknown'
  
  addRequest({
    moduleId,
    moduleName,
    comment,
    budget
  })
}
```

---

## 🗄️ Хранилище (Zustand + Persist)

### User Store

Данные сохраняются в `IndexedDB` через `zustand/persist`:

```typescript
{
  unlockedModules: ['dashboard', 'tasks', 'calendar', 'notes'],
  pendingRequests: [
    {
      id: 'req-123',
      moduleId: 'health',
      moduleName: 'Здоровье',
      comment: 'Хочу трекер привычек',
      budget: 500,
      status: 'pending',
      createdAt: '2024-12-17T...'
    }
  ]
}
```

### Dashboard Store

```typescript
{
  dataMode: 'demo' | 'real'
}
```

---

## 🎨 UI Компоненты

### ModuleCard

```tsx
<ModuleCard
  module={module}
  status={status}
  price={price}
  subscriptionPrice={subscriptionPrice}
  onPurchase={() => console.log('Purchase')}
  onRequest={() => console.log('Request')}
/>
```

**Свойства:**
- `module` — объект модуля из каталога
- `status` — статус доступа (`available`, `demo`, `locked-paid`, etc.)
- `price` — разовая покупка (₽)
- `subscriptionPrice` — ежемесячная подписка (₽/мес)
- `onPurchase` — обработчик покупки
- `onRequest` — обработчик заявки

### ModuleRequestModal

```tsx
<ModuleRequestModal
  module={module}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

---

## 🔄 Жизненный цикл модуля

```
[Гость в демо]
  ↓
  Видит все модули, но не-core заблокированы
  ↓
[Регистрация]
  ↓
  → switchToRealMode()
  → addUnlockedModule(bonusModule.id)
  → Показать тост о бонусе
  ↓
[Пользователь]
  ↓
  Core-модули: доступны
  Bonus-модуль: доступен
  Premium-модули: "Купить за X₽"
  Request-модули: "Оставить заявку"
  ↓
[Покупка / Заявка]
  ↓
  addUnlockedModule(moduleId)
  ↓
[Модуль доступен]
```

---

## 🛠️ Добавление нового модуля

### 1. Добавить в каталог

```typescript
// src/lib/module-catalog.ts

export const MODULE_CATALOG: ModuleCatalogItem[] = [
  // ... existing modules
  
  {
    id: 'new-module',
    name: 'Новый модуль',
    icon: '🆕',
    color: 'bg-indigo-500',
    description: 'Описание модуля',
    isCore: false,
    accessType: 'paid',
    price: 590,
    subscriptionPrice: 59,
    requiresAuth: true,
    tags: ['productivity'],
    beta: false
  }
]
```

### 2. Добавить страницу модуля

```
src/app/modules/new-module/page.tsx
```

### 3. Добавить роут в навигации

```typescript
// src/components/layout/Sidebar.tsx

{modules.map(module => (
  <Link key={module.id} href={`/modules/${module.id}`}>
    {module.icon} {module.name}
  </Link>
))}
```

---

## 🧪 Тестирование

### Unit-тесты

```typescript
// src/hooks/useModuleAccess.test.ts

describe('useModuleAccess', () => {
  it('should return available for core modules', () => {
    const { status } = renderHook(() => useModuleAccess('dashboard'))
    expect(status).toBe('available')
  })
  
  it('should return locked-reg for non-auth user', () => {
    // TODO: Mock auth store
    const { status } = renderHook(() => useModuleAccess('notes'))
    expect(status).toBe('locked-reg')
  })
})
```

### E2E-тесты

```typescript
// cypress/e2e/modules.cy.ts

describe('Module System', () => {
  it('should show demo badge before registration', () => {
    cy.visit('/')
    cy.contains('🟡 Демо').should('be.visible')
  })
  
  it('should unlock bonus module after registration', () => {
    cy.visit('/auth/register')
    cy.get('[data-testid="email"]').type('test@example.com')
    cy.get('[data-testid="password"]').type('password123')
    cy.get('[data-testid="register-btn"]').click()
    cy.contains('🎁 Разблокирован модуль: Заметки').should('be.visible')
  })
})
```

---

## 🐛 Известные проблемы

1. **Auth store не реализован** — TODO: создать `src/stores/auth-store.ts`
2. **Платежи не интегрированы** — TODO: добавить модал оплаты
3. **Нет синхронизации с облаком** — TODO: sync engine для заявок и покупок

---

## 📚 Дополнительные ресурсы

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Dexie.js Documentation](https://dexie.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Версия:** 2.0.0  
**Дата:** 2024-12-17
