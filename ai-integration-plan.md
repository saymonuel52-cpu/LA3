# План реализации AI интеграции для LAD 2

## 1. Архитектура AI слоя

### 1.1. Компоненты системы
```
AI Service Layer
├── AIService (фасад)
├── ActionDispatcher
├── PromptEngine
├── ModelRouter
├── LocalLLMAdapter
├── CloudLLMAdapter
└── ResultProcessor
```

### 1.2. Поток данных
```
UI Компонент → AIService → ModelRouter → LLM (Local/Cloud) → ResultProcessor → UI
```

## 2. Реализация сервисов

### 2.1. Core AI Service (`src/core/ai-service/`)
```typescript
// AIService.ts
class AIService {
  private modelRouter: ModelRouter;
  private actionDispatcher: ActionDispatcher;
  private promptEngine: PromptEngine;
  
  async executeAction(
    actionId: string,
    input: Record<string, any>,
    context: AIExecutionContext
  ): Promise<AIResult> {
    // 1. Валидация действия
    // 2. Построение промпта
    // 3. Выбор модели (локальная/облачная)
    // 4. Выполнение запроса
    // 5. Обработка результата
    // 6. Логирование
  }
  
  async streamAction(
    actionId: string,
    input: Record<string, any>,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    // Стриминг ответов для лучшего UX
  }
}
```

### 2.2. Model Router
```typescript
class ModelRouter {
  async route(
    action: AIAction,
    context: AIExecutionContext
  ): Promise<LLMProvider> {
    // Правила выбора модели:
    // 1. Если действие требует конфиденциальности → LocalLLM
    // 2. Если нужна мощная модель → CloudLLM (OpenAI/Claude)
    // 3. Если offline → только LocalLLM
    // 4. Балансировка по стоимости/скорости
  }
}
```

### 2.3. Local LLM Adapter (WebLLM)
```typescript
class LocalLLMAdapter {
  private model: WebLLMModel;
  
  async initialize(): Promise<void> {
    // Загрузка модели в IndexedDB/WebGPU
    // Поддержка: Llama 3.1 8B, Phi-3, Gemma
  }
  
  async generate(
    prompt: string,
    options: GenerationOptions
  ): Promise<string> {
    // Генерация через WebGPU/WASM
    // Падение в CloudLLM при ошибках
  }
}
```

## 3. UI интеграция

### 3.1. Компоненты (`src/components/ai/`)
```
├── FloatingAssistant.tsx
├── MagicButton.tsx
├── AIContextMenu.tsx
├── AISuggestions.tsx
└── AIActionBar.tsx
```

### 3.2. Floating Assistant
- Позиция: bottom-right
- Состояния: minimized, expanded, hidden
- Функции: чат, быстрые действия, контекстная помощь
- Горячие клавиши: Ctrl+Space

### 3.3. Magic Button
- Автоматическое обнаружение полей ввода
- Контекстные действия:
  - Текст → улучшить, перефразировать, перевести
  - Дата/время → распознать, предложить варианты
  - Числа → рассчитать, конвертировать
- Индикация доступных действий

## 4. Действия AI (Actions)

### 4.1. Категории действий
1. **Text Processing**
   - `improve_text` - улучшить текст
   - `summarize` - суммаризировать
   - `translate` - перевести
   - `extract_keywords` - извлечь ключевые слова

2. **Data Extraction**
   - `parse_task` - создать задачу из текста
   - `extract_event` - извлечь событие
   - `categorize_transaction` - категоризировать транзакцию
   - `extract_contact` - извлечь контакт

3. **Content Generation**
   - `generate_email` - сгенерировать email
   - `create_agenda` - создать повестку встречи
   - `suggest_response` - предложить ответ
   - `generate_code` - сгенерировать код (для модулей)

4. **Analysis & Insights**
   - `analyze_spending` - анализ расходов
   - `predict_completion` - предсказать завершение задачи
   - `suggest_optimization` - предложить оптимизацию

### 4.2. Конфигурация действий (`config/ai-actions.json`)
```json
{
  "actions": [
    {
      "id": "parse_task",
      "name": "Parse Task",
      "description": "Convert natural language to structured task",
      "module": "tasks",
      "contexts": ["home", "work", "study"],
      "inputSchema": {
        "text": "string",
        "priorityHint": "optional string"
      },
      "outputSchema": {
        "title": "string",
        "dueDate": "date",
        "priority": "string"
      },
      "promptTemplate": "Convert to task: {text}",
      "modelPreference": "cloud" // или "local"
    }
  ]
}
```

