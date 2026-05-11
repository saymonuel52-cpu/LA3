# Примеры использования компонентов LAD 2 Design System

## 🔘 Button

### Базовое использование
```tsx
import { Button } from './Button/Button'

// Primary кнопка (по умолчанию)
<Button>Сохранить</Button>

// Secondary кнопка
<Button variant="secondary">Отмена</Button>

// Outline кнопка
<Button variant="outline">Редактировать</Button>

// Ghost кнопка
<Button variant="ghost">Удалить</Button>

// Destructive кнопка
<Button variant="destructive">Удалить навсегда</Button>
```

### Размеры
```tsx
<Button size="large">Большая кнопка</Button>
<Button size="medium">Средняя кнопка (по умолчанию)</Button>
<Button size="small">Маленькая кнопка</Button>
```

### Состояния
```tsx
// С иконкой
<Button leftIcon={<Mail className="h-4 w-4" />}>
  Написать письмо
</Button>

// Загрузка
<Button isLoading>Загрузка...</Button>

// Отключенная
<Button disabled>Недоступно</Button>

// На всю ширину
<Button fullWidth>Полная ширина</Button>
```

### Комбинированные примеры
```tsx
// Кнопка с иконкой справа
<Button 
  variant="primary" 
  size="large" 
  rightIcon={<ArrowRight className="h-4 w-4" />}
>
  Продолжить
</Button>

// Деструктивная кнопка с загрузкой
<Button 
  variant="destructive" 
  isLoading 
  leftIcon={<Trash2 className="h-4 w-4" />}
>
  Удаление...
</Button>
```

## 📦 Card

### Базовая карточка
```tsx
import { Card, CardHeader, CardContent, CardFooter } from './Card/Card'

<Card>
  <CardHeader 
    title="Заголовок карточки" 
    subtitle="Подзаголовок с дополнительной информацией"
  />
  <CardContent>
    <p className="text-body text-secondary">
      Основной контент карточки. Здесь может быть текст, изображения, таблицы или другие компоненты.
    </p>
  </CardContent>
</Card>
```

### Карточка с действиями
```tsx
<Card variant="interactive">
  <CardHeader 
    title="Интерактивная карточка"
    subtitle="Нажмите для подробностей"
    action={<Settings className="h-4 w-4 text-tertiary" />}
  />
  <CardContent>
    <p>Контент карточки...</p>
  </CardContent>
  <CardFooter align="right">
    <Button variant="ghost" size="small">Отмена</Button>
    <Button size="small">Подтвердить</Button>
  </CardFooter>
</Card>
```

### Карточка с тенью
```tsx
<Card variant="elevated" shadow>
  <CardHeader title="Важное уведомление" />
  <CardContent>
    <p>Эта карточка имеет тень для выделения на фоне.</p>
  </CardContent>
</Card>
```

### Карточка без границ
```tsx
<Card border={false}>
  <CardContent>
    <p>Карточка без видимой границы.</p>
  </CardContent>
</Card>
```

## 📝 Input & Textarea

### Текстовое поле
```tsx
import { Input, Textarea } from './Input/Input'
import { useState } from 'react'

function FormExample() {
  const [value, setValue] = useState('')
  
  return (
    <div className="space-y-4">
      <Input
        label="Имя пользователя"
        placeholder="Введите ваше имя"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        helperText="Используйте только буквы и цифры"
      />
      
      <Input
        label="Email"
        type="email"
        placeholder="email@example.com"
        required
        error={!value.includes('@') ? 'Введите корректный email' : undefined}
      />
      
      <Input
        label="Поиск"
        placeholder="Поиск..."
        leftIcon={<Search className="h-4 w-4" />}
        fullWidth
      />
      
      <Input
        label="Пароль"
        type="password"
        placeholder="Введите пароль"
      />
    </div>
  )
}
```

### Многострочный текст
```tsx
<Textarea
  label="Описание проекта"
  placeholder="Опишите ваш проект..."
  rows={4}
  helperText="Максимум 1000 символов"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

### Поле с кастомной иконкой
```tsx
<Input
  label="Сумма"
  placeholder="0.00"
  leftIcon={<DollarSign className="h-4 w-4" />}
  rightIcon={<span className="text-tertiary">USD</span>}
/>
```

## 🗂️ Modal

### Базовое модальное окно
```tsx
import { Modal, ModalHeader, ModalContent, ModalFooter } from './Modal/Modal'
import { useState } from 'react'

