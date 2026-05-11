'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Switch } from '@/components/ui/Switch/Switch';
import { useSmartScheduling } from '@/hooks/use-smart-scheduling';
import { Loader2, Check, X, Key, Brain, Shield, AlertTriangle, Zap } from 'lucide-react';

interface AIIntegrationSettingsProps {
  /** Callback при сохранении настроек */
  onSave?: (settings: any) => void;
  /** Callback при тестировании подключения */
  onTest?: (result: any) => void;
  /** Начальные настройки */
  initialSettings?: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
    model?: string;
  };
}

/**
 * Компонент настроек интеграции с AI-провайдерами
 * Позволяет настроить OpenAI, Anthropic и другие AI-сервисы
 */
export function AIIntegrationSettings({
  onSave,
  onTest,
  initialSettings,
}: AIIntegrationSettingsProps) {
  const { testAIConnection, updateAISettings, getStats, isAIEnabled, settings } = useSmartScheduling();
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
  // Локальное состояние формы
  const [formState, setFormState] = useState({
    enabled: initialSettings?.enabled ?? false,
    provider: initialSettings?.provider ?? 'openai',
    apiKey: initialSettings?.apiKey ?? '',
    model: initialSettings?.model ?? 'gpt-4',
  });
  
  // Статистика использования
  const [stats, setStats] = useState<any>(null);
  
  // Загружаем статистику при монтировании
  useEffect(() => {
    const loadStats = () => {
      const currentStats = getStats();
      setStats(currentStats);
    };
    
    loadStats();
    const interval = setInterval(loadStats, 5000); // Обновляем каждые 5 секунд
    
    return () => clearInterval(interval);
  }, [getStats]);
  
  // Обработчик изменения полей формы
  const handleInputChange = (field: keyof typeof formState, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Сбрасываем сообщения при изменении
    setTestResult(null);
    setSaveMessage(null);
  };
  
  // Обработчик тестирования подключения
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Временно обновляем настройки для теста
      const testSettings = {
        ...settings,
        ai: {
          ...settings.ai,
          enabled: true,
          apiKey: formState.apiKey || 'test-key',
          provider: formState.provider as any,
        },
      };
      
      // Используем хук для тестирования
      const result = await testAIConnection();
      setTestResult(result);
      
      if (onTest) {
        onTest(result);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  // Обработчик сохранения настроек
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Обновляем настройки через хук
      updateAISettings({
        enabled: formState.enabled,
        provider: formState.provider as any,
        apiKey: formState.apiKey,
        model: formState.model,
      });
      
      setSaveMessage('Настройки успешно сохранены!');
      
      if (onSave) {
        onSave(formState);
      }
      
      // Сбрасываем сообщение через 3 секунды
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage(`Ошибка сохранения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Обработчик сброса настроек
  const handleReset = () => {
    setFormState({
      enabled: false,
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4',
    });
    setTestResult(null);
    setSaveMessage(null);
  };
  
  // Провайдеры AI
  const aiProviders = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, GPT-3.5 Turbo', icon: '🤖' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude 3', icon: '🧠' },
    { id: 'local', name: 'Локальный', description: 'Ollama, LocalAI', icon: '💻' },
    { id: 'custom', name: 'Кастомный', description: 'Свой API endpoint', icon: '⚙️' },
  ];
  
  // Модели в зависимости от провайдера
  const providerModels: Record<string, string[]> = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    local: ['llama3', 'mistral', 'gemma', 'custom'],
    custom: ['custom'],
  };
  
  return (
    <div className="space-y-6">
      {/* Заголовок и описание */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Настройки AI-интеграции
        </h2>
        <p className="text-muted-foreground mt-1">
          Настройте подключение к AI-провайдерам для интеллектуального планирования
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основные настройки */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6 space-y-6">
              {/* Включение AI */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Включить AI-планирование
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Использовать AI для парсинга естественного языка и поиска оптимальных слотов
                  </p>
                </div>
                <Switch
                  checked={formState.enabled}
                  onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                />
              </div>
              
              {/* Выбор провайдера */}
              <div>
                <h3 className="font-semibold text-lg mb-3">AI-провайдер</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {aiProviders.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      className={`p-4 rounded-lg border-2 text-left transition-all ${formState.provider === provider.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => handleInputChange('provider', provider.id)}
                    >
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{provider.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Настройки API */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Настройки API
                </h3>
                
                {/* API ключ */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    API ключ
                    <span className="text-xs text-muted-foreground ml-2">
                      (сохраняется локально с шифрованием)
                    </span>
                  </label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={formState.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="font-mono"
                    leftIcon={<Key className="h-4 w-4" />}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ключ шифруется и хранится только в вашем браузере
                  </p>
                </div>
                
                {/* Модель */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Модель
                  </label>
                  <select
                    className="w-full p-2 border border-border rounded-lg bg-background"
                    value={formState.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                  >
                    {providerModels[formState.provider]?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Кастомный endpoint */}
                {formState.provider === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      API Endpoint
                    </label>
                    <Input
                      placeholder="https://api.example.com/v1/chat/completions"
                      value={formState.apiKey ? 'https://api.example.com/v1/chat/completions' : ''}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      className="font-mono"
                    />
                  </div>
                )}
              </div>
              
              {/* Кнопки действий */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[120px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Сохранить
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || !formState.apiKey}
                  className="min-w-[120px]"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Тестирование...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Тестировать
                    </>
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4 mr-2" />
                  Сбросить
                </Button>
              </div>
              
              {/* Сообщения */}
              {saveMessage && (
                <div className={`p-3 rounded-lg ${saveMessage.includes('Ошибка') ? 'bg-destructive/10 text-destructive' : 'bg-green-100 text-green-800'}`}>
                  {saveMessage}
                </div>
              )}
              
              {testResult && (
                <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-destructive/10 text-destructive'}`}>
                  <div className="font-medium">{testResult.success ? '✅ Подключение успешно' : '❌ Ошибка подключения'}</div>
                  <div className="text-sm mt-1">{testResult.message}</div>
                  {testResult.latency && (
                    <div className="text-xs mt-1">Задержка: {testResult.latency} мс</div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
        
        {/* Статистика и информация */}
        <div className="space-y-6">
          {/* Статистика использования */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Статистика использования
              </h3>
              
              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{stats.stats.ruleEngineUses}</div>
                      <div className="text-xs text-muted-foreground">RuleEngine</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{stats.stats.aiEngineUses}</div>
                      <div className="text-xs text-muted-foreground">AIEngine</div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{stats.stats.cacheHits}</div>
                    <div className="text-xs text-muted-foreground">Попаданий в кэш</div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>Текущий движок: {stats.usingAI ? 'AIEngine' : 'RuleEngine'}</div>
                    <div>AI доступен: {stats.aiAvailable ? 'Да' : 'Нет'}</div>
                    <div className="mt-2 text-xs">
                      Сброс статистики: {new Date(stats.stats.lastReset).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Загрузка статистики...
                </div>
              )}
            </div>
          </Card>
          
          {/* Информация о безопасности */}
          <Card>
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Безопасность
              </h3>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>API ключи шифруются с помощью Web Crypto API</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Данные не покидают ваш браузер без вашего разрешения</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>RuleEngine работает полностью локально</span>
                </li>
              </ul>
            </div>
          </Card>
          
          {/* Предупреждение о затратах */}
          <Card className="border-amber-200 bg-amber-50">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                Важная информация
              </h3>
              
              <ul className="space-y-2 text-sm text-amber-700">
                <li>• Использование AI API может влечь финансовые затраты</li>
                <li>• Установите лимиты использования в настройках провайдера</li>
                <li>• RuleEngine бесплатен и работает без интернета</li>
                <li>• Регулярно проверяйте баланс API ключа</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}