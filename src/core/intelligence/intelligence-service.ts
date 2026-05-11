/**
 * IntelligenceService - роутер, выбирающий между RuleEngine и AIEngine
 * Реализует паттерн "Strategy" с Dependency Injection
 */

import { 
  ISmartEngine, 
  ParsedEvent, 
  TimeSlot, 
  SlotSearchOptions, 
  Context,
  AISettings,
  UserSettings,
  ParseResult
} from './types';
import { RuleEngine } from './rule-engine';
import { AIEngine } from './ai-engine';

export class IntelligenceService implements ISmartEngine {
  private ruleEngine: RuleEngine;
  private aiEngine: AIEngine | null = null;
  private settings: UserSettings;
  
  // Кэш для часто используемых запросов
  private parseCache = new Map<string, { result: ParsedEvent, timestamp: number, engine: 'rule' | 'ai' }>();
  private slotsCache = new Map<string, { result: TimeSlot[], timestamp: number }>();
  
  // Статистика использования
  private stats = {
    ruleEngineUses: 0,
    aiEngineUses: 0,
    cacheHits: 0,
    lastReset: new Date(),
  };

  constructor(settings: UserSettings) {
    this.settings = settings;
    this.ruleEngine = new RuleEngine();
    
    // Инициализируем AIEngine если AI включен и есть API ключ
    if (this.shouldUseAI()) {
      this.aiEngine = new AIEngine({
        provider: settings.ai.provider,
        apiKey: settings.ai.apiKey,
        model: settings.ai.model,
      });
    }
  }

  /**
   * Парсит текст на естественном языке, выбирая оптимальный движок
   */
  async parseInput(text: string, context: Context): Promise<ParsedEvent> {
    const cacheKey = `${text}:${context}`;
    
    // Проверяем кэш (5 минут)
    const cached = this.parseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      this.stats.cacheHits++;
      return cached.result;
    }
    
    let result: ParsedEvent;
    let engineUsed: 'rule' | 'ai' = 'rule';
    
    try {
      if (this.shouldUseAI()) {
        // Пытаемся использовать AIEngine
        result = await this.aiEngine!.parseInput(text, context);
        engineUsed = 'ai';
        this.stats.aiEngineUses++;
      } else {
        // Используем RuleEngine
        result = await this.ruleEngine.parseInput(text, context);
        this.stats.ruleEngineUses++;
      }
    } catch (error) {
      // Fallback на RuleEngine при ошибках
      console.warn(`[IntelligenceService] ${engineUsed === 'ai' ? 'AI' : 'Rule'} engine failed, falling back:`, error);
      result = await this.ruleEngine.parseInput(text, context);
      engineUsed = 'rule';
      this.stats.ruleEngineUses++;
    }
    
    // Сохраняем в кэш
    this.parseCache.set(cacheKey, { result, timestamp: Date.now(), engine: engineUsed });
    
    // Ограничиваем размер кэша
    if (this.parseCache.size > 100) {
      const oldestKey = this.parseCache.keys().next().value;
      if (oldestKey) {
        this.parseCache.delete(oldestKey);
      }
    }
    
