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
    console.log('Obteniendo todos los partidos');
    try {
      const partidos = await PartidoService.obtenerTodosLosPartidos();
      console.log('Partidos obtenidos:', partidos);

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

  /**
   * Cambiar estado de un partido con validaciones
   * PUT /api/partidos/:id/cambiar-estado
   */
  cambiarEstado = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nuevoEstado } = req.body;

      if (!nuevoEstado) {
        res.status(400).json({ 
          success: false, 
          message: 'El nuevo estado es requerido' 
        });
        return;
      }

      const resultado = await PartidoService.cambiarEstadoConValidacion(id, nuevoEstado);

      if (resultado) {
        res.status(200).json({
          success: true,
          message: `Estado del partido actualizado a ${nuevoEstado}`,
          data: { id, nuevoEstado }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'No se pudo actualizar el estado del partido'
        });
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(400).json({
        success: false,
        message: (error as Error).message
      });
    }
  };

  /**
   * Verificar si un partido permite invitaciones
   * GET /api/partidos/:id/permite-invitaciones
   */
  permiteInvitaciones = async (req: Request, res: Response): Promise<void> => {
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

      const permiteInvitaciones = PartidoService.permiteInvitaciones(partido.estado as any);

      res.status(200).json({
        success: true,
        data: {
          partidoId: id,
          estado: partido.estado,
          permiteInvitaciones
        }
      });
    } catch (error) {
      console.error('Error al verificar invitaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };

  /**
   * Unirse directamente a un partido (solo si permite invitaciones)
   * POST /api/partidos/:id/unirse
   */
  unirseAPartido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { usuarioId, equipo } = req.body;

      if (!usuarioId) {
        res.status(400).json({
          success: false,
          message: 'El ID del usuario es requerido'
        });
        return;
      }

      // Verificar que el partido existe y permite invitaciones
      const partido = await PartidoService.obtenerPartidoPorId(id);
      if (!partido) {
        res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
        return;
      }

      // Verificar que el partido permite invitaciones (solo NECESITAMOS_JUGADORES)
      const permiteInvitaciones = PartidoService.permiteInvitaciones(partido.estado as any);
      if (!permiteInvitaciones) {
        res.status(400).json({
          success: false,
          message: `No es posible unirse al partido en estado ${partido.estado}`
        });
        return;
      }

      // Verificar que el partido no esté completo
      const estaCompleto = await PartidoService.verificarPartidoCompleto(id);
      if (estaCompleto) {
        res.status(400).json({
          success: false,
          message: 'El partido ya está completo'
        });
        return;
      }

      // Unir usuario al partido
      const resultado = await PartidoService.unirUsuarioAPartido(id, { usuarioId, equipo });

      // Verificar si el partido se completó y cambiar estado automáticamente
      const partidoCompleto = await PartidoService.verificarPartidoCompleto(id);
      if (partidoCompleto) {
        await PartidoService.verificarYTransicionarArmado(id);
      }

      res.status(200).json({
        success: true,
        message: 'Te has unido al partido exitosamente',
        data: {
          participacion: resultado,
          partidoCompleto
        }
      });

    } catch (error) {
      console.error('Error al unirse al partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al unirse al partido'
      });
    }
  };

  /**
   * Abandonar un partido
   * DELETE /api/partidos/:id/abandonar
   */
  abandonarPartido = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { usuarioId } = req.body;

      if (!usuarioId) {
        res.status(400).json({
          success: false,
          message: 'El ID del usuario es requerido'
        });
        return;
      }

      // Verificar que el partido existe
      const partido = await PartidoService.obtenerPartidoPorId(id);
      if (!partido) {
        res.status(404).json({
          success: false,
          message: 'Partido no encontrado'
        });
        return;
      }      // Verificar que el partido esté en un estado que permita abandonar
      const estadosPermitidos = ['NECESITAMOS_JUGADORES', 'ARMADO'];
      if (!estadosPermitidos.includes(partido.estado)) {
        res.status(400).json({
          success: false,
          message: `No es posible abandonar el partido en estado ${partido.estado}. Solo se puede abandonar en estados: NECESITAMOS_JUGADORES o ARMADO`
        });
        return; 
      }

      // Remover usuario del partido
      const removido = await PartidoService.removerUsuarioDePartido(id, usuarioId);

      if (!removido) {
        res.status(400).json({
          success: false,
          message: 'El usuario no está participando en este partido'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Has abandonado el partido exitosamente'
      });

    } catch (error) {
      console.error('Error al abandonar partido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al abandonar el partido'
      });
    }
  };

  /**
   * Obtener todos los partidos de un usuario específico
   * GET /api/partidos/usuario/:userId
   */
  obtenerPartidosDeUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'El ID del usuario es requerido'
        });
        return;
      }

      const partidos = await PartidoService.obtenerPartidosDeUsuario(userId);

      res.status(200).json({
        success: true,
        message: 'Partidos del usuario obtenidos exitosamente',
        data: partidos,
        total: partidos.length
      });

    } catch (error) {
      console.error('Error al obtener partidos del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener los partidos del usuario'
      });
    }
  };
}
