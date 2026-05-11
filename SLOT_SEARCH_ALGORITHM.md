# ⏰ Алгоритм поиска слотов для RuleEngine.findBestSlots()

## 🎯 Цель
Найти лучшие свободные временные слоты для события заданной длительности, учитывая:
- Занятое расписание из БД
- Рабочие/личные часы
- Буферы между событиями
- Предпочтения пользователя

## 📊 Входные данные

### SlotSearchOptions:
```typescript
interface SlotSearchOptions {
  // Обязательные параметры
  durationMinutes: number;      // Длительность события (30, 60, 120 и т.д.)
  context: 'work' | 'home';     // Контекст поиска
  
  // Ограничения по времени
  dateRange?: {                 // Диапазон дат для поиска
    start: Date;               // Начало поиска (по умолчанию: сейчас)
    end: Date;                 // Конец поиска (по умолчанию: +7 дней)
  };
  
  // Предпочтения
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  avoidDays?: number[];        // Дни недели для исключения (0=воскресенье)
  minStartHour?: number;       // Минимальный час начала (0-23)
  maxEndHour?: number;         // Максимальный час окончания (0-23)
  
  // Алгоритмические параметры
  bufferMinutes?: number;      // Буфер между событиями (по умолчанию: 15)
  maxSlotsToReturn?: number;   // Максимальное количество слотов (по умолчанию: 3)
  considerTravelTime?: boolean; // Учитывать время на дорогу
}
```

### TimeSlot (результат):
```typescript
interface TimeSlot {
  start: Date;                 // Начало слота
  end: Date;                   // Конец слота
  durationMinutes: number;     // Длительность слота
  score: number;               // Оценка качества (0-100)
  reason: string;              // Почему этот слот выбран
  
  // Метаданные для UI
  isToday: boolean;
  isTomorrow: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  formattedTime: string;       // "Завтра, 10:00-11:00"
}
```

## 🔧 Алгоритм поиска (псевдокод)

### Шаг 1: Подготовка данных
```
function findBestSlots(duration, options):
  // 1. Получить занятые слоты из БД
  busySlots = getBusySlotsFromDB(options.dateRange)
  
  // 2. Определить рабочие часы
  workingHours = getWorkingHours(options.context)
  
  // 3. Создать временную сетку
  timeGrid = createTimeGrid(
    start: options.dateRange?.start || now(),
    end: options.dateRange?.end || now() + 7 days,
    resolution: 15 minutes  // Шаг сетки
  )
```

### Шаг 2: Фильтрация доступных окон
```
function findAvailableWindows(timeGrid, busySlots, workingHours, options):
  availableWindows = []
  
  for each day in timeGrid.days:
    // Применить рабочие часы
    daySlots = filterByWorkingHours(day.slots, workingHours)
    
    // Применить пользовательские ограничения
    if options.minStartHour:
      daySlots = filterByMinHour(daySlots, options.minStartHour)
    if options.maxEndHour:
      daySlots = filterByMaxHour(daySlots, options.maxEndHour)
    if options.avoidDays includes day.weekday:
      continue  // Пропустить нежелательные дни
    
    // Найти непрерывные свободные интервалы
    freeIntervals = findFreeIntervals(daySlots, busySlots, options.bufferMinutes)
    
    // Отфильтровать по минимальной длительности
    for each interval in freeIntervals:
      if interval.duration >= options.durationMinutes:
        availableWindows.append({
          start: interval.start,
          end: interval.start + duration,
          day: day
        })
  
  return availableWindows
```

### Шаг 3: Оценка и ранжирование слотов
```
function scoreAndRankSlots(windows, options):
  scoredSlots = []
  
  for each window in windows:
    score = calculateSlotScore(window, options)
    
    scoredSlots.append({
      ...window,
      score: score,
      reason: getScoreReason(score, window)
    })
  
  // Сортировка по убыванию оценки
  scoredSlots.sort((a, b) => b.score - a.score)
  
  // Возврат топ-N слотов
  return scoredSlots.slice(0, options.maxSlotsToReturn || 3)
```

