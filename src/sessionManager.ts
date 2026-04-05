import makeWASocket, { useMultiFileAuthState } from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

const sessions = new Map<string, any>();
const SESSIONS_DIR = './sessions';

function getSessionPath(tenantId: string) {
  return path.join(SESSIONS_DIR, tenantId);
}

export async function createSession(tenantId: string) {
  const sessionPath = getSessionPath(tenantId);

  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  fs.mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    browser: ['Railway', 'Chrome', '1.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: true,
  });

  const info: any = {
    tenantId,
    status: 'connecting',
    qr: null,
    phoneNumber: null,
    lastConnectedAt: null,
  };

  sessions.set(tenantId, { sock, info });

  sock.ev.on('connection.update', async (update) => {
    console.log('UPDATE:', update);

    const { connection, qr, lastDisconnect } = update as any;

    if (qr) {
      console.log('QR GENERATED');
      info.status = 'qr_pending';
      info.qr = await QRCode.toDataURL(qr);
    }

    if (connection === 'open') {
      console.log('CONNECTED');
      info.status = 'connected';
      info.phoneNumber = sock.user?.id || null;
      info.lastConnectedAt = new Date().toISOString();
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log('STATUS CODE:', statusCode);
      console.log('LAST DISCONNECT:', lastDisconnect);
      info.status = 'disconnected';
    }
  });

  sock.ev.on('creds.update', saveCreds);

  return info;
}

export function getSessionQR(tenantId: string) {
  const info = sessions.get(tenantId)?.info;

  return {
    qr: info?.qr || null,
    status: info?.status || 'not_found',
  };
}

export async function disconnectSession(tenantId: string) {
  const session = sessions.get(tenantId);

  if (session) {
    await session.sock.logout();
    sessions.delete(tenantId);
  }

  return { status: 'disconnected' };
}
