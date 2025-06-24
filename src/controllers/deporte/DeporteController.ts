import { Request, Response } from 'express';
import { DeporteService } from '../../services/deporte/DeporteService.js';

export class DeporteController {
  /**
   * Obtener todos los deportes
   * GET /api/deportes
   */
  obtenerTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const deportes = await DeporteService.obtenerTodosLosDeportes();

      res.status(200).json({
        success: true,
        message: 'Deportes obtenidos exitosamente',
        data: deportes,
        total: deportes.length
      });

    } catch (error) {
      console.error('Error al obtener deportes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener deportes'
      });
    }
  };

  /**
   * Obtener un deporte por ID
   * GET /api/deportes/:id
   */
  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const deporte = await DeporteService.obtenerDeportePorId(id);

      if (!deporte) {
        res.status(404).json({
          success: false,
          message: 'Deporte no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Deporte obtenido exitosamente',
        data: deporte
      });

    } catch (error) {
      console.error('Error al obtener deporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener el deporte'
      });
    }
  };

  /**
   * Crear un nuevo deporte
   * POST /api/deportes
   */
  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nombre } = req.body;

      if (!nombre) {
        res.status(400).json({
          success: false,
          message: 'El nombre del deporte es requerido'
        });
        return;
      }

      const deporteCreado = await DeporteService.crearDeporte(nombre);

      res.status(201).json({
        success: true,
        message: 'Deporte creado exitosamente',
        data: deporteCreado
      });

    } catch (error) {
      console.error('Error al crear deporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear el deporte'
      });
    }
  };

  /**
   * Actualizar un deporte
   * PUT /api/deportes/:id
   */
  actualizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      if (!nombre) {
        res.status(400).json({
          success: false,
          message: 'El nombre del deporte es requerido'
        });
        return;
      }

      const actualizado = await DeporteService.actualizarDeporte(id, nombre);

      if (!actualizado) {
        res.status(404).json({
          success: false,
          message: 'Deporte no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Deporte actualizado exitosamente',
        data: { id, nombre }
      });

    } catch (error) {
      console.error('Error al actualizar deporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar el deporte'
      });
    }
  };

  /**
   * Eliminar un deporte
   * DELETE /api/deportes/:id
   */
  eliminar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const eliminado = await DeporteService.eliminarDeporte(id);

      if (!eliminado) {
        res.status(404).json({
          success: false,
          message: 'Deporte no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Deporte eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar deporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar el deporte'
      });
    }
  };
}
