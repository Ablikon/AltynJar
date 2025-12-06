# ✨ Jar of Good Things

Виртуальная 3D банка с записками счастья.

## 🚀 Деплой на Vercel

1. **Подключите Vercel Postgres:**
   - Зайдите в проект на Vercel
   - Storage → Create Database → Postgres
   - Подключите к проекту

2. **Создайте таблицу в базе:**
   - Откройте вкладку Query в Vercel Postgres
   - Выполните SQL:
   ```sql
   CREATE TABLE notes (
     id SERIAL PRIMARY KEY,
     text TEXT NOT NULL,
     type VARCHAR(20) DEFAULT 'good',
     photo TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Задеплойте:**
   - Просто запушьте в GitHub
   - Vercel автоматически задеплоит

## 📦 Локальная разработка

```bash
# API
npm install
npm run dev:api

# Frontend (в другом терминале)
cd Tree
npm install
npm run dev
```

## 🗄️ Структура проекта

- `/api` - Serverless функции для Vercel
- `/Tree` - React фронтенд с Three.js
- `/uploads` - Локальные загрузки (не в git)
# AltynJar
