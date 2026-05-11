'use client';

import { useState, useCallback, useEffect } from 'react';
import { ParsedEvent, Context } from '@/core/intelligence/types';
import { useSmartScheduling } from '@/hooks/use-smart-scheduling';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';
import { Loader2, Calendar, Clock, Tag, Check, X } from 'lucide-react';

interface QuickAddInputProps {
  /** Контекст по умолчанию (работа/дом) */
  defaultContext?: Context;
  /** Callback при успешном парсинге события */
  onEventParsed?: (event: ParsedEvent) => void;
  /** Callback при добавлении события */
  onAddEvent?: (event: ParsedEvent) => void;
  /** Плейсхолдер для поля ввода */
  placeholder?: string;
  /** Автоматически очищать поле после добавления */
  autoClear?: boolean;
  /** Показывать ли предпросмотр */
  showPreview?: boolean;
}

/**
 * Компонент для быстрого добавления событий через естественный язык
 * Пример: "Встреча с Олегом завтра в 15:00"
 */
export function QuickAddInput({
  defaultContext = 'work',
  onEventParsed,
  onAddEvent,
  placeholder = "Добавить событие: 'Встреча с Олегом завтра в 15:00'",
  autoClear = true,
  showPreview = true,
}: QuickAddInputProps) {
  const [input, setInput] = useState('');
  const [context, setContext] = useState<Context>(defaultContext);
  const [isParsing, setIsParsing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const { parseQuickInput, suggestTags, isLoading, error, lastParsedEvent } = useSmartScheduling();
  
  // Дебаунс для парсинга
  useEffect(() => {
    if (!input || input.length < 3) {
      return;
    }
    
    const timer = setTimeout(async () => {
      setIsParsing(true);
      setLastError(null);
      
      try {
        await parseQuickInput(input, context);
        // onEventParsed вызывается внутри хука через setLastParsedEvent
      } catch (err) {
        setLastError(err instanceof Error ? err.message : 'Ошибка парсинга');
      } finally {
        setIsParsing(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [input, context, parseQuickInput]);
  
  // Обработчик изменения контекста
  const handleContextToggle = useCallback(() => {
    setContext(prev => prev === 'work' ? 'home' : 'work');
  }, []);
  
  // Обработчик добавления события
  const handleAddEvent = useCallback(async () => {
    if (!lastParsedEvent) {
      // Если событие еще не распаршено, пытаемся распарсить
      try {
        const event = await parseQuickInput(input, context);
        if (onAddEvent) {
          onAddEvent(event);
        }
      } catch (err) {
        setLastError(err instanceof Error ? err.message : 'Ошибка добавления события');
        return;
      }
    } else {
      if (onAddEvent) {
        onAddEvent(lastParsedEvent);
      }
    }
    
    // Очищаем поле если нужно
    if (autoClear) {
      setInput('');
    }
    
    setLastError(null);
  }, [lastParsedEvent, input, context, parseQuickInput, onAddEvent, autoClear]);
  
  // Обработчик сброса
  const handleReset = useCallback(() => {
    setInput('');
    setLastError(null);
  }, []);
  
  // Форматирование даты для отображения
  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(date);
  }, []);
  
  // Форматирование времени для отображения
  const formatTime = useCallback((event: ParsedEvent) => {
    if (event.isAllDay) {
      return 'Весь день';
    }
    
    if (event.time) {
      const { hour, minute } = event.time;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    return 'Время не указано';
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="w-full"
            leftIcon={<Calendar className="h-4 w-4" />}
            rightIcon={isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={context === 'work' ? 'primary' : 'outline'}
            size="small"
            onClick={handleContextToggle}
            title={context === 'work' ? 'Рабочий контекст' : 'Личный контекст'}
          >
            {context === 'work' ? '💼 Работа' : '🏠 Дом'}
          </Button>
          
          <Button
            variant="primary"
            size="small"
            onClick={handleAddEvent}
            disabled={(!lastParsedEvent && input.length < 3) || isLoading}
            title="Добавить событие"
          >
            <Check className="h-4 w-4 mr-1" />
            Добавить
          </Button>
          
          <Button
            variant="ghost"
            size="small"
            onClick={handleReset}
            title="Очистить"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Сообщения об ошибках */}
      {(error || lastError) && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
          {error || lastError}
        </div>
      )}
      
      {/* Предпросмотр распарсенного события */}
      {showPreview && lastParsedEvent && (
        <ParsedEventPreview
          event={lastParsedEvent}
          onAdd={handleAddEvent}
          onDismiss={() => setInput('')}
        />
      )}
      
      {/* Подсказки */}
      {!input && (
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">Примеры:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Встреча с Олегом завтра в 15:00</li>
            <li>Совещание в пятницу утром на 2 часа</li>
            <li>Тренировка сегодня вечером на 45 минут</li>
            <li>Обед в 13:00 каждый день</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Компонент предпросмотра распарсенного события
 */
interface ParsedEventPreviewProps {
  event: ParsedEvent;
  onAdd?: () => void;
  onDismiss?: () => void;
}

function ParsedEventPreview({ event, onAdd, onDismiss }: ParsedEventPreviewProps) {
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const { suggestTags } = useSmartScheduling();
  
  // Загружаем предложенные теги
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await suggestTags(event.title);
        setSuggestedTags(tags);
      } catch (err) {
        // Игнорируем ошибки при загрузке тегов
      }
    };
    
    loadTags();
  }, [event.title, suggestTags]);
  
  // Форматирование даты
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(event.date);
  
  // Форматирование времени
  const formattedTime = event.time 
    ? `${event.time.hour.toString().padStart(2, '0')}:${event.time.minute.toString().padStart(2, '0')}`
    : event.isAllDay ? 'Весь день' : 'Время не указано';
  
  // Форматирование длительности
  const formattedDuration = event.duration 
    ? `${Math.floor(event.duration / 60)} ч ${event.duration % 60} мин`
    : 'Длительность не указана';
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-lg">{event.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full ${event.context === 'work' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {event.context === 'work' ? '💼 Работа' : '🏠 Личное'}
              </span>
              <span className="px-2 py-0.5 text-xs bg-muted rounded-full">
                Уверенность: {Math.round(event.confidence * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {onAdd && (
              <Button size="small" variant="primary" onClick={onAdd}>
                <Check className="h-3 w-3 mr-1" />
                Добавить
              </Button>
            )}
            {onDismiss && (
              <Button size="small" variant="ghost" onClick={onDismiss}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Дата</p>
              <p className="font-medium">{formattedDate}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Время</p>
              <p className="font-medium">{formattedTime}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Длительность</p>
              <p className="font-medium">{formattedDuration}</p>
            </div>
          </div>
        </div>
        
        {/* Предложенные теги */}
        {suggestedTags.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Предложенные теги:</p>
            <div className="flex flex-wrap gap-1">
              {suggestedTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Сырой текст для отладки */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Распознано из: "{event.rawText}"
          </p>
        </div>
      </div>
    </Card>
  );
}