### Шаг 4: Функция оценки (calculateSlotScore)
```
function calculateSlotScore(slot, options):
  totalScore = 0
  
  // 1. Близость к текущему времени (30%)
  recencyScore = calculateRecencyScore(slot.start)
  totalScore += recencyScore * 0.3
  
  // 2. Соответствие предпочтительному времени дня (25%)
  if options.preferredTimeOfDay:
    timeOfDayScore = calculateTimeOfDayScore(slot, options.preferredTimeOfDay)
    totalScore += timeOfDayScore * 0.25
  
  // 3. Удобство дня недели (20%)
  weekdayScore = calculateWeekdayScore(slot.start)
  totalScore += weekdayScore * 0.2
  
  // 4. Контекстные предпочтения (15%)
  contextScore = calculateContextScore(slot, options.context)
  totalScore += contextScore * 0.15
  
  // 5. Избегание перерывов (10%)
  continuityScore = calculateContinuityScore(slot, busySlots)
  totalScore += continuityScore * 0.1
  
  return Math.min(100, Math.round(totalScore))
```

## 📈 Подробности функций оценки

### 1. Близость к текущему времени
```typescript
function calculateRecencyScore(slotStart: Date): number {
  const now = new Date();
  const hoursDiff = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff < 0) return 0; // Прошлое время
  if (hoursDiff < 24) return 100; // В течение суток
  if (hoursDiff < 48) return 80;  // Завтра
  if (hoursDiff < 72) return 60;  // Послезавтра
  if (hoursDiff < 168) return 40; // В течение недели
  return 20; // Далее недели
}
```

### 2. Соответствие времени дня
```typescript
function calculateTimeOfDayScore(slot: TimeSlot, preferred: string): number {
  const hour = slot.start.getHours();
  let timeOfDay: string;
  
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  return timeOfDay === preferred ? 100 : 0;
}
```

### 3. Удобство дня недели
```typescript
function calculateWeekdayScore(date: Date): number {
  const weekday = date.getDay(); // 0=воскресенье, 1=понедельник...
  
  // Предпочтения по умолчанию (можно настраивать)
  const preferences = {
    0: 30, // Воскресенье - низкий приоритет
    1: 90, // Понедельник - высокий (начало недели)
    2: 80, // Вторник
    3: 85, // Среда
    4: 90, // Четверг
    5: 70, // Пятница (вечером могут быть планы)
    6: 40  // Суббота
  };
  
  return preferences[weekday] || 50;
}
```

### 4. Контекстные предпочтения
```typescript
function calculateContextScore(slot: TimeSlot, context: string): number {
  const hour = slot.start.getHours();
  
  if (context === 'work') {
    // Рабочие часы: 9:00-18:00
    if (hour >= 9 && hour < 18) return 100;
    if (hour >= 8 && hour < 20) return 60;
    return 20;
  } else { // 'home'
    // Личное время: 18:00-22:00
    if (hour >= 18 && hour < 22) return 100;
    if (hour >= 16 && hour < 23) return 70;
    return 30;
  }
}
```

### 5. Избегание перерывов
```typescript
function calculateContinuityScore(slot: TimeSlot, busySlots: BusySlot[]): number {
  // Проверяем, не создаст ли слот слишком короткий перерыв
  const adjacentEvents = findAdjacentEvents(slot, busySlots);
  
  if (adjacentEvents.before && adjacentEvents.after) {
    const gapBefore = slot.start - adjacentEvents.before.end;
    const gapAfter = adjacentEvents.after.start - slot.end;
    
    if (gapBefore < 30 * 60 * 1000 || gapAfter < 30 * 60 * 1000) {
      return 30; // Слишком плотное расписание
    }
  }
  
  return 100;
}
```

## 🚀 Оптимизации производительности

