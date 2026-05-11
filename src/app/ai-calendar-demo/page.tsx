'use client';

import { useState } from 'react';
import { QuickAddInput } from '@/components/calendar/QuickAddInput';
import { AIIntegrationSettings } from '@/components/settings/AIIntegrationSettings';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { useSmartScheduling } from '@/hooks/use-smart-scheduling';
import { ParsedEvent, TimeSlot, Context } from '@/core/intelligence/types';
import { 
  Calendar, 
  Clock, 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Code,
  Cpu,
  Shield,
  BarChart
} from 'lucide-react';

export default function AICalendarDemoPage() {
  const [activeTab, setActiveTab] = useState<'demo' | 'settings' | 'api'>('demo');
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [foundSlots, setFoundSlots] = useState<TimeSlot[]>([]);
  const [testInput, setTestInput] = useState<string>('');
  const [testContext, setTestContext] = useState<Context>('work');
  
  const { parseQuickInput, findTimeSlots, suggestTags, getStats, clearCache, isLoading, error } = useSmartScheduling();
  
  // Обработчик успешного парсинга события
  const handleEventParsed = (event: ParsedEvent) => {
    setParsedEvents(prev => [event, ...prev.slice(0, 4)]); // Храним последние 5 событий
  };
  
  // Обработчик добавления события
  const handleAddEvent = (event: ParsedEvent) => {
    console.log('Event added:', event);
    // В реальном приложении здесь будет сохранение в БД
    alert(`Событие добавлено: ${event.title} на ${event.date.toLocaleDateString('ru-RU')}`);
  };
  
  // Тестирование парсинга
  const handleTestParse = async () => {
    if (!testInput.trim()) return;
    
    try {
      const result = await parseQuickInput(testInput, testContext);
      handleEventParsed(result);
      setTestInput('');
    } catch (err) {
      console.error('Parse error:', err);
    }
  };
  
  // Тестирование поиска слотов
  const handleTestSlotSearch = async () => {
    try {
      const slots = await findTimeSlots(60, {
        durationMinutes: 60,
        context: 'work',
        preferredTimeOfDay: 'afternoon',
        maxSlotsToReturn: 3,
      });
      setFoundSlots(slots);
    } catch (err) {
      console.error('Slot search error:', err);
    }
  };
  
  // Очистка кэша
  const handleClearCache = () => {
    clearCache();
    alert('Кэш очищен!');
  };
  
  // Получение статистики
  const stats = getStats();
  
  // Примеры для быстрого тестирования
  const exampleInputs = [
    { text: 'Встреча с Олегом завтра в 15:00', context: 'work' as Context },
    { text: 'Тренировка сегодня вечером на 45 минут', context: 'home' as Context },
    { text: 'Совещание в пятницу утром на 2 часа', context: 'work' as Context },
    { text: 'Обед в 13:00 каждый день', context: 'home' as Context },
    { text: 'Звонок с клиентом через 3 дня в 11 утра', context: 'work' as Context },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI-Ready Calendar Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            Демонстрация архитектуры "заглушка + стратегия" для интеллектуального планирования
          </p>
        </header>
        
        {/* Навигация по вкладкам */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeTab === 'demo' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('demo')}
            leftIcon={<Zap className="h-4 w-4" />}
          >
            Демо
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('settings')}
            leftIcon={<Cpu className="h-4 w-4" />}
          >
            Настройки AI
          </Button>
          <Button
            variant={activeTab === 'api' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('api')}
            leftIcon={<Code className="h-4 w-4" />}
          >
            API & Статистика
          </Button>
        </div>
        
        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Демо и быстрый ввод */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'demo' && (
              <>
                {/* Быстрый ввод */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Быстрый ввод событий
                  </h2>
                  <QuickAddInput
                    onEventParsed={handleEventParsed}
                    onAddEvent={handleAddEvent}
                    defaultContext="work"
                    autoClear={true}
                    showPreview={true}
                  />
                  
                  {/* Примеры для быстрого тестирования */}
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Примеры для тестирования:</h3>
                    <div className="flex flex-wrap gap-2">
                      {exampleInputs.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="small"
                          onClick={() => {
                            setTestInput(example.text);
                            setTestContext(example.context);
                          }}
                        >
                          {example.text.substring(0, 20)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
                
                {/* Ручное тестирование */}
                <Card className="p-6">
                  <h2 className="text-xl font-bold mb-4">Ручное тестирование</h2>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Введите текст для парсинга..."
                        className="flex-1 p-3 border border-border rounded-lg"
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                      />
                      <select
                        className="p-3 border border-border rounded-lg bg-background"
                        value={testContext}
                        onChange={(e) => setTestContext(e.target.value as Context)}
                      >
                        <option value="work">💼 Работа</option>
                        <option value="home">🏠 Дом</option>
                      </select>
                      <Button
                        variant="primary"
                        onClick={handleTestParse}
                        disabled={isLoading || !testInput.trim()}
                      >
                        {isLoading ? 'Парсинг...' : 'Протестировать'}
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleTestSlotSearch}
                        disabled={isLoading}
                      >
                        Найти слоты (60 мин)
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleClearCache}
                      >
                        Очистить кэш
                      </Button>
                    </div>
                  </div>
                </Card>
                
                {/* Найденные слоты */}
                {foundSlots.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Найденные временные слоты
                    </h2>
                    <div className="space-y-3">
                      {foundSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                {slot.start.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {slot.formattedTime} • {slot.durationMinutes} мин • {slot.timeOfDay}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">{slot.score.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground">оценка</div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">{slot.reason}</div>
                          <div className="flex gap-2 mt-3">
                            {slot.isToday && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Сегодня
                              </span>
                            )}
                            {slot.isTomorrow && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Завтра
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
            
            {activeTab === 'settings' && (
              <AIIntegrationSettings
                onSave={(settings) => console.log('Settings saved:', settings)}
                onTest={(result) => console.log('Test result:', result)}
              />
            )}
            
            {activeTab === 'api' && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API & Статистика
                </h2>
                
                <div className="space-y-6">
                  {/* Статистика использования */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BarChart className="h-4 w-4" />
                      Статистика использования
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold">{stats.stats.ruleEngineUses}</div>
                        <div className="text-sm text-muted-foreground">RuleEngine</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold">{stats.stats.aiEngineUses}</div>
                        <div className="text-sm text-muted-foreground">AIEngine</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold">{stats.stats.cacheHits}</div>
                        <div className="text-sm text-muted-foreground">Кэш-хиты</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold">
                          {stats.usingAI ? 'AI' : 'Rule'}
                        </div>
                        <div className="text-sm text-muted-foreground">Текущий движок</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Архитектура */}
                  <div>
                    <h3 className="font-semibold mb-3">Архитектура</h3>
                    <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                      <div className="font-medium mb-2">Strategy + Dependency Injection</div>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>RuleEngine: локальный парсинг на regex-правилах</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>AIEngine: заглушка для будущей интеграции с OpenAI/Anthropic</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>IntelligenceService: роутер, выбирающий оптимальный движок</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span>Безопасное хранение API ключей через Web Crypto API</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Последние распарсенные события */}
                  {parsedEvents.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Последние распарсенные события</h3>
                      <div className="space-y-2">
                        {parsedEvents.map((event, index) => (
                          <div
                            key={index}
                            className="p-3 border border-border rounded-lg text-sm"
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-muted-foreground">
                              {event.date.toLocaleDateString('ru-RU')} • 
                              {event.time ? ` ${event.time.hour}:${event.time.minute.toString().padStart(2, '0')}` : ''} • 
                              Уверенность: {Math.round(event.confidence * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
          
          {/* Правая колонка - Информация и статус */}
          <div className="space-y-8">
            {/* Статус системы */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Статус системы
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">RuleEngine</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Активен
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">AIEngine</span>
                  <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                    Заглушка
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">IntelligenceService</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Работает
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Кэш</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {stats.stats.cacheHits} хитов
                  </span>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Ошибка:</span>
                  </div>
                  <div className="text-sm mt-1">{error}</div>
                </div>
              )}
            </Card>
            
            {/* Принцип работы */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Принцип работы</h2>
              
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">1. Парсинг естественного языка</div>
                  <div className="text-muted-foreground mt-1">
                    RuleEngine анализирует текст, извлекает даты, время, длительность
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">2. Интеллектуальный роутинг</div>
                  <div className="text-muted-foreground mt-1">
                    IntelligenceService выбирает между RuleEngine и AIEngine
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">3. Поиск оптимальных слотов</div>
                  <div className="text-muted-foreground mt-1">
                    Алгоритм оценивает слоты по 5 критериям, возвращает лучшие
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">4. Готовность к AI</div>
                  <div className="text-muted-foreground mt-1">
                    Архитектура позволяет подключить AI-провайдеров без переписывания кода
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Быстрые действия */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Быстрые действия</h2>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setActiveTab('settings')}
                  leftIcon={<Cpu className="h-4 w-4" />}
                >
                  Настроить AI-интеграцию
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleClearCache}
                  leftIcon={<Zap className="h-4 w-4" />}
                >
                  Очистить кэш
                </Button>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => window.open('/design-system', '_blank')}
                  leftIcon={<Calendar className="h-4 w-4" />}
                >
                  Открыть дизайн-систему
                </Button>
              </div>
            </Card>
          </div>
        </div>
        
        {/* Футер с информацией */}
        <footer className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            AI-Ready Calendar • Архитектура "заглушка + стратегия" • 
            Работает сейчас на RuleEngine, готово к подключению AI
          </p>
          <p className="mt-2">
            Производительность: {'<'}100 мс для парсинга, {'<'}200 мс для поиска слотов на 7 дней
          </p>
        </footer>
      </div>
    </div>
  );
}