// Vercel Serverless Function fallback for /api/admin/config
let inMemoryConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'System maintenance in progress. Portal will resume shortly.',
  announcement: {
    enabled: false,
    id: '1',
    title: 'Important Official Notice 📢',
    message: 'Join our official Telegram community for daily notes, tests, and live updates!',
    badge: 'LIVE ALERT'
  },
  telegramUrl: 'https://t.me/+g42TEGdV8HE3NWM1',
  updatedAt: Date.now()
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json(inMemoryConfig);
}
