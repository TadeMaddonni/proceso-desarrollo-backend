import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ZonaController } from '../../controllers/zona/ZonaController.js';
import { authenticateJWT, optionalAuth } from '../../middleware/authMiddleware.js';

const router = Router();
const zonaController = new ZonaController();

// Validaciones para crear/actualizar zona
const validacionesZona = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre de la zona es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim()
];

// Validación para obtener por ID
const validacionId = [
  param('id')
    .isUUID()
    .withMessage('El ID de la zona debe ser un UUID válido')
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

// Rutas para zonas
router.get('/', optionalAuth, zonaController.obtenerTodas);

router.get(
  '/:id',
  validacionId,
  validarErrores,
  optionalAuth,
  zonaController.obtenerPorId
);

router.post(
  '/',
  authenticateJWT,
  validacionesZona,
  validarErrores,
  zonaController.crear
);

router.put(
  '/:id',
  authenticateJWT,
  validacionId,
  validacionesZona,
  validarErrores,
  zonaController.actualizar
);

router.delete(
  '/:id',
  authenticateJWT,
  validacionId,
  validarErrores,
  zonaController.eliminar
);

export default router;
