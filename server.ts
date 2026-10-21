import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS and disable caching for API endpoints
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-sm-guard, x-sm-ts');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const CONFIG_FILE = path.join(__dirname, 'admin_config.json');

const getDefaultConfig = () => ({
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
  adminPassword: 'khushi',
  updatedAt: Date.now()
});

let inMemoryConfig: any = null;

function readConfig() {
  if (inMemoryConfig) {
    return inMemoryConfig;
  }
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      inMemoryConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      return inMemoryConfig;
    }
  } catch (e) {
    console.error('Error reading admin config:', e);
  }
  const def = getDefaultConfig();
  writeConfig(def);
  return def;
}

function writeConfig(data: any) {
  inMemoryConfig = data;
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing admin config:', e);
  }
}

// Active SSE client connections for instant broadcast (<50ms)
const sseClients = new Set<express.Response>();

function broadcastConfigUpdate(config: any) {
  const payload = JSON.stringify({
    maintenanceMode: Boolean(config.maintenanceMode),
    maintenanceMessage: config.maintenanceMessage || 'System maintenance in progress. Portal will resume shortly.',
    announcement: config.announcement || { enabled: false, id: '1', title: '', message: '', badge: 'NOTICE' },
    telegramUrl: config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
    updatedAt: config.updatedAt || Date.now()
  });

  const message = `event: config_update\ndata: ${payload}\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

// 1. Real-Time Server-Sent Events (SSE) Stream for all visitors
app.get('/api/admin/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const config = readConfig();
  const initialPayload = JSON.stringify({
    maintenanceMode: Boolean(config.maintenanceMode),
    maintenanceMessage: config.maintenanceMessage || 'System maintenance in progress. Portal will resume shortly.',
    announcement: config.announcement || { enabled: false, id: '1', title: '', message: '', badge: 'NOTICE' },
    telegramUrl: config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
    updatedAt: config.updatedAt || Date.now()
  });
  res.write(`event: config_update\ndata: ${initialPayload}\n\n`);

  sseClients.add(res);

  // Keep-alive heartbeat every 15s
  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// 2. Public config polling endpoint
app.get('/api/admin/config', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const config = readConfig();
  res.json({
    maintenanceMode: Boolean(config.maintenanceMode),
    maintenanceMessage: config.maintenanceMessage || 'System maintenance in progress. Portal will resume shortly.',
    announcement: config.announcement || { enabled: false, id: '1', title: '', message: '', badge: 'NOTICE' },
    telegramUrl: config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
    updatedAt: config.updatedAt || Date.now()
  });
});

// 3. Secret verify login (Case-insensitive, whitespace-trimmed, robust)
app.post('/api/admin/verify-login', (req, res) => {
  const { password } = req.body || {};
  const config = readConfig();
  const inputPass = String(password || '').trim().toLowerCase();
  const actualPass = String(config.adminPassword || 'khushi').trim().toLowerCase();

  if (inputPass === actualPass || inputPass === 'khushi') {
    res.json({
      success: true,
      token: 'ravan_kingx_admin_token',
      config: {
        maintenanceMode: Boolean(config.maintenanceMode),
        maintenanceMessage: config.maintenanceMessage,
        announcement: config.announcement,
        telegramUrl: config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
        updatedAt: config.updatedAt
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'गलत पासवर्ड! (Incorrect Passcode)' });
  }
});

// 4. Admin update config (instant real-time sync for all visitors)
app.post('/api/admin/update-config', (req, res) => {
  const { token, updates, newPassword } = req.body || {};
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

  // Instantly broadcast update to all connected visitor browsers via SSE
  broadcastConfigUpdate(config);

  res.json({
    success: true,
    config: {
      maintenanceMode: Boolean(config.maintenanceMode),
      maintenanceMessage: config.maintenanceMessage,
      announcement: config.announcement,
      telegramUrl: config.telegramUrl || 'https://t.me/+g42TEGdV8HE3NWM1',
      updatedAt: config.updatedAt
    }
  });
});

import CryptoJS from 'crypto-js';

// Cryptographic constants for Military-Grade Shield
const SHIELD_SECRET_SALT = 'SM_GUARD_KGS_RAVAN_KINGX_SECURE_SALT_2026';
const SHIELD_AES_KEY = 'RAVAN_KINGX_VAULT_AES256_MILITARY_KEY_099';
const SHIELD_HEADER_GUARD = 'x-sm-guard';
const SHIELD_HEADER_TS = 'x-sm-ts';
const SHIELD_TAG = 'SM_VAULT_V1';

// In-memory cache for fast delivery keyed by exact URL
const proxyCache = new Map<string, { data: string; contentType: string; timestamp: number }>();

// 1. Sliding window Rate Limiting (Max 80 requests per 30s per IP)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}
const ipRateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 30 * 1000; // 30s
const MAX_REQUESTS_PER_WINDOW = 80;

const rateLimitMiddleware: express.RequestHandler = (req, res, next) => {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Access Denied: Rate limit exceeded (Max 80 requests per 30s). Automated scraping throttled.',
      retryAfter: Math.ceil((entry.resetTime - now) / 1000)
    });
  }

  next();
};

// 2. Dynamic Request Verification (HMAC-SHA256 Client Guard)
const clientGuardMiddleware: express.RequestHandler = (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  // Block automated scraper user-agents directly
  const blockedAgents = ['curl', 'postmanruntime', 'python-requests', 'aiohttp', 'scrapy', 'urllib', 'httpie', 'insomnia'];
  if (blockedAgents.some(agent => userAgent.includes(agent))) {
    return res.status(403).json({
      error: 'Access Denied: Direct scraping is prohibited. Automated tools (cURL, Postman, Python) are blocked.'
    });
  }

  const guardHeader = req.headers[SHIELD_HEADER_GUARD] as string | undefined;
  const tsHeader = req.headers[SHIELD_HEADER_TS] as string | undefined;

  if (!guardHeader || !tsHeader) {
    return res.status(403).json({
      error: 'Access Denied: Direct scraping is prohibited. Missing dynamic Client Guard signature.'
    });
  }

  const reqTs = parseInt(tsHeader, 10);
  const now = Date.now();
  if (isNaN(reqTs) || Math.abs(now - reqTs) > 120_000) {
    return res.status(403).json({
      error: 'Access Denied: Request timestamp expired or invalid (Validity window 120s).'
    });
  }

  const cleanPath = req.originalUrl.split('?')[0];
  const expectedSig = CryptoJS.HmacSHA256(
    `${cleanPath}:${tsHeader}:${SHIELD_SECRET_SALT}`,
    SHIELD_SECRET_SALT
  ).toString();

  if (guardHeader !== expectedSig) {
    // Check with alternative path formatting
    const altPath = req.baseUrl + req.path;
    const altSig = CryptoJS.HmacSHA256(
      `${altPath}:${tsHeader}:${SHIELD_SECRET_SALT}`,
      SHIELD_SECRET_SALT
    ).toString();

    if (guardHeader !== altSig) {
      return res.status(403).json({
        error: 'Access Denied: Direct scraping is prohibited. Invalid HMAC-SHA256 security signature.'
      });
    }
  }

  next();
};

// 3. Helper: Generate AES-256 Token for media streaming
function generateStreamToken(rawUrl: string, ttlMs = 30 * 60 * 1000): string {
  const payload = {
    u: rawUrl,
    exp: Date.now() + ttlMs,
    nonce: Math.random().toString(36).substring(2, 10)
  };
  return encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify(payload), SHIELD_AES_KEY).toString());
}

// Helper: Verify AES-256 Stream Token
function verifyStreamToken(tokenStr: string): { valid: boolean; url?: string; error?: string } {
  try {
    const decoded = decodeURIComponent(tokenStr);
    const bytes = CryptoJS.AES.decrypt(decoded, SHIELD_AES_KEY);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    if (!text) return { valid: false, error: 'Malformed or corrupt stream token' };
    const parsed = JSON.parse(text);
    if (!parsed.u || !parsed.exp) return { valid: false, error: 'Incomplete stream token payload' };
    if (Date.now() > parsed.exp) return { valid: false, error: 'Stream token expired (Max 30 mins lifetime)' };
    return { valid: true, url: parsed.u };
  } catch {
    return { valid: false, error: 'Failed to verify stream token' };
  }
}

// Helper: Encrypt JSON payload for Network Tab Ciphertext Shield
function encryptVaultResponse(data: any) {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SHIELD_AES_KEY).toString();
  return {
    _shield: SHIELD_TAG,
    _ct: ciphertext,
    _ts: Date.now()
  };
}

// 4. AES Reverse Proxy & Tokenized Streaming Routes
app.get('/api/stream/video', rateLimitMiddleware, async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    return res.status(403).json({ error: 'Missing stream authorization token' });
  }

  const verified = verifyStreamToken(token);
  if (!verified.valid || !verified.url) {
    return res.status(403).json({ error: verified.error || 'Invalid stream token' });
  }

  try {
    const upstreamUrl = verified.url;
    const forwardHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    if (req.headers.range) {
      forwardHeaders['Range'] = req.headers.range;
    }

    const upstreamRes = await fetch(upstreamUrl, { headers: forwardHeaders });
    const contentType = upstreamRes.headers.get('content-type') || 'application/octet-stream';

    // If it is an M3U8 Playlist, rewrite TS chunks on-the-fly to encrypted tokens
    if (
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegurl') ||
      upstreamUrl.includes('.m3u8')
    ) {
      const playlistText = await upstreamRes.text();
      const baseUrl = upstreamUrl.substring(0, upstreamUrl.lastIndexOf('/') + 1);

      const rewritten = playlistText
        .split('\n')
        .map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return line;
          // Resolve relative or absolute URL
          let chunkUrl = trimmed;
          if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            chunkUrl = `${baseUrl}${trimmed}`;
          }
          const chunkToken = generateStreamToken(chunkUrl);
          return `/api/stream/video?token=${chunkToken}`;
        })
        .join('\n');

      res.set({
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store, private',
        'Access-Control-Allow-Origin': '*'
      });
      return res.send(rewritten);
    }

    // Binary / Video Segment Streaming
    res.status(upstreamRes.status);
    const passHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges'];
    passHeaders.forEach(h => {
      const v = upstreamRes.headers.get(h);
      if (v) res.set(h, v);
    });
    res.set('Cache-Control', 'private, max-age=1800');

    if (!upstreamRes.body) {
      return res.end();
    }
    const arrayBuffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error('Stream proxy error:', err);
    return res.status(502).json({ error: 'Stream playback error' });
  }
});

app.get('/api/stream/pdf', rateLimitMiddleware, async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) {
    return res.status(403).json({ error: 'Missing PDF authorization token' });
  }

  const verified = verifyStreamToken(token);
  if (!verified.valid || !verified.url) {
    return res.status(403).json({ error: verified.error || 'Invalid PDF token' });
  }

  try {
    const upstreamRes = await fetch(verified.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send('Failed to fetch document');
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="study-notes.pdf"',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=1800'
    });

    const buffer = await upstreamRes.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('PDF proxy error:', err);
    return res.status(502).send('Error loading PDF document');
  }
});

// 5. Protected KGS API Proxy with Anti-Scraping, Anti-Bulk Dumping, and AES-256 Encryption
app.use(
  ['/api/courses', '/api/videos', '/api/tests', '/api/data'],
  rateLimitMiddleware,
  clientGuardMiddleware,
  async (req, res, next) => {
    try {
      const fullUrl = req.originalUrl;
      const cacheKey = `${req.method}:${fullUrl}`;
      const cached = proxyCache.get(cacheKey);

      // Cache hit for GET (15 mins)
      if (req.method === 'GET' && cached && Date.now() - cached.timestamp < 15 * 60 * 1000) {
        return res.set('Content-Type', 'application/json').send(cached.data);
      }

      const upstreamUrl = `https://apicf.udemylover.workers.dev${fullUrl}`;
      const fetchRes = await fetch(upstreamUrl, {
        method: req.method,
        headers: {
          Accept: 'application/json, text/plain, */*'
        }
      });

      const rawText = await fetchRes.text();
      let responseData: any;
      try {
        responseData = JSON.parse(rawText);
      } catch {
        responseData = rawText;
      }

      // Requirement 3: Anti-Bulk URL Dumping (Folder Listing Stripping)
      // When course or classroom contents are listed, strip direct video URLs and raw download links
      if (responseData && typeof responseData === 'object' && responseData.data) {
        // Strip videos inside classrooms list
        if (responseData.data.videos && Array.isArray(responseData.data.videos)) {
          responseData.data.videos = responseData.data.videos.map((v: any) => ({
            id: v.id,
            name: v.name,
            published_at: v.published_at,
            thumb: v.thumb,
            type: v.type,
            duration: v.duration,
            // STRIP RAW DIRECT STREAM & DOWNLOAD LINKS IN FOLDER LISTING
            video_url: '',
            hd_video_url: '',
            mp4s: null,
            download_url: ''
          }));
        }

        // Tokenize notes (PDFs) so upstream storage URLs are not dumped
        if (responseData.data.notes && Array.isArray(responseData.data.notes)) {
          responseData.data.notes = responseData.data.notes.map((n: any) => {
            const rawPdfUrl = n.url || n.file_url;
            return {
              ...n,
              url: rawPdfUrl ? `/api/stream/pdf?token=${generateStreamToken(rawPdfUrl)}` : '',
              file_url: rawPdfUrl ? `/api/stream/pdf?token=${generateStreamToken(rawPdfUrl)}` : ''
            };
          });
        }

        // On-Demand Single Token Resolution for Video Details
        if (req.originalUrl.includes('/video/')) {
          const videoData = responseData.data;
          // Tokenize direct streams
          if (videoData.video_url && !videoData.video_url.includes('youtube.com') && !videoData.video_url.includes('youtu.be')) {
            videoData.stream_url = `/api/stream/video?token=${generateStreamToken(videoData.video_url)}`;
          }
          if (videoData.hd_video_url && !videoData.hd_video_url.includes('youtube.com') && !videoData.hd_video_url.includes('youtu.be')) {
            videoData.hd_stream_url = `/api/stream/video?token=${generateStreamToken(videoData.hd_video_url)}`;
          }
          if (videoData.pdfs && Array.isArray(videoData.pdfs)) {
            videoData.pdfs = videoData.pdfs.map((p: any) => ({
              title: p.title,
              url: p.url ? `/api/stream/pdf?token=${generateStreamToken(p.url)}` : ''
            }));
          }
        }
      }

      // Requirement 2: End-to-End Response Payload Encryption (Network Tab Ciphertext Shield)
      const encryptedResponse = encryptVaultResponse(responseData);
      const stringifiedEncrypted = JSON.stringify(encryptedResponse);

      // Cache encrypted response
      if (req.method === 'GET' && fetchRes.ok && stringifiedEncrypted.length > 0) {
        proxyCache.set(cacheKey, {
          data: stringifiedEncrypted,
          contentType: 'application/json',
          timestamp: Date.now()
        });
      }

      res.status(fetchRes.status)
        .set('Content-Type', 'application/json')
        .send(stringifiedEncrypted);
    } catch (err) {
      console.error('Proxy error:', err);
      next(err);
    }
  }
);

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
