# LAD 2 - Personal Operating System

**Local Adaptive Dashboard 2** — это не просто приложение, а **Персональная Операционная Система** нового поколения, построенная на принципах local-first, модульности и контекстной осведомленности.

[📚 Подробная документация по модулям](./MODULES.md)
[📱 Мобильная адаптация](./MOBILE.md)
[🎨 Современный дизайн](./DESIGN.md)

## 🎯 Основные принципы

1. **Local-First** — идеальная работа без интернета, данные хранятся локально
2. **Zero-Config Setup** — установка в 1 клик, настройка через визуальный Wizard
3. **Context-Aware** — интерфейс адаптируется под задачу (Дом/Работа/Учеба)
4. **Modular** — пользователь собирает приложение как Lego из модулей
5. **AI as an Agent** — AI не просто чатится, а действует: создает задачи, парсит чеки, пишет ответы

## 🏗️ Архитектура

### Технологический стек
- **Framework:** Next.js 14+ (App Router), React 18
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS + Radix UI + Framer Motion
- **State Management:** Zustand (глобальный) + React Query (серверный)
- **Local DB:** Dexie.js (обертка над IndexedDB)
- **Backend/Sync:** Supabase (Postgres + Auth + Realtime)
- **AI:** Vercel AI SDK + OpenAI/Claude API + Local WebLLM
- **Deployment:** Docker (Self-hosted), Vercel (Cloud), PWA (Mobile)

### Ключевые компоненты системы

#### 1. Local-First Data Layer
- **Primary DB:** IndexedDB через Dexie.js на клиенте
- **Sync Strategy:** Опциональная синхронизация с Supabase/Cloudflare
- **Conflict Resolution:** CRDT для бесшовного слияния данных
- **Privacy:** Данные шифруются перед отправкой в облако

#### 2. Modular Core (Plugin System)
- **Module Registry:** Центральный реестр модулей с метаданными
- **Dynamic Import:** Ленивая загрузка модулей при активации
- **Event Bus:** Межмодульная коммуникация через события
- **Isolation:** Каждый модуль имеет свой store и компоненты

#### 3. Context Engine
- Глобальное состояние `CurrentContext` (Home | Work | Study)
- Фильтрация контента по контексту
- Адаптация AI под текущий контекст

#### 4. AI Service Layer
- AI как сервисный слой, а не просто UI компонент
- Действия: `parseTextToTask`, `categorizeTransaction`, `generateReply`
- UI: Кнопка "Magic", плавающий виджет ассистента

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router pages and layouts
├── core/                   # Ядро системы
│   ├── auth/              # Аутентификация
│   ├── context/           # Контекстный движок
│   ├── sync-engine/       # Синхронизация Local-First
│   ├── event-bus/         # Межмодульная коммуникация
│   ├── module-registry/   # Реестр модулей
│   └── ai-service/        # AI интеграция
├── modules/               # Модули приложения
│   ├── calendar/          # Календарь
│   ├── tasks/             # Задачи
│   ├── finance/           # Финансы
│   ├── crm/               # CRM
│   ├── notes/             # Заметки
│   ├── health/            # Здоровье
│   ├── mail/              # Почта
│   └── dashboard/         # Дашборд
├── lib/                   # Вспомогательные библиотеки
│   ├── db/               # Схемы и конфигурация БД
│   ├── utils/            # Утилиты
│   ├── constants/        # Константы
│   └── types/            # TypeScript типы
├── components/           # UI компоненты
│   ├── ui/              # Базовые компоненты
│   ├── layout/          # Компоненты layout
│   ├── modules/         # Модульные компоненты
│   └── ai/              # AI компоненты
├── stores/              # Zustand stores
├── hooks/               # React hooks
└── styles/              # Глобальные стили
```

## 🚀 Быстрый старт

### Вариант 1: Локальная разработка
```bash
# Клонирование репозитория
git clone https://github.com/your-org/lad2.git
cd lad2

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env.local
# Отредактируйте .env.local, добавив свои ключи API

# Запуск в режиме разработки
npm run dev
```

### Вариант 2: Docker (Self-hosted)
```bash
# Клонирование и настройка
git clone https://github.com/your-org/lad2.git
cd lad2

# Настройка окружения
cp .env.example .env
# Отредактируйте .env, установите пароли и ключи

# Запуск через Docker Compose
docker compose up -d

