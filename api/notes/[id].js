import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      
      await sql`DELETE FROM notes WHERE id = ${id}`;
      console.log('Deleted note:', id);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('DELETE Error:', error);
      return res.status(500).json({ error: 'Failed to delete note', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