function ModalExample() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Открыть модальное окно
      </Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Создание новой задачи"
        description="Заполните форму для создания новой задачи"
        size="medium"
      >
        <ModalContent>
          <div className="space-y-4">
            <Input
              label="Название задачи"
              placeholder="Введите название"
              fullWidth
            />
            <Textarea
              label="Описание"
              placeholder="Детальное описание задачи..."
              rows={3}
            />
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button onClick={() => setIsOpen(false)}>
            Создать задачу
          </Button>
        </ModalFooter>
      </Modal>
    </>
  )
}
```

### Модальное окно без заголовка
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  showCloseButton={false}
>
  <ModalContent>
    <p>Контент без заголовка</p>
  </ModalContent>
</Modal>
```

### Модальное окно разных размеров
```tsx
// Маленькое
<Modal size="small" ...>

// Среднее (по умолчанию)
<Modal size="medium" ...>

// Большое
<Modal size="large" ...>

// На всю ширину
<Modal size="full" ...>
```

## 🎨 Комбинированные примеры

### Форма в карточке
```tsx
<Card>
  <CardHeader title="Регистрация" />
  <CardContent>
    <div className="space-y-4">
      <Input label="Имя" placeholder="Ваше имя" />
      <Input label="Email" placeholder="email@example.com" />
      <Input label="Пароль" type="password" />
    </div>
  </CardContent>
  <CardFooter align="right">
    <Button variant="ghost">Отмена</Button>
    <Button>Зарегистрироваться</Button>
  </CardFooter>
</Card>
```

### Список карточек с действиями
```tsx
<div className="space-y-4">
  {items.map((item) => (
    <Card key={item.id} variant="interactive">
      <CardHeader 
        title={item.title}
        subtitle={item.subtitle}
        action={
          <Button variant="ghost" size="small">
            <MoreVertical className="h-4 w-4" />
          </Button>
        }
      />
      <CardContent>
        <p>{item.description}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

### Модальное окно подтверждения
```tsx
function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small">
      <ModalHeader title={title} />
      <ModalContent>
        <p className="text-body text-secondary">{message}</p>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Удалить
        </Button>
      </ModalFooter>
    </Modal>
  )
}
```

## 🎯 Лучшие практики

### 1. Консистентность размеров
```tsx
// ❌ Плохо - смешанные размеры
<Button size="large">Сохранить</Button>
<Button size="small">Отмена</Button>

// ✅ Хорошо - одинаковые размеры
<Button size="medium">Сохранить</Button>
<Button size="medium" variant="ghost">Отмена</Button>
```

### 2. Доступность
```tsx
// ✅ Всегда добавляйте labels к полям ввода
<Input label="Email" ... />

// ✅ Используйте helperText для пояснений
<Input helperText="Мы никогда не делимся вашим email" ... />

// ✅ Показывайте ошибки явно
<Input error="Неверный формат email" ... />
```

### 3. Адаптивность
```tsx
// ✅ Используйте утилитарные классы для адаптивности
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input label="Имя" />
  <Input label="Фамилия" />
</div>

// ✅ Скрывайте неважное на мобильных
<div className="hide-mobile show-desktop-only">
  <p>Только для десктопа</p>
</div>
```

### 4. Состояния загрузки
```tsx
// ✅ Показывайте состояние загрузки
<Button isLoading={isSubmitting}>
  {isSubmitting ? 'Отправка...' : 'Отправить'}
</Button>

// ✅ Блокируйте форму при загрузке
<Input disabled={isLoading} ... />
<Button disabled={isLoading} ... />
```

## 🔧 Интеграция с существующим кодом

### Использование с Tailwind
```tsx
<div className="p-6 bg-surface rounded-lg shadow-sm">
  <h2 className="text-h2 text-primary mb-4">Заголовок</h2>
  <Card className="mt-4">
    {/* ... */}
  </Card>
</div>
```

### Кастомизация через className
```tsx
<Button className="custom-button-class">
  Кастомная кнопка
</Button>

<Card className="special-card">
  <CardContent>
    <p>Кастомная карточка</p>
  </CardContent>
</Card>
```

### Использование design tokens в JS
```tsx
import { colors, spacing } from '@/lib/design-tokens'

const customStyle = {
  backgroundColor: colors.primary,
  padding: spacing[6],
  borderRadius: '12px',
}

<div style={customStyle}>
  Кастомный элемент
</div>
```

---

**Примечание:** Все компоненты следуют дизайн-системе LAD 2 и включают встроенную поддержку доступности, адаптивности и тёмной темы.