    return result;
  }

  /**
   * Находит лучшие временные слоты
   */
  async findBestSlots(durationMinutes: number, options: SlotSearchOptions): Promise<TimeSlot[]> {
    const cacheKey = `${durationMinutes}:${JSON.stringify(options)}`;
    
    // Проверяем кэш (2 минуты для слотов)
    const cached = this.slotsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 2 * 60 * 1000) {
      this.stats.cacheHits++;
      return cached.result;
    }
    
    let result: TimeSlot[];
    
    if (this.shouldUseAI() && this.aiEngine) {
      try {
        result = await this.aiEngine.findBestSlots(durationMinutes, options);
        this.stats.aiEngineUses++;
      } catch (error) {
        console.warn('[IntelligenceService] AI slot search failed, falling back to RuleEngine:', error);
        result = await this.ruleEngine.findBestSlots(durationMinutes, options);
        this.stats.ruleEngineUses++;
      }
    } else {
      result = await this.ruleEngine.findBestSlots(durationMinutes, options);
      this.stats.ruleEngineUses++;
    }
    
    // Сохраняем в кэш
    this.slotsCache.set(cacheKey, { result, timestamp: Date.now() });
    
    // Ограничиваем размер кэша
    if (this.slotsCache.size > 50) {
      const oldestKey = this.slotsCache.keys().next().value;
      if (oldestKey) {
        this.slotsCache.delete(oldestKey);
      }
    }
    
    return result;
  }

  /**
   * Предлагает категории/теги
   */
  async suggestCategories(title: string): Promise<string[]> {
    if (this.shouldUseAI() && this.aiEngine) {
      try {
        const result = await this.aiEngine.suggestCategories(title);
        this.stats.aiEngineUses++;
        return result;
      } catch (error) {
        console.warn('[IntelligenceService] AI category suggestion failed, falling back:', error);
      }
    }
    
    this.stats.ruleEngineUses++;
    return this.ruleEngine.suggestCategories(title);
  }

  /**
   * Проверяет доступность интеллектуальных функций
   */
  async isAvailable(): Promise<boolean> {
    // RuleEngine всегда доступен
    return true;
  }

  /**
   * Возвращает информацию о том, какой движок будет использован
   */
  getEngineInfo(): { usingAI: boolean; aiAvailable: boolean; stats: any } {
    return {
      usingAI: this.shouldUseAI(),
      aiAvailable: !!this.aiEngine && this.settings.ai.enabled,
      stats: { ...this.stats },
    };
  }

  /**
   * Сбрасывает статистику
   */
  resetStats(): void {
    this.stats = {
      ruleEngineUses: 0,
      aiEngineUses: 0,
      cacheHits: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Очищает кэш
   */
  clearCache(): void {
    this.parseCache.clear();
    this.slotsCache.clear();
  }

  /**
   * Тестирует доступность AI-движка
   */
  async testAI(): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!this.aiEngine) {
      return { success: false, message: 'AIEngine не инициализирован' };
    }
    
    return this.aiEngine.testConnection();
  }

  /**
   * Обновляет настройки (например, после изменения API ключа)
   */
  updateSettings(newSettings: UserSettings): void {
    this.settings = newSettings;
    
    // Пересоздаем AIEngine если нужно
    if (this.shouldUseAI()) {
      this.aiEngine = new AIEngine({
        provider: newSettings.ai.provider,
        apiKey: newSettings.ai.apiKey,
        model: newSettings.ai.model,
      });
    } else {
      this.aiEngine = null;
    }
    
    // Очищаем кэш, т.к. настройки изменились
    this.clearCache();
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

  private shouldUseAI(): boolean {
    // Проверяем, нужно ли использовать AI
    const { ai } = this.settings;
    
    if (!ai.enabled) {
      return false;
    }
    
    if (!ai.apiKey || ai.apiKey.length < 10) {
      return false;
    }
    
    // Проверяем лимиты использования
    if (ai.usage && ai.usage.monthlyRequests >= 1000) {
      console.warn('[IntelligenceService] Monthly AI request limit reached');
      return false;
    }
    
    // Проверяем, когда последний раз тестировали
    if (ai.lastTested) {
      const daysSinceTest = (Date.now() - new Date(ai.lastTested).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceTest > 30) {
        console.warn('[IntelligenceService] AI not tested in over 30 days');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Парсит текст и возвращает расширенную информацию о результате
   */
  async parseInputWithDetails(text: string, context: Context): Promise<ParseResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.parseInput(text, context);
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        engineUsed: this.shouldUseAI() ? 'ai' : 'rule',
        latency,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        engineUsed: 'rule',
      };
    }
  }
}