// Vercel Serverless Function fallback for /api/admin/verify-login
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { password } = req.body || {};
  const cleanPass = String(password || '').trim().toLowerCase();

  if (cleanPass === 'khushi') {
    return res.status(200).json({
      success: true,
      token: 'ravan_kingx_admin_token',
      config: {
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
      }
    });
  }

  return res.status(401).json({ success: false, message: 'गलत पासवर्ड!' });
}
