// Vercel Serverless Function fallback for /api/admin/update-config
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { token, updates } = req.body || {};
  if (token !== 'ravan_kingx_admin_token') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const updatedConfig = {
    maintenanceMode: updates?.maintenanceMode || false,
    maintenanceMessage: updates?.maintenanceMessage || 'System maintenance in progress.',
    announcement: updates?.announcement || { enabled: false },
    telegramUrl: updates?.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
    updatedAt: Date.now()
  };

  return res.status(200).json({ success: true, config: updatedConfig });
}
