import { Router } from 'express';
import { body, param } from 'express-validator';
import { PartidoController } from '../../controllers/partido/PartidoController.js';
import { PartidoValidationMiddleware } from '../../middleware/partidoValidationMiddleware.js';

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

// Validación para obtener por ID
const validacionObtenerPorId = [
  param('id')
    .isUUID()
    .withMessage('El ID del partido debe ser un UUID válido')
];

// Rutas para partidos con middlewares de validación
router.post(
  '/', 
  validacionesCrearPartido,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarEntidadesRelacionadas,
  PartidoValidationMiddleware.validarNiveles,
  PartidoValidationMiddleware.validarFecha,
  partidoController.crear
);

router.get('/', partidoController.obtenerTodos);

router.get(
  '/:id', 
  validacionObtenerPorId,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  partidoController.obtenerPorId
);

// Eliminada la ruta de unirse a partido y sus validaciones relacionadas

router.put(
  '/:id/estado', 
  validacionesActualizarEstado,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  PartidoValidationMiddleware.validarEstado,
  partidoController.actualizarEstado
);

router.put(
  '/:id/finalizar', 
  validacionesFinalizar,
  PartidoValidationMiddleware.validarErrores,
  PartidoValidationMiddleware.validarPartidoExiste,
  PartidoValidationMiddleware.validarEquipo,
  partidoController.finalizar
);

export default router;
