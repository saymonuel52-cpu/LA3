# 🎨 LAD 2 Design System v1.0

> «Профессионально. Просто. Безупречно.»

## 📋 Оглавление

1. [Введение](#введение)
2. [Дизайн-принципы](#дизайн-принципы)
3. [Структура файлов](#структура-файлов)
4. [Использование](#использование)
5. [Компоненты](#компоненты)
6. [Токены](#токены)
7. [Адаптивность](#адаптивность)
8. [Доступность](#доступность)
9. [Чек-лист качества](#чек-лист-качества)

## 🧭 Введение

LAD 2 Design System — это профессиональная система дизайна для проекта LAD 2 (Local Adaptive Dashboard). Система обеспечивает консистентность, доступность и адаптивность интерфейса на всех устройствах.

**Ключевые особенности:**
- 🎯 **Ясность** — интуитивно понятные интерфейсы
- 📐 **Порядок** — сетка 4px, выравнивание по базовой линии
- 🎨 **Консистентность** — единые токены и компоненты
- ♿ **Доступность** — поддержка WCAG 2.1 AA
- 📱 **Адаптивность** — от мобильных до десктопных экранов

## 🧭 Дизайн-принципы

| Принцип | Описание | Пример |
|---------|-----------|--------|
| **Ясность** | Пользователь сразу понимает, что можно нажать, а что нет | Кнопки имеют четкие границы |
| **Порядок** | Всё выровнено по сетке, ничего не «прыгает» | Отступы кратны 4px |
| **Фокус** | Важное выделено, второстепенное не мешает | Заголовок крупный, подсказки — мелкие |
| **Предсказуемость** | Элементы ведут себя так, как от них ждут | Кнопка нажимается с визуальным откликом |
| **Доступность** | Интерфейсом удобно пользоваться всем | Контраст текста ≥ 4.5:1 |

## 🗂️ Структура файлов

```
src/
├── styles/
│   ├── globals.css          # CSS variables (tokens)
│   ├── typography.css       # Шрифты, шкала типографики
│   ├── utilities.css        # Helper-классы (margin, padding, flex)
│   └── components/          # Стили компонентов (опционально)
├── components/ui/           # Переиспользуемые UI-компоненты
│   ├── Button/
│   │   └── Button.tsx
│   ├── Card/
│   │   └── Card.tsx
│   ├── Input/
│   │   └── Input.tsx
│   └── Modal/
│       └── Modal.tsx
├── lib/
│   ├── design-tokens.ts     # Экспорт токенов для JS
│   └── utils.ts             # cn(), conditional classes
└── app/design-system/
    └── page.tsx             # Демонстрационная страница
```

## 🚀 Использование

### Установка зависимостей

```bash
npm install clsx tailwind-merge lucide-react
```

### Импорт в проект

```typescript
// В layout.tsx
import '@/styles/globals.css'
import '@/styles/typography.css'
import '@/styles/utilities.css'

// Использование компонентов
import { Button } from '@/components/ui/Button/Button'
import { Card } from '@/components/ui/Card/Card'
```

### Демонстрационная страница

Откройте `/design-system` в браузере для просмотра всех компонентов и токенов.

## 🧩 Компоненты

### 🔘 Button

```tsx
import { Button } from '@/components/ui/Button/Button'

// Варианты использования
<Button variant="primary">Primary</Button>
<Button variant="secondary" size="large">Large Secondary</Button>
<Button variant="outline" isLoading>Loading</Button>
<Button variant="ghost" leftIcon={<Mail />}>With Icon</Button>
<Button variant="destructive" disabled>Disabled</Button>
```

**Пропсы:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
- `size`: 'large' | 'medium' | 'small'
- `isLoading`: boolean
- `fullWidth`: boolean
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode

### 📦 Card

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card/Card'

<Card variant="interactive">
  <CardHeader 
    title="Заголовок карточки" 
    subtitle="Подзаголовок"
    action={<Settings />}
  />
  <CardContent>
    <p>Контент карточки</p>
  </CardContent>
  <CardFooter align="right">
    <Button>Действие</Button>
  </CardFooter>
</Card>
```

**Варианты:**
- `default`: стандартная карточка
- `interactive`: с hover-эффектами
- `elevated`: с тенью для модальных окон

### 📝 Input / Textarea

```tsx
import { Input, Textarea } from '@/components/ui/Input/Input'

<Input
  label="Email"
  placeholder="email@example.com"
  error="Неверный формат email"
  required
/>

<Textarea
  label="Описание"
  placeholder="Введите описание..."
  rows={4}
  helperText="Максимум 500 символов"
/>
```

### 🗂️ Modal

```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/Modal/Modal'
import { useState } from 'react'

function Example() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Открыть</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Заголовок модалки"
        size="medium"
      >
        <ModalContent>
          <p>Контент модального окна</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Отмена</Button>
          <Button onClick={() => setIsOpen(false)}>Сохранить</Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
```

## 🎨 Токены

### CSS переменные

Все токены доступны как CSS переменные:

```css
/* Цвета */
--color-primary: #8B5CF6;
--color-success: #10B981;
--color-error: #EF4444;

/* Фоны */
--bg-primary: #F8FAFC;
--bg-surface: #FFFFFF;

/* Текст */
--text-primary: #0F172A;
--text-secondary: #64748B;

/* Отступы */
--space-4: 1rem;  /* 16px */
--space-6: 1.5rem; /* 24px */

/* Тени */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
```

### JavaScript токены

```typescript
import { colors, spacing, typography } from '@/lib/design-tokens'

// Использование в JS
const buttonStyle = {
  backgroundColor: colors.primary,
  padding: spacing[4],
  fontSize: typography.fontSize.base,
}
```

### Тёмная тема

Система автоматически поддерживает тёмную тему через CSS media queries:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0F172A;
    --bg-surface: #1E293B;
    --text-primary: #F1F5F9;
  }
}
```

## 📱 Адаптивность

### Сетка по устройствам

| Устройство | Колонки | Отступы | Поля |
|------------|---------|---------|------|
| 📱 Мобильный (<768px) | 4 | 16px | 16px |
| 📱 Планшет (768-1023px) | 8 | 24px | 24px |
| 💻 Десктоп (≥1024px) | 12 | 32px | 48-96px |

### Адаптивные утилиты

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 колонка на мобильном, 2 на планшете, 4 на десктопе */}
</div>

<div className="hide-mobile show-desktop-only">
  {/* Скрыто на мобильном, показано только на десктопе */}
</div>
```

## ♿ Доступность

### Ключевые требования

1. **Контраст текста**: ≥ 4.5:1 для обычного текста, ≥ 3:1 для крупного
2. **Размеры касания**: кнопки ≥ 44×44px на мобильных
3. **Фокус-индикатор**: видимая обводка при навигации с клавиатуры
4. **ARIA-атрибуты**: правильные роли, состояния и свойства
5. **Клавиатурная навигация**: логичный Tab-порядок

### Пример доступного компонента

```tsx
<button
  aria-label="Закрыть модальное окно"
  aria-expanded={isOpen}
  aria-controls="modal-content"
  onClick={handleClose}
>
  <XIcon aria-hidden="true" />
</button>
```

## ✅ Чек-лист качества

Перед сдачей каждого экрана проверьте:

### 🎯 Выравнивание
- [ ] Все элементы выровнены по сетке
- [ ] Отступы кратны 4px
- [ ] Нет «прыгающих» элементов при загрузке

### 📱 Адаптивность
- [ ] Корректное отображение на мобильных (320px+)
- [ ] Корректное отображение на планшетах (768px+)
- [ ] Корректное отображение на десктопе (1024px+)
- [ ] Горизонтального скролла нет

### 🎨 Визуальная консистентность
- [ ] Одинаковые элементы выглядят одинаково
- [ ] Цвета соответствуют токенам
- [ ] Тени используются консистентно
- [ ] Иконки одного стиля и размера

### ♿ Доступность
- [ ] Контраст текста ≥ 4.5:1 (проверьте через инструменты)
- [ ] Все интерактивные элементы доступны с клавиатуры
- [ ] Есть визуальный фокус-индикатор
- [ ] ARIA-атрибуты корректны
- [ ] Изображения имеют alt-текст

### 💫 Интерактивность
- [ ] У всех интерактивных элементов есть состояния (hover, active, focus)
- [ ] Кнопки имеют визуальный отклик при нажатии
- [ ] Формы показывают ошибки понятно
- [ ] Загрузка отображается спиннером или скелетоном

### 📝 Контент
- [ ] Нет орфографических ошибок
- [ ] Текст читаем на любом фоне
- [ ] Пустые состояния имеют призыв к действию
- [ ] Сообщения об ошибках понятны пользователю

## 🔧 Утилитарные классы

### Spacing
```css
.m-4      /* margin: 1rem */
.p-6      /* padding: 1.5rem */
.mt-2     /* margin-top: 0.5rem */
.gap-4    /* gap: 1rem */
```

### Flex & Grid
```css
.flex, .inline-flex
.flex-col, .flex-row
.justify-center, .justify-between
.items-center, .items-start
.grid, .grid-cols-2, .grid-cols-4
```

### Colors & Backgrounds
```css
.text-primary, .text-secondary
.bg-surface, .bg-surface-hover
.bg-success, .bg-error, .bg-warning
```

### Borders & Shadows
```css
.border, .border-t, .border-b
.border-primary, .border-error
.rounded-lg, .rounded-xl
.shadow-sm, .shadow-md, .shadow-lg
```

## 🚀 Быстрый старт

1. **Импортируйте стили** в `layout.tsx`:
   ```typescript
   import '@/styles/globals.css'
   import '@/styles/typography.css'
   import '@/styles/utilities.css'
   ```

2. **Используйте компоненты**:
   ```typescript
   import { Button } from '@/components/ui/Button/Button'
   import { Card } from '@/components/ui/Card/Card'
   ```

3. **Применяйте утилитарные классы**:
   ```tsx
   <div className="p-6 bg-surface rounded-lg shadow-sm">
     <h2 className="text-h2 text-primary mb-4">Заголовок</h2>
     <p className="text-body text-secondary">Контент</p>
   </div>
   ```

4. **Проверьте доступность**:
   - Используйте инструменты разработчика
   - Проверьте контраст
   - Протестируйте клавиатурную навигацию

## 📞 Поддержка

- **Демонстрационная страница**: `/design-system`
- **Токены**: `src/lib/design-tokens.ts`
- **Утилиты**: `src/lib/utils.ts`
- **Исходная спецификация**: `DESIGN.md`

---

**LAD 2 Design System v1.0**  
*Профессионально. Просто. Безупречно.*