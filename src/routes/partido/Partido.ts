import { Router } from 'express';
import { body, param } from 'express-validator';
import { PartidoController } from '../../controllers/partido/PartidoController.js';
import { PartidoValidationMiddleware } from '../../middleware/partidoValidationMiddleware.js';
import { authenticateJWT, optionalAuth } from '../../middleware/authMiddleware.js';

const router = Router();
const partidoController = new PartidoController();

// Validaciones para crear partido
const validacionesCrearPartido = [
  body('deporteId')
    .notEmpty()
    .withMessage('El ID del deporte es requerido')
    .isUUID()
    .withMessage('El ID del deporte debe ser un UUID válido'),
  
  body('zonaId')
    .notEmpty()
    .withMessage('El ID de la zona es requerido')
    .isUUID()
    .withMessage('El ID de la zona debe ser un UUID válido'),
  
  body('organizadorId')
    .notEmpty()
    .withMessage('El ID del organizador es requerido')
    .isUUID()
    .withMessage('El ID del organizador debe ser un UUID válido'),
  
  body('fecha')
    .notEmpty()
    .withMessage('La fecha es requerida')
    .isISO8601()
    .withMessage('La fecha debe tener formato ISO 8601 válido'),
  
  body('hora')
    .notEmpty()
    .withMessage('La hora es requerida')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora debe tener formato HH:MM válido'),
  
  body('duracion')
    .notEmpty()
    .withMessage('La duración es requerida')
    .isFloat({ min: 0.5, max: 8 })
    .withMessage('La duración debe ser entre 0.5 y 8 horas'),
    body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 255 })
    .withMessage('La dirección debe tener entre 5 y 255 caracteres'),
  
  body('cantidadJugadores')
    .notEmpty()
    .withMessage('La cantidad de jugadores es requerida')
    .isInt({ min: 2, max: 22 })
    .withMessage('La cantidad de jugadores debe ser entre 2 y 22'),
  
  body('tipoEmparejamiento')
    .optional()
    .isIn(['ZONA', 'NIVEL', 'HISTORIAL'])
    .withMessage('El tipo de emparejamiento debe ser ZONA, NIVEL o HISTORIAL'),
  
  body('nivelMinimo')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El nivel mínimo debe ser entre 1 y 3'),
  
  body('nivelMaximo')
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage('El nivel máximo debe ser entre 1 y 3')
];

// Validaciones para actualizar estado
const validacionesActualizarEstado = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido'),
  
  body('estado')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['NECESITAMOS_JUGADORES', 'ARMADO', 'CONFIRMADO', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('Estado inválido')
];

// Validaciones para finalizar partido
const validacionesFinalizar = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido'),
  
  body('equipoGanador')
    .optional()
    .isIn(['A', 'B'])
    .withMessage('El equipo ganador debe ser "A" o "B"')
];

// Validaciones para cambiar estado (usando patrón State)
const validacionesCambiarEstado = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido'),
  
  body('nuevoEstado')
    .notEmpty()
    .withMessage('El nuevo estado es requerido')
    .isIn(['NECESITAMOS_JUGADORES', 'ARMADO', 'CONFIRMADO', 'EN_JUEGO', 'FINALIZADO', 'CANCELADO'])
    .withMessage('Estado inválido')
];

// Validaciones para unirse a partido
const validacionesUnirsePartido = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido'),
  
  body('usuarioId')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido'),
  
  body('equipo')
    .optional()
    .isIn(['A', 'B'])
    .withMessage('El equipo debe ser "A" o "B"')
];

// Validaciones para abandonar partido
const validacionesAbandonarPartido = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido'),
  
  body('usuarioId')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido')
];

// Validación para obtener por ID
const validacionObtenerPorId = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido')
];

// Validaciones para obtener partidos de usuario
const validacionesPartidosUsuario = [
  param('userId')
    .notEmpty()
    .withMessage('El ID del usuario es requerido')
    .isUUID()
    .withMessage('El ID del usuario debe ser un UUID válido')
];

// Rutas para partidos con middlewares de validación
router.post(
  '/', 
  authenticateJWT,
  validacionesCrearPartido,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarEntidadesRelacionadas,
  PartidoValidationMiddleware.validarNiveles,
  PartidoValidationMiddleware.validarFecha,
  partidoController.crear
);

router.get('/', optionalAuth, partidoController.obtenerTodos);

router.get(
  '/:id', 
  optionalAuth,
  validacionObtenerPorId,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  partidoController.obtenerPorId
);

// Eliminada la ruta de unirse a partido y sus validaciones relacionadas

router.put(
  '/:id/finalizar', 
  authenticateJWT,
  validacionesFinalizar,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  PartidoValidationMiddleware.validarEquipo,
  partidoController.finalizar
);

// Rutas que usan el patrón State
router.put(
  '/:id/cambiar-estado',
  authenticateJWT,
  validacionesCambiarEstado,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  partidoController.cambiarEstado
);

router.get(
  '/:id/permite-invitaciones',
  optionalAuth,
  validacionObtenerPorId,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  partidoController.permiteInvitaciones
);

// Ruta para unirse directamente a un partido
router.post(
  '/:id/unirse',
  authenticateJWT,
  validacionesUnirsePartido,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  partidoController.unirseAPartido
);

// Ruta para abandonar un partido
router.delete(
  '/:id/abandonar',
  authenticateJWT,
  validacionesAbandonarPartido,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  partidoController.abandonarPartido
);

// Ruta para obtener partidos de un usuario
router.get(
  '/usuario/:userId',
  optionalAuth,
  validacionesPartidosUsuario,
  PartidoValidationMiddleware.validarErrores,
  partidoController.obtenerPartidosDeUsuario
);

export default router;
