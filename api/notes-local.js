import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'jar_db',
  user: process.env.POSTGRES_USER || 'abylajhanbegimkulov',
  password: process.env.POSTGRES_PASSWORD || ''
});

export default async function handler(req, res) {
  // Настройка CORS для локальной разработки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text, type } = req.body;
      const result = await pool.query(
        'INSERT INTO notes (text, type, created_at) VALUES ($1, $2, NOW()) RETURNING *',
        [text, type || 'good']
      );
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await pool.query('DELETE FROM notes WHERE id = $1', [id]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to delete note' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
