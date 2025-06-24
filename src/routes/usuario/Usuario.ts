import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { UsuarioController } from '../../controllers/usuario/UsuarioController.js';
import { authenticateJWT } from '../../middleware/authMiddleware.js';

const router = Router();
const usuarioController = new UsuarioController();

// Validaciones para actualizar token de Firebase
const validacionesFirebaseToken = [
  param('usuarioId')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido'),
  
  body('firebaseToken')
    .notEmpty()
    .withMessage('El token de Firebase es requerido')
    .isLength({ min: 50, max: 500 })
    .withMessage('El token de Firebase debe tener entre 50 y 500 caracteres')
];

// Validaciones para eliminar token
const validacionesEliminarToken = [
  param('usuarioId')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido')
];

// Validación para obtener por ID
const validacionObtenerPorId = [
  param('usuarioId')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido')
];

// Middleware simple para validar errores
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

// Rutas
router.get('/', authenticateJWT, usuarioController.obtenerTodos);

router.get(
  '/:usuarioId',
  authenticateJWT,
  validacionObtenerPorId,
  validarErrores,
  usuarioController.obtenerPorId
);

router.put(
  '/:usuarioId/firebase-token',
  authenticateJWT,
  validacionesFirebaseToken,
  validarErrores,
  usuarioController.actualizarFirebaseToken
);

router.delete(
  '/:usuarioId/firebase-token',
  authenticateJWT,
  validacionesEliminarToken,
  validarErrores,
  usuarioController.eliminarFirebaseToken
);

export default router;
