import dbPromise from '../../models/index.js';
import { PartidoService } from './PartidoService.js';

export class InvitacionService {
  static async aceptarInvitacion(invitacionId: string, usuarioId: string) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const invitacion = await Invitacion.findByPk(invitacionId);
    if (!invitacion) return { success: false, message: 'Invitación no encontrada', status: 404 };
    if (invitacion.usuarioId !== usuarioId) return { success: false, message: 'No autorizado', status: 403 };
    if (invitacion.estado !== 'pendiente') return { success: false, message: 'La invitación no está pendiente', status: 409 };
    invitacion.estado = 'aceptada';
    await invitacion.save();
    // Unir usuario al partido
    await PartidoService.unirUsuarioAPartido(invitacion.partidoId, { usuarioId });
    return { success: true };
  }

  static async cancelarInvitacion(invitacionId: string, usuarioId: string) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const invitacion = await Invitacion.findByPk(invitacionId);
    if (!invitacion) return { success: false, message: 'Invitación no encontrada', status: 404 };
    if (invitacion.usuarioId !== usuarioId) return { success: false, message: 'No autorizado', status: 403 };
    if (invitacion.estado !== 'pendiente') return { success: false, message: 'La invitación no está pendiente', status: 409 };
    invitacion.estado = 'cancelada';
    await invitacion.save();
    return { success: true };
  }

  /**
   * Cancela todas las invitaciones pendientes de un partido
   * Usado por el patrón Observer cuando cambia el estado del partido
   */
  static async cancelarInvitacionesPorPartido(
    partidoId: string, 
    motivo: string = 'Cambio de estado del partido'
  ): Promise<{ invitacionesCanceladas: number }> {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    
    try {
      // Buscar todas las invitaciones pendientes del partido
      const invitacionesPendientes = await Invitacion.findAll({
        where: {
          partidoId: partidoId,
          estado: 'pendiente'
        }
      });

      if (invitacionesPendientes.length === 0) {
        return { invitacionesCanceladas: 0 };
      }

      // Actualizar todas las invitaciones a 'cancelada'
      const [rowsUpdated] = await Invitacion.update(
        { 
          estado: 'cancelada',
          motivo: motivo,
          updatedAt: new Date()
        },
        {
          where: {
            partidoId: partidoId,
            estado: 'pendiente'
          }
        }
      );

      console.log(`[InvitacionService] Canceladas ${rowsUpdated} invitaciones del partido ${partidoId}. Motivo: ${motivo}`);
      
      return { invitacionesCanceladas: rowsUpdated };

    } catch (error) {
      console.error(`[InvitacionService] Error al cancelar invitaciones del partido ${partidoId}:`, error);
      throw error;
    }
  }

  /**
   * Reactivar invitaciones canceladas cuando un partido vuelve a necesitar jugadores
   * Solo reactiva invitaciones que fueron canceladas por "partido lleno"
   */
  static async reactivarInvitacionesPartido(
    partidoId: string, 
    motivo: string = 'El partido vuelve a necesitar jugadores'
  ): Promise<{ invitacionesReactivadas: number }> {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    
    try {      // Buscar invitaciones canceladas que pueden reactivarse
      // Nota: Como no tenemos columna 'motivo', reactivamos todas las invitaciones canceladas
      const invitacionesCanceladas = await Invitacion.findAll({
        where: {
          partidoId: partidoId,
          estado: 'cancelada'
        }
      });

      if (invitacionesCanceladas.length === 0) {
        return { invitacionesReactivadas: 0 };
      }      // Reactivar invitaciones cambiando el estado a 'pendiente'
      const [rowsUpdated] = await Invitacion.update(
        { 
          estado: 'pendiente',
          updatedAt: new Date()
        },
        {
          where: {
            partidoId: partidoId,
            estado: 'cancelada'
          }
        }
      );

      console.log(`[InvitacionService] Reactivadas ${rowsUpdated} invitaciones del partido ${partidoId}. Motivo: ${motivo}`);
      
      return { invitacionesReactivadas: rowsUpdated };

    } catch (error) {
      console.error(`[InvitacionService] Error al reactivar invitaciones del partido ${partidoId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener todas las invitaciones de un usuario
   */
  static async obtenerInvitacionesPorUsuario(usuarioId: string) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const Partido = db.Partido as any;
    const Usuario = db.Usuario as any;
    const Deporte = db.Deporte as any;
    const Zona = db.Zona as any;

    try {
      const invitaciones = await Invitacion.findAll({
        where: {
          usuarioId: usuarioId
        },
        include: [
          {
            model: Partido,
            include: [
              {
                model: Usuario,
                as: 'organizador',
                attributes: ['id', 'nombre', 'email']
              },
              {
                model: Deporte,
                attributes: ['id', 'nombre']
              },
              {
                model: Zona,
                attributes: ['id', 'nombre']
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return { success: true, invitaciones };
    } catch (error) {
      console.error('[InvitacionService] Error al obtener invitaciones por usuario:', error);
      return { success: false, message: 'Error interno del servidor', status: 500 };
    }
  }

  /**
   * Obtener todas las invitaciones de un partido
   */
  static async obtenerInvitacionesPorPartido(partidoId: string) {
    const db = await dbPromise;
    const Invitacion = db.Invitacion as any;
    const Usuario = db.Usuario as any;

    try {
      const invitaciones = await Invitacion.findAll({
        where: {
          partidoId: partidoId
        },
        include: [
          {
            model: Usuario,
            attributes: ['id', 'nombre', 'email']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return { success: true, invitaciones };
    } catch (error) {
      console.error('[InvitacionService] Error al obtener invitaciones por partido:', error);
      return { success: false, message: 'Error interno del servidor', status: 500 };
    }
  }
}
