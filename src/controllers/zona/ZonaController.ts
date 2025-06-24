import { Request, Response } from 'express';
import { ZonaService } from '../../services/zona/ZonaService.js';

export class ZonaController {
  /**
   * Obtener todas las zonas
   * GET /api/zonas
   */
  obtenerTodas = async (req: Request, res: Response): Promise<void> => {
    try {
      const zonas = await ZonaService.obtenerTodasLasZonas();

      res.status(200).json({
        success: true,
        message: 'Zonas obtenidas exitosamente',
        data: zonas,
        total: zonas.length
      });

    } catch (error) {
      console.error('Error al obtener zonas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener zonas'
      });
    }
  };

  /**
   * Obtener una zona por ID
   * GET /api/zonas/:id
   */
  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const zona = await ZonaService.obtenerZonaPorId(id);

      if (!zona) {
        res.status(404).json({
          success: false,
          message: 'Zona no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Zona obtenida exitosamente',
        data: zona
      });

    } catch (error) {
      console.error('Error al obtener zona:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener la zona'
      });
    }
  };

  /**
   * Crear una nueva zona
   * POST /api/zonas
   */
  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la zona es requerido'
        });
        return;
      }

      const zonaCreada = await ZonaService.crearZona(nombre);

      res.status(201).json({
        success: true,
        message: 'Zona creada exitosamente',
        data: zonaCreada
      });

    } catch (error) {
      console.error('Error al crear zona:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la zona'
      });
    }
  };

  /**
   * Actualizar una zona
   * PUT /api/zonas/:id
   */
  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la zona es requerido'
        });
        return;
      }

      const actualizado = await ZonaService.actualizarZona(id, nombre);

      if (!actualizado) {
        res.status(404).json({
          success: false,
          message: 'Zona no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Zona actualizada exitosamente',
        data: { id, nombre }
      });

    } catch (error) {
      console.error('Error al actualizar zona:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar la zona'
      });
    }
  };

  /**
   * Eliminar una zona
   * DELETE /api/zonas/:id
   */
  eliminar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const eliminado = await ZonaService.eliminarZona(id);

      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Zona no encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Zona eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar zona:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar la zona'
      });
    }
  };
}
