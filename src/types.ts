export type SessionStatus =
  | 'disconnected'
  | 'qr_pending'
  | 'connecting'
  | 'connected'
  | 'expired'
  | 'failed';

export interface SessionInfo {
  tenantId: string;
  status: SessionStatus;
  qr: string | null;
  qrExpiresAt: number | null;
  phoneNumber: string | null;
  lastError: string | null;
  lastConnectedAt: string | null;
}

export interface CreateSessionRequest {
  tenantId: string;
}

export interface DisconnectRequest {
  tenantId: string;
  clearSession?: boolean;
}

export interface ReconnectRequest {
  tenantId: string;
}