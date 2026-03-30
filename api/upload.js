import { put } from '@vercel/blob';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bpi-super-secret-key-2026';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Authenticate
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { filename, base64 } = req.body;
    
    if (!filename || !base64) {
      return res.status(400).json({ error: 'Filename and base64 string required.' });
    }

    // Convert base64 to Buffer
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn("BLOB_READ_WRITE_TOKEN missing. Using base64 directly as a fallback.");
      return res.status(200).json({ url: base64 });
    }

    const { url } = await put(filename, buffer, { access: 'public' });
    
    return res.status(200).json({ url });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
