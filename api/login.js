import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bpi-super-secret-key-2026';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'Bpinepal@0';

export default function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      return res.status(200).json({ token });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
