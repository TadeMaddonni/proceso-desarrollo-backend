import { Request, Response } from 'express';
import { PartidoService } from '../../services/partido/PartidoService.js';
import type { PartidoCreationDTO, UnirsePartidoDTO, PartidoFinalizarDTO } from '../../DTOs/PartidoCreationDTO.js';

export class PartidoController {

  /**
   * Crear un nuevo partido
   * POST /api/partidos
   */
  crear = async (req: Request, res: Response): Promise<void> => {
    try {
      const datosPartido: PartidoCreationDTO = req.body;
      
      const partidoCreado = await PartidoService.crearPartido(datosPartido);

      res.status(201).json({
        success: true,
        message: 'Partido creado exitosamente',
        data: partidoCreado
      });

    } catch (error) {
      console.error('Error al crear partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear el partido'
      });
    }
  };

  /**
   * Obtener todos los partidos
   * GET /api/partidos
   */
  obtenerTodos = async (req: Request, res: Response): Promise<void> => {
    try {
      const partidos = await PartidoService.obtenerTodosLosPartidos();

      res.status(200).json({
        success: true,
        message: 'Partidos obtenidos exitosamente',
        data: partidos,
        total: partidos.length
      });

    } catch (error) {
      console.error('Error al obtener partidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener partidos'
      });
    }
  };

  /**
   * Obtener un partido por ID
   * GET /api/partidos/:id
   */
  obtenerPorId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const partido = await PartidoService.obtenerPartidoPorId(id);

      if (!partido) {
        res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Partido obtenido exitosamente',
        data: partido
      });

    } catch (error) {
      console.error('Error al obtener partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener el partido'
      });
    }
  };


  /**
   * Actualizar estado del partido
   * PUT /api/partidos/:id/estado
   */
  actualizarEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const actualizado = await PartidoService.actualizarEstadoPartido(id, estado);

      if (!actualizado) {
        res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Estado del partido actualizado exitosamente',
        data: {
          id,
          estado,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error al actualizar estado del partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar estado del partido'
      });
    }
  };

  /**
   * Finalizar partido y establecer equipo ganador
   * PUT /api/partidos/:id/finalizar
   */
  finalizar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const datosFinalizacion: PartidoFinalizarDTO = req.body;

      const finalizado = await PartidoService.finalizarPartido(id, datosFinalizacion);

      if (!finalizado) {
        res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Partido finalizado exitosamente',
        data: {
          id,
          estado: 'FINALIZADO',
          equipoGanador: datosFinalizacion.equipoGanador || null,
          updatedAt: new Date()
        }
      });

    } catch (error) {
      console.error('Error al finalizar partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al finalizar partido'
      });
    }
  };
}
