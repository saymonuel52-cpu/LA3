/**
 * RuleEngine - локальный движок парсинга естественного языка на основе правил
 * Реализует ISmartEngine и работает без внешних API
 */

import { 
  ISmartEngine, 
  ParsedEvent, 
  TimeSlot, 
  SlotSearchOptions, 
  Context,
  DatePatternMatch,
  ParsedDateTime,
  BusySlot,
  DayOfWeek,
  DEFAULT_WORKING_HOURS,
  TIME_OF_DAY_RANGES
} from './types';

export class RuleEngine implements ISmartEngine {
  private readonly datePatterns = {
    // Относительные даты
    RELATIVE: /(завтра|послезавтра|вчера|позавчера|через\s+(\d+)\s+день|через\s+(\d+)\s+дней|через\s+неделю|через\s+(\d+)\s+недель)/i,
    
    // Дни недели
    WEEKDAY: /(в|во|на)\s+(понедельник|вторник|сред[уы]|четверг|пятниц[уы]|суббот[уы]|воскресень[ея])(?:\s+следующей|\s+прошлой)?/i,
    
    // Конкретные даты
    SPECIFIC_DATE: /(\d{1,2})\s+(январ[яю]|феврал[яю]|март[ае]|апрел[яю]|ма[яю]|июн[яю]|июл[яю]|август[ае]|сентябр[яю]|октябр[яю]|ноябр[яю]|декабр[яю])(?:\s+(\d{4}))?/i,
    DATE_DDMMYYYY: /(\d{1,2})[\.\/](\d{1,2})[\.\/]?(\d{4})?/i,
    
    // Время
    TIME_24H: /в\s+(\d{1,2}):(\d{2})/i,
    TIME_12H: /в\s+(\d{1,2})\s+(утра|вечера|часов)/i,
    TIME_OF_DAY: /(утром|днём|вечером|ночью|рано\s+утром|поздно\s+вечером)/i,
    
    // Длительность
    DURATION: /на\s+(\d+)\s+(час|часа|часов|минут|минуты)/i,
    DURATION_HALF: /на\s+полтора\s+часа|на\s+полчаса/i,
    DURATION_ALL_DAY: /на\s+весь\s+день/i,
  };

  private readonly monthMap: Record<string, number> = {
    'января': 0, 'январе': 0, 'январь': 0,
    'февраля': 1, 'феврале': 1, 'февраль': 1,
    'марта': 2, 'марте': 2, 'март': 2,
    'апреля': 3, 'апреле': 3, 'апрель': 3,
    'мая': 4, 'мае': 4, 'май': 4,
    'июня': 5, 'июне': 5, 'июнь': 5,
    'июля': 6, 'июле': 6, 'июль': 6,
    'августа': 7, 'августе': 7, 'август': 7,
    'сентября': 8, 'сентябре': 8, 'сентябрь': 8,
    'октября': 9, 'октябре': 9, 'октябрь': 9,
    'ноября': 10, 'ноябре': 10, 'ноябрь': 10,
    'декабря': 11, 'декабре': 11, 'декабрь': 11,
  };

  private readonly weekdayMap: Record<string, number> = {
    'понедельник': 1,
    'вторник': 2,
    'среду': 3, 'среды': 3,
    'четверг': 4,
    'пятницу': 5, 'пятницы': 5,
    'субботу': 6, 'субботы': 6,
    'воскресенье': 0, 'воскресенья': 0,
  };

  private readonly timeOfDayDefaults: Record<string, { hour: number, minute: number }> = {
    'утром': { hour: 9, minute: 0 },
    'днём': { hour: 13, minute: 0 },
    'вечером': { hour: 18, minute: 0 },
    'ночью': { hour: 22, minute: 0 },
    'рано утром': { hour: 7, minute: 0 },
    'поздно вечером': { hour: 20, minute: 0 },
  };

  /**
   * Парсит текст на естественном языке и возвращает структурированное событие
   */
  async parseInput(text: string, context: Context): Promise<ParsedEvent> {
    const lowerText = text.toLowerCase();
    
    // Шаг 1: Извлечь дату
    const date = this.extractDate(lowerText);
    
    // Шаг 2: Извлечь время
    const time = this.extractTime(lowerText, context);
    
    // Шаг 3: Извлечь длительность
    const duration = this.extractDuration(lowerText);
    
    // Шаг 4: Извлечь заголовок (убрать даты/времени из текста)
    const title = this.extractTitle(text, lowerText);
    
    // Шаг 5: Рассчитать уверенность
    const confidence = this.calculateConfidence(date, time, duration);
    
    return {
      title,
      date: date.date,
      time: time.time,
      duration: duration,
      isAllDay: duration === 480, // 8 часов = весь рабочий день
      context,
      confidence,
      rawText: text,
    };
  }

