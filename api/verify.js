import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bpi-super-secret-key-2026';

export default function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const user = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({ valid: true, user: user.username });
    } catch (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
