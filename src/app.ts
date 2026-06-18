import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { initSockets } from './config/sockets.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { NotFoundError } from './core/errors/CustomError.js';
import { taskRouter } from './modules/task/task.routes.js';

const app = express();
const httpServer = createServer(app);

// ── WebSockets Initialization ─────────────────────────────────
initSockets(httpServer);

// ── Security & Standard Middlewares ───────────────────────────
app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS === '*' ? '*' : env.ALLOWED_ORIGINS.split(',');
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '100kb' }));

// ── Route Mounting ────────────────────────────────────────────
app.use('/api/tasks', taskRouter);

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: env.NODE_ENV,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Route Not Found Handler ───────────────────────────────
app.all('*', (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found.`));
});

// ── Global Error Handling Middleware ──────────────────────────
app.use(errorHandler);

export { httpServer };
export default app;
