import express from 'express';
import dotenv from 'dotenv';
import {
  createSession,
  getSessionStatus,
  getSessionQR,
  disconnectSession,
} from './sessionManager';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const SERVICE_KEY = process.env.SERVICE_SECRET_KEY;

// 🔐 Middleware לאבטחה
function authMiddleware(req: any, res: any, next: any) {
  const key = req.headers['x-service-key'];
  if (!SERVICE_KEY || key !== SERVICE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// 🟢 בדיקת שרת
app.get('/', (req, res) => {
  res.send('WhatsApp Backend is running 🚀');
});

// 📲 יצירת סשן
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

// 📊 סטטוס סשן
app.get('/session/status/:tenantId', authMiddleware, (req, res) => {
  const { tenantId } = req.params;
  const result = getSessionStatus(tenantId);
  res.json(result);
});

// 📷 קבלת QR
app.get('/session/qr/:tenantId', authMiddleware, (req, res) => {
  const { tenantId } = req.params;
  const result = getSessionQR(tenantId);
  res.json(result);
});

// 🔥🔥🔥 זה מה שהיה חסר לך!!!
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
  console.log(`🔥 WhatsApp Backend running on port ${PORT}`);
});
