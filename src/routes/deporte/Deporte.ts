import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { DeporteController } from '../../controllers/deporte/DeporteController.js';
import { authenticateJWT, optionalAuth } from '../../middleware/authMiddleware.js';

const router = Router();
const deporteController = new DeporteController();

// Validaciones para crear/actualizar deporte
const validacionesDeporte = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre del deporte es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .trim()
];

// Validación para obtener por ID
const validacionId = [
  param('id')
    .isUUID()
    .withMessage('El ID del deporte debe ser un UUID válido')
];

// Middleware para validar errores
const validarErrores = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  
  next();
};

// Rutas para deportes
router.get('/', optionalAuth, deporteController.obtenerTodos);

router.get(
  '/:id',
  validacionId,
  validarErrores,
  optionalAuth,
  deporteController.obtenerPorId
);

router.post(
  '/',
  authenticateJWT,
  validacionesDeporte,
  validarErrores,
  deporteController.crear
);

router.put(
  '/:id',
  authenticateJWT,
  validacionId,
  validacionesDeporte,
  validarErrores,
  deporteController.actualizar
);

router.delete(
  '/:id',
  authenticateJWT,
  validacionId,
  validarErrores,
  deporteController.eliminar
);

export default router;
