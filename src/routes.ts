import { Router, Request, Response } from 'express';
import {
  createSession,
  getSessionStatus,
  getSessionQR,
  disconnectSession,
  reconnectSession,
} from './sessionManager';
import {
  CreateSessionRequest,
  DisconnectRequest,
  ReconnectRequest,
} from './types';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body as CreateSessionRequest;

    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }

    const info = await createSession(tenantId);
    res.json({
      status: info.status,
      phoneNumber: info.phoneNumber,
      lastConnectedAt: info.lastConnectedAt,
    });
  } catch (err) {
    console.error('[Route] create error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

router.get('/qr/:tenantId', (req: Request, res: Response) => {
  try {
    const tenantId = String(req.params.tenantId);
    const result = getSessionQR(tenantId);

    if (!result.qr) {
      res.json({
        qr: null,
        status: result.status,
        message:
          result.status === 'connected'
            ? 'Already connected'
            : result.status === 'expired'
              ? 'QR expired, request new session'
              : 'QR not yet available',
      });
      return;
    }

    res.json({
      qr: result.qr,
      expiresAt: result.expiresAt,
      status: result.status,
    });
  } catch (err) {
    console.error('[Route] qr error:', err);
    res.status(500).json({ error: 'Failed to get QR' });
  }
});

router.get('/status/:tenantId', (req: Request, res: Response) => {
  try {
    const tenantId = String(req.params.tenantId);
    const info = getSessionStatus(tenantId);

    res.json({
      status: info.status,
      phoneNumber: info.phoneNumber,
      lastConnectedAt: info.lastConnectedAt,
      lastError: info.lastError,
    });
  } catch (err) {
    console.error('[Route] status error:', err);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const { tenantId, clearSession } = req.body as DisconnectRequest;

    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }

    const info = await disconnectSession(tenantId, clearSession ?? true);
    res.json({
      status: info.status,
      message: 'Session disconnected',
    });
  } catch (err) {
    console.error('[Route] disconnect error:', err);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

router.post('/reconnect', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.body as ReconnectRequest;

    if (!tenantId) {
      res.status(400).json({ error: 'tenantId is required' });
      return;
    }

    const info = await reconnectSession(tenantId);
    res.json({
      status: info.status,
      phoneNumber: info.phoneNumber,
      lastConnectedAt: info.lastConnectedAt,
    });
  } catch (err) {
    console.error('[Route] reconnect error:', err);
    res.status(500).json({ error: 'Failed to reconnect' });
  }
});

export default router;