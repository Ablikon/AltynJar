import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM notes ORDER BY created_at DESC`;
      console.log('Fetched notes:', rows); // Для дебага
      return res.status(200).json(rows || []);
    } catch (error) {
      console.error('GET Error:', error);
      return res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text, type, photo } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }
      
      const { rows } = await sql`
        INSERT INTO notes (text, type, photo, created_at)
        VALUES (${text}, ${type || 'good'}, ${photo || null}, NOW())
        RETURNING *
      `;
      console.log('Created note:', rows[0]); // Для дебага
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('POST Error:', error);
      return res.status(500).json({ error: 'Failed to create note', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