  /**
   * Находит лучшие временные слоты для события заданной длительности
   */
  async findBestSlots(durationMinutes: number, options: SlotSearchOptions): Promise<TimeSlot[]> {
    // Получить занятые слоты (заглушка - в реальности из БД)
    const busySlots = await this.getBusySlots(options.dateRange);
    
    // Создать временную сетку
    const timeGrid = this.createTimeGrid(options);
    
    // Найти свободные интервалы
    const freeSlots = this.findFreeIntervals(timeGrid, busySlots, durationMinutes);
    
    // Оценить слоты
    const scoredSlots = this.scoreSlots(freeSlots, options);
    
    // Вернуть топ-3 слота
    return scoredSlots.slice(0, options.maxSlotsToReturn || 3);
  }

  /**
   * Предлагает категории/теги на основе заголовка события
   */
  async suggestCategories(title: string): Promise<string[]> {
    const rules = [
      { keywords: ['встреча', 'звонок', 'клиент', 'совещание', 'переговоры', 'презентация'], tags: ['#работа', '#встреча'] },
      { keywords: ['дом', 'семья', 'дети', 'родители', 'ребенок', 'супруг'], tags: ['#личное', '#семья'] },
      { keywords: ['спорт', 'тренировка', 'зал', 'бег', 'фитнес', 'йога'], tags: ['#здоровье', '#спорт'] },
      { keywords: ['врач', 'больница', 'анализы', 'здоровье', 'стоматолог', 'терапевт'], tags: ['#здоровье', '#медицина'] },
      { keywords: ['ужин', 'ресторан', 'кафе', 'еда', 'обед', 'завтрак'], tags: ['#еда', '#отдых'] },
      { keywords: ['покупки', 'магазин', 'супермаркет', 'товары'], tags: ['#покупки'] },
      { keywords: ['учеба', 'курсы', 'лекция', 'семинар', 'обучение'], tags: ['#образование'] },
      { keywords: ['путешествие', 'отпуск', 'отдых', 'каникулы', 'поездка'], tags: ['#путешествие'] },
    ];
    
    const matchedTags = new Set<string>();
    const lowerTitle = title.toLowerCase();
    
    for (const rule of rules) {
      if (rule.keywords.some(keyword => lowerTitle.includes(keyword))) {
        rule.tags.forEach(tag => matchedTags.add(tag));
      }
    }
    
    // Если не найдено тегов, возвращаем общие теги на основе анализа текста
    if (matchedTags.size === 0) {
      // Анализируем текст на наличие рабочих терминов
      const workKeywords = ['проект', 'отчет', 'задача', 'дедлайн', 'бюджет', 'план'];
      const hasWorkTerms = workKeywords.some(keyword => lowerTitle.includes(keyword));
      
      return hasWorkTerms ? ['#работа'] : ['#личное'];
    }
    
    return Array.from(matchedTags);
  }

