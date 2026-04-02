import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';
import QRCode from 'qrcode';
import { Boom } from '@hapi/boom';
import { SessionInfo } from './types';

const sessions = new Map<string, any>();
const logger = pino({ level: 'silent' });

const SESSIONS_DIR = process.env.SESSIONS_DIR || '/sessions';

function getSessionPath(tenantId: string) {
  return path.join(SESSIONS_DIR, tenantId);
}

export async function createSession(tenantId: string): Promise<SessionInfo> {
  const sessionPath = getSessionPath(tenantId);
  fs.mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    logger,
    printQRInTerminal: true,
    browser: ['Chrome', 'Desktop', '121.0.0'],
  });

  const info: SessionInfo = {
    tenantId,
    status: 'connecting',
    qr: null,
    qrExpiresAt: null,
    phoneNumber: null,
    lastError: null,
    lastConnectedAt: null,
  };

  sessions.set(tenantId, { sock, info });

  sock.ev.on('connection.update', async (update: any) => {
    console.log('UPDATE:', update);

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      info.status = 'qr_pending';
      info.qr = await QRCode.toDataURL(qr);
      info.qrExpiresAt = Date.now() + 60_000;
    }

    if (connection === 'open') {
      info.status = 'connected';
      info.phoneNumber = sock.user?.id || null;
      info.lastConnectedAt = new Date().toISOString();
      info.lastError = null;
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log(`Reconnecting session ${tenantId}...`);
        createSession(tenantId);
      } else {
        info.status = 'disconnected';
        info.lastError = 'Logged out';
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  return info;
}

export function getSessionStatus(tenantId: string): SessionInfo {
  return (
    sessions.get(tenantId)?.info || {
      tenantId,
      status: 'disconnected',
      qr: null,
      qrExpiresAt: null,
      phoneNumber: null,
      lastError: null,
      lastConnectedAt: null,
    }
  );
}

export function getSessionQR(tenantId: string) {
  const info = getSessionStatus(tenantId);
  return {
    qr: info.qr,
    status: info.status,
    expiresAt: info.qrExpiresAt,
  };
}

export async function disconnectSession(
  tenantId: string,
  clear = false
) {
  const session = sessions.get(tenantId);

  if (session) {
    await session.sock.logout();
    sessions.delete(tenantId);
  }

  if (clear) {
    const dir = getSessionPath(tenantId);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  return getSessionStatus(tenantId);
}

export async function reconnectSession(tenantId: string) {
  return createSession(tenantId);
}
