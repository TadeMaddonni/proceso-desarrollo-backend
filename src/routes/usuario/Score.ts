import { Router } from 'express';
import { param, query } from 'express-validator';
import { ScoreController } from '../../controllers/usuario/ScoreController.js';

const router = Router();
const scoreController = new ScoreController();

// Validaciones para obtener score de usuario
const validacionObtenerScoreUsuario = [
  param('usuarioId')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido')
];

// Validaciones para ranking con parámetro de límite opcional
const validacionRanking = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100')
];

// Middleware para validar errores
const validarErrores = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  
  next();
};

// Rutas para scores
router.get(
  '/usuario/:usuarioId',
  validacionObtenerScoreUsuario,
  validarErrores,
  scoreController.obtenerScoreUsuario
);

router.get(
  '/ranking',
  validacionRanking,
  validarErrores,
  scoreController.obtenerRanking
);

router.get(
  '/usuario/:usuarioId/estadisticas',
  validacionObtenerScoreUsuario,
  validarErrores,
  scoreController.obtenerEstadisticasUsuario
);

router.put(
  '/usuario/:usuarioId/reset',
  validacionObtenerScoreUsuario,
  validarErrores,
  scoreController.resetearScoreUsuario
);

export default router;