## 5. Контекстная адаптация

### 5.1. Context-Aware Prompts
```typescript
class ContextAwarePromptEngine {
  enhancePrompt(
    basePrompt: string,
    context: UserContext
  ): string {
    // Добавление контекстной информации:
    // - Текущий модуль
    // - Рабочее пространство
    // - История действий
    // - Предпочтения пользователя
  }
}
```

### 5.2. Примеры контекстных промптов
- **Home context**: "You are a helpful personal assistant..."
- **Work context**: "You are a professional productivity assistant..."
- **Study context**: "You are an educational tutor..."

## 6. Оффлайн/Онлайн режимы

### 6.1. Стратегия fallback
```
Интернет есть?
├── Да → Cloud LLM (GPT-4, Claude)
├── Нет → Local LLM (WebLLM)
└── Ошибка → Кэшированные ответы
```

### 6.2. Кэширование промптов
- IndexedDB кэш для частых запросов
- Векторный поиск похожих промптов
- TTL: 24 часа для динамических данных

## 7. Безопасность и приватность

### 7.1. Data Privacy
- Локальная обработка → данные не покидают устройство
- Облачная обработка → опциональное шифрование
- Анонимизация данных перед отправкой
- Пользовательский контроль: "никогда не отправлять в облако"

### 7.2. Permission System
```typescript
interface AIPermissions {
  canAccessModuleData: boolean;
  canPerformActions: boolean;
  canStoreConversations: boolean;
  canUseCloudModels: boolean;
}
```

## 8. Мониторинг и аналитика

### 8.1. Метрики
- Время ответа
- Точность действий
- Предпочтения пользователя
- Частота использования

### 8.2. Логирование
```typescript
interface AIActionLog {
  actionId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  modelUsed: string;
  processingTime: number;
  success: boolean;
  userId: string; // анонимизированный
  timestamp: string;
}
```

## 9. План внедрения (Roadmap)

### Phase 1: Foundation (2 недели)
- [ ] Базовый AIService с Cloud LLM
- [ ] Floating Assistant UI
- [ ] 5 основных действий
- [ ] Конфигурация через JSON

### Phase 2: Local-First (3 недели)
- [ ] WebLLM интеграция
- [ ] Оффлайн режим
- [ ] Кэширование промптов
- [ ] Улучшенная обработка ошибок

### Phase 3: Context-Aware (2 недели)
- [ ] Контекстные промпты
- [ ] Адаптация к модулям
- [ ] Персонализация
- [ ] История контекста

### Phase 4: Advanced Features (3 недели)
- [ ] Стриминг ответов
- [ ] Векторный поиск похожих промптов
- [ ] Автоматическое определение действий
- [ ] Интеграция с системными событиями

## 10. Технические требования

### 10.1. Зависимости
```json
{
  "dependencies": {
    "@vercel/ai": "latest",
    "openai": "latest",
    "web-llm": "latest",
    "langchain": "optional"
  }
}
```

### 10.2. Минимальные требования
- Браузер с поддержкой IndexedDB
- 2GB+ RAM для локальных моделей
- WebGPU для ускорения (опционально)
- 500MB дискового пространства для моделей

## 11. Тестирование

### 11.1. Юнит-тесты
- Тестирование промпт-инжиниринга
- Тестирование роутинга моделей
- Тестирование обработки результатов

### 11.2. Интеграционные тесты
- End-to-end тесты с моками LLM
- Тестирование оффлайн режима
- Тестирование производительности

## 12. Документация для разработчиков

### 12.1. Добавление нового действия
1. Добавить конфигурацию в `ai-actions.json`
2. Создать обработчик в `src/core/ai-service/actions/`
3. Добавить UI компоненты при необходимости
4. Обновить документацию

### 12.2. Кастомизация промптов
- Шаблоны в `config/ai-prompt-templates/`
- Переменные: `{userName}`, `{context}`, `{module}`
- Контекстные правила в `config/context-rules.json`

---

*Этот план обеспечивает гибкую, расширяемую и приватную AI интеграцию, соответствующую принципам LAD 2.*