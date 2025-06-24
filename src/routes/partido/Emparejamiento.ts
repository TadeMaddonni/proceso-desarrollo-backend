import { Router } from 'express';
import { EmparejamientoController } from '../../controllers/partido/EmparejamientoController.js';
import { authenticateJWT, optionalAuth } from '../../middleware/authMiddleware.js';

const router = Router();
const emparejamientoController = new EmparejamientoController();

// Rutas para emparejamiento
router.get('/candidatos/:partidoId', optionalAuth, emparejamientoController.obtenerCandidatos);
router.post('/ejecutar/:partidoId', authenticateJWT, emparejamientoController.ejecutarEmparejamiento);
router.put('/estrategia/:partidoId', authenticateJWT, emparejamientoController.actualizarEstrategia);
router.get('/estrategias', optionalAuth, emparejamientoController.obtenerEstrategias);
router.get('/estrategias/:tipo', optionalAuth, emparejamientoController.obtenerDetalleEstrategia);

export default router;
