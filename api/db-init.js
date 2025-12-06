import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function initDB() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'jar_db',
    user: process.env.POSTGRES_USER || 'abylajhanbegimkulov',
    password: process.env.POSTGRES_PASSWORD || ''
  });

  try {
    console.log('🔌 Подключение к базе данных...');
    await client.connect();
    
    // Создание таблицы с полем для фото
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'good',
        photo TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log('✅ Таблица notes создана успешно!');
    
    // Добавление тестовых данных
    await client.query(`
      INSERT INTO notes (text, type) VALUES 
      ('Алтыночка самая лучшая!', 'good'),
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Тестовые данные добавлены!');
    
    // Проверка
    const result = await client.query('SELECT * FROM notes');
    console.log('📝 Записки в базе:', result.rows);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await client.end();
    process.exit(1);
  }
}

initDB();
