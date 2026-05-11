/**
 * AIEngine - заглушка для будущей интеграции с AI-провайдерами
 * Реализует ISmartEngine и делегирует на RuleEngine как fallback
 */

import { ISmartEngine, ParsedEvent, TimeSlot, SlotSearchOptions, Context, AIProviderConfig } from './types';
import { RuleEngine } from './rule-engine';

export class AIEngine implements ISmartEngine {
  private ruleEngine: RuleEngine;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.ruleEngine = new RuleEngine();
  }

  /**
   * Парсит текст с использованием AI (заглушка - делегирует на RuleEngine)
   */
  async parseInput(text: string, context: Context): Promise<ParsedEvent> {
    if (!await this.isAvailable()) {
      // Если AI недоступен, используем RuleEngine
      return this.ruleEngine.parseInput(text, context);
    }

    // Здесь будет реальная интеграция с AI API
    // Пока что используем RuleEngine как fallback
    console.log(`[AIEngine] Parsing with ${this.config.provider}: "${text}"`);
    
    try {
      // В будущем: вызов API OpenAI/Anthropic
      // const response = await this.callAIAPI(text, context);
      // return this.transformAIResponse(response);
      
      // Сейчас используем RuleEngine
      return await this.ruleEngine.parseInput(text, context);
    } catch (error) {
      console.error('[AIEngine] AI parsing failed, falling back to RuleEngine:', error);
      return this.ruleEngine.parseInput(text, context);
    }
  }

  /**
   * Находит лучшие слоты с использованием AI (заглушка)
   */
  async findBestSlots(durationMinutes: number, options: SlotSearchOptions): Promise<TimeSlot[]> {
    if (!await this.isAvailable()) {
      return this.ruleEngine.findBestSlots(durationMinutes, options);
    }

    console.log(`[AIEngine] Finding slots with AI for ${durationMinutes} minutes`);
    
    // В будущем: AI-оптимизация расписания
    // Пока что используем RuleEngine
    return this.ruleEngine.findBestSlots(durationMinutes, options);
  }

  /**
   * Предлагает категории с использованием AI (заглушка)
   */
  async suggestCategories(title: string): Promise<string[]> {
    if (!await this.isAvailable()) {
      return this.ruleEngine.suggestCategories(title);
    }

    console.log(`[AIEngine] Suggesting categories for: "${title}"`);
    
    // В будущем: AI-классификация
    // Пока что используем RuleEngine
    return this.ruleEngine.suggestCategories(title);
  }

  /**
   * Проверяет доступность AI-движка
   */
  async isAvailable(): Promise<boolean> {
    // Проверяем наличие API ключа и конфигурации
    const hasValidConfig = this.config.apiKey && this.config.apiKey.length > 10;
    const isProviderSupported = ['openai', 'anthropic', 'local', 'custom'].includes(this.config.provider);
    
    // Для демонстрации всегда возвращаем false, чтобы использовать RuleEngine
    // В реальном приложении здесь будет проверка доступности API
    return false; // Заглушка: AI отключен по умолчанию
  }

  /**
   * Тестирует подключение к AI-провайдеру
   */
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!this.config.apiKey) {
      return { success: false, message: 'API ключ не указан' };
    }

    // Заглушка для тестирования
    // В реальном приложении здесь будет ping к API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Подключение к ${this.config.provider} успешно (заглушка)`,
          latency: 150
        });
      }, 150);
    });
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (для будущей реализации) ==========

  private async callAIAPI(text: string, context: Context): Promise<any> {
    // Заглушка для будущей реализации
    throw new Error('AI API integration not implemented yet');
  }

  private transformAIResponse(aiResponse: any): ParsedEvent {
    // Заглушка для будущей реализации
    throw new Error('AI response transformation not implemented yet');
  }
}