  /**
   * Проверяет доступность движка (всегда true для RuleEngine)
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

  private extractDate(text: string): ParsedDateTime {
    const now = new Date();
    let resultDate = new Date(now);
    let confidence = 0.5;

    // Проверяем конкретные даты (15 мая)
    const specificMatch = text.match(this.datePatterns.SPECIFIC_DATE);
    if (specificMatch) {
      const day = parseInt(specificMatch[1]);
      const monthName = specificMatch[2];
      const year = specificMatch[3] ? parseInt(specificMatch[3]) : now.getFullYear();
      const month = this.monthMap[monthName.toLowerCase()];
      
      if (month !== undefined) {
        resultDate = new Date(year, month, day);
        confidence = 0.9;
        return { date: resultDate, confidence };
      }
    }

    // Проверяем дни недели (в понедельник)
    const weekdayMatch = text.match(this.datePatterns.WEEKDAY);
    if (weekdayMatch) {
      const weekdayName = weekdayMatch[2].toLowerCase();
      const weekday = this.weekdayMap[weekdayName];
      
      if (weekday !== undefined) {
        resultDate = this.getNextWeekday(weekday);
        confidence = 0.8;
        return { date: resultDate, confidence };
      }
    }

    // Проверяем относительные даты (завтра, послезавтра)
    const relativeMatch = text.match(this.datePatterns.RELATIVE);
    if (relativeMatch) {
      const relative = relativeMatch[1].toLowerCase();
      
      if (relative === 'завтра') {
        resultDate = new Date(now);
        resultDate.setDate(now.getDate() + 1);
        confidence = 0.95;
      } else if (relative === 'послезавтра') {
        resultDate = new Date(now);
        resultDate.setDate(now.getDate() + 2);
        confidence = 0.9;
      } else if (relative === 'вчера') {
        resultDate = new Date(now);
        resultDate.setDate(now.getDate() - 1);
        confidence = 0.95;
      } else if (relative === 'позавчера') {
        resultDate = new Date(now);
        resultDate.setDate(now.getDate() - 2);
        confidence = 0.9;
      } else if (relative.includes('через')) {
        const numMatch = relative.match(/(\d+)/);
        if (numMatch) {
          const days = parseInt(numMatch[1]);
          resultDate = new Date(now);
          resultDate.setDate(now.getDate() + days);
          confidence = 0.85;
        }
      }
      
      if (confidence > 0.5) {
        return { date: resultDate, confidence };
      }
    }

    // По умолчанию - сегодня
    return { date: now, confidence: 0.3 };
  }

  private extractTime(text: string, context: Context): ParsedDateTime {
    const result: ParsedDateTime = { date: new Date(), confidence: 0.3 };
    
    // Проверяем конкретное время (в 10:00)
    const time24hMatch = text.match(this.datePatterns.TIME_24H);
    if (time24hMatch) {
      const hour = parseInt(time24hMatch[1]);
      const minute = parseInt(time24hMatch[2]);
      
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        result.time = { hour, minute };
        result.confidence = 0.95;
        return result;
      }
    }

    // Проверяем время суток (утром, вечером)
    for (const [key, time] of Object.entries(this.timeOfDayDefaults)) {
      if (text.includes(key)) {
        result.time = time;
        result.confidence = 0.8;
        
        // Корректируем по контексту
        if (context === 'work' && key === 'утром') {
          result.time = { hour: 10, minute: 0 }; // Рабочее утро позже
        }
        return result;
      }
    }

    // Время по умолчанию в зависимости от контекста
    if (!result.time) {
      result.time = context === 'work' 
        ? { hour: 14, minute: 0 }  // Рабочее время - после обеда
        : { hour: 18, minute: 0 }; // Личное время - вечер
      result.confidence = 0.4;
    }

    return result;
  }

  private extractDuration(text: string): number | undefined {
    // Проверяем длительность в часах (на 2 часа)
    const durationMatch = text.match(this.datePatterns.DURATION);
    if (durationMatch) {
      const amount = parseInt(durationMatch[1]);
      const unit = durationMatch[2];
      
      if (unit.includes('час')) {
        return amount * 60;
      } else if (unit.includes('минут')) {
        return amount;
      }
    }

    // Проверяем специальные форматы
    if (text.includes('полтора часа')) {
      return 90;
    }
    if (text.includes('полчаса')) {
      return 30;
    }
    if (text.includes('весь день')) {
      return 480; // 8 часов
    }

    return undefined;
  }

  private extractTitle(originalText: string, lowerText: string): string {
    // Удаляем паттерны дат/времени из текста
    let title = originalText;
    
    // Удаляем относительные даты
    title = title.replace(this.datePatterns.RELATIVE, '').trim();
    
    // Удаляем дни недели
    title = title.replace(this.datePatterns.WEEKDAY, '').trim();
    
    // Удаляем конкретные даты
    title = title.replace(this.datePatterns.SPECIFIC_DATE, '').trim();
    title = title.replace(this.datePatterns.DATE_DDMMYYYY, '').trim();
    
    // Удаляем время
    title = title.replace(this.datePatterns.TIME_24H, '').trim();
    title = title.replace(this.datePatterns.TIME_12H, '').trim();
    title = title.replace(this.datePatterns.TIME_OF_DAY, '').trim();
    
    // Удаляем длительность
    title = title.replace(this.datePatterns.DURATION, '').trim();
    title = title.replace(/на\s+полтора\s+часа/gi, '').trim();
    title = title.replace(/на\s+полчаса/gi, '').trim();
    title = title.replace(/на\s+весь\s+день/gi, '').trim();
    
    // Удаляем лишние пробелы и запятые
    title = title.replace(/\s+/g, ' ').trim();
    title = title.replace(/^,\s*|\s*,/g, '').trim();
    
    // Если после очистки текст пустой, возвращаем оригинал
    if (!title) {
      return originalText;
    }
    
    return title;
  }

  private calculateConfidence(date: ParsedDateTime, time: ParsedDateTime, duration?: number): number {
    let confidence = date.confidence * 0.5 + time.confidence * 0.3;
    
    if (duration !== undefined) {
      confidence += 0.2;
    }
    
    // Ограничиваем от 0.1 до 0.95
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private getNextWeekday(targetDay: number): Date {
    const now = new Date();
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;
    
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    const result = new Date(now);
    result.setDate(now.getDate() + daysToAdd);
    return result;
  }

  private async getBusySlots(dateRange?: { start: Date; end: Date }): Promise<BusySlot[]> {
    // Заглушка - в реальности запрос к БД
    // Возвращаем тестовые данные для демонстрации
    return [
      {
        start: new Date(new Date().setHours(10, 0, 0, 0)),
        end: new Date(new Date().setHours(11, 30, 0, 0)),
        title: 'Ежедневное совещание',
        context: 'work'
      },
      {
        start: new Date(new Date().setHours(14, 0, 0, 0)),
        end: new Date(new Date().setHours(15, 0, 0, 0)),
        title: 'Обед',
        context: 'home'
      }
    ];
  }

  private createTimeGrid(options: SlotSearchOptions): Date[] {
    const startDate = options.dateRange?.start || new Date();
    const endDate = options.dateRange?.end || new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const grid: Date[] = [];
    const current = new Date(startDate);
    
    // Округляем до ближайшего 15-минутного интервала
    current.setMinutes(Math.floor(current.getMinutes() / 15) * 15);
    current.setSeconds(0);
    current.setMilliseconds(0);
    
    while (current < endDate) {
      grid.push(new Date(current));
      current.setMinutes(current.getMinutes() + 15);
    }
    
    return grid;
  }

  private findFreeIntervals(grid: Date[], busySlots: BusySlot[], durationMinutes: number): TimeSlot[] {
    const freeSlots: TimeSlot[] = [];
    
    for (let i = 0; i < grid.length - 1; i++) {
      const start = grid[i];
      const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
      
      // Проверяем, что интервал полностью в пределах сетки
      if (end > grid[grid.length - 1]) {
        break;
      }
      
      // Проверяем конфликты с занятыми слотами
      const hasConflict = busySlots.some(busy => 
        (start < busy.end && end > busy.start)
      );
      
      if (!hasConflict) {
        freeSlots.push({
          start,
          end,
          durationMinutes,
          score: 0,
          reason: '',
          isToday: this.isSameDay(start, new Date()),
          isTomorrow: this.isSameDay(start, new Date(Date.now() + 24 * 60 * 60 * 1000)),
          timeOfDay: this.getTimeOfDay(start),
          formattedTime: this.formatTime(start),
        });
        
        // Пропускаем вперед на длительность слота
        i += Math.floor(durationMinutes / 15) - 1;
      }
    }
    
    return freeSlots;
  }

  private scoreSlots(slots: TimeSlot[], options: SlotSearchOptions): TimeSlot[] {
    const now = new Date();
    
    return slots.map(slot => {
      let score = 0;
      const reasons: string[] = [];
      
      // 1. Близость к текущему времени (30%)
      const hoursDiff = Math.abs(slot.start.getTime() - now.getTime()) / (1000 * 60 * 60);
      const timeScore = Math.max(0, 1 - hoursDiff / 48); // 48 часов - максимальное влияние
      score += timeScore * 0.3;
      if (timeScore > 0.8) reasons.push('близко к текущему времени');
      
      // 2. Соответствие предпочтительному времени дня (25%)
      if (options.preferredTimeOfDay) {
        const slotTimeOfDay = this.getTimeOfDay(slot.start);
        if (slotTimeOfDay === options.preferredTimeOfDay) {
          score += 0.25;
          reasons.push('соответствует предпочтительному времени дня');
        }
      }
      
      // 3. Удобство дня недели (20%)
      const dayOfWeek = slot.start.getDay();
      if (!options.avoidDays?.includes(dayOfWeek)) {
        score += 0.2;
        reasons.push('удобный день недели');
      }
      
      // 4. Контекстные предпочтения (15%)
      const workingHours = DEFAULT_WORKING_HOURS[options.context];
      const slotHour = slot.start.getHours();
      if (slotHour >= workingHours.start && slotHour <= workingHours.end) {
        score += 0.15;
        reasons.push('в пределах рабочих часов');
      }
      
      // 5. Избегание перерывов (10%)
      // (упрощенная логика - проверяем, не обеденное ли время)
      if (slotHour !== 13 && slotHour !== 14) {
        score += 0.1;
        reasons.push('избегает обеденного времени');
      }
      
      return {
        ...slot,
        score: Math.round(score * 100) / 100,
        reason: reasons.join(', ') || 'стандартный слот',
      };
    }).sort((a, b) => b.score - a.score);
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}