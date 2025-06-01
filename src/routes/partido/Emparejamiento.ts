import { Router } from 'express';
import { EmparejamientoController } from '../../controllers/partido/EmparejamientoController.js';

const router = Router();
const emparejamientoController = new EmparejamientoController();

// Rutas para emparejamiento
router.get('/candidatos/:partidoId', emparejamientoController.obtenerCandidatos);
router.post('/ejecutar', emparejamientoController.ejecutarEmparejamiento);
router.put('/estrategia/:partidoId', emparejamientoController.actualizarEstrategia);
router.get('/estrategias', emparejamientoController.obtenerEstrategias);
router.get('/estrategias/:tipo', emparejamientoController.obtenerDetalleEstrategia);

export default router;
