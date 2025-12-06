import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const port = 3000;

// Создаем папку для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Только изображения!'));
    }
  }
});

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'jar_db',
  user: process.env.POSTGRES_USER || 'abylajhanbegimkulov',
  password: process.env.POSTGRES_PASSWORD || ''
});

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Увеличиваем лимит
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));

// GET - получить все записки
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST - создать записку с фото (base64)
app.post('/api/notes', async (req, res) => {
  try {
    const { text, type, photo } = req.body;
    
    const result = await pool.query(
      'INSERT INTO notes (text, type, photo, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [text, type || 'good', photo || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// DELETE - удалить записку
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API сервер запущен на http://localhost:${port}`);
  console.log(`📝 Доступные endpoints:`);
  console.log(`   GET    http://localhost:${port}/api/notes`);
  console.log(`   POST   http://localhost:${port}/api/notes`);
  console.log(`   DELETE http://localhost:${port}/api/notes/:id`);
});