# Приложение будет доступно по адресу http://localhost:3000
```

### Вариант 3: Vercel (Cloud)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/lad2)

## 📦 Модули

LAD 2 поддерживает динамические модули, которые пользователь может включать/выключать:

| Модуль | Статус | Описание |
|--------|--------|----------|
| **Dashboard** | ✅ | Основной дашборд с виджетами |
| **Tasks** | ✅ | Управление задачами и проектами |
| **Calendar** | ✅ | Календарь событий и напоминаний |
| **Finance** | ✅ | Личные финансы и бюджет |
| **CRM** | ✅ | Управление контактами |
| **Notes** | ✅ | Заметки в Markdown |
| **Health** | ✅ | Трекер здоровья и привычек |
| **Mail** | ✅ | Email клиент с AI |

Все модули работают локально с поддержкой IndexedDB.

## 🤖 AI Интеграция

### Возможности AI
- **Text Processing:** Улучшение, суммаризация, перевод текста
- **Data Extraction:** Создание задач из текста, категоризация транзакций
- **Content Generation:** Генерация email, создание повестки встреч
- **Analysis & Insights:** Анализ расходов, предсказание завершения задач

### Режимы работы
1. **Cloud AI:** OpenAI GPT-4, Claude (требуется интернет)
2. **Local AI:** WebLLM с моделями Llama, Phi-3 (работает оффлайн)
3. **Hybrid:** Автоматический выбор модели в зависимости от контекста

## 🔒 Безопасность и приватность

- **Local-First:** Данные по умолчанию хранятся на устройстве
- **Шифрование:** End-to-end шифрование для облачной синхронизации
- **Контроль:** Пользователь решает, какие данные отправлять в облако
- **Анонимизация:** Данные для AI анонимизируются перед отправкой

## 📊 База данных

### Локальная схема (IndexedDB)
```typescript
// Основные таблицы
users, settings, module_configs, activity_logs, workspaces
// Модульные таблицы
tasks, calendar_events, transactions, notes, contacts
// AI таблицы
ai_action_logs, ai_prompt_templates
// Синхронизация
sync_metadata
```

### Облачная схема (Supabase PostgreSQL)
- Полная совместимость с локальной схемой
- Row Level Security для изоляции данных пользователей
- Realtime подписки для мгновенных обновлений

## 🛠️ Разработка

### Добавление нового модуля
1. Создайте папку в `src/modules/your-module/`
2. Добавьте конфигурацию в `config/module-config.json`
3. Реализуйте основные компоненты модуля
4. Зарегистрируйте модуль в реестре
5. Добавьте типы в `src/lib/types/modules.ts`

### Конфигурационные файлы
- `config/module-config.json` — реестр модулей
- `config/ai-actions.json` — определения AI действий
- `config/context-rules.json` — правила контекстной фильтрации

## 📈 Deployment

### Self-Hosted (Docker)
```bash
# Production сборка
docker build -t lad2 .

# Запуск с Docker Compose
docker compose -f docker-compose.prod.yml up -d

# Миграции базы данных
docker compose exec app npm run db:migrate
```

### Vercel (Cloud)
- Автоматические деплои из веток Git
- Serverless функции для API
- CDN для статических файлов
- Environment Variables через dashboard

### PWA (Mobile)
- Установка как нативное приложение
- Оффлайн работа через Service Worker
- Push-уведомления
- Доступ к аппаратным функциям

## 📋 Roadmap

### Phase 1: Core Foundation (Q2 2024)
- [x] Архитектура и проектирование
- [ ] Базовый каркас приложения
- [ ] Local-First data layer
- [ ] Module system
- [ ] Context engine

### Phase 2: AI Integration (Q3 2024)
- [ ] AI Service Layer
- [ ] Cloud AI (OpenAI/Claude)
- [ ] Local AI (WebLLM)
- [ ] Floating Assistant UI

### Phase 3: Modules (Q4 2024)
- [ ] Tasks module
- [ ] Calendar module
- [ ] Finance module
- [ ] Notes module

### Phase 4: Polish & Scale (Q1 2025)
- [ ] PWA optimization
- [ ] Team collaboration
- [ ] Module marketplace
- [ ] Advanced analytics

## 🤝 Участие в разработке

Мы приветствуем вклад в развитие LAD 2! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) перед началом работы.

### Требования
- Node.js 20+
- Docker и Docker Compose (для self-hosted)
- Supabase аккаунт (для облачных функций)

### Процесс разработки
1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией AGPL-3.0. Подробнее см. в файле [LICENSE](LICENSE).

## 📞 Контакты

- **Website:** [lad2.dev](https://lad2.dev)
- **Documentation:** [docs.lad2.dev](https://docs.lad2.dev)
- **GitHub:** [github.com/your-org/lad2](https://github.com/your-org/lad2)
- **Discord:** [discord.gg/lad2](https://discord.gg/lad2)

---

**LAD 2** — это больше чем приложение. Это ваша персональная операционная система для жизни и работы. 🚀