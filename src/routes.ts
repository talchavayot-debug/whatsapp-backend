import { Router } from 'express';
import { createSession, getSessionStatus, getSessionQR, disconnectSession } from './sessionManager';

const router = Router();

router.post('/session/create', async (req, res) => {
  const { tenantId } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'tenantId required' });
  }

  const result = await createSession(tenantId);
  res.json(result);
});

router.get('/session/status/:tenantId', (req, res) => {
  res.json(getSessionStatus(req.params.tenantId));
});

router.get('/session/qr/:tenantId', (req, res) => {
  res.json(getSessionQR(req.params.tenantId));
});

router.post('/session/disconnect/:tenantId', async (req, res) => {
  res.json(await disconnectSession(req.params.tenantId));
});

export default router;
