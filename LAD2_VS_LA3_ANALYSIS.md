# Анализ различий между LAD 2 и LA3

## Обзор схем базы данных

### Таблицы с полем `isDemo` в LAD 2 (основной проект)
- ✅ `Task` - has `isDemo: boolean`
- ✅ `CalendarEvent` - has `isDemo: boolean`
- ✅ `Transaction` - has `isDemo: boolean`
- ⚠️ `Note` - has `isDemo?: boolean` (опциональное)
- ⚠️ `Contact` - has `isDemo?: boolean` (опциональное)
- ⚠️ `Appointment` - has `isDemo?: boolean` (опциональное)
- ⚠️ `Client` - has `isDemo?: boolean` (опциональное)
- ❌ `Procedure` - нет `isDemo`

### Текущее состояние в LA3
Схема LA3 идентична схеме LAD 2, поле `isDemo` уже добавлено в те же таблицы.

## Различия в реализации

### 1. Хуки
**LAD 2:**
- ✅ `src/hooks/useDashboardData.ts` - реализован с поддержкой 3 режимов (demo, real, empty)

**LA3:**
- ❌ Хук отсутствует

### 2. Компоненты настроек
**LAD 2:**
- ✅ `src/components/settings/DataSettings.tsx` - компонент управления данными

**LA3:**
- ❌ Компонент отсутствует

### 3. Структура данных
**LAD 2:**
- ✅ `src/data/demo/` - директория с демо-данными
  - `dashboard.json`
  - `tasks.json`
  - `calendar.json`
  - `finance.json`

**LA3:**
- ❌ Директория не создана

## Рекомендации по синхронизации

1. Добавить поле `isDemo` в таблицу `Procedure` (необязательное)
2. Создать директорию `src/data/demo/` с демо-данными
3. Реализовать хук `useDashboardData`
4. Создать компонент `DataSettings`
5. Интегрировать компонент в страницу настроек

## Статус интеграции

| Компонент | LAD 2 | LA3 | Статус |
|-----------|-------|-----|--------|
| Схема БД (isDemo) | ✅ | ⚠️ | Частично |
| Хук useDashboardData | ✅ | ❌ | Нужно создать |
| Компонент DataSettings | ✅ | ❌ | Нужно создать |
| Демо-данные | ✅ | ❌ | Нужно создать |
