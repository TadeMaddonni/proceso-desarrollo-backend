import { Router } from 'express';
import { EmparejamientoSchedulerController } from '../../controllers/scheduler/EmparejamientoSchedulerController.js';
import { authenticateJWT } from '../../middleware/authMiddleware.js';

const router = Router();

/**
 * Rutas para administración del scheduler de emparejamiento automático
 * Requieren autenticación JWT
 */

// GET /api/emparejamiento-scheduler/estadisticas - Obtener estadísticas
router.get(
  '/estadisticas',
  authenticateJWT,
  EmparejamientoSchedulerController.obtenerEstadisticas
);

// POST /api/emparejamiento-scheduler/reiniciar - Reiniciar scheduler
router.post(
  '/reiniciar',
  authenticateJWT,
  EmparejamientoSchedulerController.reiniciarScheduler
);

export default router;
