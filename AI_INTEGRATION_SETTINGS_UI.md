# 🎨 UI-макет: Настройки AI-интеграций

## 🎯 Цель
Создать интуитивный интерфейс для подключения и настройки AI-провайдеров в календаре LAD 2.

## 📱 Макет страницы настроек

### Общий вид:
```
┌─────────────────────────────────────────────────────┐
│  ⚙️ Настройки > Интеграции                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🧠 AI-интеграции для календаря                     │
│  Используйте ИИ для умного планирования             │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  [x] Включить AI-функции                    │   │
│  │                                             │   │
│  │  Провайдер: [▼ OpenAI ▾]                    │   │
│  │                                             │   │
│  │  API ключ: [*******************] [👁️]       │   │
│  │  (сохраняется локально, зашифрованно)       │   │
│  │                                             │   │
│  │  Модель: [▼ GPT-4o-mini ▾]                  │   │
│  │  (быстрая и недорогая)                      │   │
│  │                                             │   │
│  │  [🔗 Проверить соединение]                  │   │
│  │  [💾 Сохранить настройки]                   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  📊 Статус:                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  ✅ AI-функции доступны                      │   │
│  │  • Парсинг естественного языка              │   │
│  │  • Умный поиск времени                      │   │
│  │  • Авто-тегирование                         │   │
│  │                                             │   │
│  │  ⚡ Использовано: 124 запроса за месяц      │   │
│  │  💰 Примерная стоимость: $0.12              │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ℹ️ Без API ключа календарь работает в режиме      │
│     правил (RuleEngine) — бесплатно и офлайн.      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🧩 Компоненты

### 1. Переключатель "Включить AI-функции"
```tsx
<Switch
  checked={settings.ai.enabled}
  onCheckedChange={(checked) => updateSettings({ ai: { ...settings.ai, enabled: checked } })}
  aria-label="Включить AI-функции"
/>
```

### 2. Выбор провайдера
```tsx
<Select
  value={settings.ai.provider}
  onValueChange={(value) => updateSettings({ ai: { ...settings.ai, provider: value } })}
  disabled={!settings.ai.enabled}
>
  <SelectTrigger>
    <SelectValue placeholder="Выберите провайдера" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
    <SelectItem value="local">Локальная модель</SelectItem>
    <SelectItem value="custom">Кастомный эндпоинт</SelectItem>
  </SelectContent>
</Select>
```

### 3. Поле для API ключа
```tsx
<Input
  type={showApiKey ? "text" : "password"}
  value={settings.ai.apiKey || ""}
  onChange={(e) => updateSettings({ ai: { ...settings.ai, apiKey: e.target.value } })}
  placeholder="sk-... (сохраняется локально)"
  disabled={!settings.ai.enabled}
  rightIcon={
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setShowApiKey(!showApiKey)}
      aria-label={showApiKey ? "Скрыть ключ" : "Показать ключ"}
    >
      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  }
/>
```

### 4. Кнопка "Проверить соединение"
```tsx
<Button
  variant="outline"
  onClick={testConnection}
  disabled={!settings.ai.enabled || !settings.ai.apiKey}
  isLoading={isTesting}
>
  {isTesting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Проверка...
    </>
  ) : (
    <>
      <Wifi className="mr-2 h-4 w-4" />
      Проверить соединение
    </>
  )}
</Button>
```

### 5. Статус-панель
```tsx
<Card>
  <CardHeader>
    <CardTitle>Статус AI-интеграции</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="flex items-center">
      {isConnected ? (
        <CheckCircle className="h-5 w-5 text-success mr-2" />
      ) : (
        <XCircle className="h-5 w-5 text-error mr-2" />
      )}
      <span>
        {isConnected ? "AI-функции доступны" : "AI-функции отключены"}
      </span>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center">
        <Check className="h-4 w-4 text-success mr-2" />
        <span className="text-sm">Парсинг естественного языка</span>
      </div>
      <div className="flex items-center">
        <Check className="h-4 w-4 text-success mr-2" />
        <span className="text-sm">Умный поиск времени</span>
      </div>
      <div className="flex items-center">
        <Check className="h-4 w-4 text-success mr-2" />
        <span className="text-sm">Авто-тегирование событий</span>
      </div>
    </div>
    
    <Separator />
    
    <div className="text-sm">
      <div className="flex justify-between">
        <span>Использовано за месяц:</span>
        <span className="font-medium">124 запроса</span>
      </div>
      <div className="flex justify-between mt-1">
        <span>Примерная стоимость:</span>
        <span className="font-medium">$0.12</span>
      </div>
    </div>
  </CardContent>
