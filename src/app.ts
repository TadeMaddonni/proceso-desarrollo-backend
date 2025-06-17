import express, { NextFunction } from 'express';
import cors from 'cors';
import { HealthController } from './controllers/health/HealthController.js';
import authRouter from './routes/auth/Auth.js';
import emparejamientoRouter from './routes/partido/Emparejamiento.js';
import emparejamientoSchedulerRouter from './routes/scheduler/EmparejamientoScheduler.js';
import partidoRouter from './routes/partido/Partido.js';
import invitacionRouter from './routes/partido/Invitacion.js';
import deporteRouter from './routes/deporte/Deporte.js';
import zonaRouter from './routes/zona/Zona.js';
import usuarioRouter from './routes/usuario/Usuario.js';
import { PartidoSchedulerService } from './services/scheduler/PartidoSchedulerService.js';
import { EmparejamientoSchedulerService } from './services/scheduler/EmparejamientoSchedulerService.js';
import { EmparejamientoSchedulerController } from './controllers/scheduler/EmparejamientoSchedulerController.js';
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
// CORS configuration
const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
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
app.use('/api/auth', authRouter);

// Partido routes
app.use('/api/partidos', partidoRouter);

// Deporte routes
app.use('/api/deportes', deporteRouter);

// Zona routes
app.use('/api/zonas', zonaRouter);

// Usuario routes
app.use('/api/usuarios', usuarioRouter);

// Emparejamiento routes
app.use('/api/emparejamiento', emparejamientoRouter);

// Emparejamiento scheduler routes
app.use('/api/emparejamiento-scheduler', emparejamientoSchedulerRouter);

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

// Inicializar schedulers automáticos
const schedulerService = new PartidoSchedulerService();
const emparejamientoScheduler = new EmparejamientoSchedulerService();

schedulerService.iniciar();
emparejamientoScheduler.iniciar();

// Configurar controlador con la instancia del scheduler
EmparejamientoSchedulerController.setSchedulerInstance(emparejamientoScheduler);

console.log('🤖 Schedulers automáticos iniciados:');
console.log('   - PartidoScheduler: estados de partidos');
console.log('   - EmparejamientoScheduler: emparejamiento automático');

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`🛑 Recibida señal ${signal}, cerrando servidor...`);
  schedulerService.detener();
  emparejamientoScheduler.detener();
  server.close(() => {
    console.log('🔥 Servidor cerrado correctamente');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

console.log('🚀 Starting server...');

// Export para tests
export default app;