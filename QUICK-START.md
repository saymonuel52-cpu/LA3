# 🚀 Быстрый старт LAD 2

## Вариант 1: Локальная разработка (рекомендуется)

### 1. Установка зависимостей
```bash
npm install
```

### 2. Запуск в режиме разработки
```bash
npm run dev
```

### 3. Откройте в браузере
```
http://localhost:3000
```

## Вариант 2: Docker (Self-Hosted)

### 1. Настройка окружения
```bash
cp .env.example .env
# Отредактируйте .env, установите пароли и ключи
```

### 2. Запуск через Docker Compose
```bash
docker compose up -d
```

### 3. Приложение будет доступно
```
http://localhost:3000
```

## Вариант 3: Vercel (Cloud)

### 1. Установите Vercel CLI
```bash
npm i -g vercel
```

### 2. Деплой
```bash
vercel
```

### 3. Следуйте инструкциям в CLI

## 📁 Что уже создано

### Архитектурные файлы
- `project-structure.json` - полная структура проекта
- `architecture-schema.json` - детализированная архитектура
- `config/module-config.json` - конфигурация модулей
- `config/ai-actions.json` - определения AI действий

### База данных
- `src/lib/db/schema.ts` - схемы IndexedDB и Supabase
- `src/lib/db/database.ts` - реализация Dexie.js с CRDT

### Конфигурации
- `Dockerfile` - multi-stage build для production
- `docker-compose.yml` - self-hosted развертывание
- `vercel.json` - конфигурация для Vercel
- `public/manifest.json` - PWA манифест

### Документация
- `README.md` - полное описание проекта
- `ai-integration-plan.md` - план реализации AI
- `QUICK-START.md` - эта инструкция

## 🎯 Демонстрация

После запуска вы увидите:

1. **Главную страницу** с описанием философии LAD 2
2. **Интерактивную демонстрацию** модульной системы
3. **Контекстный движок** (Дом/Работа/Учеба)
4. **Визуализацию Local-First data flow**
5. **AI интеграцию** с демо действиями

## 🔧 Структура проекта

```
lad2/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── core/               # Ядро системы
│   │   ├── auth/           # Аутентификация
│   │   ├── context/        # Контекстный движок
│   │   ├── sync-engine/    # Синхронизация
│   │   ├── event-bus/      # Межмодульная коммуникация
│   │   ├── module-registry/# Реестр модулей
│   │   └── ai-service/     # AI интеграция
│   ├── modules/            # Модули приложения
│   ├── lib/db/             # Схемы и конфигурация БД
│   └── components/         # UI компоненты
├── config/                 # Конфигурационные файлы
├── docker/                 # Docker конфигурации
└── public/                 # Статические файлы
```

## 🚨 Решение проблем

### Ошибка "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Ошибка TypeScript
```bash
npm run type-check
```

### Docker не запускается
```bash
docker compose down
docker system prune -a
docker compose up --build
```

## 📞 Дополнительная помощь

- Изучите `README.md` для полного понимания архитектуры
- Проверьте `ai-integration-plan.md` для AI интеграции
- Используйте `docker-compose.yml` для production развертывания

---

**LAD 2 готов к разработке!** 🎉

Архитектурный фундамент создан, конфигурационные файлы подготовлены, демо приложение запускается. Осталось только начать писать бизнес-логику модулей.