</Card>
```

## 🎨 Состояния интерфейса

### Состояние 1: AI отключен
```
[ ] Включить AI-функции
────────────────────
Все поля disabled
Статус: "AI-функции отключены" (серый)
```

### Состояние 2: AI включен, но нет ключа
```
[✓] Включить AI-функции
────────────────────
Провайдер: доступен для выбора
API ключ: пустое поле, placeholder "Введите API ключ"
Статус: "Требуется API ключ" (желтый)
Кнопка "Проверить соединение": disabled
```

### Состояние 3: AI включен, ключ есть, проверка
```
[✓] Включить AI-функции
────────────────────
Провайдер: OpenAI
API ключ: sk-...*** (скрыто)
Статус: "Проверка соединения..." (синий, спиннер)
Кнопка "Проверить соединение": loading
```

### Состояние 4: AI включен, подключено
```
[✓] Включить AI-функции
────────────────────
Провайдер: OpenAI
API ключ: sk-...*** (скрыто)
Статус: "✅ Подключено к OpenAI" (зеленый)
Кнопка "Проверить соединение": доступна
Отображаются статистика и возможности
```

### Состояние 5: Ошибка подключения
```
[✓] Включить AI-функции
────────────────────
Провайдер: OpenAI
API ключ: sk-...*** (скрыто)
Статус: "❌ Ошибка подключения: неверный ключ" (красный)
Кнопка "Проверить соединение": доступна
Показывается ошибка с пояснением
```

## 🔧 Логика работы

### 1. Тестирование соединения
```typescript
async function testConnection() {
  setIsTesting(true);
  
  try {
    // 1. Проверяем базовую доступность API
    const testResult = await aiService.testConnection(settings.ai);
    
    if (testResult.success) {
      // 2. Делаем тестовый запрос на парсинг
      const parseTest = await aiService.parseInput(
        "Встреча завтра в 15:00",
        "work"
      );
      
      setConnectionStatus({
        connected: true,
        provider: settings.ai.provider,
        capabilities: testResult.capabilities,
        latency: testResult.latency,
      });
      
      showToast("✅ Подключение успешно", "success");
    } else {
      throw new Error(testResult.error || "Неизвестная ошибка");
    }
  } catch (error) {
    setConnectionStatus({
      connected: false,
      error: error.message,
    });
    
    showToast(`❌ Ошибка подключения: ${error.message}`, "error");
  } finally {
    setIsTesting(false);
  }
}
```

### 2. Безопасное хранение ключа
```typescript
// Шифрование ключа перед сохранением
function encryptApiKey(key: string): string {
  // Используем Web Crypto API для шифрования
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  
  // Генерируем salt из userId
  const salt = getUserIdSalt();
  
  // PBKDF2 для получения ключа шифрования
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(salt),
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
  
  // Шифруем
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    data
  );
  
  // Сохраняем iv + encrypted
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
}

// Дешифровка при использовании
async function decryptApiKey(encrypted: string): Promise<string> {
  // ... обратная логика
  return decryptedKey;
}
```

### 3. Управление состоянием
```typescript
interface AIIntegrationState {
  // Настройки пользователя
  settings: {
    enabled: boolean;
    provider: AIProvider;
    apiKey?: string; // Зашифрованная версия
    model?: string;
  };
  
  // Текущее состояние
  connection: {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    lastTested?: Date;
    error?: string;
    capabilities?: string[];
    latency?: number;
  };
  
  // Статистика использования
  usage: {
    monthlyRequests: number;
    monthlyCost: number;
    lastReset: Date;
    requestsByDay: Record<string, number>;
  };
  
