export interface SessionInfo {
  tenantId: string;
  status: string;
  qr: string | null;
  phoneNumber: string | null;
  lastConnectedAt: string | null;
}
