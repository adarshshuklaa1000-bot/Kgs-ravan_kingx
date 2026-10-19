import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const CONFIG_FILE = path.join(__dirname, 'admin_config.json');

const getDefaultConfig = () => ({
  maintenanceMode: false,
  maintenanceMessage: 'वेबसाइट अभी रखरखाव (Maintenance) में है। जल्द ही पुनः चालू होगी।',
  announcement: {
    enabled: false,
    id: '1',
    title: 'विशेष आवश्यक सूचना 📢',
    message: 'सभी छात्र तुरंत हमारे आधिकारिक टेलीग्राम चैनल से जुड़ें।',
    badge: 'LIVE ALERT'
  },
  telegramUrl: 'https://t.me/+g42TEGdV8HE3NWM1',
  adminPassword: 'khushi',
  updatedAt: Date.now()
});

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading admin config:', e);
  }
  const def = getDefaultConfig();
  writeConfig(def);
  return def;
}

function writeConfig(data: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing admin config:', e);
  }
}

// 1. Public config polling endpoint
app.get('/api/admin/config', (req, res) => {
  const config = readConfig();
  res.json({
    maintenanceMode: config.maintenanceMode,
    maintenanceMessage: config.maintenanceMessage,
    announcement: config.announcement,
    telegramUrl: config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
    updatedAt: config.updatedAt
  });
});

// 2. Secret verify login
app.post('/api/admin/verify-login', (req, res) => {
  const { password } = req.body;
  const config = readConfig();
  if (password === config.adminPassword) {
    res.json({ success: true, token: 'ravan_kingx_admin_token', config });
  } else {
    res.status(401).json({ success: false, message: 'गलत पासवर्ड!' });
  }
});

// 3. Admin update config (instant real-time sync for all visitors)
app.post('/api/admin/update-config', (req, res) => {
  const { token, updates, newPassword } = req.body;
  if (token !== 'ravan_kingx_admin_token') {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }
  const config = readConfig();
  if (newPassword && typeof newPassword === 'string' && newPassword.trim()) {
    config.adminPassword = newPassword.trim();
  }
  if (updates && typeof updates === 'object') {
    Object.assign(config, updates);
  }
  config.updatedAt = Date.now();
  writeConfig(config);
  res.json({ success: true, config });
});

// In-memory cache for fast delivery keyed by exact URL
const proxyCache = new Map<string, { data: string; contentType: string; timestamp: number }>();

// 4. Upstream KGS proxy with exact URL caching
app.use('/api', async (req, res, next) => {
  try {
    const cacheKey = `${req.method}:${req.url}`;
    const cached = proxyCache.get(cacheKey);
    // Serve from cache if fresh (15 mins)
    if (req.method === 'GET' && cached && (Date.now() - cached.timestamp < 15 * 60 * 1000)) {
      return res.set('Content-Type', cached.contentType).send(cached.data);
    }

    const upstreamUrl = `https://apicf.udemylover.workers.dev/api${req.url}`;
    const fetchRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json, text/plain, */*'
      }
    });
    const contentType = fetchRes.headers.get('content-type') || 'application/json';
    const data = await fetchRes.text();
    
    // Cache successful GET responses
    if (req.method === 'GET' && fetchRes.ok && data.length > 0) {
      proxyCache.set(cacheKey, { data, contentType, timestamp: Date.now() });
    }

    res.status(fetchRes.status)
       .set('Content-Type', contentType)
       .send(data);
  } catch (err) {
    const cacheKey = `${req.method}:${req.url}`;
    const cached = proxyCache.get(cacheKey);
    if (cached) {
      return res.set('Content-Type', cached.contentType).send(cached.data);
    }
    next(err);
  }
});

async function start() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
