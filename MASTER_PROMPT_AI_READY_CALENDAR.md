# 🧠 MASTER PROMPT: AI-Ready Calendar Module для LAD 2

## ROLE: Senior TypeScript Architect
## PROJECT: LAD 2 Calendar Module (AI-Ready Stub Architecture)
## GOAL: Реализовать модуль календаря с архитектурой "заглушка + стратегия"

---

## 📋 ОГЛАВЛЕНИЕ
1. [Архитектурный паттерн](#-архитектурный-паттерн)
2. [Интерфейсы и типы](#-интерфейсы-и-типы)
3. [RuleEngine (работает сейчас)](#-ruleengine-работает-сейчас)
4. [AIEngine (заглушка на будущее)](#-aiengine-заглушка-на-будущее)
5. [IntelligenceService (роутер)](#-intelligenceservice-роутер)
6. [Интеграция с UI](#-интеграция-с-ui)
7. [Настройки AI](#-настройки-ai)
8. [Тестирование](#-тестирование)
9. [Структура файлов](#-структура-файлов)

---

## 🧠 АРХИТЕКТУРНЫЙ ПАТТЕРН

### Strategy + Dependency Injection
```
┌─────────────────────────────────┐
│     КАЛЕНДАРЬ (LAD 2)           │
├─────────────────────────────────┤
│                                 │
│  🎯 Публичный интерфейс:        │
│  • parseInput(text)             │
│  • findBestSlots(duration)      │
│  • suggestCategories(title)     │
│                                 │
│  🔀 Роутер (переключатель):     │
│  ┌─────────────────────────┐   │
│  │ Если API ключ есть →    │   │
│  │   → AIEngine (OpenAI)   │   │
│  │ Иначе →                 │   │
│  │   → RuleEngine (Local)  │   │
│  └─────────────────────────┘   │
│                                 │
│  🧩 Реализации:                 │
│  • RuleEngine:                  │
│    - Regex-парсинг дат          │
│    - Алгоритм поиска слотов     │
│    - Правила авто-тегирования   │
│                                 │
│  • AIEngine (будущее):          │
│    - NLP через API              │
│    - Контекстные предложения    │
│    - Адаптация под привычки     │
│                                 │
└─────────────────────────────────┘
```

**Философия**: «Работает сейчас, готово к ИИ»

---

## 📐 ИНТЕРФЕЙСЫ И ТИПЫ

### 1. Базовый интерфейс ISmartEngine
```typescript
// src/core/intelligence/types.ts

type Context = 'home' | 'work';

interface ParsedEvent {
  title: string;
  date: Date;
  time?: {
    hour: number;
    minute: number;
  };
  duration?: number;
  isAllDay?: boolean;
  context: Context;
  confidence: number;
  rawText: string;
}

interface TimeSlot {
  start: Date;
  end: Date;
  durationMinutes: number;
  score: number;
  reason: string;
  isToday: boolean;
  isTomorrow: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  formattedTime: string;
}

interface SlotSearchOptions {
  durationMinutes: number;
  context: Context;
  dateRange?: {
    start: Date;
    end: Date;
  };
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  avoidDays?: number[];
  minStartHour?: number;
  maxEndHour?: number;
  bufferMinutes?: number;
  maxSlotsToReturn?: number;
  considerTravelTime?: boolean;
}

interface ISmartEngine {
  parseInput(text: string, context: Context): Promise<ParsedEvent>;
  findBestSlots(durationMinutes: number, options: SlotSearchOptions): Promise<TimeSlot[]>;
  suggestCategories(title: string): Promise<string[]>;
  isAvailable(): Promise<boolean>;
}
```

### 2. Настройки пользователя
```typescript
// src/types/settings.ts

interface UserSettings {
  // ... другие настройки
  ai: {
    enabled: boolean;
    provider: 'openai' | 'anthropic' | 'local' | 'custom';
    apiKey?: string; // Зашифрованная версия
    model?: string;
    lastTested?: Date;
    usage?: {
      monthlyRequests: number;
      monthlyCost: number;
      lastReset: Date;
    };
  };
}
```

---

## 🔧 RULEENGINE (РАБОТЕТ СЕЙЧАС)

### 1. Парсинг естественного языка
**Поддерживаемые форматы:**
- Относительные даты: "завтра", "послезавтра", "через 3 дня"
- Дни недели: "в понедельник", "в следующую пятницу"
- Конкретные даты: "15 мая", "01.06.2025"
- Время: "в 10:00", "утром", "вечером"
- Длительность: "на 1 час", "на 45 минут"

**Регулярные выражения:**
```typescript
// См. полный список в RULE_ENGINE_DATE_FORMATS.md
const DATE_PATTERNS = {
  RELATIVE: /(завтра|послезавтра|вчера|позавчера)/i,
  WEEKDAY: /(в|во)\s+(понедельник|вторник|сред[уы]|четверг|пятниц[уы]|суббот[уы]|воскресень[ея])/i,
  SPECIFIC_DATE: /(\d{1,2})\s+(январ[яю]|феврал[яю]|март[ае]|апрел[яю]|ма[яю]|июн[яю]|июл[яю]|август[ае]|сентябр[яю]|октябр[яю]|ноябр[яю]|декабр[яю])/i,
  TIME: /в\s+(\d{1,2}):(\d{2})/i,
  DURATION: /на\s+(\d+)\s+(час|часа|часов)/i,
};
```

**Алгоритм парсинга:**
1. Извлечь дату (приоритет: конкретная > день недели > относительная)
2. Извлечь время (конкретное > время суток > умолчания по контексту)
3. Извлечь длительность
4. Извлечь заголовок (весь текст кроме дат/времени)
5. Нормализовать и вернуть структурированный объект

### 2. Поиск слотов
**Алгоритм:**
1. Получить занятые слоты из БД (кэшировать на 5 минут)
2. Создать временную сетку с шагом 15 минут
3. Применить ограничения (рабочие часы, предпочтения)
4. Найти непрерывные свободные интервалы
5. Оценить слоты по критериям:
   - Близость к текущему времени (30%)
   - Соответствие предпочтительному времени дня (25%)
   - Удобство дня недели (20%)
   - Контекстные предпочтения (15%)
   - Избегание перерывов (10%)
6. Вернуть топ-3 слота с оценками

**Производительность:** < 100 мс для поиска на 7 дней

### 3. Авто-тегирование
```typescript
function suggestCategories(title: string): string[] {
  const rules = [
    { keywords: ['встреча', 'звонок', 'клиент', 'совещание'], tags: ['#работа', '#встреча'] },
    { keywords: ['дом', 'семья', 'дети', 'родители'], tags: ['#личное', '#семья'] },
    { keywords: ['спорт', 'тренировка', 'зал', 'бег'], tags: ['#здоровье', '#спорт'] },
    { keywords: ['врач', 'больница', 'анализы', 'здоровье'], tags: ['#здоровье', '#медицина'] },
    { keywords: ['ужин', 'ресторан', 'кафе', 'еда'], tags: ['#еда', '#отдых'] },
  ];
  
  const matchedTags = new Set<string>();
  const lowerTitle = title.toLowerCase();
  
  for (const rule of rules) {
    if (rule.keywords.some(keyword => lowerTitle.includes(keyword))) {
      rule.tags.forEach(tag => matchedTags.add(tag));
    }
  }
  
  return Array.from(matchedTags);
}
```

---

## 🤖 AIENGINE (ЗАГЛУШКА НА БУДУЩЕЕ)

### 1. Базовая структура
```typescript
class AIEngine implements ISmartEngine {
  constructor(private apiKey: string, private provider: string) {}
  
  async parseInput(text: string, context: Context): Promise<ParsedEvent> {
    if (!this.isAvailable()) {
      throw new NotImplementedError('AIEngine requires API key');
    }
    
    // Заглушка: делегируем на RuleEngine как fallback
    const ruleEngine = new RuleEngine();
    return ruleEngine.parseInput(text, context);
  }
  
  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && this.apiKey.length > 10;
  }
  
  // ... остальные методы с аналогичной логикой
}
```

### 2. Подготовка к реальной реализации
```typescript
// Структура для будущей реализации
interface AIProviderConfig {
  name: string;
  endpoint: string;
  headers: Record<string, string>;
  parseResponse: (response: any) => ParsedEvent;
  handleError: (error: any) => Error;
}

const PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    parseResponse: (response) => {
      // Парсинг ответа GPT в структурированный объект
      const content = response.choices[0].message.content;
      return JSON.parse(content);
    },
    handleError: (error) => new Error(`OpenAI error: ${error.message}`),
  },
  // ... другие провайдеры
};
```

---

## 🔀 INTELLIGENCESERVICE (РОУТЕР)

### 1. Динамический выбор реализации
```typescript
class IntelligenceService implements ISmartEngine {
  private ruleEngine: RuleEngine;
  private aiEngine: AIEngine | null;
  
  constructor(private settings: UserSettings) {
    this.ruleEngine = new RuleEngine();
    this.aiEngine = settings.ai.enabled && settings.ai.apiKey
      ? new AIEngine(settings.ai.apiKey, settings.ai.provider)
      : null;
  }
  
  async parseInput(text: string, context: Context): Promise<ParsedEvent> {
    try {
      // Пробуем AIEngine если доступен
      if (this.aiEngine && await this.aiEngine.isAvailable()) {
        try {
          const result = await this.aiEngine.parseInput(text, context);
          if (result.confidence > 0.7) { // Достаточно уверенный ответ
            return result;
          }
        } catch (error) {
          console.warn('AIEngine failed, falling back to RuleEngine:', error);
        }
      }
      
      // Fallback на RuleEngine
      return this.ruleEngine.parseInput(text, context);
    } catch (error) {
      throw new Error(`Failed to parse input: ${error.message}`);
    }
  }
  
  // ... аналогично для других методов
}
```

### 2. Кэширование результатов
```typescript
// Кэш для часто используемых запросов
const parseCache = new Map<string, { result: ParsedEvent, timestamp: number }>();

async function parseInputWithCache(text: string, context: Context): Promise<ParsedEvent> {
  const cacheKey = `${text}:${context}`;
  const cached = parseCache.get(cacheKey);
  
  // Кэш на 5 минут
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.result;
  }
  
  const result = await parseInput(text, context);
  parseCache.set(cacheKey, { result, timestamp: Date.now() });
  return result;
}
```

---

## 🎨 ИНТЕГРАЦИЯ С UI

### 1. Хук useSmartScheduling
```typescript
// src/features/calendar/hooks/useSmartScheduling.ts

export function useSmartScheduling() {
  const { settings } = useSettings();
  const [intelligenceService] = useState(() => new IntelligenceService(settings));
  
  const parseQuickInput = useCallback(async (text: string, context: Context) => {
    return intelligenceService.parseInput(text, context);
  }, [intelligenceService]);
  
  const findTimeSlots = useCallback(async (duration: number, options: SlotSearchOptions) => {
    return intelligenceService.findBestSlots(duration, options);
  }, [intelligenceService]);
  
  const suggestTags = useCallback(async (title: string) => {
    return intelligenceService.suggestCategories(title);
  }, [intelligenceService]);
  
  return {
    parseQuickInput,
    findTimeSlots,
    suggestTags,
    isAIEnabled: settings.ai.enabled && !!settings.ai.apiKey,
  };
}
```

### 2. Компонент QuickAddInput
```tsx
// src/features/calendar/components/QuickAddInput.tsx

export function QuickAddInput() {
  const [input, setInput] = useState('');
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null);
  const { parseQuickInput } = useSmartScheduling();
  
  const handleInputChange = useDebounce(async (text: string) => {
    if (text.length < 3) return;
    
    try {
      const result = await parseQuickInput(text, 'work');
      setParsedEvent(result);
    } catch (error) {
      console.error('Failed to parse input:', error);
    }
  }, 300);
  
  return (
    <div className="space-y-2">
      <Input
        placeholder="Добавить событие: 'Встреча с Олегом завтра в 15:00'"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          handleInputChange(e.target.value);
        }}
      />
      
      {parsedEvent && (
        <ParsedEventPreview event={parsedEvent} />
      )}
    </div>
  );
}
```

### 3. Компонент FindTimeButton
```tsx
// src/features/calendar/components/FindTimeButton.tsx

export function FindTimeButton({ duration, context }: { duration: number, context: Context }) {
  const [isFinding, setIsFinding] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const { findTimeSlots } = useSmartScheduling();
  
  const handleFindTime = async () => {
    setIsFinding(true);
    try {
      const foundSlots = await findTimeSlots(duration, {
        durationMinutes: duration,
        context,
        maxSlotsToReturn: 3,
      });
      setSlots(foundSlots);
    } finally {
      setIsFinding(false);
    }
  };
  
  return (
    <div>
      <Button onClick={handleFindTime} isLoading={isFinding}>
        <Clock className="mr-2 h-4 w-4" />
        Найти время
      </Button>
      
      {slots.length > 0 && (
        <TimeSlotList slots={slots} />
      )}
    </div>
  );
}
```

---

## ⚙️ НАСТРОЙКИ AI

### 1. Компонент AIIntegrationSettings
```tsx
// src/settings/integrations/AIIntegrationSettings.tsx

export function AIIntegrationSettings() {
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>();
  
  const testConnection = async () => {
    setIsTesting(true);
    try {
      const result = await testAIConnection(settings.ai);
      setConnectionStatus(result);
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-интеграции для календаря</CardTitle>
        <CardDescription>
          Используйте ИИ для умного планирования
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.ai.enabled}
              onCheckedChange={(checked) => 
                updateSettings({ ai: { ...settings.ai, enabled: checked } })
              }
            />
            <Label>Включить AI-функции</Label>
          </div>
          
          {settings.ai.enabled && (
            <>
              <div className="space-y-2">
                <Label>Провайдер</Label>
                <Select
                  value={settings.ai.provider}
                  onValueChange={(value) => 
                    updateSettings({ ai: { ...settings.ai, provider: value } })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="local">Локальная модель</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>API ключ</Label>
                <div className="flex space-x-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={settings.ai.apiKey || ""}
                    onChange={(e) => 
                      updateSettings({ ai: { ...settings.ai, apiKey: e.target.value } })
                    }
                    placeholder="sk-... (сохраняется локально)"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ключ хранится локально и шифруется
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={testConnection}
                  disabled={!settings.ai.apiKey}
                  isLoading={isTesting}
                >
                  <Wifi className="mr-2 h-4 w-4" />
                  Проверить соединение
                </Button>
                
                <Button onClick={() => updateSettings(settings)}>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </Button>
              </div>
            </>
          )}
        </div>
        
        {connectionStatus && (
          <ConnectionStatusPanel status={connectionStatus} />
        )}
      </CardContent>
      
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Без API ключа календарь работает в режиме правил (RuleEngine) — бесплатно и офлайн.
        </p>
      </CardFooter>
    </Card>
  );
}
```

### 2. Безопасное хранение ключей
```typescript
// src/lib/encryption.ts

export async function encryptApiKey(key: string, userId: string): Promise<string> {
  // Используем Web Crypto API для шифрования
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  
  // Генерируем ключ из userId
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("lad2-ai-encryption"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    data
  );
  
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 1. Юнит-тесты для RuleEngine
```typescript
// tests/unit/rule-engine.test.ts

describe('RuleEngine', () => {
  let engine: RuleEngine;
  
  beforeEach(() => {
    engine = new RuleEngine();
  });
  
  describe('parseInput', () => {
    test('парсит относительные даты', async () => {
      const result = await engine.parseInput('Встреча завтра в 10:00', 'work');
      expect(result.date).toBeTomorrow();
      expect(result.time?.hour).toBe(10);
      expect(result.time?.minute).toBe(0);
    });
    
    test('парсит дни недели', async () => {
      const result = await engine.parseInput('Совещание в пятницу', 'work');
      expect(result.date.getDay()).toBe(5); // Пятница
    });
    
    test('парсит конкретные даты', async () => {
      const result = await engine.parseInput('День рождения 15 мая', 'home');
      expect(result.date.getMonth()).toBe(4); // Май (0-indexed)
      expect(result.date.getDate()).toBe(15);
    });
    
    test('парсит время суток', async () => {
      const result = await engine.parseInput('Тренировка утром', 'home');
      expect(result.time?.hour).toBe(8); // Утро для дома
    });
    
    test('парсит длительность', async () => {
      const result = await engine.parseInput('Звонок на 30 минут', 'work');
      expect(result.duration).toBe(30);
    });
  });
  
  describe('findBestSlots', () => {
    test('находит свободные слоты', async () => {
      const slots = await engine.findBestSlots(60, {
        durationMinutes: 60,
        context: 'work',
        dateRange: {
          start: new Date(),
          end: addDays(new Date(), 3),
        },
      });
      
      expect(slots).toHaveLength(3);
      expect(slots[0].score).toBeGreaterThan(0);
      expect(slots[0].durationMinutes).toBe(60);
    });
    
    test('учитывает рабочие часы', async () => {
      const slots = await engine.findBestSlots(120, {
        durationMinutes: 120,
        context: 'work',
      });
      
      // Проверяем, что слоты в рабочих часах (9-18)
      slots.forEach(slot => {
        const hour = slot.start.getHours();
        expect(hour).toBeGreaterThanOrEqual(9);
        expect(hour).toBeLessThan(18);
      });
    });
  });
  
  describe('suggestCategories', () => {
    test('предлагает теги на основе ключевых слов', async () => {
      const tags = await engine.suggestCategories('Встреча с клиентом по проекту');
      expect(tags).toContain('#работа');
      expect(tags).toContain('#встреча');
    });
    
    test('предлагает теги для личных дел', async () => {
      const tags = await engine.suggestCategories('Ужин с семьей в ресторане');
      expect(tags).toContain('#личное');
      expect(tags).toContain('#семья');
      expect(tags).toContain('#еда');
    });
  });
});
```

### 2. Интеграционные тесты
```typescript
// tests/integration/intelligence-service.test.ts

describe('IntelligenceService', () => {
  test('использует RuleEngine когда AI отключен', async () => {
    const settings: UserSettings = {
      ai: { enabled: false, provider: 'openai' },
    };
    
    const service = new IntelligenceService(settings);
    const result = await service.parseInput('Встреча завтра', 'work');
    
    expect(result.confidence).toBeGreaterThan(0);
    // Проверяем, что это результат RuleEngine
  });
  
  test('пытается использовать AIEngine когда включен', async () => {
    const settings: UserSettings = {
      ai: { 
        enabled: true, 
        provider: 'openai',
        apiKey: 'test-key',
      },
    };
    
    const service = new IntelligenceService(settings);
    // Мокаем AIEngine чтобы он падал
    const mockAIEngine = { 
      parseInput: jest.fn().mockRejectedValue(new Error('API error')),
      isAvailable: jest.fn().mockResolvedValue(true),
    };
    
    // Инжектим мок через рефлексию или dependency injection
    const result = await service.parseInput('Встреча завтра', 'work');
    
    // Должен упасть на RuleEngine
    expect(result.confidence).toBeGreaterThan(0);
    expect(mockAIEngine.parseInput).toHaveBeenCalled();
  });
});
```

### 3. Тесты производительности
```typescript
// tests/performance/rule-engine.perf.test.ts

describe('RuleEngine performance', () => {
  test('парсинг выполняется < 50ms', async () => {
    const engine = new RuleEngine();
    const start = performance.now();
    
    await engine.parseInput('Совещание в следующую пятницу утром на 2 часа', 'work');
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });
  
  test('поиск слотов на 7 дней выполняется < 100ms', async () => {
    const engine = new RuleEngine();
    const start = performance.now();
    
    await engine.findBestSlots(60, {
      durationMinutes: 60,
      context: 'work',
      dateRange: {
        start: new Date(),
        end: addDays(new Date(), 7),
      },
    });
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });
});
```

---

## 📁 СТРУКТУРА ФАЙЛОВ

```
src/
├── core/
│   └── intelligence/
│       ├── types.ts                    # ISmartEngine, ParsedEvent, TimeSlot
│       ├── rule-engine.ts              # Реализация на правилах
│       ├── ai-engine.ts                # Заглушка для AI
│       ├── intelligence-service.ts     # Роутер
│       └── index.ts                    # Экспорт
├── features/
│   └── calendar/
│       ├── components/
│       │   ├── CalendarGrid.tsx
│       │   ├── QuickAddInput.tsx       # Поле с парсингом
│       │   ├── FindTimeButton.tsx      # Кнопка поиска слота
│       │   ├── ParsedEventPreview.tsx  # Предпросмотр распарсенного
│       │   └── TimeSlotList.tsx        # Список найденных слотов
│       ├── hooks/
│       │   └── useSmartScheduling.ts   # Хук для умного планирования
│       └── utils/
│           ├── date-parser.ts          # Вспомогательные функции
│           ├── slot-finder.ts          # Алгоритм поиска слотов
│           └── category-suggester.ts   # Авто-тегирование
├── settings/
│   └── integrations/
│       ├── AIIntegrationSettings.tsx   # Страница настроек AI
│       └── components/
│           ├── ConnectionStatusPanel.tsx
│           └── ApiKeyInput.tsx
├── lib/
│   ├── encryption.ts                   # Шифрование API ключей
│   └── ai-providers/                   # Конфигурации провайдеров
│       ├── openai.ts
│       ├── anthropic.ts
│       └── local.ts
└── types/
    ├── settings.ts                     # Расширение UserSettings
    └── ai.ts                           # Типы для AI
```

---

## 🚀 ПЛАН РАБОТЫ (ИТЕРАТИВНО)

### Фаза 1: Базовые интерфейсы и RuleEngine (2-3 дня)
1. Создать `types.ts` с интерфейсами
2. Реализовать `RuleEngine.parseInput()` с поддержкой 10+ форматов
3. Реализовать `RuleEngine.findBestSlots()` с базовым алгоритмом
4. Реализовать `RuleEngine.suggestCategories()` с правилами
5. Написать юнит-тесты для RuleEngine

### Фаза 2: Интеграция и UI (2-3 дня)
1. Создать `IntelligenceService` (роутер)
2. Реализовать хук `useSmartScheduling`
3. Создать компонент `QuickAddInput`
4. Создать компонент `FindTimeButton`
5. Интегрировать в существующий календарь

### Фаза 3: Настройки и AIEngine (1-2 дня)
1. Создать `AIIntegrationSettings` компонент
2. Реализовать `AIEngine` (заглушку)
3. Добавить шифрование API ключей
4. Создать страницу настроек

### Фаза 4: Тестирование и оптимизация (1 день)
1. Написать интеграционные тесты
2. Провести тесты производительности
3. Оптимизировать кэширование
4. Документировать API

---

## ✅ КРИТЕРИИ ПРИЁМКИ

### Работает без AI:
- [ ] RuleEngine парсит 10+ форматов дат/времени
- [ ] Поиск слотов находит свободные окна за < 100ms
- [ ] Авто-тегирование работает по ключевым словам
- [ ] Все операции работают офлайн

### Готово к AI:
- [ ] Интерфейс `ISmartEngine` стабилен
- [ ] `IntelligenceService` динамически выбирает реализацию
- [ ] `AIEngine` готов к подключению реальных провайдеров
- [ ] API ключи хранятся безопасно

### Пользовательский опыт:
- [ ] Поле быстрого создания показывает распарсенные данные
- [ ] Кнопка "Найти время" предлагает 3 варианта
- [ ] Настройки AI понятны и безопасны
- [ ] Плавная деградация при отключении AI

### Качество кода:
- [ ] 100% TypeScript с strict mode
- [ ] 80%+ покрытие тестами для RuleEngine
- [ ] Нет хардкода, всё конфигурируется
- [ ] Чистая архитектура с dependency injection

---

## 🎯 СТАРТ РАБОТЫ

**Начни с:** `src/core/intelligence/types.ts` и `src/core/intelligence/rule-engine.ts`

**Первые тестовые кейсы:**
1. "Встреча завтра в 10:00" → правильная дата и время
2. "Совещание в пятницу утром" → ближайшая пятница, 9:00
3. Поиск слота на 1 час в рабочие часы

**Вопросы для уточнения:**
- Нужны ли дополнительные форматы дат?
- Какие параметры поиска слотов критичны?
- Как обрабатывать конфликты времени?

**Готов начать?** Создай `types.ts` и пришли на review. 🚀