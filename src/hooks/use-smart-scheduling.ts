/**
 * Хук для использования интеллектуального планирования (AI-Ready Calendar)
 * Предоставляет функции парсинга естественного языка, поиска слотов и предложения категорий
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  ParsedEvent, 
  TimeSlot, 
  SlotSearchOptions, 
  Context,
  UserSettings,
  AISettings
} from '@/core/intelligence/types';
import { IntelligenceService } from '@/core/intelligence/intelligence-service';

// Заглушка настроек по умолчанию
const DEFAULT_SETTINGS: UserSettings = {
  ai: {
    enabled: false,
    provider: 'openai',
    apiKey: undefined,
    model: 'gpt-4',
    lastTested: new Date(),
    usage: {
      monthlyRequests: 0,
      monthlyCost: 0,
      lastReset: new Date(),
    },
  },
  calendar: {
    workingHours: {
      work: { start: 9, end: 18 },
      home: { start: 8, end: 22 },
    },
    defaultDuration: 60,
    timezone: 'Europe/Moscow',
  },
};

/**
 * Хук для работы с интеллектуальным планированием
 */
export function useSmartScheduling(initialSettings?: Partial<UserSettings>) {
  // Объединяем настройки по умолчанию с переданными
  const settings = useMemo(() => {
    const merged = { ...DEFAULT_SETTINGS, ...initialSettings };
    // Глубокое слияние для вложенных объектов
    if (initialSettings?.ai) {
      merged.ai = { ...DEFAULT_SETTINGS.ai, ...initialSettings.ai };
    }
    if (initialSettings?.calendar) {
      merged.calendar = { ...DEFAULT_SETTINGS.calendar, ...initialSettings.calendar };
    }
    return merged;
  }, [initialSettings]);

  // Создаем экземпляр IntelligenceService
  const [intelligenceService] = useState(() => new IntelligenceService(settings));

  // Состояние для отслеживания загрузки и ошибок
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastParsedEvent, setLastParsedEvent] = useState<ParsedEvent | null>(null);

  /**
   * Парсит текст на естественном языке
   */
  const parseQuickInput = useCallback(async (text: string, context: Context = 'work') => {
    if (!text || text.length < 2) {
      throw new Error('Текст слишком короткий для парсинга');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await intelligenceService.parseInput(text, context);
      setLastParsedEvent(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при парсинге';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [intelligenceService]);

  /**
   * Находит лучшие временные слоты
   */
  const findTimeSlots = useCallback(async (durationMinutes: number, options: SlotSearchOptions) => {
    if (durationMinutes <= 0) {
      throw new Error('Длительность должна быть положительной');
    }

    setIsLoading(true);
    setError(null);

    try {
      return await intelligenceService.findBestSlots(durationMinutes, options);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при поиске слотов';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [intelligenceService]);

  /**
   * Предлагает категории/теги для заголовка события
   */
  const suggestTags = useCallback(async (title: string) => {
    if (!title || title.length < 2) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      return await intelligenceService.suggestCategories(title);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при предложении тегов';
      setError(errorMessage);
      // Возвращаем пустой массив вместо выброса ошибки
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [intelligenceService]);

  /**
   * Тестирует подключение к AI-провайдеру
   */
  const testAIConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      return await intelligenceService.testAI();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка при тестировании AI';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [intelligenceService]);

  /**
   * Обновляет настройки AI
   */
  const updateAISettings = useCallback((aiSettings: Partial<AISettings>) => {
    const newSettings = {
      ...settings,
      ai: { ...settings.ai, ...aiSettings },
    };
    
    // В реальном приложении здесь будет обновление настроек в хранилище
    console.log('Updating AI settings:', aiSettings);
    
    // Пересоздаем IntelligenceService с новыми настройками
    // В реальном приложении нужно будет пересоздать сервис
    // intelligenceService.updateSettings(newSettings);
  }, [settings]);

  /**
   * Очищает кэш IntelligenceService
   */
  const clearCache = useCallback(() => {
    intelligenceService.clearCache();
  }, [intelligenceService]);

  /**
   * Получает статистику использования движков
   */
  const getStats = useCallback(() => {
    return intelligenceService.getEngineInfo();
  }, [intelligenceService]);

  return {
    // Основные функции
    parseQuickInput,
    findTimeSlots,
    suggestTags,
    
    // Вспомогательные функции
    testAIConnection,
    updateAISettings,
    clearCache,
    getStats,
    
    // Состояние
    isLoading,
    error,
    lastParsedEvent,
    
    // Информация
    isAIEnabled: settings.ai.enabled && !!settings.ai.apiKey,
    settings,
    
    // Утилиты
    resetError: () => setError(null),
    resetLastParsedEvent: () => setLastParsedEvent(null),
  };
}

/**
 * Упрощенная версия хука для быстрого парсинга
 */
export function useQuickParse() {
  const { parseQuickInput, isLoading, error, lastParsedEvent } = useSmartScheduling();
  
  return {
    parse: parseQuickInput,
    isLoading,
    error,
    lastParsedEvent,
  };
}

/**
 * Хук для поиска временных слотов
 */
export function useSlotFinder() {
  const { findTimeSlots, isLoading, error } = useSmartScheduling();
  
  return {
    findSlots: findTimeSlots,
    isLoading,
    error,
  };
}