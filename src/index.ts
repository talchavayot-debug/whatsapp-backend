import * as express from 'express';
import { authenticateServiceKey } from './auth';
import sessionRoutes from './routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3100', 10);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/session', authenticateServiceKey, sessionRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WhatsApp Backend] Running on port ${PORT}`);
});