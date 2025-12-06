import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

async function migrate() {
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
    
    // Добавляем колонку photo
    await client.query(`
      ALTER TABLE notes 
      ADD COLUMN IF NOT EXISTS photo TEXT
    `);
    
    console.log('✅ Колонка photo добавлена!');
    
    // Проверка
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notes'
    `);
    console.log('📋 Структура таблицы:', result.rows);
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    await client.end();
    process.exit(1);
  }
}

migrate();
