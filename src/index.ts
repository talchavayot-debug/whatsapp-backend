import express from 'express';
import {
  createSession,
  getSessionStatus,
  getSessionQR,
  disconnectSession,
} from './sessionManager';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SERVICE_KEY = process.env.SERVICE_SECRET_KEY;

// middleware לאבטחה
function authMiddleware(req: any, res: any, next: any) {
  const key = req.headers['x-service-key'];

  if (!SERVICE_KEY || key !== SERVICE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

// בדיקת שרת
app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// יצירת session
app.post('/session/create', authMiddleware, async (req, res) => {
  const { tenantId } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId is required' });
  }

  try {
    const result = await createSession(tenantId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// סטטוס session
app.get('/session/status/:tenantId', authMiddleware, (req, res) => {
  const { tenantId } = req.params;
  const result = getSessionStatus(tenantId);
  res.json(result);
});

// QR
app.get('/session/qr/:tenantId', authMiddleware, (req, res) => {
  const { tenantId } = req.params;
  const result = getSessionQR(tenantId);
  res.json(result);
});

// ניתוק session
app.post('/session/disconnect/:tenantId', authMiddleware, async (req, res) => {
  const { tenantId } = req.params;
  const clear = req.query.clear === 'true';

  try {
    const result = await disconnectSession(tenantId, clear);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect session' });
  }
});

app.listen(PORT, () => {
  console.log(`[WhatsApp Backend] Running on port ${PORT}`);
});
