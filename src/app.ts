import express, { NextFunction } from 'express';
import { HealthController } from './controllers/health/HealthController.js'; 
import authRouter from './routes/auth/Auth.js';
import emparejamientoRouter from './routes/partido/Emparejamiento.js';
import partidoRouter from './routes/partido/Partido.js';
import invitacionRouter from './routes/partido/Invitacion.js';
import deporteRouter from './routes/deporte/Deporte.js';
import zonaRouter from './routes/zona/Zona.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const app = express();
const port = process.env.PORT || 3000;

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Middleware
app.use(express.json());

// Controllers
const healthController = new HealthController();

// Routes
app.get('/health', healthController.check);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend TypeScript funcionando correctamente!' });
});

// Auth routes
app.use('/auth', authRouter);

// Partido routes
app.use('/api/partidos', partidoRouter);

// Deporte routes
app.use('/api/deportes', deporteRouter);

// Zona routes
app.use('/api/zonas', zonaRouter);

// Emparejamiento routes
app.use('/api/emparejamiento', emparejamientoRouter);

// Invitacion routes
app.use('/api/invitaciones', invitacionRouter);

// Error handler global
app.use((err: any, req: express.Request, res: express.Response, next: NextFunction) => {
  console.error('Error handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// Start server
const server = app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

console.log('🚀 Starting server...');

// Export para tests
export default app;