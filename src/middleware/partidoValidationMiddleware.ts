import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import dbPromise from '../models/index.js';

export class PartidoValidationMiddleware {
  
  /**
   * Valida los errores de express-validator
   */
  static validarErrores = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
      return;
    }
    next();
  };

  /**
   * Valida que el partido existe
   */
  static validarPartidoExiste = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID del partido es requerido'
        });
        return;
      }

      const db = await dbPromise;
      const Partido = db.Partido as any;

      const partido = await Partido.findByPk(id);
      if (!partido) {
        res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
        return;
      }

      // Guardar el partido en el request para uso posterior
      req.partido = partido;
      next();
    } catch (error) {
      console.error('Error al validar partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Valida que el usuario existe
   */
  static validarUsuarioExiste = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { usuarioId } = req.body;
      
      if (!usuarioId) {
        res.status(400).json({
          success: false,
          message: 'ID del usuario es requerido'
        });
        return;
      }

      const db = await dbPromise;
      const Usuario = db.Usuario as any;

      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Guardar el usuario en el request para uso posterior
      req.usuario = usuario;
      next();
    } catch (error) {
      console.error('Error al validar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Valida que las entidades relacionadas existen (deporte, zona, organizador)
   */
  static validarEntidadesRelacionadas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { deporteId, zonaId, organizadorId } = req.body;
      const db = await dbPromise;

      // Validar deporte
      if (deporteId) {
        const Deporte = db.Deporte as any;
        const deporte = await Deporte.findByPk(deporteId);
        if (!deporte) {
          res.status(404).json({
            success: false,
            message: 'Deporte no encontrado'
          });
          return;
        }
      }

      // Validar zona
      if (zonaId) {
        const Zona = db.Zona as any;
        const zona = await Zona.findByPk(zonaId);
        if (!zona) {
          res.status(404).json({
            success: false,
            message: 'Zona no encontrada'
          });
          return;
        }
      }

      // Validar organizador
      if (organizadorId) {
        const Usuario = db.Usuario as any;
        const organizador = await Usuario.findByPk(organizadorId);
        if (!organizador) {
          res.status(404).json({
            success: false,
            message: 'Usuario organizador no encontrado'
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Error al validar entidades relacionadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Valida niveles de partido
   */
  static validarNiveles = (req: Request, res: Response, next: NextFunction): void => {
    const { nivelMinimo, nivelMaximo } = req.body;

    if (nivelMinimo && (nivelMinimo < 1 || nivelMinimo > 10)) {
      res.status(400).json({
        success: false,
        message: 'El nivel mínimo debe estar entre 1 y 10'
      });
      return;
    }

    if (nivelMaximo && (nivelMaximo < 1 || nivelMaximo > 10)) {
      res.status(400).json({
        success: false,
        message: 'El nivel máximo debe estar entre 1 y 10'
      });
      return;
    }

    if (nivelMinimo && nivelMaximo && nivelMinimo > nivelMaximo) {
      res.status(400).json({
        success: false,
        message: 'El nivel mínimo no puede ser mayor que el nivel máximo'
      });
      return;
    }

    next();
  };

  /**
   * Valida que la fecha no sea en el pasado
   */
  static validarFecha = (req: Request, res: Response, next: NextFunction): void => {
    const { fecha } = req.body;

    if (fecha) {
      const fechaPartido = new Date(fecha);
      const ahora = new Date();
      ahora.setHours(0, 0, 0, 0); // Comparar solo fechas, no horas

      if (fechaPartido < ahora) {
        res.status(400).json({
          success: false,
          message: 'La fecha del partido no puede ser en el pasado'
        });
        return;
      }
    }

    next();
  };

  /**
   * Valida estado del partido
   */
  static validarEstado = (req: Request, res: Response, next: NextFunction): void => {
    const { estado } = req.body;

    if (estado) {
      const estadosValidos = [
        'NECESITAMOS_JUGADORES',
        'ARMADO',
        'CONFIRMADO',
        'EN_JUEGO',
        'FINALIZADO',
        'CANCELADO'
      ];

      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          success: false,
          message: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
        });
        return;
      }
    }

    next();
  };

  /**
   * Valida equipo
   */
  static validarEquipo = (req: Request, res: Response, next: NextFunction): void => {
    const { equipo, equipoGanador } = req.body;

    if (equipo && !['A', 'B'].includes(equipo)) {
      res.status(400).json({
        success: false,
        message: 'El equipo debe ser "A" o "B"'
      });
      return;
    }

    if (equipoGanador && !['A', 'B'].includes(equipoGanador)) {
      res.status(400).json({
        success: false,
        message: 'El equipo ganador debe ser "A" o "B"'
      });
      return;
    }

    next();
  };
}

// Extender el tipo Request para incluir propiedades personalizadas
declare global {
  namespace Express {
    interface Request {
      partido?: any;
      usuario?: any;
    }
  }
}
