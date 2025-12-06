import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM notes ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text, type, photo } = req.body;
      const { rows } = await sql`
        INSERT INTO notes (text, type, photo, created_at)
        VALUES (${text}, ${type || 'good'}, ${photo || null}, NOW())
        RETURNING *
      `;
      return res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await sql`DELETE FROM notes WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete note' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
