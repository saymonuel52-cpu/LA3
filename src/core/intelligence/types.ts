/**
 * Базовые типы и интерфейсы для AI-Ready Calendar
 * Согласно архитектуре "заглушка + стратегия"
 */

export type Context = 'home' | 'work';

export interface ParsedEvent {
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

export interface TimeSlot {
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

export interface SlotSearchOptions {
  durationMinutes: number;
  context: Context;
  dateRange?: {
    start: Date;
    end: Date;
  };
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening';
  avoidDays?: number[]; // 0=Sunday, 1=Monday, etc.
  minStartHour?: number;
  maxEndHour?: number;
  bufferMinutes?: number;
  maxSlotsToReturn?: number;
  considerTravelTime?: boolean;
}

export interface ISmartEngine {
  parseInput(text: string, context: Context): Promise<ParsedEvent>;
  findBestSlots(durationMinutes: number, options: SlotSearchOptions): Promise<TimeSlot[]>;
  suggestCategories(title: string): Promise<string[]>;
  isAvailable(): Promise<boolean>;
}

// Типы для RuleEngine
export interface DatePatternMatch {
  type: 'relative' | 'weekday' | 'specific_date' | 'time' | 'duration';
  value: string;
  index: number;
  length: number;
}

export interface ParsedDateTime {
  date: Date;
  time?: { hour: number; minute: number };
  duration?: number;
  confidence: number;
}

// Типы для AIEngine
export interface AIProviderConfig {
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

export interface AIRequest {
  text: string;
  context: Context;
  userPreferences?: {
    workingHours?: { start: number; end: number };
    preferredDays?: number[];
    timezone?: string;
  };
}

export interface AIResponse {
  parsedEvent: ParsedEvent;
  alternatives?: ParsedEvent[];
  reasoning?: string;
  modelUsed?: string;
}

// Типы для настроек пользователя
export interface AISettings {
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
}

export interface UserSettings {
  ai: AISettings;
  calendar: {
    workingHours: {
      work: { start: number; end: number };
      home: { start: number; end: number };
    };
    defaultDuration: number;
    timezone: string;
  };
}

// Утилитарные типы
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface BusySlot {
  start: Date;
  end: Date;
  title: string;
  context: Context;
}

// Результаты парсинга
export interface ParseResult {
  success: boolean;
  data?: ParsedEvent;
  error?: string;
  engineUsed: 'rule' | 'ai';
  latency?: number;
}

// Константы
export const DEFAULT_WORKING_HOURS = {
  work: { start: 9, end: 18 },
  home: { start: 8, end: 22 }
};

export const TIME_OF_DAY_RANGES = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 17 },
  evening: { start: 17, end: 21 },
  night: { start: 21, end: 6 }
};