  // Кэш для производительности
  cache: {
    testResults: Map<string, TestResult>;
    modelCapabilities: Map<string, string[]>;
  };
}
```

## 📱 Адаптивный дизайн

### Мобильная версия:
```
┌────────────────────┐
│ ⚙️ Интеграции      │
├────────────────────┤
│ [ ] AI-функции     │
│                    │
│ Провайдер:         │
│ [OpenAI ▼]         │
│                    │
│ API ключ:          │
│ [•••••••••] [👁️]  │
│                    │
│ [🔗 Проверить]     │
│ [💾 Сохранить]     │
│                    │
│ 📊 Статус:         │
│ ✅ Доступно        │
│ • Парсинг текста   │
│ • Поиск времени    │
│                    │
│ ℹ️ Без ключа —     │
│   бесплатный режим │
└────────────────────┘
```

### Планшетная версия:
- Две колонки: настройки слева, статус справа
- Увеличенные поля ввода
- Иконки рядом с текстом

### Десктопная версия:
- Три колонки: настройки, статус, справка
- Дополнительная информация: документация, примеры использования
- График использования API

## 🎯 Пользовательские сценарии

### Сценарий 1: Первое подключение
1. Пользователь заходит в "Настройки > Интеграции"
2. Видит переключатель "Включить AI-функции" (выключен)
3. Включает переключатель
4. Выбирает OpenAI из выпадающего списка
5. Вставляет API ключ из буфера обмена
6. Нажимает "Проверить соединение"
7. Видит ✅ "Подключено" и список возможностей
8. Нажимает "Сохранить настройки"

### Сценарий 2: Проверка истёкшего ключа
1. Пользователь пытается добавить событие через AI
2. Получает ошибку "Неверный API ключ"
3. Переходит в настройки интеграций
4. Видит статус "❌ Ошибка подключения"
5. Обновляет API ключ
6. Нажимает "Проверить соединение"
7. После успеха продолжает работу

### Сценарий 3: Отключение AI
1. Пользователь хочет сэкономить на API вызовах
2. Переходит в настройки интеграций
3. Выключает переключатель "Включить AI-функции"
4. Все поля становятся disabled
5. Статус меняется на "AI-функции отключены"
6. Календарь автоматически переключается на RuleEngine

## 🔒 Безопасность

### Меры защиты:
1. **Шифрование ключей**: API ключи шифруются перед сохранением
2. **Локальное хранение**: Ключи не отправляются на наши серверы
3. **Маскирование в UI**: Ключи показываются как "sk-...***"
4. **Автоматическое скрытие**: Ключ скрывается через 30 секунд показа
5. **Очистка при logout**: Ключи удаляются при выходе из системы

### Предупреждения:
```tsx
<Alert variant="warning">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Безопасность API ключей</AlertTitle>
  <AlertDescription>
    Ваш API ключ хранится только на этом устройстве и шифруется.
    Никогда не делитесь им с другими. При утере ключа отзовите его
    в панели управления провайдера.
  </AlertDescription>
</Alert>
```

## 🧪 Тестирование UI

### Тест 1: Валидация ключа
```typescript
// Проверяем формат OpenAI ключа
function validateOpenAIKey(key: string): boolean {
  return key.startsWith('sk-') && key.length > 20;
}

// Проверяем формат Anthropic ключа
function validateAnthropicKey(key: string): boolean {
  return key.startsWith('sk-ant-') && key.length > 30;
}
```

### Тест 2: Состояния загрузки
```typescript
// Симуляция медленного соединения
function simulateSlowConnection() {
  setIsTesting(true);
  setTimeout(() => {
    setConnectionStatus({ connected: true });
    setIsTesting(false);
  }, 3000); // 3 секунды задержки
}
```

### Тест 3: Ошибки сети
```typescript
// Симуляция различных ошибок
const errorScenarios = [
  { error: "Неверный API ключ", code: "invalid_key" },
  { error: "Достигнут лимит запросов", code: "rate_limit" },
  { error: "Сеть недоступна", code: "network_error" },
  { error: "Провайдер недоступен", code: "provider_down" },
];
```

Этот UI обеспечивает плавный опыт подключения AI-интеграций с акцентом на безопасность и понятность для пользователя.