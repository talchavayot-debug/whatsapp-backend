import express from 'express';
import dotenv from 'dotenv';
import { createSession, getSessionStatus, getSessionQR, disconnectSession } from './sessionManager';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔐 Middleware לאימות
app.use((req, res, next) => {
  const key = req.headers['x-service-key'];

  if (key !== process.env.SERVICE_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
});

// יצירת סשן
app.post('/session/create', async (req, res) => {
  const { tenantId } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId required' });
  }

  const result = await createSession(tenantId);
  res.json(result);
});

// סטטוס סשן
app.get('/session/status/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  const result = getSessionStatus(tenantId);
  res.json(result);
});

// QR קוד
app.get('/session/qr/:tenantId', (req, res) => {
  const { tenantId } = req.params;
  const result = getSessionQR(tenantId);
  res.json(result);
});

// ניתוק
app.post('/session/disconnect/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const result = await disconnectSession(tenantId);
  res.json(result);
});

// בדיקת שרת
app.get('/', (req, res) => {
  res.send('WhatsApp backend is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
