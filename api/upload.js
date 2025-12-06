export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photo } = req.body;
    
    if (!photo) {
      return res.status(400).json({ error: 'No photo provided' });
    }

    // Возвращаем base64 строку как есть
    // На фронтенде будем хранить в базе
    return res.status(200).json({ photoUrl: photo });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