### 1. Кэширование занятых слотов
```typescript
// Кэш на 5 минут
const busySlotsCache = new Map<string, { data: BusySlot[], timestamp: number }>();

function getBusySlotsCached(dateRange: DateRange): BusySlot[] {
  const cacheKey = `${dateRange.start}-${dateRange.end}`;
  const cached = busySlotsCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  
  const data = getBusySlotsFromDB(dateRange);
  busySlotsCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Поиск с ограничением глубины
```typescript
// Ищем только в разумных пределах
const MAX_SEARCH_DAYS = 14; // Не ищем дальше 2 недель
const TIME_RESOLUTION = 15; // Минут

// Если не нашли слоты в первые 3 дня, расширяем поиск
function findSlotsWithFallback(duration, options) {
  let slots = findBestSlots(duration, { ...options, dateRange: 3 days });
  
  if (slots.length === 0) {
    slots = findBestSlots(duration, { ...options, dateRange: 7 days });
  }
  
  if (slots.length === 0) {
    slots = findBestSlots(duration, { ...options, dateRange: 14 days });
  }
  
  return slots;
}
```

### 3. Параллельная обработка дней
```typescript
// Обрабатываем дни параллельно (если поддерживается)
async function processDaysParallel(days: Day[], processor: Function) {
  if (supportsParallelism) {
    return Promise.all(days.map(day => processor(day)));
  } else {
    const results = [];
    for (const day of days) {
      results.push(await processor(day));
    }
    return results;
  }
}
```

## 📊 Оценка сложности

### Временная сложность:
- **O(n * m)** где n = количество дней, m = количество слотов в день
- При сетке 15 минут и поиске на 7 дней: 7 * 96 = 672 слота
- Каждый слот проверяется на пересечение с занятыми событиями: O(k) где k = количество занятых событий
- **Итого**: O(n * m * k) ≈ 672 * 50 = 33,600 операций (быстро)

### Память:
- Хранение временной сетки: ~672 записей * 100 байт = 67 КБ
- Кэш занятых слотов: ~50 событий * 500 байт = 25 КБ
- **Итого**: < 100 КБ

## 🎯 Критерии качества

### Точность:
- Находит реально свободные слоты (проверка пересечений)
- Учитывает буферы между событиями
- Не предлагает невозможные времена (ночью для рабочих встреч)

### Скорость:
- Поиск на 7 дней выполняется < 100 мс
- Кэширование ускоряет повторные запросы
- Инкрементальный поиск (сначала ближайшие дни)

### Полезность:
- Возвращает несколько вариантов (не один)
- Объясняет, почему слот выбран (score, reason)
- Учитывает контекст (работа/дом)

## 🧪 Тестовые сценарии

### Сценарий 1: Рабочая встреча на 1 час
```
findBestSlots(60, { context: 'work' })

Ожидаемый результат:
1. Завтра, 10:00-11:00 (score: 95) - идеальное рабочее время
2. Сегодня, 14:00-15:00 (score: 85) - сегодня, но позже
3. Четверг, 9:00-10:00 (score: 80) - позже, но утро
```

### Сценарий 2: Личное дело на 2 часа вечером
```
findBestSlots(120, { 
  context: 'home',
  preferredTimeOfDay: 'evening'
})

Ожидаемый результат:
1. Сегодня, 19:00-21:00 (score: 100) - сегодня вечером
2. Завтра, 18:00-20:00 (score: 90) - завтра вечером
3. Суббота, 17:00-19:00 (score: 70) - выходной, но раньше
```

### Сценарий 3: Срочное дело на 30 минут
```
findBestSlots(30, { 
  context: 'work',
  dateRange: { start: now, end: now + 24 hours }
})

Ожидаемый результат:
1. Сегодня, 15:30-16:00 (score: 98) - ближайший свободный слот
2. Сегодня, 17:00-17:30 (score: 85) - позже сегодня
3. Завтра, 9:00-9:30 (score: 70) - утро завтра
```

Этот алгоритм обеспечивает интеллектуальный поиск слотов без использования AI, с хорошей производительностью и качеством результатов.